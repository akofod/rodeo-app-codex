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
  };
};

const getSearchParamValue = (value?: string | string[]) => {
  if (!value) {
    return '';
  }
  return Array.isArray(value) ? value[0] ?? '' : value;
};

const normalizeLocation = (value: string) => value.replace(/\s+/g, ' ').trim();

const parseRadius = (value: string) => {
  const parsed = Number.parseInt(value, 10);
  const allowedRadii = new Set([10, 25, 50, 100, 250]);
  if (!Number.isFinite(parsed) || !allowedRadii.has(parsed)) {
    return 50;
  }
  return parsed;
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
  const radiusParam = getSearchParamValue(searchParams?.radius);
  const radius = parseRadius(radiusParam);
  let geocodedLocation: Awaited<ReturnType<typeof geocodeAddress>> = null;

  if (locationParam) {
    try {
      geocodedLocation = await geocodeAddress(locationParam);
    } catch {
      geocodedLocation = null;
    }
  }

  const resolvedLocationName = geocodedLocation?.placeName ?? locationParam;
  const activeFilterLabel = resolvedLocationName
    ? `Within ${radius} miles of ${resolvedLocationName}`
    : '';

  const venuesById = new Map(venues.map((venue) => [venue.id, venue]));
  const filteredEvents =
    locationParam && geocodedLocation
      ? events.filter((event) => {
          const venue = venuesById.get(event.venue_id);
          if (venue?.latitude === null || venue?.longitude === null) {
            return false;
          }

          const distance = getDistanceMiles(geocodedLocation, {
            latitude: venue.latitude,
            longitude: venue.longitude,
          });

          return distance <= radius;
        })
      : events;
  const eventIds = filteredEvents.map((event) => event.id);
  const eventSchema = buildEventItemListSchema(filteredEvents, venues);
  const favoritesResult =
    user && eventIds.length > 0
      ? await getOptionalUserFavorites('EVENT', eventIds)
      : { data: [], error: null };
  const favoriteIds = new Set((favoritesResult.data ?? []).map((favorite) => favorite.entity_id));
  const errorMessage = searchParams?.error
    ? decodeURIComponent(searchParams.error)
    : eventsResult.error || venuesResult.error || favoritesResult.error;

  return (
    <>
      {eventSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
        />
      ) : null}
      <section className="px-6 py-12 sm:py-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-8">
          <header className="flex flex-col gap-3">
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
                href="/venues"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-100 transition hover:bg-white/10"
              >
                Browse venues
              </Link>
              <Link
                href="/map"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-100 transition hover:bg-white/10"
              >
                Map view
              </Link>
            </div>
          </header>

          {errorMessage ? (
            <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-5 py-4 text-sm text-red-100">
              {errorMessage}
            </div>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-3xl border border-white/10 bg-night-800/80 p-6 shadow-glow">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-display text-2xl text-slate-100">Upcoming events</h2>
                <span className="text-xs uppercase tracking-[0.3em] text-brand-300">
                  {filteredEvents.length} listed
                </span>
              </div>
              <div className="mt-4 grid gap-4">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((event) => {
                    const isFavorited = favoriteIds.has(event.id);
                    return (
                      <article
                        key={event.id}
                        className="rounded-2xl border border-white/10 bg-night-900/70 p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-brand-200">
                              {formatDate(event.start_datetime)}
                            </p>
                            <h3 className="mt-2 text-lg font-semibold text-slate-100">
                              {event.title}
                            </h3>
                            <p className="mt-1 text-sm text-slate-400">
                              {venueNameById.get(event.venue_id) ?? 'Venue to be announced'}
                            </p>
                          </div>
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
                                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-100 transition hover:bg-white/10"
                              >
                                {isFavorited ? 'Favorited' : 'Add to favorites'}
                              </button>
                            </form>
                          ) : (
                            <Link
                              href="/sign-in"
                              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-100 transition hover:bg-white/10"
                            >
                              Sign in to favorite
                            </Link>
                          )}
                        </div>
                        {event.description ? (
                          <p className="mt-3 text-sm text-slate-300">{event.description}</p>
                        ) : null}
                      </article>
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-400">
                    No approved events yet. Be the first to submit one for review.
                  </p>
                )}
              </div>
            </div>

            <aside className="rounded-3xl border border-white/10 bg-night-900/70 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-brand-300">Get involved</p>
              <h2 className="mt-4 font-display text-2xl text-slate-100">Share your event</h2>
              <p className="mt-3 text-sm text-slate-300">
                Producers and venues can submit events for approval. Approved events appear in the
                public directory and map.
              </p>
              {user ? (
                <Link
                  href="/dashboard/events"
                  className="mt-6 inline-flex rounded-full border border-brand-400/50 bg-brand-400/20 px-5 py-2 text-xs uppercase tracking-[0.2em] text-brand-100 transition hover:border-brand-300 hover:bg-brand-400/30"
                >
                  Submit an event
                </Link>
              ) : (
                <Link
                  href="/sign-in"
                  className="mt-6 inline-flex rounded-full border border-brand-400/50 bg-brand-400/20 px-5 py-2 text-xs uppercase tracking-[0.2em] text-brand-100 transition hover:border-brand-300 hover:bg-brand-400/30"
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
