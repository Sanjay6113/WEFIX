import { adminRows } from "@/lib/admin-queries";
import {
  savePrice,
  saveBudget,
  saveConsultationFee,
} from "@/app/admin/actions";
import { AdminForm, Input, Textarea } from "@/components/admin/form";
import { AdminHeading } from "@/components/admin/shared";
import type { Price, Budget } from "@/lib/domain";
function PriceForm({ price }: { price?: Price }) {
  return (
    <AdminForm
      action={savePrice}
      label={price ? "Save repair price" : "Add service"}
    >
      {price && <input type="hidden" name="id" value={price.id} />}
      <Input
        label="Service name"
        name="service"
        defaultValue={price?.service}
        required
        maxLength={150}
      />
      <div className="admin-fields-grid">
        <Input
          label="Market comparison price (INR)"
          name="market_price"
          type="number"
          min="0"
          max="100000000"
          step="0.01"
          defaultValue={price?.market_price}
          required
        />
        <Input
          label="WeFix price (INR)"
          name="price"
          type="number"
          min="0"
          max="100000000"
          step="0.01"
          defaultValue={price?.price}
          required
        />
      </div>
      <Input
        label="Display order (lowest first)"
        name="sort_order"
        type="number"
        min="0"
        max="10000"
        defaultValue={price?.sort_order ?? 0}
        required
      />
      <label className="checkbox">
        <input
          type="checkbox"
          name="from_price"
          defaultChecked={price?.from_price}
        />{" "}
        Show “From” before the WeFix price
      </label>
      <label className="checkbox">
        <input
          type="checkbox"
          name="visible"
          defaultChecked={price?.visible ?? true}
        />{" "}
        Visible on website
      </label>
    </AdminForm>
  );
}
export default async function PricingPage() {
  const [prices, budgets, settings] = await Promise.all([
    adminRows("repair_pricing"),
    adminRows("pc_budgets"),
    adminRows("website_settings"),
  ]);
  return (
    <>
      <AdminHeading
        title="Pricing"
        copy="Changes appear on the website after saving. All amounts are in INR."
      />
      <section>
        <h2>Repair services</h2>
        <div className="admin-editor-grid">
          {(prices as Price[])
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((p) => (
              <details className="panel admin-card" key={p.id}>
                <summary>
                  {p.service}
                  {!p.visible ? " (hidden)" : ""}
                </summary>
                <PriceForm price={p} />
              </details>
            ))}
          <details className="panel admin-card">
            <summary>Add repair service</summary>
            <PriceForm />
          </details>
        </div>
      </section>
      <section>
        <h2>PC budget bands</h2>
        <div className="admin-editor-grid">
          {(budgets as Budget[])
            .sort((a, b) => a.minimum - b.minimum)
            .map((b) => (
              <div className="panel admin-card" key={b.id}>
                <h3>{b.label}</h3>
                <AdminForm action={saveBudget} label="Save budget">
                  <input type="hidden" name="id" value={b.id} />
                  <Input
                    label="Band name"
                    name="label"
                    defaultValue={b.label}
                    maxLength={40}
                    required
                  />
                  <Textarea
                    label="Description"
                    name="detail"
                    defaultValue={b.detail}
                    maxLength={200}
                    required
                  />
                  <Input
                    label="Minimum INR"
                    name="minimum"
                    type="number"
                    min="0"
                    max="100000000"
                    step="0.01"
                    defaultValue={b.minimum}
                    required
                  />
                  <Input
                    label="Maximum INR (blank for no upper limit)"
                    name="maximum"
                    type="number"
                    min="0"
                    max="100000000"
                    step="0.01"
                    defaultValue={b.maximum ?? ""}
                  />
                </AdminForm>
              </div>
            ))}
        </div>
      </section>
      <section className="panel admin-card">
        <h2>Priority consultation</h2>
        {settings[0] ? (
          <AdminForm action={saveConsultationFee} label="Save consultation fee">
            <Input
              label="Consultation fee (INR)"
              name="consultation_fee"
              type="number"
              min="0"
              max="100000000"
              step="0.01"
              defaultValue={settings[0].consultation_fee}
              required
            />
          </AdminForm>
        ) : (
          <p className="notice error">
            Run npm run db:seed to create initial website settings.
          </p>
        )}
      </section>
    </>
  );
}
