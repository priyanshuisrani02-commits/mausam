-- Harden the shared MAUSAM admin authorization check.
-- The admin account is controlled by email and protected app metadata.
-- Do not use user_metadata for authorization because users can change it.

create or replace function public.is_mausam_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    lower(coalesce((select auth.jwt() ->> 'email'), '')) = 'mausamfes@gmail.com'
    or lower(coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '')) = 'admin';
$$;

revoke all on function public.is_mausam_admin() from public;
grant execute on function public.is_mausam_admin() to anon, authenticated;

-- Keep the intended MAUSAM admin account marked in protected app metadata.
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
  || jsonb_build_object('role', 'admin')
where lower(email) = 'mausamfes@gmail.com';
