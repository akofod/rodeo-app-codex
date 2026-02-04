-- Align profiles table with common Supabase auth trigger expectations
alter table profiles add column if not exists avatar_url text;
alter table profiles add column if not exists updated_at timestamptz default now();

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Users can insert own profile'
  ) then
    create policy "Users can insert own profile"
      on profiles
      for insert
      with check (auth.uid() = id);
  end if;
end $$;
