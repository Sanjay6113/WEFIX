import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { listParams } from "@/lib/admin-queries";
import { AdminHeading, Pagination } from "@/components/admin/shared";
export default async function ClientsPage({
  searchParams: input,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const searchParams = await input;
  const { db } = await requireAdmin();
  const { page, query, from, to } = listParams(searchParams);
  let request = db
    .from("clients")
    .select("id,name,phone,updated_at,orders(count)", { count: "exact" })
    .order("updated_at", { ascending: false })
    .order("id")
    .range(from, to);
  if (query)
    request = request.or(
      `name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`,
    );
  const { data, error, count } = await request;
  if (error) throw new Error("Clients unavailable.");
  return (
    <>
      <AdminHeading
        title="Clients"
        copy="Contact details and the full order history for each client."
      >
        <Link className="button button-primary" href="/admin/clients/new">
          Add client
        </Link>
      </AdminHeading>
      <form className="admin-filters">
        <label>
          Search clients
          <input
            className="field"
            name="q"
            defaultValue={query}
            placeholder="Name, phone, or email"
          />
        </label>
        <button className="button button-secondary">Search</button>
      </form>
      <div className="panel admin-card">
        <div className="table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Orders</th>
                <th>Latest activity</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link href={`/admin/clients/${c.id}`}>{c.name}</Link>
                  </td>
                  <td>+{c.phone}</td>
                  <td>{c.orders[0]?.count || 0}</td>
                  <td>
                    {new Date(c.updated_at).toLocaleDateString("en-IN", {
                      timeZone: "Asia/Kolkata",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!data?.length && (
          <p>No clients found. Add your first client to create an order.</p>
        )}
        <Pagination
          page={page}
          count={count || 0}
          path="/admin/clients"
          params={{ q: query }}
        />
      </div>
    </>
  );
}
