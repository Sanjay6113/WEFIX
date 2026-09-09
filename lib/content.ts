import "server-only";
import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { publicConfig } from "./supabase/config";
import { defaultContent } from "./defaults";
import type { SiteContent, GalleryItem, TemplateKey } from "./domain";
export function publicClient() {
  const config = publicConfig();
  return config
    ? createClient(config.url, config.key, {
        auth: { persistSession: false, autoRefreshToken: false },
        global: {
          fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
        },
      })
    : null;
}
export const getContent = cache(async (): Promise<SiteContent> => {
  const db = publicClient();
  if (!db) return defaultContent;
  const results = await Promise.all([
    db
      .from("repair_pricing")
      .select("*")
      .eq("visible", true)
      .order("sort_order"),
    db.from("pc_budgets").select("*").order("minimum"),
    db
      .from("website_settings")
      .select("phone,consultation_fee")
      .eq("id", 1)
      .single(),
    db.from("whatsapp_templates").select("key,body").neq("key", "order_update"),
  ]);
  if (results.some((r) => r.error)) {
    console.error(
      "Public content unavailable; retaining built-in website content.",
    );
    return defaultContent;
  }
  const [prices, budgets, settings, templates] = results;
  return {
    prices: prices.data!,
    budgets: budgets.data!.length ? budgets.data! : defaultContent.budgets,
    phone: settings.data!.phone,
    consultationFee: settings.data!.consultation_fee,
    templates: {
      ...defaultContent.templates,
      ...Object.fromEntries(
        templates.data!.map((t) => [t.key as TemplateKey, t.body]),
      ),
    },
  };
});
export async function getGallery(): Promise<GalleryItem[] | null> {
  const db = publicClient();
  if (!db) return null;
  const { data, error } = await db
    .from("gallery_media")
    .select("id,name,src,type,visible,sort_order,bucket,object_path")
    .eq("visible", true)
    .order("sort_order")
    .order("created_at");
  if (error) {
    console.error("Gallery metadata unavailable.");
    return [];
  }
  return data;
}
