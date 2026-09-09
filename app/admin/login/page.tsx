import Link from "next/link";
import { login, requestRecovery } from "../auth-actions";
import { AdminForm, Input } from "@/components/admin/form";
import { publicConfig } from "@/lib/supabase/config";
export default async function LoginPage({
  searchParams: input,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const searchParams = await input;
  const configured = Boolean(publicConfig());
  return (
    <main className="auth-shell">
      <div className="panel auth-card">
        <Link href="/" className="admin-back">
          ← WeFix website
        </Link>
        <p className="section-kicker">Staff access</p>
        <h1>Admin login</h1>
        <p className="section-copy">
          Manage your website, clients, and orders.
        </p>
        {!configured ? (
          <p className="notice" role="status">
            Admin access is not configured yet. The site owner must connect
            Supabase using the setup guide in docs/ADMIN-SETUP.md.
          </p>
        ) : (
          <>
            {searchParams.denied && (
              <p className="notice error">
                This account does not have admin access, or membership could not
                be verified.
              </p>
            )}
            {searchParams.expired && (
              <p className="notice error">
                This recovery link is invalid or expired. Request a new link
                below.
              </p>
            )}
            {searchParams.reset && (
              <p className="notice success">
                Password updated. Sign in with your new password.
              </p>
            )}
            <AdminForm action={login} label="Sign in">
              <Input
                label="Email"
                name="email"
                type="email"
                autoComplete="username"
                required
              />
              <Input
                label="Password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </AdminForm>
            <details className="recovery">
              <summary>Forgot your password?</summary>
              <AdminForm action={requestRecovery} label="Send reset link">
                <Input
                  label="Account email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                />
              </AdminForm>
            </details>
          </>
        )}
      </div>
    </main>
  );
}
