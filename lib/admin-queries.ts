import "server-only";
import { requireAdmin } from "./admin";
export const pageSize = 20;
export function listParams(params: Record<string, string | undefined>) {
  const page = Math.max(
    1,
    Math.min(100000, Number.parseInt(params.page || "1") || 1),
  );
  const query = (params.q || "")
    .trim()
    .replace(/[^\p{L}\p{N}\s@+._-]/gu, "")
    .replace(/[%_]/g, "")
    .slice(0, 100);
  return { page, query, from: (page - 1) * pageSize, to: page * pageSize - 1 };
}
export async function adminRows(table: string) {
  const { db } = await requireAdmin();
  const { data, error } = await db.from(table).select("*");
  if (error) throw new Error(`Unable to read ${table}. Check database setup.`);
  return data;
}
