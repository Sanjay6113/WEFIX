import "server-only";
import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { serverClient } from "./supabase/server";
import { publicConfig } from "./supabase/config";
export async function requireAdmin() {
  noStore();
  if (!publicConfig()) redirect("/admin/login?setup=1");
  const db = await serverClient();
  const {
    data: { user },
    error,
  } = await db.auth.getUser();
  if (error || !user) redirect("/admin/login");
  const { data: member, error: membershipError } = await db
    .from("admin_members")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (membershipError || !member) redirect("/admin/login?denied=1");
  return { db, user };
}
