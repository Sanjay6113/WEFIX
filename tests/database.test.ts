import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";

test("migration, row security, and atomic order history on embedded PostgreSQL", async (t) => {
  const db = new PGlite({ extensions: { pgcrypto } });
  const admin = "20000000-0000-4000-8000-000000000001";
  const outsider = "20000000-0000-4000-8000-000000000002";
  const client = "30000000-0000-4000-8000-000000000001";
  const order = "40000000-0000-4000-8000-000000000001";
  try {
    // Minimal Supabase-owned schemas. The application migration runs unchanged.
    await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
      create schema auth; create schema extensions; create schema storage;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      grant usage on schema auth, storage, extensions to anon,authenticated,service_role;
      grant execute on function auth.uid() to anon,authenticated,service_role;
      create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
      create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text,metadata jsonb);
      alter table storage.objects enable row level security;
      grant select,insert,update,delete on storage.objects to anon,authenticated;
      create function storage.foldername(name text) returns text[] language sql immutable as $$ select string_to_array(name,'/') $$;
    `);
    await db.exec(fs.readFileSync("supabase/schema.sql", "utf8"));
    await db.exec(
      "insert into repairs(ticket_id,customer_phone) values('LEGACY-1','919999999999')",
    );
    await db.exec(
      fs.readFileSync(
        "supabase/migrations/202609090001_admin_portal.sql",
        "utf8",
      ),
    );
    await db.exec(
      `insert into auth.users values('${admin}'),('${outsider}'); insert into admin_members(user_id) values('${admin}');`,
    );
    const asUser = async (id: string) => {
      await db.exec(
        `reset role; set role authenticated; select set_config('request.jwt.claim.sub','${id}',false);`,
      );
    };
    const count = async (table: string) =>
      Number(
        (await db.query<{ count: string }>(`select count(*) from ${table}`))
          .rows[0].count,
      );
    await t.test("legacy records survive the additive migration", async () =>
      assert.equal(await count("repairs"), 1),
    );
    await asUser(admin);
    await t.test(
      "admins can create clients and orders with an initial history event",
      async () => {
        await db.query(
          "insert into clients(id,name,phone,notes) values($1,'Test Client','919994428061','private notes')",
          [client],
        );
        await db.query(
          "insert into orders(id,client_id,type,description,requested_work,internal_notes) values($1,$2,'repair','Laptop','Screen repair','secret order notes')",
          [order, client],
        );
        const row = (
          await db.query<{
            status: string;
            tracking_token: string;
            ticket: string;
          }>("select status,tracking_token,ticket from orders")
        ).rows[0];
        assert.equal(row.status, "not_started");
        assert.match(row.tracking_token, /^[a-f0-9]{64}$/);
        assert.match(row.ticket, /^WF-\d+$/);
        assert.equal(await count("order_history"), 1);
        assert.equal(
          (
            await db.query<{ admin_id: string }>(
              "select admin_id from order_history",
            )
          ).rows[0].admin_id,
          admin,
        );
      },
    );
    await t.test(
      "phone duplicates and malformed phones are rejected in the database",
      async () => {
        await assert.rejects(
          db.exec(
            "insert into clients(name,phone) values('Duplicate','919994428061')",
          ),
        );
        await assert.rejects(
          db.exec("insert into clients(name,phone) values('Short','5')"),
        );
      },
    );
    await t.test(
      "all statuses, reopening, issue explanation and history are transactional",
      async () => {
        await db.query("update orders set status='in_process' where id=$1", [
          order,
        ]);
        await db.query("update orders set status='complete' where id=$1", [
          order,
        ]);
        await db.query("update orders set status='in_process' where id=$1", [
          order,
        ]);
        const before = await count("order_history");
        await assert.rejects(
          db.query(
            "update orders set status='failed_issue', customer_update='' where id=$1",
            [order],
          ),
        );
        assert.equal(await count("order_history"), before);
        assert.equal(
          (await db.query<{ status: string }>("select status from orders"))
            .rows[0].status,
          "in_process",
        );
        await db.query(
          "update orders set status='failed_issue',customer_update='Part unavailable' where id=$1",
          [order],
        );
        assert.equal(await count("order_history"), before + 1);
        await assert.rejects(
          db.exec("update order_history set new_status='complete'"),
        );
      },
    );
    await t.test(
      "stale versions do not overwrite newer order changes",
      async () => {
        const v = (
          await db.query<{ version: number }>("select version from orders")
        ).rows[0].version;
        await db.query(
          "update orders set internal_notes='Updated' where id=$1 and version=$2",
          [order, v],
        );
        const stale = await db.query(
          "update orders set internal_notes='Stale' where id=$1 and version=$2 returning id",
          [order, v],
        );
        assert.equal(stale.rows.length, 0);
      },
    );
    await t.test(
      "replacing a tracking token invalidates the previous lookup",
      async () => {
        const old = (
          await db.query<{ tracking_token: string }>(
            "select tracking_token from orders",
          )
        ).rows[0].tracking_token;
        await db.exec(
          "update orders set tracking_token=encode(extensions.gen_random_bytes(32),'hex')",
        );
        assert.equal(
          (
            await db.query(
              "select ticket from orders where tracking_token=$1",
              [old],
            )
          ).rows.length,
          0,
        );
      },
    );
    await t.test(
      "admins can publish content and upload within their Storage folder",
      async () => {
        await db.exec(
          "insert into repair_pricing(service,market_price,price,visible) values('Shown',1000,900,true),('Hidden',500,400,false)",
        );
        await db.exec(
          "insert into gallery_media(name,src,type,visible) values('Visible photo','/gallery/visible.jpg','image',true),('Hidden photo','/gallery/hidden.jpg','image',false)",
        );
        await db.query(
          "insert into storage.objects(bucket_id,name) values('wefix-images',$1)",
          [`${admin}/photo.jpg`],
        );
        await assert.rejects(
          db.query(
            "insert into storage.objects(bucket_id,name) values('wefix-images',$1)",
            [`${outsider}/photo.jpg`],
          ),
        );
      },
    );
    await asUser(outsider);
    await t.test(
      "non-admins cannot read private records, elevate themselves, or mutate content",
      async () => {
        for (const table of [
          "clients",
          "orders",
          "order_history",
          "admin_members",
          "admin_order_list",
        ])
          assert.equal(await count(table), 0);
        await assert.rejects(
          db.query("insert into admin_members(user_id) values($1)", [outsider]),
        );
        await assert.rejects(
          db.exec(
            "insert into clients(name,phone) values('Intruder','918888888888')",
          ),
        );
        await assert.rejects(
          db.query(
            "insert into orders(client_id,type,description,requested_work) values($1,'repair','Bad','Bad')",
            [client],
          ),
        );
        assert.equal(
          (await db.exec("update orders set quote=1 returning id"))[0].rows
            .length,
          0,
        );
        await assert.rejects(
          db.exec(
            "insert into repair_pricing(service,market_price,price) values('Bad',1,1)",
          ),
        );
        await assert.rejects(
          db.query(
            "insert into storage.objects(bucket_id,name) values('wefix-images',$1)",
            [`${outsider}/bad.jpg`],
          ),
        );
      },
    );
    await db.exec(
      "reset role; set role anon; select set_config('request.jwt.claim.sub','',false)",
    );
    await t.test(
      "anonymous users see only published content and cannot access clients or orders",
      async () => {
        for (const table of [
          "clients",
          "orders",
          "order_history",
          "admin_members",
          "admin_order_list",
        ])
          await assert.rejects(db.query(`select * from ${table}`));
        assert.equal(await count("repair_pricing"), 1);
        assert.equal(await count("gallery_media"), 1);
        await assert.rejects(
          db.exec(
            "insert into gallery_media(name,src,type) values('Bad','/bad','image')",
          ),
        );
        await assert.rejects(
          db.exec(
            "insert into storage.objects(bucket_id,name) values('wefix-images','bad.jpg')",
          ),
        );
      },
    );
    await db.exec("reset role");
    await t.test(
      "Storage buckets enforce the specified MIME allowlists and size caps",
      async () => {
        const rows = (
          await db.query<{
            id: string;
            file_size_limit: number;
            allowed_mime_types: string[];
          }>("select * from storage.buckets order by id")
        ).rows;
        assert.equal(Number(rows[0].file_size_limit), 10485760);
        assert.equal(Number(rows[1].file_size_limit), 52428800);
        assert.equal(
          rows[0].allowed_mime_types.includes("image/svg+xml"),
          false,
        );
        assert.deepEqual(rows[1].allowed_mime_types, [
          "video/mp4",
          "video/webm",
        ]);
      },
    );
  } finally {
    await db.close();
  }
});
