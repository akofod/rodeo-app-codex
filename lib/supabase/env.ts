import { getOptionalEnv, getRequiredEnv } from '@/lib/validators/env';

export const getSupabaseEnv = () => ({
  url: getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
  anonKey: getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  serviceRoleKey: getOptionalEnv('SUPABASE_SERVICE_ROLE_KEY'),
});
