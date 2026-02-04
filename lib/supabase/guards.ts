import 'server-only';

import { createSupabaseServerClient } from './server';

export const requireUser = async () => {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Authentication required.');
  }

  return { supabase, user };
};

export const getOptionalUser = async () => {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
};

export const requireAdmin = async () => {
  const { supabase, user } = await requireUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role !== 'ADMIN') {
    throw new Error('Admin access required.');
  }

  return { supabase, user };
};
