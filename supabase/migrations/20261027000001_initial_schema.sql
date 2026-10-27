-- ETHIO Foods — initial schema
-- Tables, constraints, indexes, Row Level Security, storage bucket and helper functions.
-- Public visitors can read the active catalog and public site content only.
-- Customer submissions are inserted by the server with the service role and are
-- readable only by authenticated admins.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- User profiles and roles
-- ---------------------------------------------------------------------------
create table public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text check (char_length(full_name) <= 120),
  role text not null default 'viewer' check (role in ('admin', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger user_profiles_updated before update on public.user_profiles
  for each row execute function public.set_updated_at();

-- Create a profile row for every new auth user (role defaults to viewer: no admin access).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.user_profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', null))
  on conflict (id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Role checks used by RLS policies. SECURITY DEFINER so policies on
-- user_profiles do not recurse.
create or replace function public.current_role_name()
returns text language sql stable security definer set search_path = public as $$
  select role from public.user_profiles where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role in ('admin', 'editor') from public.user_profiles where id = auth.uid()), false)
$$;

create or replace function public.is_owner_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'admin' from public.user_profiles where id = auth.uid()), false)
$$;

-- Prevent non-owners from changing roles.
create or replace function public.guard_role_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and not public.is_owner_admin() and auth.uid() is not null then
    raise exception 'Only an admin can change roles';
  end if;
  return new;
end $$;
create trigger user_profiles_guard_role before update on public.user_profiles
  for each row execute function public.guard_role_change();

-- ---------------------------------------------------------------------------
-- Catalog
-- ---------------------------------------------------------------------------
create table public.product_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 1 and 80),
  description text check (char_length(description) <= 500),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger product_categories_updated before update on public.product_categories
  for each row execute function public.set_updated_at();

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 1 and 120),
  package_name text check (char_length(package_name) <= 120),
  category_id uuid references public.product_categories (id) on delete set null,
  short_description text check (char_length(short_description) <= 300),
  description text check (char_length(description) <= 4000),
  geez_name text check (char_length(geez_name) <= 40),
  geez_latin text check (char_length(geez_latin) <= 40),
  uses text[] not null default '{}',
  ingredients text check (char_length(ingredients) <= 1000),
  nutrition jsonb,
  nutrition_verified boolean not null default false,
  grain_style text not null default 'lentil' check (grain_style in ('lentil', 'flax', 'fava', 'bulgur', 'bean')),
  is_active boolean not null default true,
  is_featured boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_category_idx on public.products (category_id);
create index products_active_sort_idx on public.products (is_active, sort_order);
create trigger products_updated before update on public.products
  for each row execute function public.set_updated_at();

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  label text not null check (char_length(label) between 1 and 60),
  net_weight text check (char_length(net_weight) <= 60),
  sku text unique check (char_length(sku) <= 60),
  upc text check (upc ~ '^[0-9 ]{8,20}$'),
  is_default boolean not null default false,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index product_variants_product_idx on public.product_variants (product_id);
create unique index product_variants_one_default on public.product_variants (product_id) where is_default;
create trigger product_variants_updated before update on public.product_variants
  for each row execute function public.set_updated_at();

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  -- Either a path inside the product-images storage bucket or a site-relative path (/images/...).
  src text not null check (char_length(src) <= 500),
  alt text not null check (char_length(alt) between 1 and 200),
  kind text not null default 'actual' check (kind in ('actual', 'concept')),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index product_images_product_idx on public.product_images (product_id, sort_order);

-- ---------------------------------------------------------------------------
-- Customer submissions
-- ---------------------------------------------------------------------------
create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique check (reference ~ '^ETH-[0-9]{6}-[A-Z0-9]{5}$'),
  buyer_type text not null check (buyer_type in ('household', 'business')),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) <= 254),
  phone text not null check (char_length(phone) <= 40),
  delivery_zip text not null check (delivery_zip ~ '^[0-9]{5}(-[0-9]{4})?$'),
  business_name text check (char_length(business_name) <= 160),
  notes text check (char_length(notes) <= 2000),
  status text not null default 'new' check (status in ('new', 'contacted', 'quoted', 'confirmed', 'fulfilled', 'cancelled')),
  internal_notes text check (char_length(internal_notes) <= 5000),
  ip_hash text,
  user_agent text check (char_length(user_agent) <= 400),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index inquiries_status_created_idx on public.inquiries (status, created_at desc);
