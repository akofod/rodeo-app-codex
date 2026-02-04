import { NextRequest, NextResponse } from 'next/server';

import { type CookieOptions, createServerClient } from '@supabase/ssr';

import { getSupabaseEnv } from '@/lib/supabase/env';
import { ensureProfile } from '@/lib/supabase/profiles';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { url, anonKey } = getSupabaseEnv();
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  const response = NextResponse.redirect(new URL('/dashboard', requestUrl));

  if (!code) {
    return response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        response.cookies.set({ name, value: '', ...options, maxAge: 0 });
      },
    },
  });

  await supabase.auth.exchangeCodeForSession(code);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.id) {
    const metadata = user.user_metadata ?? {};

    await ensureProfile({
      id: user.id,
      email: user.email,
      full_name: metadata.full_name ?? metadata.name ?? null,
      avatar_url: metadata.avatar_url ?? metadata.picture ?? null,
    });
  }

  return response;
}
