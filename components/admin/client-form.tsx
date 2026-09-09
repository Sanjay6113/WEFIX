import { AdminForm, Input, Textarea } from "./form";
import { saveClient } from "@/app/admin/actions";
import type { Client } from "@/lib/domain";
export function ClientForm({
  client,
  saved,
}: {
  client?: Client;
  saved?: boolean;
}) {
  return (
    <AdminForm
      action={saveClient}
      label={client ? "Save client" : "Create client"}
      initialSuccess={saved ? "Client saved." : undefined}
    >
      {client && <input type="hidden" name="id" value={client.id} />}
      <Input
        label="Client name"
        name="name"
        defaultValue={client?.name}
        maxLength={150}
        required
        autoComplete="name"
      />
      <Input
        label="Phone / WhatsApp (10 Indian digits or international country code)"
        name="phone"
        type="tel"
        defaultValue={client?.phone}
        required
        autoComplete="tel"
      />
      <Input
        label="Email (optional)"
        name="email"
        type="email"
        defaultValue={client?.email}
        autoComplete="email"
      />
      <Textarea
        label="Internal client notes"
        name="notes"
        defaultValue={client?.notes}
        maxLength={5000}
      />
      <p className="muted">
        Clients do not need an account. Existing phone numbers are checked
        before saving.
      </p>
    </AdminForm>
  );
}
