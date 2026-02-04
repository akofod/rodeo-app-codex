import 'server-only';

import type { Favorite, FavoriteEntityType, FavoriteInsert } from '@/types/database';

import { getOptionalUser, requireUser } from './guards';
import { getErrorMessage, toDataResult, toErrorResult, type DataResult } from './results';
import { createSupabaseServerClient } from './server';

export type FavoriteCreateInput = {
  entity_id: string;
  entity_type: FavoriteEntityType;
};

const normalize = (value: string) => value.trim();

const validateFavoriteInput = (input: FavoriteCreateInput): string | null => {
  if (!normalize(input.entity_id)) {
    return 'Entity id is required.';
  }
  if (!input.entity_type) {
    return 'Entity type is required.';
  }
  return null;
};

export const createFavorite = async (
  input: FavoriteCreateInput,
): Promise<DataResult<Favorite>> => {
  const validationError = validateFavoriteInput(input);

  if (validationError) {
    return toErrorResult(validationError);
  }

  try {
    const { supabase, user } = await requireUser();
    const payload: FavoriteInsert = {
      user_id: user.id,
      entity_id: normalize(input.entity_id),
      entity_type: input.entity_type,
    };

    await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('entity_id', payload.entity_id)
      .eq('entity_type', payload.entity_type);

    const { data, error } = await supabase.from('favorites').insert(payload).select('*').single();

    return toDataResult(data, error);
  } catch (error) {
    return toErrorResult(getErrorMessage(error));
  }
};

export const deleteFavorite = async (
  input: FavoriteCreateInput,
): Promise<DataResult<null>> => {
  const validationError = validateFavoriteInput(input);

  if (validationError) {
    return toErrorResult(validationError);
  }

  try {
    const { supabase, user } = await requireUser();
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('entity_id', normalize(input.entity_id))
      .eq('entity_type', input.entity_type);

    return toDataResult(null, error);
  } catch (error) {
    return toErrorResult(getErrorMessage(error));
  }
};

export const getUserFavorites = async (
  userId?: string,
  entityType?: FavoriteEntityType,
  entityIds?: string[],
): Promise<DataResult<Favorite[]>> => {
  try {
    const { supabase, user } = userId ? { supabase: null, user: null } : await requireUser();
    const targetUserId = userId ?? user?.id;

    if (!targetUserId) {
      return toErrorResult('Authentication required.');
    }

    const client = supabase ?? createSupabaseServerClient();
    let query = client.from('favorites').select('*').eq('user_id', targetUserId);

    if (entityType) {
      query = query.eq('entity_type', entityType);
    }

    if (entityIds && entityIds.length > 0) {
      query = query.in('entity_id', entityIds);
    }

    const { data, error } = await query;
    return toDataResult(data ?? [], error);
  } catch (error) {
    return toErrorResult(getErrorMessage(error));
  }
};

export const getOptionalUserFavorites = async (
  entityType?: FavoriteEntityType,
  entityIds?: string[],
): Promise<DataResult<Favorite[]>> => {
  try {
    const { supabase, user } = await getOptionalUser();

    if (!user) {
      return toDataResult([], null);
    }

    let query = supabase.from('favorites').select('*').eq('user_id', user.id);

    if (entityType) {
      query = query.eq('entity_type', entityType);
    }

    if (entityIds && entityIds.length > 0) {
      query = query.in('entity_id', entityIds);
    }

    const { data, error } = await query;
    return toDataResult(data ?? [], error);
  } catch (error) {
    return toErrorResult(getErrorMessage(error));
  }
};
