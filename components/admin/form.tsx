"use client";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { ActionResult } from "@/app/admin/auth-actions";
export type FormAction = (
  state: ActionResult,
  form: FormData,
) => Promise<ActionResult>;
function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button className="button button-primary" disabled={pending} type="submit">
      {pending ? "Saving…" : label}
    </button>
  );
}
export function AdminForm({
  action,
  children,
  label = "Save changes",
  className = "admin-form",
  initialSuccess,
}: {
  action: FormAction;
  children: React.ReactNode;
  label?: string;
  className?: string;
  initialSuccess?: string;
}) {
  const [state, dispatch] = useActionState(action, {});
  return (
    <form action={dispatch} className={className}>
      <Fields>{children}</Fields>
      {state.error && (
        <p className="notice error" role="alert">
          {state.error}
        </p>
      )}
      {!state.error && (state.success || initialSuccess) && (
        <p className="notice success" role="status">
          {state.success || initialSuccess}
        </p>
      )}
      <Submit label={label} />
    </form>
  );
}
function Fields({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <fieldset className="form-fields" disabled={pending}>
      {children}
    </fieldset>
  );
}
export function Input({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="admin-label">
      {label}
      <input className="field" {...props} />
    </label>
  );
}
export function Textarea({
  label,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <label className="admin-label">
      {label}
      <textarea className="field" rows={4} {...props} />
    </label>
  );
}
