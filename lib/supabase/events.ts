import 'server-only';

import type {
  AppStatus,
  Event,
  EventDisciplineInsert,
  EventInsert,
  EventSanctionInsert,
  EventUpdate,
} from '@/types/database';
import { isValidEventTimezone } from '@/lib/events/timezones';

import { requireSupabaseAdminClient } from './admin';
import { requireAdmin, requireUser } from './guards';
import { getErrorMessage, toDataResult, toErrorResult, type DataResult } from './results';
import { createSupabaseServerClient } from './server';

export type EventCreateInput = {
  title: string;
  description?: string | null;
  venue_id: string;
  start_datetime: string;
  end_datetime: string;
  timezone: string;
  flyer_image_url?: string | null;
  official_website_url?: string | null;
  classes_details?: string | null;
};

export type EventUpdateInput = Partial<EventCreateInput> & {
  status?: AppStatus;
};

type EventFilters = {
  startDate?: string;
  endDate?: string;
  venueId?: string;
};

const normalize = (value: string) => value.trim();

const isValidDate = (value: string) => !Number.isNaN(Date.parse(value));

const validateEventInput = (input: EventCreateInput): string | null => {
  if (!normalize(input.title)) {
    return 'Event title is required.';
  }
  if (!normalize(input.venue_id)) {
    return 'Venue id is required.';
  }
  if (!normalize(input.start_datetime)) {
    return 'Start date/time is required.';
  }
  if (!normalize(input.end_datetime)) {
    return 'End date/time is required.';
  }
  if (!isValidDate(input.start_datetime)) {
    return 'Start date/time must be a valid ISO date string.';
  }
  if (!isValidDate(input.end_datetime)) {
    return 'End date/time must be a valid ISO date string.';
  }
  if (new Date(input.end_datetime).getTime() <= new Date(input.start_datetime).getTime()) {
    return 'End date/time must be after start date/time.';
  }
  if (!isValidEventTimezone(input.timezone)) {
    return 'Timezone is required.';
  }
  return null;
};

export const createEvent = async (input: EventCreateInput): Promise<DataResult<Event>> => {
  const validationError = validateEventInput(input);

  if (validationError) {
    return toErrorResult(validationError);
  }

  try {
    const { supabase, user } = await requireUser();

    const payload: EventInsert = {
      title: normalize(input.title),
      description: input.description?.trim() || null,
      venue_id: normalize(input.venue_id),
      start_datetime: normalize(input.start_datetime),
      end_datetime: normalize(input.end_datetime),
      timezone: normalize(input.timezone),
      flyer_image_url: input.flyer_image_url?.trim() || null,
      official_website_url: input.official_website_url?.trim() || null,
      classes_details: input.classes_details?.trim() || null,
      created_by: user.id,
      status: 'PENDING',
    };

    const { data, error } = await supabase.from('events').insert(payload).select('*').single();

    return toDataResult(data, error);
  } catch (error) {
    return toErrorResult(getErrorMessage(error));
  }
};

export const updateEvent = async (
  eventId: string,
  updates: EventUpdateInput,
): Promise<DataResult<Event>> => {
  if (!eventId) {
    return toErrorResult('Event id is required.');
  }

  try {
    const { supabase } = await requireUser();
    const payload: EventUpdate = {};

    if (updates.title !== undefined) payload.title = updates.title.trim();
    if (updates.description !== undefined)
      payload.description = updates.description?.trim() || null;
    if (updates.venue_id !== undefined) payload.venue_id = updates.venue_id.trim();
    if (updates.start_datetime !== undefined) {
      if (!isValidDate(updates.start_datetime)) {
        return toErrorResult('Start date/time must be a valid ISO date string.');
      }
      payload.start_datetime = updates.start_datetime.trim();
    }
    if (updates.end_datetime !== undefined) {
      if (!isValidDate(updates.end_datetime)) {
        return toErrorResult('End date/time must be a valid ISO date string.');
      }
      payload.end_datetime = updates.end_datetime.trim();
    }
    if (updates.timezone !== undefined) {
      if (!isValidEventTimezone(updates.timezone)) {
        return toErrorResult('Timezone is required.');
      }
      payload.timezone = updates.timezone.trim();
    }
    const nextStart = updates.start_datetime;
    const nextEnd = updates.end_datetime;
    if (nextStart && nextEnd && new Date(nextEnd).getTime() <= new Date(nextStart).getTime()) {
      return toErrorResult('End date/time must be after start date/time.');
    }
    if (updates.flyer_image_url !== undefined)
      payload.flyer_image_url = updates.flyer_image_url?.trim() || null;
    if (updates.official_website_url !== undefined)
      payload.official_website_url = updates.official_website_url?.trim() || null;
    if (updates.classes_details !== undefined)
      payload.classes_details = updates.classes_details?.trim() || null;
    if (updates.status !== undefined) payload.status = updates.status;

    const { data, error } = await supabase
      .from('events')
      .update(payload)
      .eq('id', eventId)
      .select('*')
      .single();

    return toDataResult(data, error);
  } catch (error) {
    return toErrorResult(getErrorMessage(error));
  }
};