create index inquiries_email_idx on public.inquiries (lower(email));
create trigger inquiries_updated before update on public.inquiries
  for each row execute function public.set_updated_at();

create table public.inquiry_items (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  variant_id uuid references public.product_variants (id) on delete set null,
  -- Snapshots so records stay readable if a product is edited or removed later.
  product_name text not null check (char_length(product_name) <= 160),
  variant_label text check (char_length(variant_label) <= 60),
  buyer_type text not null default 'household' check (buyer_type in ('household', 'business')),
  quantity int not null check (quantity between 1 and 9999),
  created_at timestamptz not null default now()
);
create index inquiry_items_inquiry_idx on public.inquiry_items (inquiry_id);
create index inquiry_items_product_idx on public.inquiry_items (product_id);

create table public.wholesale_inquiries (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique check (reference ~ '^WHL-[0-9]{6}-[A-Z0-9]{5}$'),
  business_name text not null check (char_length(business_name) between 2 and 160),
  contact_name text not null check (char_length(contact_name) between 2 and 120),
  email text not null check (char_length(email) <= 254),
  phone text not null check (char_length(phone) <= 40),
  business_type text not null check (business_type in ('grocery', 'supermarket', 'restaurant', 'distributor', 'other')),
  location text not null check (char_length(location) between 2 and 160),
  order_frequency text not null check (order_frequency in ('one-time', 'weekly', 'biweekly', 'monthly', 'unsure')),
  notes text check (char_length(notes) <= 2000),
  status text not null default 'new' check (status in ('new', 'contacted', 'quoted', 'won', 'lost', 'closed')),
  internal_notes text check (char_length(internal_notes) <= 5000),
  ip_hash text,
  user_agent text check (char_length(user_agent) <= 400),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index wholesale_status_created_idx on public.wholesale_inquiries (status, created_at desc);
create trigger wholesale_inquiries_updated before update on public.wholesale_inquiries
  for each row execute function public.set_updated_at();

create table public.wholesale_inquiry_items (
  id uuid primary key default gen_random_uuid(),
  wholesale_inquiry_id uuid not null references public.wholesale_inquiries (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null check (char_length(product_name) <= 160),
  quantity_text text check (char_length(quantity_text) <= 80),
  created_at timestamptz not null default now()
);
create index wholesale_items_parent_idx on public.wholesale_inquiry_items (wholesale_inquiry_id);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) <= 254),
  phone text check (char_length(phone) <= 40),
  topic text not null check (topic in ('product', 'order', 'wholesale', 'other')),
  message text not null check (char_length(message) between 5 and 4000),
  status text not null default 'new' check (status in ('new', 'replied', 'closed')),
  internal_notes text check (char_length(internal_notes) <= 5000),
  ip_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index contact_status_created_idx on public.contact_messages (status, created_at desc);
create trigger contact_messages_updated before update on public.contact_messages
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Site content and audit
-- ---------------------------------------------------------------------------
create table public.site_settings (
  key text primary key check (key ~ '^[a-z0-9_.]{2,64}$'),
  value jsonb not null,
  is_public boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);
create trigger site_settings_updated before update on public.site_settings
  for each row execute function public.set_updated_at();

create table public.admin_activity_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users (id) on delete set null,
  action text not null check (char_length(action) <= 80),
  entity_type text not null check (char_length(entity_type) <= 60),
  entity_id text check (char_length(entity_id) <= 80),
  details jsonb,
  created_at timestamptz not null default now()
);
create index admin_logs_created_idx on public.admin_activity_logs (created_at desc);

