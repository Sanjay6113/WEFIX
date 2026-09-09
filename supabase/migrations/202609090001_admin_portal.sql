-- Additive migration. Existing repairs, pc_builds and consultations remain untouched.
create extension if not exists pgcrypto with schema extensions;
create table public.admin_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_members enable row level security;
create policy "Read own membership" on public.admin_members for select to authenticated using (user_id = auth.uid());
grant select on public.admin_members to authenticated;
revoke all on public.admin_members from anon;
revoke insert, update, delete on public.admin_members from authenticated;

create function public.is_wefix_admin() returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.admin_members where user_id = (select auth.uid()));
$$;
revoke all on function public.is_wefix_admin() from public;
grant execute on function public.is_wefix_admin() to anon, authenticated;

create table public.clients (
  id uuid primary key default gen_random_uuid(), name text not null check(length(trim(name)) between 1 and 150),
  phone text not null unique check(phone ~ '^[1-9][0-9]{7,14}$'), email text not null default '', notes text not null default '',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create sequence public.order_ticket_seq start 1001;
create table public.orders (
  id uuid primary key default gen_random_uuid(), ticket text not null unique default ('WF-' || nextval('public.order_ticket_seq')),
  client_id uuid not null references public.clients(id), type text not null check(type in ('repair','pc_build','consultation')),
  description text not null check(length(trim(description)) between 1 and 1000), requested_work text not null check(length(trim(requested_work)) between 1 and 5000),
  quote numeric(12,2) check(quote >= 0 and quote <= 100000000), expected_date date,
  internal_notes text not null default '', customer_update text not null default '',
  status text not null default 'not_started' check(status in ('not_started','in_process','complete','failed_issue')),
  tracking_token text not null unique default encode(extensions.gen_random_bytes(32), 'hex'),
  version integer not null default 1,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check(status <> 'failed_issue' or length(trim(customer_update)) > 0)
);
create index orders_client_idx on public.orders(client_id);
create index orders_status_updated_idx on public.orders(status, updated_at desc);
create table public.order_history (
  id bigint generated always as identity primary key, order_id uuid not null references public.orders(id),
  old_status text, new_status text not null, customer_update text not null default '',
  changed_at timestamptz not null default now(), admin_id uuid references auth.users(id) on delete set null
);
create index order_history_order_idx on public.order_history(order_id, changed_at);
create table public.repair_pricing (
  id uuid primary key default gen_random_uuid(), service text not null check(length(trim(service)) between 1 and 150),
  market_price numeric(12,2) not null check(market_price between 0 and 100000000), price numeric(12,2) not null check(price between 0 and 100000000),
  from_price boolean not null default false, visible boolean not null default true, sort_order integer not null default 0 check(sort_order between 0 and 10000)
);
create table public.pc_budgets (
  id text primary key check(id in ('entry','mid','extreme')), label text not null, detail text not null,
  minimum numeric(12,2) not null check(minimum between 0 and 100000000), maximum numeric(12,2) check(maximum between minimum and 100000000)
);
create table public.website_settings (
  id integer primary key default 1 check(id = 1), phone text not null check(phone ~ '^[1-9][0-9]{7,14}$'),
  consultation_fee numeric(12,2) not null default 299 check(consultation_fee between 0 and 100000000)
);
create table public.whatsapp_templates (
  key text primary key check(key in ('build','repair','consult','priority','footer','gallery','configurator','order_update')),
  body text not null check(length(trim(body)) between 1 and 4000)
);
create table public.gallery_media (
  id uuid primary key default gen_random_uuid(), name text not null check(length(trim(name)) between 1 and 200),
  src text not null unique, type text not null check(type in ('image','video')),
  bucket text check(bucket in ('wefix-images','wefix-videos')), object_path text,
  visible boolean not null default true, sort_order integer not null default 0 check(sort_order between 0 and 10000),
  created_at timestamptz not null default now()
);

create function public.wefix_touch_updated() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end;
$$;
create trigger clients_touch before update on public.clients for each row execute function public.wefix_touch_updated();
create function public.wefix_order_before() returns trigger language plpgsql set search_path = '' as $$
begin
  if TG_OP = 'UPDATE' then
    new.id := old.id; new.ticket := old.ticket; new.created_at := old.created_at;
    new.version := old.version + 1;
  end if;
  new.updated_at := now(); return new;
end;
$$;
create trigger orders_before before insert or update on public.orders for each row execute function public.wefix_order_before();
create function public.wefix_order_history() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if TG_OP = 'INSERT' then
    insert into public.order_history(order_id, old_status, new_status, customer_update, admin_id)
      values(new.id, null, new.status, new.customer_update, auth.uid());
  elsif old.status is distinct from new.status or old.customer_update is distinct from new.customer_update then
    insert into public.order_history(order_id, old_status, new_status, customer_update, admin_id)
      values(new.id, old.status, new.status, new.customer_update, auth.uid());
  end if;
  update public.clients set updated_at = now() where id = new.client_id;
  return new;
end;
$$;
create trigger orders_history after insert or update on public.orders for each row execute function public.wefix_order_history();
revoke all on function public.wefix_order_history() from public;

-- All private rows require admin membership, including direct Data API access.
do $$ declare t text; begin
  foreach t in array array['clients','orders','repair_pricing','pc_budgets','website_settings','whatsapp_templates','gallery_media'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "Admin management" on public.%I for all to authenticated using ((select public.is_wefix_admin())) with check ((select public.is_wefix_admin()))', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('revoke all on public.%I from anon', t);
  end loop;
end $$;
alter table public.order_history enable row level security;
create policy "Admin history read" on public.order_history for select to authenticated using ((select public.is_wefix_admin()));
revoke all on public.order_history from anon, authenticated;
grant select on public.order_history to authenticated;
grant usage on sequence public.order_ticket_seq to authenticated;
grant all on public.admin_members, public.clients, public.orders, public.order_history, public.repair_pricing, public.pc_budgets, public.website_settings, public.whatsapp_templates, public.gallery_media to service_role;
grant usage, select on all sequences in schema public to service_role;

grant select on public.repair_pricing, public.pc_budgets, public.website_settings, public.whatsapp_templates, public.gallery_media to anon;
create policy "Published repair prices" on public.repair_pricing for select to anon, authenticated using (visible);
create policy "Public budgets" on public.pc_budgets for select to anon, authenticated using (true);
create policy "Public settings" on public.website_settings for select to anon, authenticated using (true);
create policy "Public website messages" on public.whatsapp_templates for select to anon, authenticated using (key <> 'order_update');
create policy "Published gallery" on public.gallery_media for select to anon, authenticated using (visible);

-- Search across all clients without loading or truncating their IDs in application code.
create view public.admin_order_list with (security_invoker = true) as
  select o.*, c.name as client_name, c.phone as client_phone
  from public.orders o join public.clients c on c.id = o.client_id;
revoke all on public.admin_order_list from anon;
grant select on public.admin_order_list to authenticated, service_role;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types) values
 ('wefix-images','wefix-images',true,10485760,array['image/jpeg','image/png','image/webp','image/gif','image/avif']),
 ('wefix-videos','wefix-videos',true,52428800,array['video/mp4','video/webm'])
on conflict(id) do update set file_size_limit=excluded.file_size_limit, allowed_mime_types=excluded.allowed_mime_types, public=true;
create policy "Admin gallery uploads" on storage.objects for insert to authenticated
  with check(bucket_id in ('wefix-images','wefix-videos') and (select public.is_wefix_admin()) and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Admin gallery objects" on storage.objects for select to authenticated
  using(bucket_id in ('wefix-images','wefix-videos') and (select public.is_wefix_admin()));
create policy "Admin gallery removal" on storage.objects for delete to authenticated
  using(bucket_id in ('wefix-images','wefix-videos') and (select public.is_wefix_admin()));
