'use server';

import { redirect } from 'next/navigation';

import { createService } from '@/lib/supabase/services';

const getString = (formData: FormData, key: string) => {
  const value = formData.get(key);
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
};

const getNumber = (formData: FormData, key: string) => {
  const value = formData.get(key);
  if (typeof value !== 'string') {
    return Number.NaN;
  }
  return Number(value);
};

export const createServiceAction = async (formData: FormData) => {
  const result = await createService({
    name: getString(formData, 'name'),
    category: getString(formData, 'category'),
    description: getString(formData, 'description') || null,
    phone: getString(formData, 'phone') || null,
    website_url: getString(formData, 'website_url') || null,
    service_radius_miles: getNumber(formData, 'service_radius_miles'),
    zip_code: getString(formData, 'zip_code'),
  });

  if (result.error) {
    redirect(`/dashboard/services?error=${encodeURIComponent(result.error)}`);
  }

  redirect('/dashboard/services?success=Service submitted for approval.');
};
