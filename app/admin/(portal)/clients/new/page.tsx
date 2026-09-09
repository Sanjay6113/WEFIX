import { AdminHeading } from "@/components/admin/shared";
import { ClientForm } from "@/components/admin/client-form";
export default function NewClient() {
  return (
    <>
      <AdminHeading title="Add client" />
      <section className="panel admin-card">
        <ClientForm />
      </section>
    </>
  );
}
