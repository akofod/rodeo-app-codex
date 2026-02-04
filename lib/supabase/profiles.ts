import { createSupabaseAdminClient } from './admin';
import { createSupabaseServerClient } from './server';

type ProfilePayload = {
  id: string;
  email?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
};

export const ensureProfile = async (payload: ProfilePayload) => {
  const adminClient = createSupabaseAdminClient();

  if (adminClient) {
    const { error } = await adminClient.from('profiles').upsert(payload, {
      onConflict: 'id',
    });

    if (!error) {
      return;
    }
  }

  const serverClient = createSupabaseServerClient();
  await serverClient.from('profiles').upsert(payload, {
    onConflict: 'id',
  });
};

export const getProfileByUserId = async (userId: string) => {
  const supabase = createSupabaseServerClient();
  return supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url, role, created_at, updated_at')
    .eq('id', userId)
    .maybeSingle();
};
