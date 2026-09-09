import type { SiteContent } from "./domain";
export const defaultContent: SiteContent = {
  phone: process.env.NEXT_PUBLIC_WEFIX_WHATSAPP || "919994428061",
  consultationFee: 299,
  prices: [
    {
      id: "10000000-0000-4000-8000-000000000001",
      service: "Laptop screen replacement",
      market_price: 5500,
      price: 4299,
      from_price: true,
      visible: true,
      sort_order: 0,
    },
    {
      id: "10000000-0000-4000-8000-000000000002",
      service: "Battery replacement",
      market_price: 4200,
      price: 3299,
      from_price: true,
      visible: true,
      sort_order: 1,
    },
    {
      id: "10000000-0000-4000-8000-000000000003",
      service: "Motherboard IC repair",
      market_price: 5000,
      price: 3499,
      from_price: true,
      visible: true,
      sort_order: 2,
    },
    {
      id: "10000000-0000-4000-8000-000000000004",
      service: "Water damage diagnosis",
      market_price: 1500,
      price: 799,
      from_price: false,
      visible: true,
      sort_order: 3,
    },
  ],
  budgets: [
    {
      id: "entry",
      label: "Entry",
      detail: "Smart value without weak parts",
      minimum: 45000,
      maximum: 75000,
    },
    {
      id: "mid",
      label: "Mid",
      detail: "Balanced performance for years",
      minimum: 75000,
      maximum: 140000,
    },
    {
      id: "extreme",
      label: "Extreme",
      detail: "No-compromise cooling and compute",
      minimum: 140000,
      maximum: null,
    },
  ],
  templates: {
    build: "Hi WeFix, I want help building a custom PC.",
    repair: "Hi WeFix, I need a device repair quote.",
    consult: "Hi WeFix, I want a priority tech advisor consultation.",
    priority:
      "Hi WeFix, I want to book a {consultation_fee} priority tech advisor call.",
    footer: "Hi WeFix, I need help with my device.",
    gallery:
      "Hi WeFix, I want to share photos or videos for the website gallery.",
    configurator:
      "Hi WeFix, I want a custom PC build consultation.\nUse case: {use_case}\nBudget: {budget} ({budget_range})\nCPU preference: {cpu}\nName: {name}\nContact: {contact}",
    order_update:
      "Hi {client_name}, your WeFix order {ticket} is now {status}.\nTrack your order: {tracking_link}",
  },
};
