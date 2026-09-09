import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizePhone,
  clientSchema,
  orderSchema,
  priceSchema,
  budgetSchema,
  validateTemplate,
  renderTemplate,
  messageLink,
  validateUpload,
  publicOrderFields,
} from "../lib/domain";
import { defaultContent } from "../lib/defaults";
test("phone normalization keeps full numbers and rejects suffix lookups", () => {
  assert.equal(normalizePhone("+91 99944 28061"), "919994428061");
  assert.equal(normalizePhone("9994428061"), "919994428061");
  assert.equal(normalizePhone("+1 (212) 555-0199"), "12125550199");
  for (const value of ["0", "5", "phone", "00000000000000000", "91<script>"])
    assert.throws(() => normalizePhone(value));
});
test("clients require a name and phone, with optional valid email", () => {
  assert.equal(
    clientSchema.parse({
      name: " Alice ",
      phone: "9994428061",
      email: "",
      notes: "",
    }).name,
    "Alice",
  );
  assert.throws(() =>
    clientSchema.parse({
      name: "",
      phone: "9994428061",
      email: "not-email",
      notes: "",
    }),
  );
});
const order = {
  client_id: "10000000-0000-4000-8000-000000000001",
  type: "repair",
  description: "Laptop",
  requested_work: "Replace screen",
  quote: "",
  expected_date: "",
  internal_notes: "private",
  customer_update: "",
  status: "not_started",
};
test("order validation permits all four states but requires an issue explanation", () => {
  for (const status of ["not_started", "in_process", "complete"])
    assert.equal(orderSchema.parse({ ...order, status }).status, status);
  assert.throws(() => orderSchema.parse({ ...order, status: "failed_issue" }));
  assert.equal(
    orderSchema.parse({
      ...order,
      status: "failed_issue",
      customer_update: "Replacement part unavailable",
    }).status,
    "failed_issue",
  );
  assert.throws(() => orderSchema.parse({ ...order, status: "ready" }));
  assert.equal(orderSchema.parse(order).quote, null);
  assert.throws(() =>
    orderSchema.parse({ ...order, expected_date: "2026-02-30" }),
  );
  assert.throws(() => orderSchema.parse({ ...order, quote: -1 }));
});
test("price and budget amounts reject invalid ranges", () => {
  assert.throws(() =>
    priceSchema.parse({ ...defaultContent.prices[0], price: -1 }),
  );
  assert.throws(() =>
    priceSchema.parse({ ...defaultContent.prices[0], price: "" }),
  );
  assert.throws(() =>
    priceSchema.parse({ ...defaultContent.prices[0], price: 1.234 }),
  );
  assert.throws(() =>
    budgetSchema.parse({
      ...defaultContent.budgets[0],
      minimum: 80000,
      maximum: 70000,
    }),
  );
  assert.equal(
    budgetSchema.parse({ ...defaultContent.budgets[2], maximum: "" }).maximum,
    null,
  );
});
test("templates reject unknown or malformed placeholders and preserve encoded user text", () => {
  assert.throws(() => validateTemplate("build", "Hi {client_name}"));
  assert.throws(() => validateTemplate("configurator", "Hi {{name}}"));
  assert.throws(() => validateTemplate("order_update", "No link here"));
  for (const [key, body] of Object.entries(defaultContent.templates))
    validateTemplate(key as keyof typeof defaultContent.templates, body);
  const text = renderTemplate("Hi {name}\n{contact}", {
    name: "A & B {cpu}",
    contact: "9994428061",
  });
  assert.equal(text, "Hi A & B {cpu}\n9994428061");
  assert.equal(
    new URL(messageLink("919994428061", text)).searchParams.get("text"),
    text,
  );
});
test("media validation enforces separate image and video limits", () => {
  assert.equal(
    validateUpload("image/png", 10 * 1024 * 1024).bucket,
    "wefix-images",
  );
  assert.equal(
    validateUpload("video/mp4", 50 * 1024 * 1024).bucket,
    "wefix-videos",
  );
  for (const [type, size] of [
    ["image/png", 10485761],
    ["video/mp4", 52428801],
    ["image/svg+xml", 100],
    ["image/png", 0],
  ] as const)
    assert.throws(() => validateUpload(type, size));
});
test("public order projection excludes private fields", () => {
  const fields = new Set(publicOrderFields.split(","));
  for (const field of [
    "client_id",
    "phone",
    "email",
    "internal_notes",
    "tracking_token",
    "admin_id",
  ])
    assert.equal(fields.has(field), false);
  assert.equal(fields.has("customer_update"), true);
});
