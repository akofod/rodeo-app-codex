import { createClient } from '@supabase/supabase-js';

import { getSupabaseEnv } from './env';

export const createSupabaseAdminClient = () => {
  const { url, serviceRoleKey } = getSupabaseEnv();

  if (!serviceRoleKey) {
    return null;
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

export const requireSupabaseAdminClient = () => {
  const client = createSupabaseAdminClient();

  if (!client) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations.');
  }

  return client;
};
