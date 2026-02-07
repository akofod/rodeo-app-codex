alter table public.services
  add column if not exists contact_name text,
  add column if not exists contact_email text,
  add column if not exists specialties text,
  add column if not exists pricing_details text,
  add column if not exists availability_notes text;
