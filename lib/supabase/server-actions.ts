import { type CookieOptions, createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import { createSupabaseCookieStorage } from './cookie-storage';
import { getSupabaseEnv } from './env';

export const createSupabaseServerActionClient = () => {
  const { url, anonKey } = getSupabaseEnv();
  const cookieStore = cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        cookieStore.set({ name, value: '', ...options, maxAge: 0 });
      },
    },
    auth: {
      storage: createSupabaseCookieStorage(cookieStore, 'readwrite'),
    },
  });
};
