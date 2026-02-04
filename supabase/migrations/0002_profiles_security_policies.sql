-- Harden profile policies so users cannot self-promote to ADMIN
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Users can insert own profile" on profiles;

create policy "Users can insert own profile"
  on profiles
  for insert
  with check (auth.uid() = id and role = 'USER');

create policy "Users can update own profile"
  on profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = 'USER');

create policy "Admins can update any profile"
  on profiles
  for update
  using (auth.uid() in (select id from profiles where role = 'ADMIN'))
  with check (true);
