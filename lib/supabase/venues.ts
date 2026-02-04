import 'server-only';

import type { AppStatus, Venue, VenueInsert, VenueUpdate } from '@/types/database';

import { geocodeAddress } from '@/lib/mapbox/geocode';

import { requireSupabaseAdminClient } from './admin';
import { requireAdmin, requireUser } from './guards';
import { getErrorMessage, toDataResult, toErrorResult, type DataResult } from './results';
import { createSupabaseServerClient } from './server';

export type VenueCreateInput = {
  name: string;
  address_street: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  address_country: string;
  website_url?: string | null;
};

export type VenueUpdateInput = Partial<VenueCreateInput> & {
  status?: AppStatus;
};

const normalize = (value: string) => value.trim();

const validateVenueInput = (input: VenueCreateInput): string | null => {
  if (!normalize(input.name)) {
    return 'Venue name is required.';
  }
  if (!normalize(input.address_street)) {
    return 'Street address is required.';
  }
  if (!normalize(input.address_city)) {
    return 'City is required.';
  }
  if (!normalize(input.address_state)) {
    return 'State is required.';
  }
  if (!normalize(input.address_zip)) {
    return 'ZIP code is required.';
  }
  if (!normalize(input.address_country)) {
    return 'Country is required.';
  }
  return null;
};

const formatVenueAddress = (input: VenueCreateInput) =>
  `${input.address_street}, ${input.address_city}, ${input.address_state} ${input.address_zip}, ${input.address_country}`;

const tryGeocodeVenue = async (input: VenueCreateInput) => {
  try {
    return await geocodeAddress(formatVenueAddress(input));
  } catch {
    return null;
  }
};

export const createVenue = async (input: VenueCreateInput): Promise<DataResult<Venue>> => {
  const validationError = validateVenueInput(input);

  if (validationError) {
    return toErrorResult(validationError);
  }

  try {
    const { supabase, user } = await requireUser();
    const geocode = await tryGeocodeVenue(input);

    const payload: VenueInsert = {
      name: normalize(input.name),
      address_street: normalize(input.address_street),
      address_city: normalize(input.address_city),
      address_state: normalize(input.address_state),
      address_zip: normalize(input.address_zip),
      address_country: normalize(input.address_country),
      website_url: input.website_url?.trim() || null,
      latitude: geocode?.latitude ?? null,
      longitude: geocode?.longitude ?? null,
      created_by: user.id,
      status: 'PENDING',
    };

    const { data, error } = await supabase.from('venues').insert(payload).select('*').single();

    return toDataResult(data, error);
  } catch (error) {
    return toErrorResult(getErrorMessage(error));
  }
};

export const updateVenue = async (
  venueId: string,
  updates: VenueUpdateInput,
): Promise<DataResult<Venue>> => {
  if (!venueId) {
    return toErrorResult('Venue id is required.');
  }

  try {
    const { supabase } = await requireUser();
    const payload: VenueUpdate = {};

    if (updates.name !== undefined) payload.name = updates.name.trim();
    if (updates.address_street !== undefined)
      payload.address_street = updates.address_street.trim();
    if (updates.address_city !== undefined) payload.address_city = updates.address_city.trim();
    if (updates.address_state !== undefined) payload.address_state = updates.address_state.trim();
    if (updates.address_zip !== undefined) payload.address_zip = updates.address_zip.trim();
    if (updates.address_country !== undefined)
      payload.address_country = updates.address_country.trim();
    if (updates.website_url !== undefined)
      payload.website_url = updates.website_url?.trim() || null;
    if (updates.status !== undefined) payload.status = updates.status;

    if (
      payload.address_street &&
      payload.address_city &&
      payload.address_state &&
      payload.address_zip &&
      payload.address_country
    ) {
      const geocode = await tryGeocodeVenue({
        name: payload.name ?? '',
        address_street: payload.address_street,
        address_city: payload.address_city,
        address_state: payload.address_state,
        address_zip: payload.address_zip,
        address_country: payload.address_country,
        website_url: payload.website_url ?? null,
      });

      payload.latitude = geocode?.latitude ?? null;
      payload.longitude = geocode?.longitude ?? null;
    }

    const { data, error } = await supabase
      .from('venues')
      .update(payload)
      .eq('id', venueId)
      .select('*')
      .single();

    return toDataResult(data, error);
  } catch (error) {
    return toErrorResult(getErrorMessage(error));
  }
};

export const getApprovedVenues = async (): Promise<DataResult<Venue[]>> => {
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .eq('status', 'APPROVED')
      .order('created_at', { ascending: false });

    return toDataResult(data ?? [], error);
  } catch (error) {
    return toErrorResult(getErrorMessage(error));
  }
};

export const getVenueById = async (venueId: string): Promise<DataResult<Venue | null>> => {
  if (!venueId) {
    return toErrorResult('Venue id is required.');
  }

  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .eq('id', venueId)
      .maybeSingle();

    return toDataResult(data, error);
  } catch (error) {
    return toErrorResult(getErrorMessage(error));
  }
};

export const getUserVenues = async (userId?: string): Promise<DataResult<Venue[]>> => {
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
      .from('venues')
      .select('*')
      .eq('created_by', targetUserId)
      .order('created_at', { ascending: false });

    return toDataResult(data ?? [], error);
  } catch (error) {
    return toErrorResult(getErrorMessage(error));
  }
};

export const setVenueStatus = async (
  venueId: string,
  status: AppStatus,
): Promise<DataResult<Venue>> => {
  if (!venueId) {
    return toErrorResult('Venue id is required.');
  }

  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
      .from('venues')
      .update({ status })
      .eq('id', venueId)
      .select('*')
      .single();

    return toDataResult(data, error);
  } catch (error) {
    return toErrorResult(getErrorMessage(error));
  }
};
