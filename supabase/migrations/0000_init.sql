-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enums
create type app_status as enum ('PENDING', 'APPROVED', 'REJECTED', 'ARCHIVED');
create type app_role as enum ('USER', 'ADMIN');

-- Profiles Table
create table profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  role app_role default 'USER'::app_role,
  created_at timestamptz default now()
);

-- Venues Table
create table venues (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  address_street text,
  address_city text,
  address_state text,
  address_zip text,
  latitude float,
  longitude float,
  website_url text,
  status app_status default 'PENDING'::app_status,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- Disciplines Table
create table disciplines (
  id serial primary key,
  name text not null,
  slug text unique not null
);

-- Sanctioning Bodies Table
create table sanctioning_bodies (
  id serial primary key,
  name text not null,
  slug text unique not null,
  website_url text
);

-- Events Table
create table events (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  venue_id uuid references venues(id),
  start_datetime timestamptz not null,
  flyer_image_url text,
  official_website_url text,
  classes_details text,
  status app_status default 'PENDING'::app_status,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- Event Disciplines Junction
create table event_disciplines (
  event_id uuid references events(id) on delete cascade,
  discipline_id int references disciplines(id) on delete cascade,
  primary key (event_id, discipline_id)
);

-- Event Sanctions Junction
create table event_sanctions (
  event_id uuid references events(id) on delete cascade,
  sanction_id int references sanctioning_bodies(id) on delete cascade,
  primary key (event_id, sanction_id)
);

-- Services Table
create table services (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  category text not null,
  description text,
  phone text,
  website_url text,
  service_radius_miles int,
  zip_code text,
  status app_status default 'PENDING'::app_status,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- Favorites Table
create table favorites (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  entity_id uuid not null,
  entity_type text not null check (entity_type in ('EVENT', 'SERVICE')),
  created_at timestamptz default now()
);

-- RLS Policies
-- Enable RLS on all tables
alter table profiles enable row level security;
alter table venues enable row level security;
alter table disciplines enable row level security;
alter table sanctioning_bodies enable row level security;
alter table events enable row level security;
alter table event_disciplines enable row level security;
alter table event_sanctions enable row level security;
alter table services enable row level security;
alter table favorites enable row level security;

-- Profiles Policies
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Venues Policies
create policy "Venues viewable by everyone if approved" on venues for select using (status = 'APPROVED' or auth.uid() in (select id from profiles where role = 'ADMIN'));
create policy "Users can insert venues" on venues for insert with check (auth.uid() = created_by);
create policy "Users can update own venues" on venues for update using (auth.uid() = created_by);

-- Events Policies
create policy "Events viewable by everyone if approved" on events for select using (status = 'APPROVED' or auth.uid() in (select id from profiles where role = 'ADMIN'));
create policy "Users can insert events" on events for insert with check (auth.uid() = created_by);
create policy "Users can update own events" on events for update using (auth.uid() = created_by);

-- Services Policies
create policy "Services viewable by everyone if approved" on services for select using (status = 'APPROVED' or auth.uid() in (select id from profiles where role = 'ADMIN'));
create policy "Users can insert services" on services for insert with check (auth.uid() = created_by);
create policy "Users can update own services" on services for update using (auth.uid() = created_by);

-- Master Lists (Disciplines, Sanctioning Bodies)
create policy "Master lists viewable by everyone" on disciplines for select using (true);
create policy "Master lists viewable by everyone 2" on sanctioning_bodies for select using (true);

-- Junction Tables
create policy "Junctions viewable by everyone" on event_disciplines for select using (true);
create policy "Junctions viewable by everyone 2" on event_sanctions for select using (true);

-- Favorites Policies
create policy "Users can view own favorites" on favorites for select using (auth.uid() = user_id);
create policy "Users can insert own favorites" on favorites for insert with check (auth.uid() = user_id);
create policy "Users can delete own favorites" on favorites for delete using (auth.uid() = user_id);
