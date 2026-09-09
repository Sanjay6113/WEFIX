import Link from "next/link";
import {
  statusLabels,
  type Order,
  type OrderStatus,
  money,
} from "@/lib/domain";
export function AdminHeading({
  title,
  copy,
  children,
}: {
  title: string;
  copy?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="admin-heading">
      <div>
        <p className="section-kicker">WeFix workspace</p>
        <h1>{title}</h1>
        {copy && <p>{copy}</p>}
      </div>
      {children}
    </header>
  );
}
export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`status-badge status-${status}`}>
      {statusLabels[status]}
    </span>
  );
}
export function OrderTable({
  orders,
  names = {},
}: {
  orders: Order[];
  names?: Record<string, string>;
}) {
  return orders.length ? (
    <div className="table-scroll">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Client / work</th>
            <th>Status</th>
            <th>Quote</th>
            <th>Updated</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>
                <Link href={`/admin/orders/${order.id}`}>{order.ticket}</Link>
              </td>
              <td>
                {names[order.client_id] && (
                  <strong>
                    {names[order.client_id]}
                    <br />
                  </strong>
                )}
                {order.description}
              </td>
              <td>
                <StatusBadge status={order.status} />
              </td>
              <td>
                {order.quote === null ? "Not quoted" : money(order.quote)}
              </td>
              <td>
                {new Date(order.updated_at).toLocaleDateString("en-IN", {
                  timeZone: "Asia/Kolkata",
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <p className="notice">No orders found.</p>
  );
}
export function Pagination({
  page,
  count,
  path,
  params = {},
}: {
  page: number;
  count: number;
  path: string;
  params?: Record<string, string>;
}) {
  const pages = Math.max(1, Math.ceil(count / 20));
  const url = (p: number) =>
    `${path}?${new URLSearchParams({ ...params, page: String(p) })}`;
  return (
    <nav className="pagination" aria-label="Pagination">
      {page > 1 && <Link href={url(page - 1)}>← Previous</Link>}
      <span>
        Page {page} of {pages} · {count} results
      </span>
      {page < pages && <Link href={url(page + 1)}>Next →</Link>}
    </nav>
  );
}
