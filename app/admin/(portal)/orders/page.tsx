import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { listParams } from "@/lib/admin-queries";
import { statuses, statusLabels, type OrderStatus } from "@/lib/domain";
import {
  AdminHeading,
  OrderTable,
  Pagination,
} from "@/components/admin/shared";
export default async function OrdersPage({
  searchParams: input,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const searchParams = await input;
  const { db } = await requireAdmin();
  const { page, query, from, to } = listParams(searchParams);
  const status = statuses.includes(searchParams.status as OrderStatus)
    ? searchParams.status!
    : "";
  let request = db
    .from("admin_order_list")
    .select("*", { count: "exact" })
    .order("updated_at", { ascending: false })
    .order("id")
    .range(from, to);
  if (status) request = request.eq("status", status);
  if (query) {
    request = request.or(
      `ticket.ilike.%${query}%,description.ilike.%${query}%,client_name.ilike.%${query}%,client_phone.ilike.%${query}%`,
    );
  }
  if (searchParams.client && /^[a-f0-9-]{36}$/i.test(searchParams.client))
    request = request.eq("client_id", searchParams.client);
  const { data, error, count } = await request;
  if (error) throw new Error("Orders unavailable.");
  return (
    <>
      <AdminHeading
        title="Orders"
        copy="Manage each job through its four statuses."
      >
        <Link className="button button-primary" href="/admin/orders/new">
          Create order
        </Link>
      </AdminHeading>
      <form className="admin-filters">
        <label>
          Search orders
          <input
            className="field"
            name="q"
            defaultValue={query}
            placeholder="Client, phone, ticket, or work"
          />
        </label>
        <label>
          Status
          <select className="field" name="status" defaultValue={status}>
            <option value="">All statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {statusLabels[s]}
              </option>
            ))}
          </select>
        </label>
        {searchParams.client && (
          <input type="hidden" name="client" value={searchParams.client} />
        )}
        <button className="button button-secondary">Filter</button>
        <Link href="/admin/orders">Clear</Link>
      </form>
      <section className="panel admin-card">
        <OrderTable
          orders={data || []}
          names={Object.fromEntries(
            (data || []).map((o) => [o.client_id, o.client_name]),
          )}
        />
        <Pagination
          page={page}
          count={count || 0}
          path="/admin/orders"
          params={{
            q: query,
            status,
            ...(searchParams.client ? { client: searchParams.client } : {}),
          }}
        />
      </section>
    </>
  );
}
