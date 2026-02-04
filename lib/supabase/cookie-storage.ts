import 'server-only';

import { DEFAULT_COOKIE_OPTIONS, combineChunks, createChunks, deleteChunks } from '@supabase/ssr';

type CookieStore = {
  get: (name: string) => { value: string } | undefined;
  set: (options: { name: string; value: string } & Record<string, unknown>) => void;
};

type StorageMode = 'readonly' | 'readwrite';

export const decodeLegacyCookieValue = (value: string): string => {
  if (!value.startsWith('base64-')) {
    return value;
  }

  const encoded = value.slice('base64-'.length);
  const normalized = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');

  try {
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(padded, 'base64').toString('utf-8');
    }

    if (typeof atob !== 'undefined') {
      const binary = atob(padded);
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
      return new TextDecoder().decode(bytes);
    }
  } catch {
    // fall through to return original value
  }

  return value;
};

export const createSupabaseCookieStorage = (cookieStore: CookieStore, mode: StorageMode) => ({
  isServer: true,
  getItem: async (key: string) => {
    const chunkedCookie = await combineChunks(key, (chunkName: string) =>
      cookieStore.get(chunkName)?.value,
    );

    if (!chunkedCookie) {
      return null;
    }

    return decodeLegacyCookieValue(chunkedCookie);
  },
  setItem: async (key: string, value: string) => {
    if (mode === 'readonly') {
      return;
    }

    const chunks = createChunks(key, value);

    await Promise.all(
      chunks.map((chunk) =>
        cookieStore.set({
          name: chunk.name,
          value: chunk.value,
          ...DEFAULT_COOKIE_OPTIONS,
          maxAge: DEFAULT_COOKIE_OPTIONS.maxAge,
        }),
      ),
    );
  },
  removeItem: async (key: string) => {
    if (mode === 'readonly') {
      return;
    }

    await deleteChunks(
      key,
      (chunkName: string) => cookieStore.get(chunkName)?.value,
      (chunkName: string) =>
        cookieStore.set({
          name: chunkName,
          value: '',
          ...DEFAULT_COOKIE_OPTIONS,
          maxAge: 0,
        }),
    );
  },
});
