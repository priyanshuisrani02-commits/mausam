-- Keep order history when an admin deletes a product.
-- order_items.product_id is nullable, so the historical order remains intact
-- while its optional product reference is cleared.

alter table public.order_items
  drop constraint if exists order_items_product_id_fkey;

alter table public.order_items
  add constraint order_items_product_id_fkey
  foreign key (product_id)
  references public.products(id)
  on delete set null;
