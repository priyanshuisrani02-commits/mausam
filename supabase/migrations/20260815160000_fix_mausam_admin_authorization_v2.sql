-- Fix MAUSAM admin authorization so RLS does not depend on stale JWT app_metadata.
-- Authorization is read directly from protected auth.users metadata.

create or replace function public.is_mausam_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from auth.users u
    where u.id = (select auth.uid())
      and (
        lower(coalesce(u.email, '')) = 'mausamfes@gmail.com'
        or lower(coalesce(u.raw_app_meta_data ->> 'role', '')) = 'admin'
      )
  );
$$;

revoke all on function public.is_mausam_admin() from public;
revoke all on function public.is_mausam_admin() from anon;
grant execute on function public.is_mausam_admin() to authenticated;
