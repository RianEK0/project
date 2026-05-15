create extension if not exists pgcrypto;

create table if not exists public.app_settings (
  id text primary key default 'default',
  store_name text not null default 'Kasir Warung Pintar',
  low_stock_threshold integer not null default 10,
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key,
  name text not null,
  barcode text unique,
  category text not null default 'Umum',
  stock integer not null default 0 check (stock >= 0),
  cost_price numeric(14, 2) not null default 0 check (cost_price >= 0),
  sell_price numeric(14, 2) not null default 0 check (sell_price >= 0),
  unit text not null default 'pcs',
  min_stock integer not null default 10 check (min_stock >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id text primary key,
  number text not null unique,
  date timestamptz not null default now(),
  total numeric(14, 2) not null default 0 check (total >= 0),
  payment numeric(14, 2) not null default 0 check (payment >= 0),
  change_amount numeric(14, 2) not null default 0 check (change_amount >= 0),
  profit numeric(14, 2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.transaction_items (
  id uuid primary key default gen_random_uuid(),
  transaction_id text not null references public.transactions(id) on delete cascade,
  product_id text references public.products(id) on delete set null,
  name text not null,
  barcode text,
  unit text not null default 'pcs',
  qty integer not null check (qty > 0),
  price numeric(14, 2) not null default 0 check (price >= 0),
  cost_price numeric(14, 2) not null default 0 check (cost_price >= 0),
  subtotal numeric(14, 2) not null default 0 check (subtotal >= 0),
  profit numeric(14, 2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.stock_movements (
  id text primary key,
  type text not null check (type in ('in', 'out')),
  date timestamptz not null default now(),
  product_id text references public.products(id) on delete set null,
  product_name text not null,
  qty integer not null check (qty > 0),
  previous_stock integer not null default 0,
  next_stock integer not null default 0,
  note text not null default '',
  cost_price numeric(14, 2) not null default 0,
  created_at timestamptz not null default now()
);

insert into public.app_settings (id, store_name, low_stock_threshold)
values ('default', 'Kasir Warung Pintar', 10)
on conflict (id) do nothing;

insert into public.products (id, name, barcode, category, stock, cost_price, sell_price, unit, min_stock)
values
  ('prd-indomie-goreng', 'Indomie Goreng', '089686010203', 'Makanan', 34, 2800, 3500, 'pcs', 8),
  ('prd-kopi-kapal-api', 'Kopi Sachet Kapal Api', '899100210001', 'Minuman', 38, 1000, 1500, 'sachet', 10),
  ('prd-gula-pasir', 'Gula Pasir 1kg', null, 'Sembako', 15, 12000, 15000, 'kg', 5),
  ('prd-minyak-goreng', 'Minyak Goreng 1L', '8992763123456', 'Sembako', 8, 14000, 16000, 'botol', 6)
on conflict (id) do nothing;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists settings_set_updated_at on public.app_settings;
create trigger settings_set_updated_at
before update on public.app_settings
for each row execute function public.set_updated_at();

create or replace function public.complete_sale(p_transaction jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item jsonb;
  v_product products%rowtype;
  v_transaction_id text := p_transaction ->> 'id';
  v_number text := p_transaction ->> 'number';
  v_total numeric := coalesce((p_transaction ->> 'total')::numeric, 0);
  v_payment numeric := coalesce((p_transaction ->> 'payment')::numeric, 0);
  v_change numeric := coalesce((p_transaction ->> 'change')::numeric, 0);
  v_profit numeric := coalesce((p_transaction ->> 'profit')::numeric, 0);
  v_items jsonb := p_transaction -> 'items';
begin
  if v_transaction_id is null or v_number is null then
    raise exception 'Data transaksi tidak lengkap.';
  end if;

  if v_items is null or jsonb_array_length(v_items) = 0 then
    raise exception 'Keranjang masih kosong.';
  end if;

  if v_payment < v_total then
    raise exception 'Uang bayar masih kurang.';
  end if;

  for v_item in select * from jsonb_array_elements(v_items)
  loop
    select * into v_product
    from public.products
    where id = v_item ->> 'productId'
    for update;

    if not found then
      raise exception 'Barang % tidak ditemukan.', v_item ->> 'name';
    end if;

    if v_product.stock < coalesce((v_item ->> 'qty')::integer, 0) then
      raise exception 'Stok % tidak cukup. Tersedia %, diminta %.',
        v_product.name,
        v_product.stock,
        v_item ->> 'qty';
    end if;
  end loop;

  insert into public.transactions (id, number, date, total, payment, change_amount, profit)
  values (
    v_transaction_id,
    v_number,
    coalesce((p_transaction ->> 'date')::timestamptz, now()),
    v_total,
    v_payment,
    v_change,
    v_profit
  );

  for v_item in select * from jsonb_array_elements(v_items)
  loop
    update public.products
    set stock = stock - (v_item ->> 'qty')::integer
    where id = v_item ->> 'productId';

    insert into public.transaction_items (
      transaction_id,
      product_id,
      name,
      barcode,
      unit,
      qty,
      price,
      cost_price,
      subtotal,
      profit
    )
    values (
      v_transaction_id,
      v_item ->> 'productId',
      v_item ->> 'name',
      nullif(v_item ->> 'barcode', ''),
      coalesce(v_item ->> 'unit', 'pcs'),
      (v_item ->> 'qty')::integer,
      coalesce((v_item ->> 'price')::numeric, 0),
      coalesce((v_item ->> 'costPrice')::numeric, 0),
      coalesce((v_item ->> 'subtotal')::numeric, 0),
      coalesce((v_item ->> 'profit')::numeric, 0)
    );
  end loop;

  return jsonb_build_object('id', v_transaction_id, 'number', v_number);
end;
$$;

create or replace function public.record_stock_movement(p_movement jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product products%rowtype;
  v_type text := p_movement ->> 'type';
  v_product_id text := p_movement ->> 'productId';
  v_qty integer := coalesce((p_movement ->> 'qty')::integer, 0);
  v_note text := coalesce(p_movement ->> 'note', '');
  v_cost_price numeric := nullif(p_movement ->> 'costPrice', '')::numeric;
  v_previous_stock integer;
  v_next_stock integer;
  v_id text := coalesce(p_movement ->> 'id', 'stk-' || replace(gen_random_uuid()::text, '-', ''));
begin
  if v_type not in ('in', 'out') then
    raise exception 'Tipe stok tidak valid.';
  end if;

  if v_qty <= 0 then
    raise exception 'Jumlah stok harus lebih dari 0.';
  end if;

  select * into v_product
  from public.products
  where id = v_product_id
  for update;

  if not found then
    raise exception 'Barang tidak ditemukan.';
  end if;

  if v_type = 'out' and v_product.stock < v_qty then
    raise exception 'Stok % hanya %.', v_product.name, v_product.stock;
  end if;

  v_previous_stock := v_product.stock;
  v_next_stock := case when v_type = 'in' then v_product.stock + v_qty else v_product.stock - v_qty end;

  update public.products
  set
    stock = v_next_stock,
    cost_price = case when v_type = 'in' and v_cost_price is not null and v_cost_price > 0 then v_cost_price else cost_price end
  where id = v_product_id;

  insert into public.stock_movements (
    id,
    type,
    date,
    product_id,
    product_name,
    qty,
    previous_stock,
    next_stock,
    note,
    cost_price
  )
  values (
    v_id,
    v_type,
    now(),
    v_product_id,
    v_product.name,
    v_qty,
    v_previous_stock,
    v_next_stock,
    v_note,
    coalesce(v_cost_price, v_product.cost_price)
  );

  return jsonb_build_object('id', v_id, 'nextStock', v_next_stock);
end;
$$;

grant execute on function public.complete_sale(jsonb) to anon, authenticated;
grant execute on function public.record_stock_movement(jsonb) to anon, authenticated;

alter table public.app_settings enable row level security;
alter table public.products enable row level security;
alter table public.transactions enable row level security;
alter table public.transaction_items enable row level security;
alter table public.stock_movements enable row level security;

drop policy if exists "public app_settings read" on public.app_settings;
drop policy if exists "public app_settings write" on public.app_settings;
drop policy if exists "public products read" on public.products;
drop policy if exists "public products write" on public.products;
drop policy if exists "public transactions read" on public.transactions;
drop policy if exists "public transactions write" on public.transactions;
drop policy if exists "public transaction_items read" on public.transaction_items;
drop policy if exists "public transaction_items write" on public.transaction_items;
drop policy if exists "public stock_movements read" on public.stock_movements;
drop policy if exists "public stock_movements write" on public.stock_movements;

create policy "public app_settings read" on public.app_settings for select to anon, authenticated using (true);
create policy "public app_settings write" on public.app_settings for all to anon, authenticated using (true) with check (true);
create policy "public products read" on public.products for select to anon, authenticated using (true);
create policy "public products write" on public.products for all to anon, authenticated using (true) with check (true);
create policy "public transactions read" on public.transactions for select to anon, authenticated using (true);
create policy "public transactions write" on public.transactions for all to anon, authenticated using (true) with check (true);
create policy "public transaction_items read" on public.transaction_items for select to anon, authenticated using (true);
create policy "public transaction_items write" on public.transaction_items for all to anon, authenticated using (true) with check (true);
create policy "public stock_movements read" on public.stock_movements for select to anon, authenticated using (true);
create policy "public stock_movements write" on public.stock_movements for all to anon, authenticated using (true) with check (true);

do $$
declare
  v_table text;
begin
  foreach v_table in array array['app_settings', 'products', 'transactions', 'transaction_items', 'stock_movements']
  loop
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = v_table
    ) then
      execute format('alter publication supabase_realtime add table public.%I', v_table);
    end if;
  end loop;
end $$;
