import Link from 'next/link';

import { getDisciplines, getSanctioningBodies } from '@/lib/supabase/catalog';
import { getUserEvents } from '@/lib/supabase/events';
import { getUserVenues } from '@/lib/supabase/venues';

import EventForm from './EventForm';

export const dynamic = 'force-dynamic';

type EventsPageProps = {
  searchParams?: {
    error?: string;
    success?: string;
  };
};

const statusStyles: Record<string, string> = {
  APPROVED: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100',
  PENDING: 'border-amber-300/40 bg-amber-500/10 text-amber-100',
  REJECTED: 'border-red-400/40 bg-red-500/10 text-red-100',
  ARCHIVED: 'border-slate-400/30 bg-slate-500/10 text-slate-100',
};

const formatDateRange = (start: string, end: string, timezone: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return `${start} - ${end}`;
  }
  const sameDay = startDate.toDateString() === endDate.toDateString();
  const startDisplay = startDate.toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: timezone,
  });
  const endDisplay = endDate.toLocaleString('en-US', {
    dateStyle: sameDay ? undefined : 'medium',
    timeStyle: 'short',
    timeZone: timezone,
  });
  return `${startDisplay} - ${endDisplay} (${timezone})`;
};

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const [eventsResult, venuesResult, disciplinesResult, sanctioningResult] = await Promise.all([
    getUserEvents(),
    getUserVenues(),
    getDisciplines(),
    getSanctioningBodies(),
  ]);
  const events = eventsResult.data ?? [];
  const venues = venuesResult.data ?? [];
  const disciplines = disciplinesResult.data ?? [];
  const sanctioningBodies = sanctioningResult.data ?? [];
  const venueNameById = new Map(venues.map((venue) => [venue.id, venue.name]));
  const errorMessage = searchParams?.error
    ? decodeURIComponent(searchParams.error)
    : eventsResult.error ||
      venuesResult.error ||
      disciplinesResult.error ||
      sanctioningResult.error;
  const successMessage = searchParams?.success ? decodeURIComponent(searchParams.success) : null;

  return (
    <section className="px-6 py-12 sm:py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.3em] text-brand-300">Events</p>
          <h1 className="font-display text-3xl text-slate-100 sm:text-4xl">Manage your events</h1>
          <p className="text-sm text-slate-300">
            Create new events linked to approved venues and track their approval status.
          </p>
          <Link
            href="/dashboard"
            className="text-xs uppercase tracking-[0.2em] text-brand-200 hover:text-brand-100"
          >
            Back to dashboard
          </Link>
        </header>

        {errorMessage ? (
          <div
            role="alert"
            className="rounded-2xl border border-red-400/40 bg-red-500/10 px-5 py-4 text-sm text-red-100"
          >
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div
            role="status"
            className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-100"
          >
            <p>{successMessage}</p>
            <Link
              href="#your-events"
              className="mt-2 inline-flex text-xs uppercase tracking-[0.2em] text-emerald-100 underline underline-offset-4 transition hover:text-emerald-50"
            >
              Jump to submitted events
            </Link>
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-night-800/80 p-6 shadow-glow">
            <h2 className="font-display text-2xl text-slate-100">Add an event</h2>
            <p className="mt-2 text-sm text-slate-300">
              Events remain pending until both the event and its venue are approved.
            </p>
            <EventForm
              venues={venues}
              disciplines={disciplines}
              sanctioningBodies={sanctioningBodies}
            />
          </div>

          <div id="your-events" className="rounded-3xl border border-white/10 bg-night-900/70 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl text-slate-100">Your events</h2>
              <span className="text-xs uppercase tracking-[0.3em] text-brand-300">
                {events.length} total
              </span>
            </div>
            <div className="mt-4 grid gap-3">
              {events.length > 0 ? (
                events.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-2xl border border-white/10 bg-night-800/70 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-100">{event.title}</p>
                        <p className="text-xs text-slate-400">
                          {formatDateRange(
                            event.start_datetime,
                            event.end_datetime ?? event.start_datetime,
                            event.timezone ?? 'UTC',
                          )}{' '}
                          - {venueNameById.get(event.venue_id) ?? event.venue_id}
                        </p>
                      </div>
                      <span
                        className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.2em] ${
                          statusStyles[event.status] ?? statusStyles.PENDING
                        }`}
                      >
                        {event.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">
                  No events yet. Once venues are approved you can submit your first event.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
