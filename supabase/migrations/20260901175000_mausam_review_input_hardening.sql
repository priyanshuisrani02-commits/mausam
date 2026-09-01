-- Keep public review submissions bounded even when clients bypass the UI.

alter table public.product_reviews
  drop constraint if exists product_reviews_customer_name_length_check,
  drop constraint if exists product_reviews_review_text_length_check;

alter table public.product_reviews
  add constraint product_reviews_customer_name_length_check
    check (char_length(trim(customer_name)) between 2 and 80),
  add constraint product_reviews_review_text_length_check
    check (char_length(trim(review_text)) between 3 and 1500);
