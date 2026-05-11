-- WeFix Web Platform baseline schema

CREATE TABLE IF NOT EXISTS repairs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  ticket_id TEXT UNIQUE,
  customer_phone TEXT NOT NULL,
  customer_name TEXT,
  device_name TEXT,
  repair_type TEXT,
  status TEXT DEFAULT 'Received',
  price_quoted NUMERIC,
  is_priority BOOLEAN DEFAULT FALSE,
  invoice_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pc_builds (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  persona TEXT,
  budget_label TEXT,
  budget_limit NUMERIC,
  preferred_cpu TEXT,
  customer_contact TEXT,
  customer_name TEXT,
  whatsapp_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS consultations (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  customer_phone TEXT NOT NULL,
  customer_name TEXT,
  topic TEXT,
  amount NUMERIC DEFAULT 299,
  payment_status TEXT DEFAULT 'Pending',
  razorpay_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS repairs_customer_phone_idx ON repairs (customer_phone);
CREATE INDEX IF NOT EXISTS repairs_ticket_id_idx ON repairs (ticket_id);
CREATE INDEX IF NOT EXISTS pc_builds_customer_contact_idx ON pc_builds (customer_contact);
