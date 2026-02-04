'use server';

import { redirect } from 'next/navigation';

import { ensureProfile } from '@/lib/supabase/profiles';
import { createSupabaseServerActionClient } from '@/lib/supabase/server-actions';

const getString = (formData: FormData, key: string) => {
  const value = formData.get(key);
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
};

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const signInWithEmail = async (formData: FormData) => {
  const email = getString(formData, 'email');
  const password = getString(formData, 'password');

  const supabase = createSupabaseServerActionClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/sign-in?error=${encodeURIComponent(error.message)}`);
  }

  redirect('/dashboard');
};

export const signUpWithEmail = async (formData: FormData) => {
  const email = getString(formData, 'email');
  const password = getString(formData, 'password');
  const fullName = getString(formData, 'fullName');

  const supabase = createSupabaseServerActionClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: fullName ? { data: { full_name: fullName } } : undefined,
  });

  if (error) {
    redirect(`/sign-up?error=${encodeURIComponent(error.message)}`);
  }

  if (data.user?.id) {
    await ensureProfile({
      id: data.user.id,
      email: data.user.email,
      full_name: fullName || null,
    });
  }

  redirect('/dashboard');
};

export const signInWithGoogle = async () => {
  const supabase = createSupabaseServerActionClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${appUrl}/api/auth/callback`,
    },
  });

  if (error) {
    redirect(`/sign-in?error=${encodeURIComponent(error.message)}`);
  }

  if (data.url) {
    redirect(data.url);
  }

  redirect('/sign-in');
};

export const signOut = async () => {
  const supabase = createSupabaseServerActionClient();
  await supabase.auth.signOut();
  redirect('/');
};
