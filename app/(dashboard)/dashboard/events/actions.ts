'use server';

import { redirect } from 'next/navigation';

import { addEventDisciplines, addEventSanctions, createEvent } from '@/lib/supabase/events';
import { createVenue } from '@/lib/supabase/venues';

const getString = (formData: FormData, key: string) => {
  const value = formData.get(key);
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
};

const toIsoString = (value: string) => {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toISOString();
};

export const createEventAction = async (formData: FormData) => {
  const occurrences = formData
    .getAll('occurrence')
    .filter((value): value is string => typeof value === 'string')
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .filter((value) => !Number.isNaN(new Date(value).getTime()));

  if (occurrences.length === 0) {
    redirect('/dashboard/events?error=Add at least one performance date and time.');
  }

  const disciplineIds = formData
    .getAll('discipline_ids')
    .filter((value): value is string => typeof value === 'string')
    .map((value) => Number.parseInt(value, 10))
    .filter((value) => Number.isFinite(value));

  const sanctionIds = formData
    .getAll('sanction_ids')
    .filter((value): value is string => typeof value === 'string')
    .map((value) => Number.parseInt(value, 10))
    .filter((value) => Number.isFinite(value));

  const baseDescription = getString(formData, 'description');
  const recurrenceNote = getString(formData, 'recurrence_note');
  const description = recurrenceNote
    ? `${baseDescription ? `${baseDescription}\n\n` : ''}Recurrence: ${recurrenceNote}`
    : baseDescription;

  const venueMode = getString(formData, 'venue_mode');
  let venueId = getString(formData, 'venue_id');

  if (venueMode === 'NEW') {
    const venueResult = await createVenue({
      name: getString(formData, 'venue_name'),
      address_street: getString(formData, 'venue_address_street'),
      address_city: getString(formData, 'venue_address_city'),
      address_state: getString(formData, 'venue_address_state'),
      address_zip: getString(formData, 'venue_address_zip'),
      address_country: getString(formData, 'venue_address_country'),
      website_url: getString(formData, 'venue_website_url') || null,
    });

    if (venueResult.error || !venueResult.data) {
      redirect(
        `/dashboard/events?error=${encodeURIComponent(venueResult.error ?? 'Failed to add venue')}`,
      );
    }

    venueId = venueResult.data.id;
  } else if (!venueId) {
    redirect('/dashboard/events?error=Select a venue or add a new one.');
  }

  const commonInput = {
    title: getString(formData, 'title'),
    description: description || null,
    venue_id: venueId,
    flyer_image_url: getString(formData, 'flyer_image_url') || null,
    official_website_url: getString(formData, 'official_website_url') || null,
    classes_details: getString(formData, 'classes_details') || null,
  };

  for (const occurrence of occurrences) {
    const result = await createEvent({
      ...commonInput,
      start_datetime: toIsoString(occurrence),
    });

    if (result.error || !result.data) {
      redirect(
        `/dashboard/events?error=${encodeURIComponent(result.error ?? 'Failed to add event')}`,
      );
    }

    if (disciplineIds.length > 0) {
      const disciplineResult = await addEventDisciplines(result.data.id, disciplineIds);

      if (disciplineResult.error) {
        redirect(
          `/dashboard/events?error=${encodeURIComponent(disciplineResult.error ?? 'Failed to add disciplines')}`,
        );
      }
    }

    if (sanctionIds.length > 0) {
      const sanctionResult = await addEventSanctions(result.data.id, sanctionIds);

      if (sanctionResult.error) {
        redirect(
          `/dashboard/events?error=${encodeURIComponent(sanctionResult.error ?? 'Failed to add sanctions')}`,
        );
      }
    }
  }

  redirect('/dashboard/events?success=Events submitted for approval.');
};
