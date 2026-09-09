import type { Metadata } from "next";
import { privateClient } from "@/lib/supabase/server";
import {
  publicOrderFields,
  statuses,
  statusLabels,
  money,
  type PublicOrder,
} from "@/lib/domain";
import { SiteNav } from "@/components/site-nav";
import { Footer } from "@/components/footer";
import { WhatsAppLink } from "@/components/site-content";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata: Metadata = {
  title: "Your order | WeFix",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
export default async function PrivateTracking({
  params: route,
}: {
  params: Promise<{ token: string }>;
}) {
  const params = await route;
  let order: PublicOrder | null = null;
  if (/^[a-f0-9]{64}$/.test(params.token)) {
    try {
      const { data, error } = await privateClient()
        .from("orders")
        .select(publicOrderFields)
        .eq("tracking_token", params.token)
        .maybeSingle();
      if (error) console.error("Private tracking lookup unavailable.");
      else order = data as PublicOrder | null;
    } catch {
      console.error("Private tracking configuration unavailable.");
    }
  }
  return (
    <main className="tracker-shell">
      <SiteNav />
      <div className="container">
        <section className="panel tracker-card">
          {order ? (
            <>
              <p className="section-kicker">{order.ticket}</p>
              <h1 className="tracking-title">Your order</h1>
              <h2>{order.description}</h2>
              <div className={`tracking-current status-${order.status}`}>
                <strong>{statusLabels[order.status]}</strong>
                <p>
                  {order.status === "failed_issue"
                    ? "Your order needs attention. Read the update below or contact our team."
                    : "We’ll update this page as your order progresses."}
                </p>
              </div>
              <ol className="tracking-stages" aria-label="Order stages">
                {statuses
                  .filter((s) => s !== "failed_issue")
                  .map((s) => (
                    <li
                      key={s}
                      aria-current={s === order!.status ? "step" : undefined}
                      className={s === order!.status ? "current" : ""}
                    >
                      {statusLabels[s]}
                    </li>
                  ))}
              </ol>
              <dl className="tracking-details">
                <dt>Requested work</dt>
                <dd className="preserve-lines">{order.requested_work}</dd>
                <dt>Quote</dt>
                <dd>
                  {order.quote === null ? "Not quoted yet" : money(order.quote)}
                </dd>
                <dt>Expected completion</dt>
                <dd>{order.expected_date || "To be confirmed"}</dd>
                <dt>Latest update</dt>
                <dd className="preserve-lines">
                  {order.customer_update ||
                    "Your order has been registered. We’ll share an update here soon."}
                </dd>
                <dt>Last updated</dt>
                <dd>
                  {new Date(order.updated_at).toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                  })}{" "}
                  IST
                </dd>
              </dl>
            </>
          ) : (
            <>
              <h1 className="tracking-title">Tracking unavailable</h1>
              <p className="section-copy">
                This link is unavailable. Contact WeFix for a current tracking
                link.
              </p>
            </>
          )}
          <WhatsAppLink template="footer" className="button button-primary">
            Message WeFix
          </WhatsAppLink>
        </section>
      </div>
      <Footer />
    </main>
  );
}
