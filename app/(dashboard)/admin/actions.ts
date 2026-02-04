'use server';

import { redirect } from 'next/navigation';

import { setEventStatus } from '@/lib/supabase/events';
import { setServiceStatus } from '@/lib/supabase/services';
import { setVenueStatus } from '@/lib/supabase/venues';

const getString = (formData: FormData, key: string) => {
  const value = formData.get(key);
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
};

const getStatus = (formData: FormData) => {
  const status = getString(formData, 'status');
  if (status === 'APPROVED' || status === 'REJECTED') {
    return status;
  }
  return '';
};

export const updateVenueStatusAction = async (formData: FormData) => {
  const venueId = getString(formData, 'venue_id');
  const status = getStatus(formData);

  if (!venueId || !status) {
    redirect('/admin?error=Invalid venue status update.');
  }

  const result = await setVenueStatus(venueId, status as 'APPROVED' | 'REJECTED');

  if (result.error) {
    redirect(`/admin?error=${encodeURIComponent(result.error)}`);
  }

  redirect('/admin?success=Venue status updated.');
};

export const updateEventStatusAction = async (formData: FormData) => {
  const eventId = getString(formData, 'event_id');
  const status = getStatus(formData);

  if (!eventId || !status) {
    redirect('/admin?error=Invalid event status update.');
  }

  const result = await setEventStatus(eventId, status as 'APPROVED' | 'REJECTED');

  if (result.error) {
    redirect(`/admin?error=${encodeURIComponent(result.error)}`);
  }

  redirect('/admin?success=Event status updated.');
};

export const updateServiceStatusAction = async (formData: FormData) => {
  const serviceId = getString(formData, 'service_id');
  const status = getStatus(formData);

  if (!serviceId || !status) {
    redirect('/admin?error=Invalid service status update.');
  }

  const result = await setServiceStatus(serviceId, status as 'APPROVED' | 'REJECTED');

  if (result.error) {
    redirect(`/admin?error=${encodeURIComponent(result.error)}`);
  }

  redirect('/admin?success=Service status updated.');
};
