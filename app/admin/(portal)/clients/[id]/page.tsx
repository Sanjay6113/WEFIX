import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { listParams } from "@/lib/admin-queries";
import {
  AdminHeading,
  OrderTable,
  Pagination,
} from "@/components/admin/shared";
import { ClientForm } from "@/components/admin/client-form";
export default async function ClientDetail({
  params: route,
  searchParams: input,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const [params, searchParams] = await Promise.all([route, input]);
  if (!z.string().uuid().safeParse(params.id).success) notFound();
  const { db } = await requireAdmin();
  const { page, from, to } = listParams(searchParams);
  const [client, orders] = await Promise.all([
    db.from("clients").select("*").eq("id", params.id).maybeSingle(),
    db
      .from("orders")
      .select("*", { count: "exact" })
      .eq("client_id", params.id)
      .order("updated_at", { ascending: false })
      .order("id")
      .range(from, to),
  ]);
  if (client.error || orders.error) throw new Error("Client unavailable.");
  if (!client.data) notFound();
  return (
    <>
      <AdminHeading title={client.data.name}>
        <Link
          href={`/admin/orders/new?client=${params.id}`}
          className="button button-primary"
        >
          Create order
        </Link>
      </AdminHeading>
      <div className="panel admin-card">
        <ClientForm client={client.data} saved={Boolean(searchParams.saved)} />
      </div>
      <section className="panel admin-card">
        <h2>Order history</h2>
        <OrderTable orders={orders.data || []} />
        <Pagination
          page={page}
          count={orders.count || 0}
          path={`/admin/clients/${params.id}`}
        />
      </section>
    </>
  );
}
