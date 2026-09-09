import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { statuses, statusLabels } from "@/lib/domain";
import { AdminHeading, OrderTable } from "@/components/admin/shared";
export default async function Dashboard() {
  const { db } = await requireAdmin();
  const [recent, ...counts] = await Promise.all([
    db
      .from("orders")
      .select("*,clients(name)")
      .order("updated_at", { ascending: false })
      .limit(10),
    ...statuses.map((status) =>
      db
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("status", status),
    ),
  ]);
  if (recent.error || counts.some((c) => c.error))
    throw new Error("Dashboard unavailable.");
  const orders = recent.data || [];
  return (
    <>
      <AdminHeading
        title="Overview"
        copy="Your orders, from first enquiry to handover."
      >
        <Link className="button button-primary" href="/admin/orders/new">
          Create order
        </Link>
      </AdminHeading>
      <div className="admin-stat-grid">
        {statuses.map((status, i) => (
          <Link
            href={`/admin/orders?status=${status}`}
            className="panel admin-stat"
            key={status}
          >
            <span>{statusLabels[status]}</span>
            <strong>{counts[i].count || 0}</strong>
          </Link>
        ))}
      </div>
      <section className="panel admin-card">
        <h2>Recent orders</h2>
        <OrderTable
          orders={orders}
          names={Object.fromEntries(
            orders.map((o) => [o.client_id, o.clients?.name || ""]),
          )}
        />
      </section>
    </>
  );
}
