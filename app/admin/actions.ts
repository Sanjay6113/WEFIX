"use server";
import { randomBytes, randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import {
  amountSchema,
  clientSchema,
  orderSchema,
  priceSchema,
  budgetSchema,
  normalizePhone,
  templateKeys,
  validateTemplate,
  validateUpload,
} from "@/lib/domain";
import type { ActionResult } from "./auth-actions";

const fields = (form: FormData) => Object.fromEntries(form.entries());
function failure(error: unknown): ActionResult {
  return {
    error:
      error instanceof z.ZodError
        ? error.issues
            .map((i) => `${i.path.join(" ")}: ${i.message}`)
            .join("; ")
        : error instanceof Error
          ? error.message
          : "Unable to save. Please try again.",
  };
}
function refresh() {
  revalidatePath("/", "layout");
}
function check(error: { code?: string; message: string } | null) {
  if (!error) return;
  console.error("Admin database operation failed", error.code);
  throw new Error(
    error.code === "23505"
      ? "A matching record already exists. Open the existing record instead."
      : "Unable to save. Check your connection and database setup, then retry.",
  );
}
export async function saveClient(
  _: ActionResult,
  form: FormData,
): Promise<ActionResult> {
  const { db } = await requireAdmin();
  let savedId: string;
  try {
    const { id, ...values } = clientSchema.parse(fields(form));
    const duplicate = await db
      .from("clients")
      .select("id,name")
      .eq("phone", values.phone)
      .maybeSingle();
    check(duplicate.error);
    if (duplicate.data && duplicate.data.id !== id)
      return {
        error: `This phone already belongs to ${duplicate.data.name}. Search for that client instead of creating a duplicate.`,
      };
    const result = id
      ? await db
          .from("clients")
          .update(values)
          .eq("id", id)
          .select("id")
          .single()
      : await db.from("clients").insert(values).select("id").single();
    check(result.error);
    savedId = result.data!.id;
  } catch (error) {
    return failure(error);
  }
  refresh();
  redirect(`/admin/clients/${savedId}?saved=1`);
}
export async function saveOrder(
  _: ActionResult,
  form: FormData,
): Promise<ActionResult> {
  const { db } = await requireAdmin();
  let savedId: string;
  try {
    const { id, version, ...values } = orderSchema.parse(fields(form));
    const row = { ...values, expected_date: values.expected_date || null };
    if (!id && row.status !== "not_started")
      throw new Error("New orders must start as Not started.");
    if (id && !version) throw new Error("Reload the order before saving.");
    const result = id
      ? await db
          .from("orders")
          .update(row)
          .eq("id", id)
          .eq("version", version!)
          .select("id")
          .maybeSingle()
      : await db.from("orders").insert(row).select("id").single();
    check(result.error);
    if (!result.data)
      throw new Error(
        "This order changed since you opened it. Reload before saving to avoid overwriting another update.",
      );
    savedId = result.data.id;
  } catch (error) {
    return failure(error);
  }
  refresh();
  redirect(`/admin/orders/${savedId}?saved=1`);
}
export async function rotateTracking(
  _: ActionResult,
  form: FormData,
): Promise<ActionResult> {
  const { db } = await requireAdmin();
  try {
    const id = z.string().uuid().parse(form.get("id"));
    const { error } = await db
      .from("orders")
      .update({ tracking_token: randomBytes(32).toString("hex") })
      .eq("id", id)
      .select("id")
      .single();
    check(error);
    refresh();
    return {
      success: "New tracking link created. The previous link no longer works.",
    };
  } catch (error) {
    return failure(error);
  }
}
export async function savePrice(
  _: ActionResult,
  form: FormData,
): Promise<ActionResult> {
  const { db } = await requireAdmin();
  try {
    const row = priceSchema.parse({
      ...fields(form),
      from_price: form.has("from_price"),
      visible: form.has("visible"),
    });
    const { error } = await db.from("repair_pricing").upsert(row);
    check(error);
    refresh();
    return { success: "Repair price saved and published." };
  } catch (error) {
    return failure(error);
  }
}
export async function saveBudget(
  _: ActionResult,
  form: FormData,
): Promise<ActionResult> {
  const { db } = await requireAdmin();
  try {
    const row = budgetSchema.parse(fields(form));
    const { error } = await db.from("pc_budgets").upsert(row);
    check(error);
    refresh();
    return { success: "Budget band saved and published." };
  } catch (error) {
    return failure(error);
  }
}
export async function saveConsultationFee(
  _: ActionResult,
  form: FormData,
): Promise<ActionResult> {
  const { db } = await requireAdmin();
  try {
    const value = amountSchema.parse(form.get("consultation_fee"));
    const { error } = await db
      .from("website_settings")
      .update({ consultation_fee: value })
      .eq("id", 1)
      .select("id")
      .single();
    check(error);
    refresh();
    return {
      success: "Consultation fee saved. Website messages use the new amount.",
    };
  } catch (error) {
    return failure(error);
  }
}
export async function savePhone(
  _: ActionResult,
  form: FormData,
): Promise<ActionResult> {
  const { db } = await requireAdmin();
  try {
    const phone = normalizePhone(String(form.get("phone") || ""));
    const { error } = await db
      .from("website_settings")
      .update({ phone })
      .eq("id", 1)
      .select("id")
      .single();
    check(error);
    refresh();
    return { success: "Business WhatsApp number saved." };
  } catch (error) {
    return failure(error);
  }
}
export async function saveTemplate(
  _: ActionResult,
  form: FormData,
): Promise<ActionResult> {
  const { db } = await requireAdmin();
  try {
    const key = z.enum(templateKeys).parse(form.get("key"));
    const body = validateTemplate(key, String(form.get("body") || ""));
    const { error } = await db.from("whatsapp_templates").upsert({ key, body });
    check(error);
    refresh();
    return { success: "Message template saved." };
  } catch (error) {
    return failure(error);
  }
}
export async function saveMedia(
  _: ActionResult,
  form: FormData,
): Promise<ActionResult> {
  const { db } = await requireAdmin();
  try {
    const values = z
      .object({
        id: z.string().uuid(),
        name: z.string().trim().min(1).max(200),
        sort_order: z.coerce.number().int().min(0).max(10000),
      })
      .parse(fields(form));
    const { id, ...row } = values;
    const { error } = await db
      .from("gallery_media")
      .update({ ...row, visible: form.has("visible") })
      .eq("id", id)
      .select("id")
      .single();
    check(error);
    refresh();
    return { success: "Gallery entry saved." };
  } catch (error) {
    return failure(error);
  }
}
export async function prepareUpload(mime: string, size: number) {
  const { user } = await requireAdmin();
  const rule = validateUpload(mime, size);
  return {
    bucket: rule.bucket,
    path: `${user.id}/${randomUUID()}.${rule.extension}`,
  };
}
export async function finishUpload(input: {
  bucket: string;
  path: string;
  name: string;
  mime: string;
  size: number;
}): Promise<ActionResult> {
  const { db, user } = await requireAdmin();
  try {
    const name = z.string().trim().min(1).max(200).parse(input.name);
    const rule = validateUpload(input.mime, input.size);
    if (
      input.bucket !== rule.bucket ||
      !input.path.startsWith(`${user.id}/`) ||
      !/^[a-f0-9-]{36}\/[a-f0-9-]{36}\.(jpg|png|webp|gif|avif|mp4|webm)$/.test(
        input.path,
      )
    )
      throw new Error("Invalid upload path.");
    const filename = input.path.split("/")[1];
    const { data, error } = await db.storage
      .from(rule.bucket)
      .list(user.id, { search: filename, limit: 100 });
    check(error);
    const object = data?.find((file) => file.name === filename);
    if (!object?.metadata)
      throw new Error("Upload not found. Try uploading again.");
    if (
      object.metadata.mimetype !== input.mime ||
      Number(object.metadata.size) !== input.size
    )
      throw new Error("Uploaded file details do not match.");
    const src = db.storage.from(rule.bucket).getPublicUrl(input.path)
      .data.publicUrl;
    const { error: insertError } = await db
      .from("gallery_media")
      .upsert(
        {
          name,
          src,
          type: rule.type,
          bucket: rule.bucket,
          object_path: input.path,
          visible: true,
          sort_order: 0,
        },
        { onConflict: "src", ignoreDuplicates: true },
      );
    check(insertError);
    refresh();
    return { success: "Media uploaded and added to the gallery." };
  } catch (error) {
    return failure(error);
  }
}
