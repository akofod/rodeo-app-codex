import 'server-only';

import type { Discipline, SanctioningBody } from '@/types/database';

import { getErrorMessage, toDataResult, toErrorResult, type DataResult } from './results';
import { createSupabaseServerClient } from './server';

export const getDisciplines = async (): Promise<DataResult<Discipline[]>> => {
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('disciplines')
      .select('*')
      .order('name', { ascending: true });

    return toDataResult(data ?? [], error);
  } catch (error) {
    return toErrorResult(getErrorMessage(error));
  }
};

export const getSanctioningBodies = async (): Promise<DataResult<SanctioningBody[]>> => {
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('sanctioning_bodies')
      .select('*')
      .order('name', { ascending: true });

    return toDataResult(data ?? [], error);
  } catch (error) {
    return toErrorResult(getErrorMessage(error));
  }
};
