import type { Metadata } from 'next';
import Link from 'next/link';

import { buildEventItemListSchema } from '@/lib/seo/events';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { getOptionalUser } from '@/lib/supabase/guards';
import { getOptionalUserFavorites } from '@/lib/supabase/favorites';
import { getApprovedEvents } from '@/lib/supabase/events';
import { getApprovedVenues } from '@/lib/supabase/venues';
import { geocodeAddress } from '@/lib/mapbox/geocode';

import { toggleEventFavoriteAction } from './actions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = buildPageMetadata({
  title: 'Events',
  description: 'Browse approved rodeos, jackpots, and clinics across the western circuit.',
  path: '/events',
});

type EventsPublicPageProps = {
  searchParams?: {
    error?: string;
    location?: string | string[];
    radius?: string | string[];
    q?: string | string[];
    sort?: string | string[];
  };
};

const getSearchParamValue = (value?: string | string[]) => {
  if (!value) {
    return '';
  }
  return Array.isArray(value) ? (value[0] ?? '') : value;
};

const normalizeLocation = (value: string) => value.replace(/\s+/g, ' ').trim();
const normalizeSearch = (value: string) => value.trim().toLowerCase();

const allowedRadii = [10, 25, 50, 100, 250];

const parseRadius = (value: string) => {
  if (!value) {
    return { radius: 50, isValid: true };
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || !allowedRadii.includes(parsed)) {
    return { radius: 50, isValid: false };
  }
  return { radius: parsed, isValid: true };
};

const toRadians = (value: number) => (value * Math.PI) / 180;

const getDistanceMiles = (
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number },
) => {
  const earthRadiusMiles = 3958.8;
  const deltaLat = toRadians(destination.latitude - origin.latitude);
  const deltaLon = toRadians(destination.longitude - origin.longitude);
  const originLat = toRadians(origin.latitude);
  const destinationLat = toRadians(destination.latitude);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(originLat) * Math.cos(destinationLat) * Math.sin(deltaLon / 2) ** 2;

  return 2 * earthRadiusMiles * Math.asin(Math.sqrt(a));
};

const formatDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const formatEventWindow = (start: string, end: string, timezone: string) => {
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

  return `${startDisplay} - ${endDisplay}`;
};

