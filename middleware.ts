import {
  DEFAULT_COOKIE_OPTIONS,
  createChunks,
  type CookieOptions,
  createServerClient,
} from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

import {
  createSupabaseCookieStorage,
  decodeLegacyCookieValue,
} from './lib/supabase/cookie-storage';
import { getSupabaseEnv } from './lib/supabase/env';

const authRoutes = ['/sign-in', '/sign-up'];
const protectedRoutes = ['/dashboard', '/admin'];

const isMatch = (pathname: string, routes: string[]) =>
  routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

const supabaseCookiePrefix = 'sb-';
const isSupabaseCookieName = (name: string) => name.startsWith(supabaseCookiePrefix);

const copyCookies = (from: NextResponse, to: NextResponse) => {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie);
  });
};

const migrateLegacySupabaseCookies = (request: NextRequest, response: NextResponse) => {
  const groups = new Map<string, { base?: string; chunks: Map<number, string> }>();

  request.cookies.getAll().forEach((cookie) => {
    const chunkMatch = cookie.name.match(/^(.*)\.(\d+)$/);
    const baseName = chunkMatch ? chunkMatch[1] : cookie.name;

    if (!isSupabaseCookieName(baseName)) {
      return;
    }

    const group = groups.get(baseName) ?? { chunks: new Map<number, string>() };

    if (chunkMatch) {
      group.chunks.set(Number(chunkMatch[2]), cookie.value);
    } else {
      group.base = cookie.value;
    }

    groups.set(baseName, group);
  });

  let migrated = false;

  groups.forEach((group, baseName) => {
    const combined = group.base
      ? group.base
      : group.chunks.size > 0
        ? Array.from(group.chunks.entries())
            .sort(([left], [right]) => left - right)
            .map(([, value]) => value)
            .join('')
        : null;

    if (!combined || !combined.startsWith('base64-')) {
      return;
    }

    const decoded = decodeLegacyCookieValue(combined);

    if (decoded === combined) {
      return;
    }

    const newChunks = createChunks(baseName, decoded);
    const newNames = new Set(newChunks.map((chunk) => chunk.name));

    newChunks.forEach((chunk) => {
      response.cookies.set({
        name: chunk.name,
        value: chunk.value,
        ...DEFAULT_COOKIE_OPTIONS,
        maxAge: DEFAULT_COOKIE_OPTIONS.maxAge,
      });
    });

    if (group.base && !newNames.has(baseName)) {
      response.cookies.set({
        name: baseName,
        value: '',
        ...DEFAULT_COOKIE_OPTIONS,
        maxAge: 0,
      });
    }

    group.chunks.forEach((_value, index) => {
      const chunkName = `${baseName}.${index}`;
      if (!newNames.has(chunkName)) {
        response.cookies.set({
          name: chunkName,
          value: '',
          ...DEFAULT_COOKIE_OPTIONS,
          maxAge: 0,
        });
      }
    });

    migrated = true;
  });

  return migrated;
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthRoute = isMatch(pathname, authRoutes);
  const isProtectedRoute = isMatch(pathname, protectedRoutes);

  const response = NextResponse.next();
  const migrated = migrateLegacySupabaseCookies(request, response);

  if (!isAuthRoute && !isProtectedRoute) {
    return migrated ? response : NextResponse.next();
  }

  const { url, anonKey } = getSupabaseEnv();
  const cookieStore = {
    get(name: string) {
      return request.cookies.get(name);
    },
    set(options: { name: string; value: string } & Record<string, unknown>) {
      response.cookies.set(options);
    },
  };

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
    auth: {
      storage: createSupabaseCookieStorage(cookieStore, 'readwrite'),
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isAuthRoute) {
    if (user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/dashboard';
      const redirectResponse = NextResponse.redirect(redirectUrl);
      copyCookies(response, redirectResponse);
      return redirectResponse;
    }

    return response;
  }

  if (!user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/sign-in';
    const redirectResponse = NextResponse.redirect(redirectUrl);
    copyCookies(response, redirectResponse);
    return redirectResponse;
  }

  if (pathname.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role !== 'ADMIN') {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/dashboard';
      const redirectResponse = NextResponse.redirect(redirectUrl);
      copyCookies(response, redirectResponse);
      return redirectResponse;
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
};
