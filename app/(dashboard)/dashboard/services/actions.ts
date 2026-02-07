'use server';

import { redirect } from 'next/navigation';

import { normalizeServiceCategory } from '@/lib/services/categories';
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

const isValidUrl = (value: string) => {
  if (!value) {
    return true;
  }
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
};

export const createServiceAction = async (formData: FormData) => {
  const name = getString(formData, 'name');
  const categoryInput = getString(formData, 'category');
  const phone = getString(formData, 'phone');
  const website = getString(formData, 'website_url');
  const imageUrl = getString(formData, 'image_url');
  const contactEmail = getString(formData, 'contact_email');
  const zipCode = getString(formData, 'zip_code');
  const radius = getNumber(formData, 'service_radius_miles');
  const category = normalizeServiceCategory(categoryInput);

  if (!name || !category) {
    redirect('/dashboard/services?error=Service name and category are required.');
  }

  if (!Number.isFinite(radius) || radius < 1 || radius > 1000) {
    redirect('/dashboard/services?error=Service radius must be between 1 and 1000 miles.');
  }

  if (!zipCode || !/^[A-Za-z0-9\\-\\s]{3,12}$/.test(zipCode)) {
    redirect('/dashboard/services?error=Enter a valid ZIP or postal code.');
  }

  if (!isValidUrl(website) || !isValidUrl(imageUrl)) {
    redirect('/dashboard/services?error=Enter valid URLs for website and image fields.');
  }

  if (phone && !/^[+()\\-\\s0-9]{7,20}$/.test(phone)) {
    redirect('/dashboard/services?error=Enter a valid phone number format.');
  }
  if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
    redirect('/dashboard/services?error=Enter a valid contact email.');
  }

  if (!phone && !website) {
    redirect('/dashboard/services?error=Add at least one contact method (phone or website).');
  }

  const result = await createService({
    name,
    category,
    description: getString(formData, 'description') || null,
    image_url: imageUrl || null,
    contact_name: getString(formData, 'contact_name') || null,
    contact_email: contactEmail || null,
    specialties: getString(formData, 'specialties') || null,
    pricing_details: getString(formData, 'pricing_details') || null,
    availability_notes: getString(formData, 'availability_notes') || null,
    phone: phone || null,
    website_url: website || null,
    service_radius_miles: radius,
    zip_code: zipCode,
  });

  if (result.error) {
    redirect(`/dashboard/services?error=${encodeURIComponent(result.error)}`);
  }

  redirect('/dashboard/services?success=Service submitted for approval.');
};
