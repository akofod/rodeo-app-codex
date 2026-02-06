import { getOptionalEnv, getRequiredEnv } from '@/lib/validators/env';
import { getSupabaseEnv } from '@/lib/supabase/env';
import { getMapboxToken } from '@/lib/mapbox/config';

describe('env helpers', () => {
  it('reads required env values', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    expect(getOptionalEnv('MISSING_ENV')).toBeUndefined();
    expect(getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL')).toBe('https://example.supabase.co');
  });

  it('builds supabase env config', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
    const env = getSupabaseEnv();
    expect(env.url).toBe('https://example.supabase.co');
    expect(env.anonKey).toBe('anon-key');
  });

  it('reads mapbox token', () => {
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN = 'token';
    expect(getMapboxToken()).toBe('token');
  });
});
