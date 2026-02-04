'use server';

import { redirect } from 'next/navigation';

import { createVenue } from '@/lib/supabase/venues';

const getString = (formData: FormData, key: string) => {
  const value = formData.get(key);
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
};

export const createVenueAction = async (formData: FormData) => {
  const result = await createVenue({
    name: getString(formData, 'name'),
    address_street: getString(formData, 'address_street'),
    address_city: getString(formData, 'address_city'),
    address_state: getString(formData, 'address_state'),
    address_zip: getString(formData, 'address_zip'),
    address_country: getString(formData, 'address_country'),
    website_url: getString(formData, 'website_url') || null,
  });

  if (result.error) {
    redirect(`/dashboard/venues?error=${encodeURIComponent(result.error)}`);
  }

  redirect('/dashboard/venues?success=Venue submitted for approval.');
};
