import 'server-only';

import type { Event, Service, Venue } from '@/types/database';

import { requireAdmin } from './guards';
import { getErrorMessage, toDataResult, toErrorResult, type DataResult } from './results';

type VenueSummary = Pick<
  Venue,
  'id' | 'name' | 'address_city' | 'address_state' | 'address_country' | 'status'
>;
type EventSummary = Pick<Event, 'id' | 'title' | 'venue_id' | 'start_datetime' | 'status'>;
type ServiceSummary = Pick<Service, 'id' | 'name' | 'category' | 'zip_code' | 'status'>;

export const getPendingVenues = async (): Promise<DataResult<VenueSummary[]>> => {
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
      .from('venues')
      .select('id, name, address_city, address_state, address_country, status')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false });

    return toDataResult(data ?? [], error);
  } catch (error) {
    return toErrorResult(getErrorMessage(error));
  }
};

export const getPendingEvents = async (): Promise<DataResult<EventSummary[]>> => {
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
      .from('events')
      .select('id, title, venue_id, start_datetime, status')
      .eq('status', 'PENDING')
      .order('start_datetime', { ascending: true });

    return toDataResult(data ?? [], error);
  } catch (error) {
    return toErrorResult(getErrorMessage(error));
  }
};

export const getPendingServices = async (): Promise<DataResult<ServiceSummary[]>> => {
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
      .from('services')
      .select('id, name, category, zip_code, status')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false });

    return toDataResult(data ?? [], error);
  } catch (error) {
    return toErrorResult(getErrorMessage(error));
  }
};
