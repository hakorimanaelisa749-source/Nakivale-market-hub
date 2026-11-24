-- Sellers = your vela_sellers
create table sellers (
  id uuid primary key references auth.users(id),
  email text,
  shop_name text,
  wa text,
  location text,
  created_at timestamp default now()
);

-- Products = your vela_products
create table products (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references sellers(id),
  name text not null,
  category text,
  price int not null,
  img text, -- we store LINK only, not image
  shop text,
  shop_wa text,
  created_at timestamp default now()
);

-- Orders = your vela_orders
create table orders (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id),
  product_name text,
  product_img text,
  price int,
  commission int,
  seller_earning int,
  buyer_id uuid,
  buyer_email text,
  buyer_phone text,
  buyer_zone text,
  buyer_details text,
  momo_tx text,
  seller_id uuid,
  seller_shop text,
  status text default 'awaiting_payment', -- awaiting_payment -> paid -> delivered -> completed
  qty int default 1,
  created_at timestamp default now()
);

-- Storage for images
-- Go to Supabase Dashboard > Storage > Create Bucket: product-images, Public = ON
-- Enable RLS for all tables in Dashboard > Authentication > Policies > Enable for anon
-- VELA APPROVAL SYSTEM - Add to products
alter table products add column if not exists status text default 'pending';
alter table products add column if not exists approved_by text;
alter table products add column if not exists approved_at timestamp;
alter table products add column if not exists rejection_reason text;

-- Approvers table
create table if not exists approvers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null, -- Aristide, Najibu, Everylene
  created_at timestamp default now()
);

-- Insert your 3 approvers - replace with their real emails
insert into approvers (email, name) values
('aristide@gmail.com', 'Aristide'),
('najibu@gmail.com', 'Najibu'),
('everylene@gmail.com', 'Everylene')
on conflict (email) do nothing;
