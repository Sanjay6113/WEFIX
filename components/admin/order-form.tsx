import { AdminForm, Input, Textarea } from "./form";
import { saveOrder } from "@/app/admin/actions";
import { statuses, statusLabels, type Client, type Order } from "@/lib/domain";
export function OrderForm({
  order,
  client,
  saved,
}: {
  order?: Order;
  client: Pick<Client, "id" | "name" | "phone">;
  saved?: boolean;
}) {
  return (
    <AdminForm
      action={saveOrder}
      label={order ? "Save order" : "Create order"}
      initialSuccess={saved ? "Order saved." : undefined}
    >
      <p>
        <strong>Client: {client.name}</strong> · +{client.phone}
      </p>
      <input type="hidden" name="client_id" value={client.id} />
      {order && (
        <>
          <input type="hidden" name="id" value={order.id} />
          <input type="hidden" name="version" value={order.version} />
        </>
      )}
      <div className="admin-fields-grid">
        <label className="admin-label">
          Order type
          <select
            name="type"
            className="field"
            defaultValue={order?.type || "repair"}
          >
            <option value="repair">Repair</option>
            <option value="pc_build">PC build</option>
            <option value="consultation">Consultation</option>
          </select>
        </label>
        <label className="admin-label">
          Status
          <select
            name="status"
            className="field"
            defaultValue={order?.status || "not_started"}
          >
            {(order ? statuses : (["not_started"] as const)).map((s) => (
              <option key={s} value={s}>
                {statusLabels[s]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <Input
        label="Device / build description"
        name="description"
        defaultValue={order?.description}
        required
        maxLength={1000}
      />
      <Textarea
        label="Requested work (visible to customer)"
        name="requested_work"
        defaultValue={order?.requested_work}
        required
        maxLength={5000}
      />
      <div className="admin-fields-grid">
        <Input
          label="Quote in INR (optional)"
          name="quote"
          type="number"
          step="0.01"
          min="0"
          max="100000000"
          defaultValue={order?.quote ?? ""}
        />
        <Input
          label="Expected completion date (optional)"
          name="expected_date"
          type="date"
          defaultValue={order?.expected_date || ""}
        />
      </div>
      <Textarea
        label="Customer-facing update (required for Failed/issue)"
        name="customer_update"
        defaultValue={order?.customer_update}
        maxLength={5000}
      />
      <Textarea
        label="Internal order notes (admin only)"
        name="internal_notes"
        defaultValue={order?.internal_notes}
        maxLength={5000}
      />
    </AdminForm>
  );
}
