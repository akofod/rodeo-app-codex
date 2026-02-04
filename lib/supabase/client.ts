import { createBrowserClient } from '@supabase/ssr';

import { getSupabaseEnv } from './env';

export const createSupabaseBrowserClient = () => {
  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient(url, anonKey);
};
