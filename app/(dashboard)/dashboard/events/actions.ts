'use server';

import { redirect } from 'next/navigation';

import { isValidEventTimezone } from '@/lib/events/timezones';
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

export const createEventAction = async (formData: FormData) => {
  const title = getString(formData, 'title');
  if (!title) {
    redirect('/dashboard/events?error=Event title is required.');
  }

  const occurrenceStarts = formData
    .getAll('occurrence_start')
    .filter((value): value is string => typeof value === 'string')
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .filter((value) => !Number.isNaN(new Date(value).getTime()));
  const occurrenceEnds = formData
    .getAll('occurrence_end')
    .filter((value): value is string => typeof value === 'string')
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .filter((value) => !Number.isNaN(new Date(value).getTime()));
  const timezone = getString(formData, 'timezone');

  const hasDuplicateOccurrences =
    new Set(occurrenceStarts.map((start, index) => `${start}::${occurrenceEnds[index] ?? ''}`))
      .size !== occurrenceStarts.length;
  if (hasDuplicateOccurrences) {
    redirect('/dashboard/events?error=Duplicate schedule occurrences are not allowed.');
  }

  if (occurrenceStarts.length === 0 || occurrenceStarts.length !== occurrenceEnds.length) {
    redirect('/dashboard/events?error=Add at least one performance date and time.');
  }
  if (!isValidEventTimezone(timezone)) {
    redirect('/dashboard/events?error=Select a valid event timezone.');
  }
  const hasInvalidRange = occurrenceStarts.some(
    (start, index) => new Date(occurrenceEnds[index]).getTime() <= new Date(start).getTime(),
  );
  if (hasInvalidRange) {
    redirect('/dashboard/events?error=Each performance must end after it starts.');
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
  const manualDisciplines = getString(formData, 'manual_disciplines');
  const manualSanctions = getString(formData, 'manual_sanctions');
  const detailNotes = [
    recurrenceNote ? `Recurrence: ${recurrenceNote}` : '',
    manualDisciplines ? `Disciplines: ${manualDisciplines}` : '',
    manualSanctions ? `Sanctioning organizations: ${manualSanctions}` : '',
  ]
    .filter(Boolean)
    .join('\n');
  const description = detailNotes
    ? `${baseDescription ? `${baseDescription}\n\n` : ''}${detailNotes}`
    : baseDescription;

  const venueMode = getString(formData, 'venue_mode');
  let venueId = getString(formData, 'venue_id');
  const flyerImageUrl = getString(formData, 'flyer_image_url');
  const officialWebsiteUrl = getString(formData, 'official_website_url');

  if (!isValidUrl(flyerImageUrl) || !isValidUrl(officialWebsiteUrl)) {
    redirect('/dashboard/events?error=Enter valid URLs for flyer and website fields.');
  }

  if (venueMode === 'NEW') {
    const venueName = getString(formData, 'venue_name');
    const venueZip = getString(formData, 'venue_address_zip');
    if (!venueName) {
      redirect('/dashboard/events?error=New venue name is required.');
    }
    if (!venueZip || !/^[A-Za-z0-9\\-\\s]{3,12}$/.test(venueZip)) {
      redirect('/dashboard/events?error=Enter a valid ZIP or postal code for the new venue.');
    }

    const venueResult = await createVenue({
      name: venueName,
      address_street: getString(formData, 'venue_address_street'),
      address_city: getString(formData, 'venue_address_city'),
      address_state: getString(formData, 'venue_address_state'),
      address_zip: venueZip,
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
    title,
    description: description || null,
    venue_id: venueId,
    flyer_image_url: flyerImageUrl || null,
    official_website_url: officialWebsiteUrl || null,
    classes_details: getString(formData, 'classes_details') || null,
  };

  const scheduleEntries = occurrenceStarts.map((start, index) => ({
    start_datetime: toIsoString(start),
    end_datetime: toIsoString(occurrenceEnds[index]),
  }));
  if (scheduleEntries.some((schedule) => !schedule.start_datetime || !schedule.end_datetime)) {
    redirect('/dashboard/events?error=Invalid performance schedule detected.');
  }

  for (const schedule of scheduleEntries) {
    const result = await createEvent({
      ...commonInput,
      start_datetime: schedule.start_datetime,
      end_datetime: schedule.end_datetime,
      timezone,
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
