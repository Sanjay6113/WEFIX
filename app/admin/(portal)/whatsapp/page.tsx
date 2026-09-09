import { adminRows } from "@/lib/admin-queries";
import { defaultContent } from "@/lib/defaults";
import { templateKeys, templateLabels, money } from "@/lib/domain";
import { AdminHeading } from "@/components/admin/shared";
import { AdminForm, Input } from "@/components/admin/form";
import { TemplateEditor } from "@/components/admin/template-editor";
import { savePhone } from "@/app/admin/actions";
export default async function WhatsAppPage() {
  const [settings, templates] = await Promise.all([
    adminRows("website_settings"),
    adminRows("whatsapp_templates"),
  ]);
  const bodies = Object.fromEntries(templates.map((t) => [t.key, t.body]));
  const sample = {
    consultation_fee: money(settings[0]?.consultation_fee ?? 299),
    use_case: "Gaming",
    budget: "Mid",
    budget_range: "Rs. 75,000–Rs. 1,40,000",
    cpu: "Advisor Pick",
    name: "Sample client",
    contact: "919876543210",
    client_name: "Sample client",
    ticket: "WF-1001",
    status: "In process",
    tracking_link: `${process.env.NEXT_PUBLIC_SITE_URL || "https://your-website.example"}/check-status/private-link`,
  };
  return (
    <>
      <AdminHeading
        title="WhatsApp"
        copy="Customize the messages customers open and the updates you send to clients."
      />
      <section className="panel admin-card">
        <h2>Business number</h2>
        {settings[0] ? (
          <AdminForm action={savePhone} label="Save WhatsApp number">
            <Input
              label="WhatsApp number with country code"
              name="phone"
              type="tel"
              defaultValue={settings[0].phone}
              required
            />
          </AdminForm>
        ) : (
          <p className="notice error">
            Run npm run db:seed to initialize settings.
          </p>
        )}
        <p className="muted">
          Order updates are addressed to the selected client’s number. Messages
          open in WhatsApp for manual sending.
        </p>
      </section>
      {templateKeys.map((key) => (
        <details className="panel admin-card" key={key}>
          <summary>{templateLabels[key]}</summary>
          <TemplateEditor
            templateKey={key}
            body={bodies[key] || defaultContent.templates[key]}
            sample={sample}
          />
        </details>
      ))}
    </>
  );
}
