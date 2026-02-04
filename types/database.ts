export type AppStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';
export type AppRole = 'USER' | 'ADMIN';
export type FavoriteEntityType = 'EVENT' | 'SERVICE' | 'VENUE';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: AppRole;
  created_at: string;
  updated_at: string | null;
}

export interface ProfileInsert {
  id?: string;
  email?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  role?: AppRole;
  created_at?: string;
  updated_at?: string | null;
}

export interface ProfileUpdate {
  email?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  role?: AppRole;
  updated_at?: string | null;
}

export interface Venue {
  id: string;
  name: string;
  address_street: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  address_country: string;
  latitude: number | null;
  longitude: number | null;
  website_url: string | null;
  status: AppStatus;
  created_by: string;
  created_at: string;
}

export interface VenueInsert {
  id?: string;
  name: string;
  address_street: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  address_country: string;
  latitude?: number | null;
  longitude?: number | null;
  website_url?: string | null;
  status?: AppStatus;
  created_by: string;
  created_at?: string;
}

export interface VenueUpdate {
  name?: string;
  address_street?: string;
  address_city?: string;
  address_state?: string;
  address_zip?: string;
  address_country?: string;
  latitude?: number | null;
  longitude?: number | null;
  website_url?: string | null;
  status?: AppStatus;
}

export interface Discipline {
  id: number;
  name: string;
  slug: string;
}

export interface DisciplineInsert {
  id?: number;
  name: string;
  slug: string;
}

export interface DisciplineUpdate {
  name?: string;
  slug?: string;
}

export interface SanctioningBody {
  id: number;
  name: string;
  slug: string;
  website_url: string | null;
}

export interface SanctioningBodyInsert {
  id?: number;
  name: string;
  slug: string;
  website_url?: string | null;
}

export interface SanctioningBodyUpdate {
  name?: string;
  slug?: string;
  website_url?: string | null;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  venue_id: string;
  start_datetime: string;
  flyer_image_url: string | null;
  official_website_url: string | null;
  classes_details: string | null;
  status: AppStatus;
  created_by: string;
  created_at: string;
}

export interface EventInsert {
  id?: string;
  title: string;
  description?: string | null;
  venue_id: string;
  start_datetime: string;
  flyer_image_url?: string | null;
  official_website_url?: string | null;
  classes_details?: string | null;
  status?: AppStatus;
  created_by: string;
  created_at?: string;
}

export interface EventUpdate {
  title?: string;
  description?: string | null;
  venue_id?: string;
  start_datetime?: string;
  flyer_image_url?: string | null;
  official_website_url?: string | null;
  classes_details?: string | null;
  status?: AppStatus;
}

export interface EventDiscipline {
  event_id: string;
  discipline_id: number;
}

export interface EventDisciplineInsert {
  event_id: string;
  discipline_id: number;
}

export interface EventSanction {
  event_id: string;
  sanction_id: number;
}

export interface EventSanctionInsert {
  event_id: string;
  sanction_id: number;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  description: string | null;
  phone: string | null;
  website_url: string | null;
  service_radius_miles: number;
  zip_code: string;
  status: AppStatus;
  created_by: string;
  created_at: string;
}

export interface ServiceInsert {
  id?: string;
  name: string;
  category: string;
  description?: string | null;
  phone?: string | null;
  website_url?: string | null;
  service_radius_miles: number;
  zip_code: string;
  status?: AppStatus;
  created_by: string;
  created_at?: string;
}

export interface ServiceUpdate {
  name?: string;
  category?: string;
  description?: string | null;
  phone?: string | null;
  website_url?: string | null;
  service_radius_miles?: number;
  zip_code?: string;
  status?: AppStatus;
}

export interface Favorite {
  id: string;
  user_id: string;
  entity_id: string;
  entity_type: FavoriteEntityType;
  created_at: string;
}

export interface FavoriteInsert {
  id?: string;
  user_id: string;
  entity_id: string;
  entity_type: FavoriteEntityType;
  created_at?: string;
}

export interface FavoriteUpdate {
  entity_id?: string;
  entity_type?: FavoriteEntityType;
}
