-- Add country to venues for North America coverage
alter table venues
  add column if not exists address_country text not null default 'United States';
