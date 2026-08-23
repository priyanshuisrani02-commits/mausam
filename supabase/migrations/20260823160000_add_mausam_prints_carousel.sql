-- MAUSAM homepage craft / prints carousel.
-- Public storefront can read active items; only the existing MAUSAM admin can mutate them.

create table if not exists public.homepage_prints (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text not null,
  link text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists homepage_prints_active_sort_idx
  on public.homepage_prints (active, sort_order, created_at desc);

alter table public.homepage_prints enable row level security;

 drop policy if exists "homepage prints public read" on public.homepage_prints;
create policy "homepage prints public read"
  on public.homepage_prints
  for select
  to anon, authenticated
  using (active = true or public.is_mausam_admin());

 drop policy if exists "homepage prints admin insert" on public.homepage_prints;
create policy "homepage prints admin insert"
  on public.homepage_prints
  for insert
  to authenticated
  with check (public.is_mausam_admin());

 drop policy if exists "homepage prints admin update" on public.homepage_prints;
create policy "homepage prints admin update"
  on public.homepage_prints
  for update
  to authenticated
  using (public.is_mausam_admin())
  with check (public.is_mausam_admin());

 drop policy if exists "homepage prints admin delete" on public.homepage_prints;
create policy "homepage prints admin delete"
  on public.homepage_prints
  for delete
  to authenticated
  using (public.is_mausam_admin());

create or replace function public.set_homepage_prints_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists homepage_prints_updated_at on public.homepage_prints;
create trigger homepage_prints_updated_at
before update on public.homepage_prints
for each row execute function public.set_homepage_prints_updated_at();

-- Use the existing banners bucket for these public design assets. The existing
-- storage hardening migration already restricts it to image MIME types/size.