-- ---------------------------------------------------------------------------
-- Rate limiting (fixed window, shared across serverless instances)
-- ---------------------------------------------------------------------------
create table public.rate_limit_hits (
  bucket text not null,
  window_start timestamptz not null,
  hits int not null default 0,
  primary key (bucket, window_start)
);

create or replace function public.check_rate_limit(p_bucket text, p_max int, p_window_seconds int)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  w timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  n int;
begin
  insert into public.rate_limit_hits (bucket, window_start, hits) values (p_bucket, w, 1)
  on conflict (bucket, window_start) do update set hits = public.rate_limit_hits.hits + 1
  returning hits into n;
  -- opportunistic cleanup of old windows
  if random() < 0.02 then
    delete from public.rate_limit_hits where window_start < now() - interval '1 day';
  end if;
  return n <= p_max;
end $$;
revoke all on function public.check_rate_limit(text, int, int) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.user_profiles enable row level security;
alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.inquiries enable row level security;
alter table public.inquiry_items enable row level security;
alter table public.wholesale_inquiries enable row level security;
alter table public.wholesale_inquiry_items enable row level security;
alter table public.contact_messages enable row level security;
alter table public.site_settings enable row level security;
alter table public.admin_activity_logs enable row level security;
alter table public.rate_limit_hits enable row level security; -- no policies: service role only

-- Profiles
create policy "profiles: read own" on public.user_profiles for select to authenticated using (id = auth.uid());
create policy "profiles: admins read all" on public.user_profiles for select to authenticated using (public.is_admin());
create policy "profiles: owner admin updates" on public.user_profiles for update to authenticated using (public.is_owner_admin()) with check (public.is_owner_admin());

-- Catalog: public read of active items, admin write
create policy "categories: public read" on public.product_categories for select to anon, authenticated using (true);
create policy "categories: admin write" on public.product_categories for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "products: public read active" on public.products for select to anon, authenticated using (is_active or public.is_admin());
create policy "products: admin write" on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "variants: public read active" on public.product_variants for select to anon, authenticated
  using ((is_active and exists (select 1 from public.products p where p.id = product_id and p.is_active)) or public.is_admin());
create policy "variants: admin write" on public.product_variants for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "images: public read active" on public.product_images for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and p.is_active) or public.is_admin());
create policy "images: admin write" on public.product_images for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Submissions: no anon access at all. Inserts come from the server (service role).
create policy "inquiries: admin read" on public.inquiries for select to authenticated using (public.is_admin());
create policy "inquiries: admin update" on public.inquiries for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "inquiry items: admin read" on public.inquiry_items for select to authenticated using (public.is_admin());

create policy "wholesale: admin read" on public.wholesale_inquiries for select to authenticated using (public.is_admin());
create policy "wholesale: admin update" on public.wholesale_inquiries for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "wholesale items: admin read" on public.wholesale_inquiry_items for select to authenticated using (public.is_admin());

create policy "contact: admin read" on public.contact_messages for select to authenticated using (public.is_admin());
create policy "contact: admin update" on public.contact_messages for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Site settings: public keys readable by everyone, admin write
create policy "settings: public read" on public.site_settings for select to anon, authenticated using (is_public or public.is_admin());
create policy "settings: admin write" on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Audit log: admins read and append; nobody edits or deletes
create policy "logs: admin read" on public.admin_activity_logs for select to authenticated using (public.is_admin());
create policy "logs: admin insert" on public.admin_activity_logs for insert to authenticated with check (public.is_admin() and actor_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Storage: public product images, admin-only writes, images only, 5 MB max
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "product images: public read" on storage.objects for select to anon, authenticated using (bucket_id = 'product-images');
create policy "product images: admin insert" on storage.objects for insert to authenticated with check (bucket_id = 'product-images' and public.is_admin());
create policy "product images: admin update" on storage.objects for update to authenticated using (bucket_id = 'product-images' and public.is_admin());
create policy "product images: admin delete" on storage.objects for delete to authenticated using (bucket_id = 'product-images' and public.is_admin());
