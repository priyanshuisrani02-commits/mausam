-- MAUSAM v1 hardening: keep catalog CRUD predictable, preserve order history,
-- clean dependent product data, and constrain uploaded assets.

-- Remove legacy image metadata left behind by products deleted before
-- product_images had a foreign key.
delete from public.product_images pi
where not exists (
  select 1 from public.products p where p.id = pi.product_id
);

alter table public.product_images
  drop constraint if exists product_images_product_id_fkey;

alter table public.product_images
  add constraint product_images_product_id_fkey
  foreign key (product_id) references public.products(id) on delete cascade;

alter table public.products
  drop constraint if exists products_price_nonnegative_check,
  drop constraint if exists products_sale_price_nonnegative_check,
  drop constraint if exists products_stock_nonnegative_check,
  drop constraint if exists products_stock_quantity_nonnegative_check,
  drop constraint if exists products_low_stock_threshold_nonnegative_check,
  drop constraint if exists products_sale_price_not_above_price_check;

alter table public.products
  add constraint products_price_nonnegative_check
    check (price is null or price >= 0),
  add constraint products_sale_price_nonnegative_check
    check (sale_price is null or sale_price >= 0),
  add constraint products_stock_nonnegative_check
    check (stock is null or stock >= 0),
  add constraint products_stock_quantity_nonnegative_check
    check (stock_quantity >= 0),
  add constraint products_low_stock_threshold_nonnegative_check
    check (low_stock_threshold >= 0),
  add constraint products_sale_price_not_above_price_check
    check (sale_price is null or price is null or sale_price <= price);

alter table public.cart_items
  drop constraint if exists cart_items_quantity_positive_check;

alter table public.cart_items
  add constraint cart_items_quantity_positive_check check (quantity > 0);

alter table public.order_items
  drop constraint if exists order_items_quantity_positive_check,
  drop constraint if exists order_items_price_nonnegative_check;

alter table public.order_items
  add constraint order_items_quantity_positive_check check (quantity > 0),
  add constraint order_items_price_nonnegative_check check (price >= 0);

alter table public.orders
  drop constraint if exists orders_subtotal_nonnegative_check,
  drop constraint if exists orders_shipping_nonnegative_check,
  drop constraint if exists orders_total_nonnegative_check;

alter table public.orders
  add constraint orders_subtotal_nonnegative_check check (subtotal >= 0),
  add constraint orders_shipping_nonnegative_check check (shipping >= 0),
  add constraint orders_total_nonnegative_check check (total >= 0);

-- Storefront images remain public for delivery, but uploads are limited to
-- supported image formats and an 8 MB maximum.
update storage.buckets
set file_size_limit = 8388608,
    allowed_mime_types = array[
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif'
    ]
where id in ('products', 'categories', 'banners', 'hero-slides');
