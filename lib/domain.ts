import { z } from "zod";

export const statuses = [
  "not_started",
  "in_process",
  "complete",
  "failed_issue",
] as const;
export type OrderStatus = (typeof statuses)[number];
export const statusLabels: Record<OrderStatus, string> = {
  not_started: "Not started",
  in_process: "In process",
  complete: "Complete",
  failed_issue: "Failed/issue",
};
export const orderTypes = ["repair", "pc_build", "consultation"] as const;
export const money = (value: number) =>
  `Rs. ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value)}`;
export function normalizePhone(input: string) {
  let phone = input.replace(/[\s()+.-]/g, "");
  if (/^\d{10}$/.test(phone)) phone = `91${phone}`;
  if (!/^[1-9]\d{7,14}$/.test(phone))
    throw new Error("Enter a valid phone number including country code.");
  return phone;
}
const text = z.string().trim().max(5000);
export const amountSchema = z.preprocess(
  (value) => (typeof value === "string" && !value.trim() ? NaN : value),
  z.coerce.number().finite().min(0).max(100000000).multipleOf(0.01),
);
const amount = amountSchema;
export const clientSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(150),
  phone: z.string().transform(normalizePhone),
  email: z.union([z.email(), z.literal("")]),
  notes: text,
});
export const orderSchema = z
  .object({
    id: z.string().uuid().optional(),
    client_id: z.string().uuid(),
    type: z.enum(orderTypes),
    description: z.string().trim().min(1).max(1000),
    requested_work: z.string().trim().min(1).max(5000),
    quote: z.union([z.literal("").transform(() => null), amount]),
    expected_date: z.union([z.literal(""), z.iso.date()]),
    internal_notes: text,
    customer_update: text,
    status: z.enum(statuses),
    version: z.coerce.number().int().min(1).optional(),
  })
  .refine((x) => x.status !== "failed_issue" || x.customer_update.length > 0, {
    message: "Explain the failure or issue in the customer-facing update.",
    path: ["customer_update"],
  });
export const priceSchema = z.object({
  id: z.string().uuid().optional(),
  service: z.string().trim().min(1).max(150),
  market_price: amount,
  price: amount,
  from_price: z.boolean(),
  visible: z.boolean(),
  sort_order: z.coerce.number().int().min(0).max(10000),
});
export const budgetSchema = z
  .object({
    id: z.enum(["entry", "mid", "extreme"]),
    label: z.string().trim().min(1).max(40),
    detail: z.string().trim().min(1).max(200),
    minimum: amount,
    maximum: z.union([z.literal("").transform(() => null), amount]),
  })
  .refine((x) => x.maximum === null || x.maximum >= x.minimum, {
    message: "Maximum budget must be at least the minimum.",
  });
export type Price = z.infer<typeof priceSchema> & { id: string };
export type Budget = z.infer<typeof budgetSchema>;
export const budgetRange = (b: Budget) =>
  b.maximum === null
    ? `${money(b.minimum)}+`
    : `${money(b.minimum)}–${money(b.maximum)}`;
export const templateKeys = [
  "build",
  "repair",
  "consult",
  "priority",
  "footer",
  "gallery",
  "configurator",
  "order_update",
] as const;
export type TemplateKey = (typeof templateKeys)[number];
export const templateLabels: Record<TemplateKey, string> = {
  build: "Build My PC",
  repair: "Fix My Device",
  consult: "Navigation consultation",
  priority: "Priority call",
  footer: "Footer / tracking contact",
  gallery: "Share gallery media",
  configurator: "PC build questionnaire",
  order_update: "Send order update to client",
};
export const templateVariables: Record<TemplateKey, string[]> = {
  build: [],
  repair: [],
  consult: ["consultation_fee"],
  priority: ["consultation_fee"],
  footer: [],
  gallery: [],
  configurator: [
    "use_case",
    "budget",
    "budget_range",
    "cpu",
    "name",
    "contact",
  ],
  order_update: ["client_name", "ticket", "status", "tracking_link"],
};
export function validateTemplate(key: TemplateKey, body: string) {
  if (!body.trim() || body.length > 4000)
    throw new Error("Message must contain between 1 and 4,000 characters.");
  const remainder = body.replace(/\{([a-z_]+)\}/g, (_, variable: string) => {
    if (!templateVariables[key].includes(variable))
      throw new Error(`Unsupported placeholder: {${variable}}`);
    return "";
  });
  if (/[{}]/.test(remainder))
    throw new Error("Use only the supported placeholders shown below.");
  if (key === "order_update" && !body.includes("{tracking_link}"))
    throw new Error("Order updates must include {tracking_link}.");
  return body.trim();
}
export function renderTemplate(
  body: string,
  variables: Record<string, string> = {},
) {
  return body.replace(
    /\{([a-z_]+)\}/g,
    (_, key: string) => variables[key] ?? "",
  );
}
export function messageLink(phone: string, body: string) {
  return `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(body)}`;
}
export const mediaTypes: Record<
  string,
  { extension: string; bucket: string; max: number; type: "image" | "video" }
> = {
  "image/jpeg": {
    extension: "jpg",
    bucket: "wefix-images",
    max: 10 * 1024 * 1024,
    type: "image",
  },
  "image/png": {
    extension: "png",
    bucket: "wefix-images",
    max: 10 * 1024 * 1024,
    type: "image",
  },
  "image/webp": {
    extension: "webp",
    bucket: "wefix-images",
    max: 10 * 1024 * 1024,
    type: "image",
  },
  "image/gif": {
    extension: "gif",
    bucket: "wefix-images",
    max: 10 * 1024 * 1024,
    type: "image",
  },
  "image/avif": {
    extension: "avif",
    bucket: "wefix-images",
    max: 10 * 1024 * 1024,
    type: "image",
  },
  "video/mp4": {
    extension: "mp4",
    bucket: "wefix-videos",
    max: 50 * 1024 * 1024,
    type: "video",
  },
  "video/webm": {
    extension: "webm",
    bucket: "wefix-videos",
    max: 50 * 1024 * 1024,
    type: "video",
  },
};
export function validateUpload(mime: string, size: number) {
  const rule = mediaTypes[mime];
  if (!rule || size <= 0 || size > rule.max)
    throw new Error(
      "Use a supported image up to 10 MB or MP4/WebM video up to 50 MB.",
    );
  return rule;
}
export type Client = {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  updated_at: string;
};
export type Order = {
  id: string;
  ticket: string;
  client_id: string;
  type: (typeof orderTypes)[number];
  description: string;
  requested_work: string;
  quote: number | null;
  expected_date: string | null;
  internal_notes: string;
  customer_update: string;
  status: OrderStatus;
  tracking_token: string;
  created_at: string;
  updated_at: string;
  version: number;
};
export type History = {
  id: number;
  order_id: string;
  old_status: OrderStatus | null;
  new_status: OrderStatus;
  customer_update: string;
  changed_at: string;
  admin_id: string;
};
export type GalleryItem = {
  id: string;
  name: string;
  src: string;
  type: "image" | "video";
  visible: boolean;
  sort_order: number;
  bucket: string | null;
  object_path: string | null;
};
export type SiteContent = {
  prices: Price[];
  budgets: Budget[];
  phone: string;
  consultationFee: number;
  templates: Record<TemplateKey, string>;
};
export const publicOrderFields =
  "ticket,type,description,requested_work,quote,expected_date,customer_update,status,updated_at";
export type PublicOrder = Pick<
  Order,
  | "ticket"
  | "type"
  | "description"
  | "requested_work"
  | "quote"
  | "expected_date"
  | "customer_update"
  | "status"
  | "updated_at"
>;
