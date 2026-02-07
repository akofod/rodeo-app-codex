import 'server-only';

import type { AppStatus, Service, ServiceInsert, ServiceUpdate } from '@/types/database';
import { normalizeServiceCategory } from '@/lib/services/categories';

import { requireSupabaseAdminClient } from './admin';
import { getOptionalUser, requireAdmin, requireUser } from './guards';
import { getErrorMessage, toDataResult, toErrorResult, type DataResult } from './results';
import { createSupabaseServerClient } from './server';

export type ServiceCreateInput = {
  name: string;
  category: string;
  description?: string | null;
  image_url?: string | null;
  contact_name?: string | null;
  contact_email?: string | null;
  specialties?: string | null;
  pricing_details?: string | null;
  availability_notes?: string | null;
  phone?: string | null;
  website_url?: string | null;
  service_radius_miles: number;
  zip_code: string;
};

export type ServiceUpdateInput = Partial<ServiceCreateInput> & {
  status?: AppStatus;
};

const normalize = (value: string) => value.trim();

const isValidRadius = (value: number) => Number.isFinite(value) && value > 0;

const validateServiceInput = (input: ServiceCreateInput): string | null => {
  if (!normalize(input.name)) {
    return 'Service name is required.';
  }
  if (!normalize(input.category) || !normalizeServiceCategory(input.category)) {
    return 'Category is required.';
  }
  if (!normalize(input.phone ?? '') && !normalize(input.website_url ?? '')) {
    return 'At least one contact method is required.';
  }
  if (input.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.contact_email)) {
    return 'Contact email must be a valid email address.';
  }
  if (!normalize(input.zip_code)) {
    return 'ZIP code is required.';
  }
  if (!isValidRadius(input.service_radius_miles)) {
    return 'Service radius must be a positive number.';
  }
  return null;
};

export const createService = async (input: ServiceCreateInput): Promise<DataResult<Service>> => {
  const validationError = validateServiceInput(input);

  if (validationError) {
    return toErrorResult(validationError);
  }

  const normalizedCategory = normalizeServiceCategory(input.category);
  if (!normalizedCategory) {
    return toErrorResult('Category is required.');
  }

  try {
    const { supabase, user } = await requireUser();

    const payload: ServiceInsert = {
      name: normalize(input.name),
      category: normalizedCategory,
      description: input.description?.trim() || null,
      image_url: input.image_url?.trim() || null,
      contact_name: input.contact_name?.trim() || null,
      contact_email: input.contact_email?.trim() || null,
      specialties: input.specialties?.trim() || null,
      pricing_details: input.pricing_details?.trim() || null,
      availability_notes: input.availability_notes?.trim() || null,
      phone: input.phone?.trim() || null,
      website_url: input.website_url?.trim() || null,
      service_radius_miles: input.service_radius_miles,
      zip_code: normalize(input.zip_code),
      created_by: user.id,
      status: 'PENDING',
    };

    const { data, error } = await supabase.from('services').insert(payload).select('*').single();

    return toDataResult(data, error);
  } catch (error) {
    return toErrorResult(getErrorMessage(error));
  }
};

export const updateService = async (
  serviceId: string,
  updates: ServiceUpdateInput,
): Promise<DataResult<Service>> => {
  if (!serviceId) {
    return toErrorResult('Service id is required.');
  }

  try {
    const { supabase } = await requireUser();
    const payload: ServiceUpdate = {};

    if (updates.name !== undefined) payload.name = updates.name.trim();
    if (updates.category !== undefined) {
      const normalizedCategory = normalizeServiceCategory(updates.category);
      if (!normalizedCategory) {
        return toErrorResult('Category is required.');
      }
      payload.category = normalizedCategory;
    }
    if (updates.description !== undefined)
      payload.description = updates.description?.trim() || null;
    if (updates.image_url !== undefined) payload.image_url = updates.image_url?.trim() || null;
    if (updates.contact_name !== undefined)
      payload.contact_name = updates.contact_name?.trim() || null;
    if (updates.contact_email !== undefined) {
      const email = updates.contact_email?.trim() || null;
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return toErrorResult('Contact email must be a valid email address.');
      }
      payload.contact_email = email;
    }
    if (updates.specialties !== undefined) payload.specialties = updates.specialties?.trim() || null;
    if (updates.pricing_details !== undefined)
      payload.pricing_details = updates.pricing_details?.trim() || null;
    if (updates.availability_notes !== undefined)
      payload.availability_notes = updates.availability_notes?.trim() || null;
    if (updates.phone !== undefined) payload.phone = updates.phone?.trim() || null;
    if (updates.website_url !== undefined)
      payload.website_url = updates.website_url?.trim() || null;
    if (updates.service_radius_miles !== undefined) {
      if (!isValidRadius(updates.service_radius_miles)) {
        return toErrorResult('Service radius must be a positive number.');
      }
      payload.service_radius_miles = updates.service_radius_miles;
    }
    if (updates.zip_code !== undefined) payload.zip_code = updates.zip_code.trim();
    if (updates.status !== undefined) payload.status = updates.status;

    const { data, error } = await supabase
      .from('services')
      .update(payload)
      .eq('id', serviceId)
      .select('*')
      .single();

    return toDataResult(data, error);
  } catch (error) {
    return toErrorResult(getErrorMessage(error));
  }
};

export const deleteService = async (serviceId: string): Promise<DataResult<null>> => {
  if (!serviceId) {
    return toErrorResult('Service id is required.');
  }

  try {
    const { supabase } = await requireUser();
    const { error } = await supabase.from('services').delete().eq('id', serviceId);

    return toDataResult(null, error);
  } catch (error) {
    return toErrorResult(getErrorMessage(error));
  }
};

export const getApprovedServices = async (): Promise<DataResult<Service[]>> => {
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('status', 'APPROVED')
      .order('created_at', { ascending: false });

    return toDataResult(data ?? [], error);
  } catch (error) {
    return toErrorResult(getErrorMessage(error));
  }
};

export const getServiceById = async (serviceId: string): Promise<DataResult<Service | null>> => {
  if (!serviceId) {
    return toErrorResult('Service id is required.');
  }

  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .maybeSingle();

    return toDataResult(data, error);
  } catch (error) {
    return toErrorResult(getErrorMessage(error));
  }
};

export const getUserServices = async (userId?: string): Promise<DataResult<Service[]>> => {
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
      .from('services')
      .select('*')
      .eq('created_by', targetUserId)
      .order('created_at', { ascending: false });

    return toDataResult(data ?? [], error);
  } catch (error) {
    return toErrorResult(getErrorMessage(error));
  }
};

export const getOptionalUserServices = async (): Promise<DataResult<Service[]>> => {
  try {
    const { supabase, user } = await getOptionalUser();

    if (!user) {
      return toDataResult([], null);
    }

    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false });

    return toDataResult(data ?? [], error);
  } catch (error) {
    return toErrorResult(getErrorMessage(error));
  }
};

export const setServiceStatus = async (
  serviceId: string,
  status: AppStatus,
): Promise<DataResult<Service>> => {
  if (!serviceId) {
    return toErrorResult('Service id is required.');
  }

  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
      .from('services')
      .update({ status })
      .eq('id', serviceId)
      .select('*')
      .single();

    return toDataResult(data, error);
  } catch (error) {
    return toErrorResult(getErrorMessage(error));
  }
};
