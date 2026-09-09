"use server";
import { redirect } from "next/navigation";
import { serverClient } from "@/lib/supabase/server";
import { publicConfig } from "@/lib/supabase/config";
import { requireAdmin } from "@/lib/admin";
export type ActionResult = { error?: string; success?: string; id?: string };
export async function login(
  _: ActionResult,
  form: FormData,
): Promise<ActionResult> {
  if (!publicConfig())
    return {
      error: "Admin access is not configured yet. Follow the setup guide.",
    };
  const db = await serverClient();
  const { data, error } = await db.auth.signInWithPassword({
    email: String(form.get("email") || "").trim(),
    password: String(form.get("password") || ""),
  });
  if (error || !data.user)
    return { error: "Unable to sign in. Check your email and password." };
  const { data: member, error: memberError } = await db
    .from("admin_members")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();
  if (memberError || !member) {
    await db.auth.signOut();
    return {
      error: "This account does not have admin access. Contact the site owner.",
    };
  }
  redirect("/admin");
}
export async function logout() {
  if (publicConfig()) await (await serverClient()).auth.signOut();
  redirect("/admin/login");
}
export async function requestRecovery(
  _: ActionResult,
  form: FormData,
): Promise<ActionResult> {
  if (!publicConfig() || !process.env.NEXT_PUBLIC_SITE_URL)
    return {
      error: "Password recovery is not configured. Contact the site owner.",
    };
  const { error } = await (
    await serverClient()
  ).auth.resetPasswordForEmail(String(form.get("email") || "").trim(), {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/auth/callback`,
  });
  if (error)
    return {
      error: "Unable to request recovery right now. Please try again later.",
    };
  return {
    success:
      "If this email has an account, a password reset link will arrive shortly.",
  };
}
export async function updatePassword(
  _: ActionResult,
  form: FormData,
): Promise<ActionResult> {
  const { db } = await requireAdmin();
  const password = String(form.get("password") || "");
  if (password.length < 12 || password.length > 128)
    return { error: "Use a password between 12 and 128 characters." };
  if (password !== form.get("confirm"))
    return { error: "Passwords do not match." };
  const { error } = await db.auth.updateUser({ password });
  if (error)
    return {
      error:
        "Password could not be changed. Request a new recovery link and try again.",
    };
  await db.auth.signOut();
  redirect("/admin/login?reset=1");
}
