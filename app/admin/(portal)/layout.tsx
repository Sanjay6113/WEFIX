import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { logout } from "../auth-actions";
export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAdmin();
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/admin">
          WeFix <span>Admin</span>
        </Link>
        <nav aria-label="Admin navigation">
          {[
            ["/admin", "Overview"],
            ["/admin/clients", "Clients"],
            ["/admin/orders", "Orders"],
            ["/admin/pricing", "Pricing"],
            ["/admin/gallery", "Gallery"],
            ["/admin/whatsapp", "WhatsApp"],
          ].map(([href, label]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="admin-account">
          <span>{user.email}</span>
          <Link href="/" target="_blank">
            View website ↗
          </Link>
          <Link href="/admin/reset-password">Change password</Link>
          <form action={logout}>
            <button className="button button-secondary">Sign out</button>
          </form>
        </div>
      </aside>
      <main className="admin-main">
        {!process.env.SUPABASE_SERVICE_ROLE_KEY && (
          <p className="notice error">
            Private tracking needs SUPABASE_SERVICE_ROLE_KEY configured on the
            server. Customers cannot track orders until setup is complete.
          </p>
        )}
        {children}
      </main>
    </div>
  );
}
