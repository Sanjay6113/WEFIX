import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID, randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { publicOrderFields } from "../lib/domain";
if (existsSync(".env.test")) process.loadEnvFile(".env.test");
const url = process.env.TEST_SUPABASE_URL;
const key = process.env.TEST_SUPABASE_PUBLIC_KEY;
const secret = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY;
const enabled =
  process.env.WEFIX_RUN_INTEGRATION === "1" && Boolean(url && key && secret);
test(
  "live Supabase auth, RLS, orders, content, and Storage",
  {
    skip:
      !enabled &&
      "Requires an explicitly enabled staging Supabase project; see docs/ADMIN-SETUP.md.",
  },
  async (t) => {
    const options = {
      auth: { autoRefreshToken: false, persistSession: false },
    };
    const service = createClient(url!, secret!, options);
    const anon = createClient(url!, key!, options);
    const admin = createClient(url!, key!, options);
    const outsider = createClient(url!, key!, options);
    const suffix = randomUUID();
    const password = randomBytes(24).toString("hex");
    const createdUsers: string[] = [];
    const clientId = randomUUID();
    const orderId = randomUUID();
    const priceId = randomUUID();
    const mediaId = randomUUID();
    let uploadPath = "";
    try {
      for (const kind of ["admin", "outsider"]) {
        const email = `wefix-${kind}-${suffix}@example.com`;
        const result = await service.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });
        assert.ifError(result.error);
        assert.ok(result.data.user);
        createdUsers.push(result.data.user.id);
        if (kind === "admin")
          assert.ifError(
            (
              await service
                .from("admin_members")
                .insert({ user_id: result.data.user.id })
            ).error,
          );
        assert.ifError(
          (
            await (kind === "admin" ? admin : outsider).auth.signInWithPassword(
              { email, password },
            )
          ).error,
        );
      }
      await t.test(
        "verified auth resolves admin membership but not non-admin membership",
        async () => {
          assert.ok((await admin.auth.getUser()).data.user);
          assert.equal(
            (await admin.from("admin_members").select("user_id")).data?.length,
            1,
          );
          assert.deepEqual(
            (await outsider.from("admin_members").select("user_id")).data,
            [],
          );
        },
      );
      await t.test(
        "anonymous and non-admin writes fail, and private reads return no rows",
        async () => {
          for (const client of [anon, outsider]) {
            for (const table of ["clients", "orders", "order_history"]) {
              const result = await client.from(table).select("*");
              assert.ok(result.error || result.data?.length === 0);
            }
            assert.ok(
              (
                await client
                  .from("clients")
                  .insert({ name: "Unauthorized", phone: "919123456789" })
              ).error,
            );
            assert.ok(
              (
                await client
                  .from("admin_members")
                  .insert({ user_id: createdUsers[1] })
              ).error,
            );
          }
        },
      );
      await t.test(
        "admin creates a client and multiple orders with history, then manages stages",
        async () => {
          assert.ifError(
            (
              await admin
                .from("clients")
                .insert({
                  id: clientId,
                  name: `Integration ${suffix}`,
                  phone: `91${String(Date.now()).slice(-10)}`,
                  notes: "PRIVATE CLIENT NOTE",
                })
            ).error,
          );
          assert.ifError(
            (
              await admin
                .from("orders")
                .insert({
                  id: orderId,
                  client_id: clientId,
                  type: "repair",
                  description: "Integration laptop",
                  requested_work: "Screen repair",
                  internal_notes: "PRIVATE ORDER NOTE",
                })
            ).error,
          );
          for (const status of [
            "in_process",
            "complete",
            "not_started",
            "failed_issue",
          ]) {
            const row = {
              status,
              customer_update:
                status === "failed_issue"
                  ? "Awaiting replacement part"
                  : "Progress updated",
            };
            assert.ifError(
              (await admin.from("orders").update(row).eq("id", orderId)).error,
            );
          }
          const history = await admin
            .from("order_history")
            .select("*")
            .eq("order_id", orderId);
          assert.ifError(history.error);
          assert.equal(history.data?.length, 5);
          assert.ok(history.data?.every((h) => h.admin_id === createdUsers[0]));
          assert.ok(
            (
              await admin
                .from("orders")
                .update({ status: "failed_issue", customer_update: "" })
                .eq("id", orderId)
            ).error,
          );
          const second = await admin
            .from("orders")
            .insert({
              client_id: clientId,
              type: "pc_build",
              description: "Second order",
              requested_work: "Build PC",
            })
            .select("id")
            .single();
          assert.ifError(second.error);
          assert.equal(
            (await admin.from("orders").select("id").eq("client_id", clientId))
              .data?.length,
            2,
          );
        },
      );
      await t.test(
        "tracking tokens resolve only the public projection and can be revoked",
        async () => {
          const { data: row, error } = await admin
            .from("orders")
            .select("tracking_token")
            .eq("id", orderId)
            .single();
          assert.ifError(error);
          const token = row!.tracking_token;
          const publicRow = await service
            .from("orders")
            .select(publicOrderFields)
            .eq("tracking_token", token)
            .single();
          assert.ifError(publicRow.error);
          assert.ok(!JSON.stringify(publicRow.data).includes("PRIVATE"));
          assert.ok(!Object.hasOwn(publicRow.data!, "client_id"));
          if (process.env.TEST_SITE_URL) {
            const response = await fetch(
              `${process.env.TEST_SITE_URL}/check-status/${token}`,
            );
            const html = await response.text();
            assert.match(html, /Integration laptop/);
            assert.ok(!html.includes("PRIVATE ORDER NOTE"));
            assert.ok(!html.includes("PRIVATE CLIENT NOTE"));
            assert.equal(
              response.headers.get("referrer-policy"),
              "no-referrer",
            );
          }
          assert.ifError(
            (
              await admin
                .from("orders")
                .update({ tracking_token: randomBytes(32).toString("hex") })
                .eq("id", orderId)
            ).error,
          );
          assert.equal(
            (
              await service
                .from("orders")
                .select("id")
                .eq("tracking_token", token)
            ).data?.length,
            0,
          );
        },
      );
      await t.test(
        "published prices and gallery entries disappear from public reads when hidden",
        async () => {
          assert.ifError(
            (
              await admin
                .from("repair_pricing")
                .insert({
                  id: priceId,
                  service: `Test ${suffix}`,
                  price: 123,
                  market_price: 456,
                  visible: true,
                })
            ).error,
          );
          assert.equal(
            (
              await anon
                .from("repair_pricing")
                .select("price")
                .eq("id", priceId)
            ).data?.[0].price,
            123,
          );
          assert.ifError(
            (
              await admin
                .from("repair_pricing")
                .update({ visible: false })
                .eq("id", priceId)
            ).error,
          );
          assert.equal(
            (await anon.from("repair_pricing").select("id").eq("id", priceId))
              .data?.length,
            0,
          );
          assert.ifError(
            (
              await admin
                .from("gallery_media")
                .insert({
                  id: mediaId,
                  name: "Test image",
                  src: `/test-${suffix}.png`,
                  type: "image",
                  visible: false,
                })
            ).error,
          );
          assert.equal(
            (await anon.from("gallery_media").select("id").eq("id", mediaId))
              .data?.length,
            0,
          );
        },
      );
      await t.test(
        "Storage accepts authorized image uploads and rejects other users and invalid MIME types",
        async () => {
          const png = Buffer.from(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=",
            "base64",
          );
          uploadPath = `${createdUsers[0]}/${suffix}.png`;
          assert.ifError(
            (
              await admin.storage
                .from("wefix-images")
                .upload(uploadPath, png, { contentType: "image/png" })
            ).error,
          );
          assert.ok(
            (
              await outsider.storage
                .from("wefix-images")
                .upload(`${createdUsers[1]}/bad.png`, png, {
                  contentType: "image/png",
                })
            ).error,
          );
          assert.ok(
            (
              await anon.storage
                .from("wefix-images")
                .upload("bad.png", png, { contentType: "image/png" })
            ).error,
          );
          assert.ok(
            (
              await admin.storage
                .from("wefix-images")
                .upload(
                  `${createdUsers[0]}/bad-${suffix}.svg`,
                  Buffer.from("<svg/>"),
                  { contentType: "image/svg+xml" },
                )
            ).error,
          );
        },
      );
      await t.test(
        "logout invalidates the local authenticated session",
        async () => {
          assert.ifError((await admin.auth.signOut()).error);
          assert.equal((await admin.auth.getUser()).data.user, null);
          assert.ok(
            (
              await admin
                .from("clients")
                .insert({ name: "Logged out", phone: "919123456789" })
            ).error,
          );
        },
      );
    } finally {
      if (uploadPath)
        await service.storage.from("wefix-images").remove([uploadPath]);
      const orders = await service
        .from("orders")
        .select("id")
        .eq("client_id", clientId);
      for (const order of orders.data || [])
        await service.from("order_history").delete().eq("order_id", order.id);
      await service.from("orders").delete().eq("client_id", clientId);
      await service.from("clients").delete().eq("id", clientId);
      await service.from("repair_pricing").delete().eq("id", priceId);
      await service.from("gallery_media").delete().eq("id", mediaId);
      for (const id of createdUsers) await service.auth.admin.deleteUser(id);
    }
  },
);
