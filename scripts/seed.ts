import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

async function main() {
  loadEnvConfig(process.cwd());
  const { defaultContent } = await import("../lib/defaults");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key)
    throw new Error(
      "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before seeding.",
    );
  const db = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const seeds: [string, Record<string, unknown>[], string][] = [
    ["repair_pricing", defaultContent.prices, "id"],
    ["pc_budgets", defaultContent.budgets, "id"],
    [
      "website_settings",
      [
        {
          id: 1,
          phone: defaultContent.phone,
          consultation_fee: defaultContent.consultationFee,
        },
      ],
      "id",
    ],
    [
      "whatsapp_templates",
      Object.entries(defaultContent.templates).map(([key, body]) => ({
        key,
        body,
      })),
      "key",
    ],
  ];
  for (const [table, rows, onConflict] of seeds) {
    const { error } = await db
      .from(table)
      .upsert(rows, { onConflict, ignoreDuplicates: true });
    if (error) throw new Error(`${table}: ${error.message}`);
  }
  const directory = path.join(process.cwd(), "public", "gallery");
  const files = fs.existsSync(directory)
    ? fs
        .readdirSync(directory)
        .filter((name) =>
          /\.(jpe?g|png|webp|gif|avif|mp4|webm|mov|m4v)$/i.test(name),
        )
        .sort()
    : [];
  if (files.length) {
    const { error } = await db.from("gallery_media").upsert(
      files.map((name, index) => ({
        name: path.parse(name).name.replace(/[-_]+/g, " ").slice(0, 200),
        src: `/gallery/${encodeURIComponent(name)}`,
        type: /\.(mp4|webm|mov|m4v)$/i.test(name) ? "video" : "image",
        visible: true,
        sort_order: index,
      })),
      { onConflict: "src", ignoreDuplicates: true },
    );
    if (error) throw new Error(`Gallery: ${error.message}`);
  }
  console.log(
    `Seed complete. Registered ${files.length} local media references; existing edits were preserved.`,
  );
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
