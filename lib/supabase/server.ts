import { type CookieOptions, createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import { createSupabaseCookieStorage } from './cookie-storage';
import { getSupabaseEnv } from './env';

export const createSupabaseServerClient = () => {
  const { url, anonKey } = getSupabaseEnv();
  const cookieStore = cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        // Server components cannot mutate cookies; rely on server actions/route handlers instead.
        void name;
        void value;
        void options;
      },
      remove(name: string, options: CookieOptions) {
        void name;
        void options;
      },
    },
    auth: {
      storage: createSupabaseCookieStorage(cookieStore, 'readonly'),
    },
  });
};