export default async function EventsPublicPage({ searchParams }: EventsPublicPageProps) {
  const { user } = await getOptionalUser();
  const [eventsResult, venuesResult] = await Promise.all([
    getApprovedEvents(),
    getApprovedVenues(),
  ]);
  const events = eventsResult.data ?? [];
  const venues = venuesResult.data ?? [];
  const venueNameById = new Map(venues.map((venue) => [venue.id, venue.name]));
  const locationParam = normalizeLocation(getSearchParamValue(searchParams?.location));
  const query = normalizeLocation(getSearchParamValue(searchParams?.q));
  const sort = getSearchParamValue(searchParams?.sort) || 'soonest';
  const radiusParam = getSearchParamValue(searchParams?.radius);
  const radiusSelection = parseRadius(radiusParam);
  const radius = radiusSelection.radius;
  const locationValidationError =
    locationParam && locationParam.length < 3
      ? 'Enter at least 3 characters for a location search.'
      : null;
  const radiusValidationError = radiusSelection.isValid
    ? null
    : 'Select a valid radius option to continue.';
  let geocodedLocation: Awaited<ReturnType<typeof geocodeAddress>> = null;

  if (locationParam && !locationValidationError) {
    try {
      geocodedLocation = await geocodeAddress(locationParam);
    } catch {
      geocodedLocation = null;
    }
  }

  const locationLookupError =
    locationParam && !locationValidationError && !geocodedLocation
      ? 'We could not find that location. Try a nearby city, state, or zip code.'
      : null;
  const resolvedLocationName = geocodedLocation?.placeName ?? locationParam;
  const activeFilterLabel =
    resolvedLocationName && geocodedLocation
      ? `Within ${radius} miles of ${resolvedLocationName}`
      : '';

  const venuesById = new Map(venues.map((venue) => [venue.id, venue]));
  const locationFilteredEvents =
    locationParam && geocodedLocation
      ? events.filter((event) => {
          const venue = venuesById.get(event.venue_id);
          if (!venue || venue.latitude === null || venue.longitude === null) {
            return false;
          }

          const distance = getDistanceMiles(geocodedLocation, {
            latitude: venue.latitude,
            longitude: venue.longitude,
          });

          return distance <= radius;
        })
      : events;
  const queryFilteredEvents = query
    ? locationFilteredEvents.filter((event) => {
        const venue = venuesById.get(event.venue_id);
        const haystack = normalizeSearch(
          `${event.title} ${event.description ?? ''} ${venue?.name ?? ''} ${venue?.address_city ?? ''} ${venue?.address_state ?? ''}`,
        );
        return haystack.includes(query.toLowerCase());
      })
    : locationFilteredEvents;
  const filteredEvents =
    sort === 'newest'
      ? [...queryFilteredEvents].sort(
          (left, right) =>
            new Date(right.start_datetime).getTime() - new Date(left.start_datetime).getTime(),
        )
      : [...queryFilteredEvents].sort(
          (left, right) =>
            new Date(left.start_datetime).getTime() - new Date(right.start_datetime).getTime(),
        );
  const eventIds = filteredEvents.map((event) => event.id);
  const eventSchema = buildEventItemListSchema(filteredEvents, venues);
  const favoritesResult =
    user && eventIds.length > 0
      ? await getOptionalUserFavorites('EVENT', eventIds)
      : { data: [], error: null };
  const favoriteIds = new Set((favoritesResult.data ?? []).map((favorite) => favorite.entity_id));
  const filterError = locationValidationError || radiusValidationError || locationLookupError;
  const errorMessage = searchParams?.error
    ? decodeURIComponent(searchParams.error)
    : filterError || eventsResult.error || venuesResult.error || favoritesResult.error;
  const emptyStateMessage =
    locationParam && geocodedLocation
      ? `No events found within ${radius} miles of ${resolvedLocationName}. Try expanding the radius or a nearby location.`
      : 'No approved events yet. Be the first to submit one for review.';

  return (
    <>
      {eventSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
        />
      ) : null}
      <section className="px-6 py-10 sm:py-14 lg:py-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-10">
          <header className="flex flex-col gap-4">
            <p className="text-xs uppercase tracking-[0.3em] text-brand-300">Events</p>
            <h1 className="font-display text-3xl text-slate-100 sm:text-4xl">
              Approved events across the western circuit
            </h1>
            <p className="text-sm text-slate-300">
              Browse upcoming rodeos, jackpots, and clinics. Submit your own listings once you are
              signed in.
            </p>
            {activeFilterLabel ? (
              <div className="rounded-2xl border border-brand-400/30 bg-brand-400/10 px-4 py-3 text-sm text-brand-100">
                <p className="text-xs uppercase tracking-[0.3em] text-brand-200">Active filter</p>
                <p className="mt-1 text-sm text-brand-100">{activeFilterLabel}</p>
              </div>
            ) : null}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/events"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-100 transition hover:bg-white/10"
              >
                Browse all events
              </Link>
              <Link
                href="/map"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-100 transition hover:bg-white/10"
              >
                View map
              </Link>
            </div>
          </header>

          {errorMessage ? (
            <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-5 py-4 text-sm text-red-100">
              {errorMessage}
            </div>
          ) : null}

          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-3xl border border-white/10 bg-night-800/80 p-6 shadow-glow">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-display text-2xl text-slate-100">Upcoming events</h2>
                <span className="text-xs uppercase tracking-[0.3em] text-brand-300">
                  {filteredEvents.length} listed
                </span>
              </div>
              <form className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-night-900/60 p-4 sm:grid-cols-[1fr_auto_auto]">
                <input
                  type="text"
                  name="q"
                  defaultValue={query}
                  placeholder="Search title, venue, or city"
                  className="rounded-xl border border-white/10 bg-night-900/70 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-400"
                />
                <select
                  name="sort"
                  defaultValue={sort}
                  className="rounded-xl border border-white/10 bg-night-900/70 px-4 py-2 text-sm text-slate-100"
                >
                  <option value="soonest">Soonest first</option>
                  <option value="newest">Latest first</option>
                </select>
                <button
                  type="submit"
                  className="rounded-full border border-brand-400/50 bg-brand-400/20 px-4 py-2 text-xs uppercase tracking-[0.2em] text-brand-100 transition hover:border-brand-300 hover:bg-brand-400/30"
                >
                  Apply
                </button>
              </form>
              <div className="mt-5 grid gap-5">
                {!user && filteredEvents.length > 0 ? (
                  <div className="rounded-2xl border border-brand-400/30 bg-brand-400/10 px-4 py-3 text-sm text-brand-100">
                    Want to save listings?{' '}
                    <Link
                      href="/sign-in"
                      className="underline underline-offset-4 hover:text-brand-50"
                    >
                      Sign in to favorite events
                    </Link>
                    .
                  </div>
                ) : null}
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((event) => {
                    const isFavorited = favoriteIds.has(event.id);
                    const venueName = venueNameById.get(event.venue_id) ?? 'Venue to be announced';
                    const eventTimezone = event.timezone ?? 'UTC';
                    const eventEnd = event.end_datetime ?? event.start_datetime;
                    return (
                      <article
                        key={event.id}
                        className="flex h-full flex-col rounded-2xl border border-white/10 bg-night-900/70 p-4"
                      >
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-xs uppercase tracking-[0.3em] text-brand-200">
                                {formatDate(event.start_datetime)}
                              </p>
                              <Link
                                href={`/events/${event.id}`}
                                className="mt-2 block text-lg font-semibold text-slate-100 underline-offset-4 transition hover:text-brand-100 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/60"
                              >
                                {event.title}
                              </Link>
                            </div>
                          </div>
                          <dl className="grid gap-2 text-xs text-slate-300 sm:grid-cols-2">
                            <div>
                              <dt className="uppercase tracking-[0.2em] text-slate-400">When</dt>
                              <dd className="mt-1">
                                {formatEventWindow(event.start_datetime, eventEnd, eventTimezone)}
                              </dd>
                            </div>
                            <div>
                              <dt className="uppercase tracking-[0.2em] text-slate-400">Venue</dt>
                              <dd className="mt-1">{venueName}</dd>
                            </div>
                            <div>
                              <dt className="uppercase tracking-[0.2em] text-slate-400">
                                Timezone
                              </dt>
                              <dd className="mt-1">{eventTimezone}</dd>
                            </div>
                          </dl>
                          {event.description ? (
                            <p className="text-sm text-slate-300">{event.description}</p>
                          ) : null}
                        </div>
                        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
                          <Link
                            href={`/events/${event.id}`}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-100 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/60"
                          >
                            View details
                          </Link>
                          <div>
                            {user ? (
                              <form action={toggleEventFavoriteAction}>
                                <input type="hidden" name="entity_id" value={event.id} />
                                <input
                                  type="hidden"
                                  name="is_favorited"
                                  value={isFavorited ? 'true' : 'false'}
                                />
                                <button
                                  type="submit"
                                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-100 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/60 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {isFavorited ? 'Favorited' : 'Add to favorites'}
                                </button>
                              </form>
                            ) : null}
                          </div>
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-300">{emptyStateMessage}</p>
                )}
              </div>
            </div>

            <aside className="rounded-3xl border border-white/10 bg-night-900/70 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-brand-300">Get involved</p>
              <h2 className="mt-3 font-display text-2xl text-slate-100">Share your event</h2>
              <p className="mt-2 text-sm text-slate-300">
                Producers and venues can submit events for approval. Approved events appear in the
                public directory and map.
              </p>
              <ul className="mt-4 space-y-1 text-sm text-slate-200">
                <li>- Reach fans searching by map and city.</li>
                <li>- Keep listings synced with approved venues.</li>
              </ul>
              {user ? (
                <Link
                  href="/dashboard/events"
                  className="mt-5 inline-flex rounded-full border border-brand-400/50 bg-brand-400/20 px-5 py-2 text-xs uppercase tracking-[0.2em] text-brand-100 transition hover:border-brand-300 hover:bg-brand-400/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/60"
                >
                  Submit an event
                </Link>
              ) : (
                <Link
                  href="/sign-in"
                  className="mt-5 inline-flex rounded-full border border-brand-400/50 bg-brand-400/20 px-5 py-2 text-xs uppercase tracking-[0.2em] text-brand-100 transition hover:border-brand-300 hover:bg-brand-400/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/60"
                >
                  Sign in to submit
                </Link>
              )}
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
