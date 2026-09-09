import { requireAdmin } from "@/lib/admin";
import { AdminForm, Input } from "@/components/admin/form";
import { updatePassword } from "../auth-actions";
export default async function ResetPasswordPage() {
  await requireAdmin();
  return (
    <main className="auth-shell">
      <div className="panel auth-card">
        <h1>New password</h1>
        <AdminForm action={updatePassword} label="Update password">
          <Input
            label="New password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={12}
            maxLength={128}
            required
          />
          <Input
            label="Confirm password"
            name="confirm"
            type="password"
            autoComplete="new-password"
            minLength={12}
            maxLength={128}
            required
          />
        </AdminForm>
      </div>
    </main>
  );
}
