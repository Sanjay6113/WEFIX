import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { listParams } from "@/lib/admin-queries";
import { AdminHeading, Pagination } from "@/components/admin/shared";
import { OrderForm } from "@/components/admin/order-form";
export default async function NewOrder({
  searchParams: input,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const searchParams = await input;
  const { db } = await requireAdmin();
  const { query, from, to, page } = listParams(searchParams);
  if (searchParams.client && /^[a-f0-9-]{36}$/i.test(searchParams.client)) {
    const { data, error } = await db
      .from("clients")
      .select("id,name,phone")
      .eq("id", searchParams.client)
      .maybeSingle();
    if (error) throw new Error("Client unavailable.");
    if (data)
      return (
        <>
          <AdminHeading title="Create order">
            <Link href="/admin/orders/new">Choose another client</Link>
          </AdminHeading>
          <section className="panel admin-card">
            <OrderForm client={data} />
          </section>
        </>
      );
  }
  let request = db
    .from("clients")
    .select("id,name,phone", { count: "exact" })
    .order("name")
    .order("id")
    .range(from, to);
  if (query)
    request = request.or(`name.ilike.%${query}%,phone.ilike.%${query}%`);
  const { data, error, count } = await request;
  if (error) throw new Error("Clients unavailable.");
  return (
    <>
      <AdminHeading
        title="Choose a client"
        copy="Select an existing client, or add a new one before creating their order."
      >
        <Link className="button button-primary" href="/admin/clients/new">
          Add client
        </Link>
      </AdminHeading>
      <form className="admin-filters">
        <label>
          Find client
          <input
            name="q"
            className="field"
            defaultValue={query}
            placeholder="Name or phone"
          />
        </label>
        <button className="button button-secondary">Search</button>
      </form>
      <div className="panel admin-card">
        <div className="client-picker">
          {data?.map((c) => (
            <Link key={c.id} href={`/admin/orders/new?client=${c.id}`}>
              <strong>{c.name}</strong>
              <span>+{c.phone} →</span>
            </Link>
          ))}
        </div>
        {!data?.length && <p>No clients found.</p>}
        <Pagination
          page={page}
          count={count || 0}
          path="/admin/orders/new"
          params={{ q: query }}
        />
      </div>
    </>
  );
}
