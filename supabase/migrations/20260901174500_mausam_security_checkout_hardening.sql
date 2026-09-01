-- MAUSAM production hardening: isolate SECURITY DEFINER helpers and make COD checkout explicit.

create schema if not exists private;
revoke all on schema private from public;

create or replace function private.is_mausam_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from auth.users u
    where u.id = auth.uid()
      and (
        lower(coalesce(u.email, '')) = 'mausamfes@gmail.com'
        or lower(coalesce(u.raw_app_meta_data ->> 'role', '')) = 'admin'
      )
  );
$$;

revoke all on function private.is_mausam_admin() from public;
grant execute on function private.is_mausam_admin() to authenticated;

create or replace function public.is_mausam_admin()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select private.is_mausam_admin();
$$;

revoke all on function public.is_mausam_admin() from public;
revoke all on function public.is_mausam_admin() from anon;
grant execute on function public.is_mausam_admin() to authenticated;

alter table public.orders
  add column if not exists payment_method text not null default 'cod',
  add column if not exists payment_status text not null default 'pending';

alter table public.orders
  drop constraint if exists orders_payment_method_check,
  drop constraint if exists orders_payment_status_check;

alter table public.orders
  add constraint orders_payment_method_check check (payment_method in ('cod')),
  add constraint orders_payment_status_check check (payment_status in ('pending','paid','failed','refunded'));

create or replace function private.place_order_atomic_secure(order_customer jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_user uuid := auth.uid();
  v_order_id uuid;
  v_subtotal numeric := 0;
  v_shipping numeric := 0;
  v_total numeric := 0;
  v_item record;
  v_price numeric;
  v_new_stock integer;
  v_customer_name text := trim(coalesce(order_customer->>'customer_name',''));
  v_email text := trim(coalesce(order_customer->>'email',''));
  v_phone text := trim(coalesce(order_customer->>'phone',''));
  v_address text := trim(coalesce(order_customer->>'address',''));
  v_city text := trim(coalesce(order_customer->>'city',''));
  v_state text := trim(coalesce(order_customer->>'state',''));
  v_pincode text := trim(coalesce(order_customer->>'pincode',''));
begin
  if v_user is null then raise exception 'Please login first.'; end if;
  if jsonb_typeof(order_customer) <> 'object' then raise exception 'Invalid customer details.'; end if;
  if length(v_customer_name) < 2 or length(v_customer_name) > 100 then raise exception 'Please enter a valid name.'; end if;
  if length(v_email) < 5 or length(v_email) > 254 or position('@' in v_email) = 0 then raise exception 'Please enter a valid email.'; end if;
  if length(v_phone) < 7 or length(v_phone) > 20 then raise exception 'Please enter a valid phone number.'; end if;
  if length(v_address) < 5 or length(v_address) > 300 then raise exception 'Please enter a valid delivery address.'; end if;
  if length(v_city) < 2 or length(v_city) > 80 then raise exception 'Please enter a valid city.'; end if;
  if length(v_state) < 2 or length(v_state) > 80 then raise exception 'Please enter a valid state.'; end if;
  if length(v_pincode) < 4 or length(v_pincode) > 10 then raise exception 'Please enter a valid pincode.'; end if;
  if not exists (select 1 from public.cart_items where user_id = v_user) then raise exception 'Cart is empty.'; end if;

  for v_item in
    select ci.product_id, ci.quantity, ci.selected_size, p.name, p.price, p.sale_price, p.stock_quantity, p.track_inventory
    from public.cart_items ci join public.products p on p.id = ci.product_id
    where ci.user_id = v_user for update of p
  loop
    if v_item.quantity <= 0 then raise exception 'Invalid cart quantity.'; end if;
    if v_item.track_inventory and v_item.quantity > v_item.stock_quantity then
      raise exception '% only has % item(s) left in stock.', v_item.name, v_item.stock_quantity;
    end if;
    v_price := coalesce(v_item.sale_price, v_item.price);
    v_subtotal := v_subtotal + v_price * v_item.quantity;
  end loop;

  v_total := v_subtotal + v_shipping;

  insert into public.orders(
    user_id, customer_name, email, phone, address, city, state, pincode,
    subtotal, shipping, total, status, payment_method, payment_status
  )
  values (
    v_user, v_customer_name, v_email, v_phone, v_address, v_city, v_state, v_pincode,
    v_subtotal, v_shipping, v_total, 'Pending', 'cod', 'pending'
  )
  returning id into v_order_id;

  for v_item in
    select ci.product_id, ci.quantity, ci.selected_size, p.price, p.sale_price, p.stock_quantity, p.track_inventory
    from public.cart_items ci join public.products p on p.id = ci.product_id
    where ci.user_id = v_user for update of p
  loop
    v_price := coalesce(v_item.sale_price, v_item.price);
    insert into public.order_items(order_id, product_id, quantity, selected_size, price)
    values(v_order_id, v_item.product_id, v_item.quantity, v_item.selected_size, v_price);
    if v_item.track_inventory then
      v_new_stock := v_item.stock_quantity - v_item.quantity;
      update public.products set stock_quantity = v_new_stock, stock = v_new_stock where id = v_item.product_id;
    end if;
  end loop;

  delete from public.cart_items where user_id = v_user;

  return jsonb_build_object(
    'id', v_order_id,
    'subtotal', v_subtotal,
    'shipping', v_shipping,
    'total', v_total,
    'payment_method', 'cod',
    'payment_status', 'pending'
  );
end;
$function$;

revoke all on function private.place_order_atomic_secure(jsonb) from public;
grant execute on function private.place_order_atomic_secure(jsonb) to authenticated;

create or replace function public.place_order_atomic(order_customer jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $function$
begin
  return private.place_order_atomic_secure(order_customer);
end;
$function$;

revoke all on function public.place_order_atomic(jsonb) from public;
revoke all on function public.place_order_atomic(jsonb) from anon;
grant execute on function public.place_order_atomic(jsonb) to authenticated;
