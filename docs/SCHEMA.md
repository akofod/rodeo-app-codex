# Database Schema Architecture

**Database Provider:** Supabase (PostgreSQL)

## 1. Enums & Types

- **app_status:** `PENDING`, `APPROVED`, `REJECTED`, `ARCHIVED`
- **app_role:** `USER`, `ADMIN`

## 2. Tables

### `profiles`

- `id` (uuid, PK, refs auth.users)
- `email` (text)
- `full_name` (text)
- `avatar_url` (text, optional)
- `role` (app_role, default 'USER')
- `created_at` (timestamptz)
- `updated_at` (timestamptz, optional)

### `venues`

- `id` (uuid, PK)
- `name` (text)
- `address_street` (text)
- `address_city` (text)
- `address_state` (text)
- `address_zip` (text)
- `address_country` (text)
- `latitude` (float) -- Populated via Geocoding
- `longitude` (float) -- Populated via Geocoding
- `website_url` (text, optional)
- `status` (app_status, default 'PENDING')
- `created_by` (uuid, refs profiles.id)
- `created_at` (timestamptz)

### `disciplines` (Master List)

- `id` (int, PK)
- `name` (text) -- e.g., "Bull Riding", "Barrel Racing"
- `slug` (text, unique)

### `sanctioning_bodies` (Master List)

- `id` (int, PK)
- `name` (text) -- e.g., "PRCA", "IPRA", "NIRA"
- `slug` (text, unique)
- `website_url` (text)

### `events`

- `id` (uuid, PK)
- `title` (text)
- `description` (text)
- `venue_id` (uuid, refs venues.id)
- `start_datetime` (timestamptz) -- Specific date and time for this performance
- `flyer_image_url` (text)
- `official_website_url` (text)
- `classes_details` (text) -- Free text for "Open, Youth, Novice" etc.
- `status` (app_status, default 'PENDING')
- `created_by` (uuid, refs profiles.id)
- `created_at` (timestamptz)
- _Note: Recurring events are stored as individual rows in this table._

### `event_disciplines` (Junction Table)

- `event_id` (uuid, refs events.id)
- `discipline_id` (int, refs disciplines.id)
- PK: (event_id, discipline_id)

### `event_sanctions` (Junction Table)

- `event_id` (uuid, refs events.id)
- `sanction_id` (int, refs sanctioning_bodies.id)
- PK: (event_id, sanction_id)

### `services`

- `id` (uuid, PK)
- `name` (text)
- `category` (text) -- e.g., "Farrier"
- `description` (text)
- `phone` (text)
- `website_url` (text)
- `service_radius_miles` (int)
- `zip_code` (text) -- Center point for search
- `status` (app_status, default 'PENDING')
- `created_by` (uuid, refs profiles.id)
- `created_at` (timestamptz)

### `favorites`

- `id` (uuid, PK)
- `user_id` (uuid, refs profiles.id)
- `entity_id` (uuid) -- Polymorphic ID (Event, Service, or Venue ID)
- `entity_type` (text) -- "EVENT", "SERVICE", or "VENUE"
- created_at (timestamptz)
- Unique: (`user_id`, `entity_id`, `entity_type`)

## 3. Security (RLS Policies)

- **Public Access:** Can read all rows where `status` = 'APPROVED'.
- **User Access:** Can insert new rows. Can update/delete ONLY rows where `created_by` matches their `auth.uid()`.
- **Admin Access:** Full CRUD on all tables.
