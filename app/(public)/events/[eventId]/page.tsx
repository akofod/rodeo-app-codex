import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import DetailMedia from '@/components/details/DetailMedia';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { getApprovedEvents } from '@/lib/supabase/events';
import { getApprovedVenues } from '@/lib/supabase/venues';

type EventDetailPageProps = {
  params: {
    eventId: string;
  };
};

export const dynamic = 'force-dynamic';

export const metadata: Metadata = buildPageMetadata({
  title: 'Event details',
  description: 'View event details.',
  path: '/events',
});

const formatDateRange = (start: string, end: string, timezone: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return `${start} - ${end}`;
  }
  const sameDay = startDate.toDateString() === endDate.toDateString();
  const startDisplay = startDate.toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: timezone,
  });
  const endDisplay = endDate.toLocaleString('en-US', {
    dateStyle: sameDay ? undefined : 'full',
    timeStyle: 'short',
    timeZone: timezone,
  });

  return `${startDisplay} - ${endDisplay}`;
};

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const [eventsResult, venuesResult] = await Promise.all([
    getApprovedEvents(),
    getApprovedVenues(),
  ]);
  const events = eventsResult.data ?? [];
  const venues = venuesResult.data ?? [];
  const event = events.find((item) => item.id === params.eventId);

  if (!event) {
    notFound();
  }

  const venue = venues.find((item) => item.id === event.venue_id);
  const eventTimezone = event.timezone ?? 'UTC';
  const eventEnd = event.end_datetime ?? event.start_datetime;

  return (
    <section className="px-6 py-12 sm:py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/events"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-100 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/60"
          >
            Back to events
          </Link>
        </div>
        <article className="grid gap-6 rounded-3xl border border-white/10 bg-night-800/80 p-6 shadow-glow md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-brand-300">Event details</p>
            <h1 className="font-display text-3xl text-slate-100">{event.title}</h1>
            <p className="text-sm text-slate-300">
              {formatDateRange(event.start_datetime, eventEnd, eventTimezone)}
            </p>
            <p className="text-sm text-slate-300">Timezone: {eventTimezone}</p>
            <p className="text-sm text-slate-300">
              {venue
                ? `${venue.name} - ${venue.address_city}, ${venue.address_state}`
                : 'Venue to be announced'}
            </p>
            {event.description ? (
              <p className="text-sm text-slate-200">{event.description}</p>
            ) : null}
            {event.classes_details ? (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-200">
                  Classes and divisions
                </h2>
                <p className="mt-2 text-sm text-slate-300">{event.classes_details}</p>
              </div>
            ) : null}
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-night-900/70">
            <DetailMedia
              imageUrl={event.flyer_image_url}
              alt={`${event.title} flyer`}
              emptyLabel="No event image provided"
            />
          </div>
        </article>
      </div>
    </section>
  );
}