export const deleteEvent = async (eventId: string): Promise<DataResult<null>> => {
  if (!eventId) {
    return toErrorResult('Event id is required.');
  }

  try {
    const { supabase } = await requireUser();
    const { error } = await supabase.from('events').delete().eq('id', eventId);

    return toDataResult(null, error);
  } catch (error) {
    return toErrorResult(getErrorMessage(error));
  }
};

export const getApprovedEvents = async (filters?: EventFilters): Promise<DataResult<Event[]>> => {
  try {
    const supabase = createSupabaseServerClient();
    let query = supabase
      .from('events')
      .select('*')
      .eq('status', 'APPROVED')
      .order('start_datetime', { ascending: true });

    if (filters?.venueId) {
      query = query.eq('venue_id', filters.venueId);
    }
    if (filters?.startDate && isValidDate(filters.startDate)) {
      query = query.gte('start_datetime', filters.startDate);
    }
    if (filters?.endDate && isValidDate(filters.endDate)) {
      query = query.lte('start_datetime', filters.endDate);
    }

    const { data, error } = await query;
    return toDataResult(data ?? [], error);
  } catch (error) {
    return toErrorResult(getErrorMessage(error));
  }
};

export const getEventById = async (eventId: string): Promise<DataResult<Event | null>> => {
  if (!eventId) {
    return toErrorResult('Event id is required.');
  }

  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .maybeSingle();

    return toDataResult(data, error);
  } catch (error) {
    return toErrorResult(getErrorMessage(error));
  }
};

export const getUserEvents = async (userId?: string): Promise<DataResult<Event[]>> => {
  try {
    const targetUserId = userId ?? (await requireUser()).user.id;
    const adminClient = (() => {
      try {
        return requireSupabaseAdminClient();
      } catch {
        return null;
      }
    })();

    const supabase = adminClient ?? createSupabaseServerClient();
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('created_by', targetUserId)
      .order('start_datetime', { ascending: false });

    return toDataResult(data ?? [], error);
  } catch (error) {
    return toErrorResult(getErrorMessage(error));
  }
};

export const setEventStatus = async (
  eventId: string,
  status: AppStatus,
): Promise<DataResult<Event>> => {
  if (!eventId) {
    return toErrorResult('Event id is required.');
  }

  try {
    const { supabase } = await requireAdmin();

    if (status === 'APPROVED') {
      const { data: event } = await supabase
        .from('events')
        .select('id, venue_id')
        .eq('id', eventId)
        .maybeSingle();

      if (!event) {
        return toErrorResult('Event not found.');
      }

      const { data: venue } = await supabase
        .from('venues')
        .select('status')
        .eq('id', event.venue_id)
        .maybeSingle();

      if (venue?.status !== 'APPROVED') {
        return toErrorResult('Event venue must be approved before approving the event.');
      }
    }

    const { data, error } = await supabase
      .from('events')
      .update({ status })
      .eq('id', eventId)
      .select('*')
      .single();

    return toDataResult(data, error);
  } catch (error) {
    return toErrorResult(getErrorMessage(error));
  }
};

export const addEventDisciplines = async (
  eventId: string,
  disciplineIds: number[],
): Promise<DataResult<null>> => {
  if (!eventId) {
    return toErrorResult('Event id is required.');
  }

  const uniqueIds = Array.from(new Set(disciplineIds));

  if (uniqueIds.length === 0) {
    return toDataResult(null, null);
  }

  try {
    const { supabase } = await requireUser();
    const payload: EventDisciplineInsert[] = uniqueIds.map((disciplineId) => ({
      event_id: eventId,
      discipline_id: disciplineId,
    }));

    const { error } = await supabase.from('event_disciplines').insert(payload);

    return toDataResult(null, error);
  } catch (error) {
    return toErrorResult(getErrorMessage(error));
  }
};

export const addEventSanctions = async (
  eventId: string,
  sanctionIds: number[],
): Promise<DataResult<null>> => {
  if (!eventId) {
    return toErrorResult('Event id is required.');
  }

  const uniqueIds = Array.from(new Set(sanctionIds));

  if (uniqueIds.length === 0) {
    return toDataResult(null, null);
  }

  try {
    const { supabase } = await requireUser();
    const payload: EventSanctionInsert[] = uniqueIds.map((sanctionId) => ({
      event_id: eventId,
      sanction_id: sanctionId,
    }));

    const { error } = await supabase.from('event_sanctions').insert(payload);

    return toDataResult(null, error);
  } catch (error) {
    return toErrorResult(getErrorMessage(error));
  }
};
