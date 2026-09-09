import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { AdminHeading, StatusBadge } from "@/components/admin/shared";
import { AdminForm } from "@/components/admin/form";
import { OrderForm } from "@/components/admin/order-form";
import { TrackingShare } from "@/components/admin/tracking-share";
import { rotateTracking } from "@/app/admin/actions";
import { defaultContent } from "@/lib/defaults";
import { statusLabels, type History } from "@/lib/domain";
export default async function OrderDetail({
  params: route,
  searchParams: input,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const [params, searchParams] = await Promise.all([route, input]);
  if (!z.string().uuid().safeParse(params.id).success) notFound();
  const { db } = await requireAdmin();
  const [order, history, template] = await Promise.all([
    db
      .from("orders")
      .select("*,clients(id,name,phone)")
      .eq("id", params.id)
      .maybeSingle(),
    db
      .from("order_history")
      .select("*")
      .eq("order_id", params.id)
      .order("changed_at", { ascending: false }),
    db
      .from("whatsapp_templates")
      .select("body")
      .eq("key", "order_update")
      .maybeSingle(),
  ]);
  if (order.error || history.error || template.error)
    throw new Error("Order unavailable.");
  if (!order.data) notFound();
  const row = order.data;
  return (
    <>
      <AdminHeading title={row.ticket} copy={row.description}>
        <StatusBadge status={row.status} />
      </AdminHeading>
      <Link href={`/admin/clients/${row.client_id}`} className="admin-back">
        ← {row.clients.name}’s orders
      </Link>
      <section className="panel admin-card">
        <OrderForm
          key={row.version}
          order={row}
          client={row.clients}
          saved={Boolean(searchParams.saved)}
        />
      </section>
      <section className="panel admin-card">
        <h2>Customer tracking</h2>
        <TrackingShare
          token={row.tracking_token}
          phone={row.clients.phone}
          name={row.clients.name}
          ticket={row.ticket}
          status={row.status}
          template={
            template.data?.body || defaultContent.templates.order_update
          }
          siteUrl={(process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "")}
        />
        <details>
          <summary>Replace the private link</summary>
          <p>
            The old link will stop working. Send the replacement link to the
            client.
          </p>
          <AdminForm action={rotateTracking} label="Regenerate tracking link">
            <input type="hidden" name="id" value={row.id} />
          </AdminForm>
        </details>
      </section>
      <section className="panel admin-card">
        <h2>Status and update history</h2>
        <ol className="order-history">
          {(history.data as History[]).map((event) => (
            <li key={event.id}>
              <strong>
                {event.old_status
                  ? `${statusLabels[event.old_status]} → `
                  : "Created → "}
                {statusLabels[event.new_status]}
              </strong>
              <time>
                {new Date(event.changed_at).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                })}{" "}
                IST
              </time>
              {event.customer_update && (
                <p className="preserve-lines">{event.customer_update}</p>
              )}
              <small>
                Admin: {event.admin_id || "Setup / removed account"}
              </small>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
