-- Allow admins to update submissions across core tables
create policy "Admins can update any venues"
  on venues
  for update
  using (auth.uid() in (select id from profiles where role = 'ADMIN'))
  with check (true);

create policy "Admins can update any events"
  on events
  for update
  using (auth.uid() in (select id from profiles where role = 'ADMIN'))
  with check (true);

create policy "Admins can update any services"
  on services
  for update
  using (auth.uid() in (select id from profiles where role = 'ADMIN'))
  with check (true);
