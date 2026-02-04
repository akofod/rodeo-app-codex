import type { Metadata } from 'next';
import Link from 'next/link';

import MapDirectory from '@/components/maps/MapDirectory';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { getApprovedEvents } from '@/lib/supabase/events';
import { getOptionalUserFavorites } from '@/lib/supabase/favorites';
import { getOptionalUser } from '@/lib/supabase/guards';
import { getApprovedVenues } from '@/lib/supabase/venues';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = buildPageMetadata({
  title: 'Map',
  description: 'Explore approved events and venues across the western circuit on the live map.',
  path: '/map',
});

const formatDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString('en-US', { dateStyle: 'medium' });
};

export default async function MapPage() {
  const { user } = await getOptionalUser();
  const [eventsResult, venuesResult] = await Promise.all([
    getApprovedEvents(),
    getApprovedVenues(),
  ]);

  const venues = venuesResult.data ?? [];
  const events = eventsResult.data ?? [];
  const venueById = new Map(venues.map((venue) => [venue.id, venue]));
  const eventCountByVenue = events.reduce((acc, event) => {
    acc.set(event.venue_id, (acc.get(event.venue_id) ?? 0) + 1);
    return acc;
  }, new Map<string, number>());

  const venueMarkers = venues
    .filter((venue) => venue.latitude !== null && venue.longitude !== null)
    .map((venue) => {
      const eventCount = eventCountByVenue.get(venue.id) ?? 0;
      const eventLabel = eventCount === 1 ? 'upcoming event' : 'upcoming events';
      return {
        id: `venue-${venue.id}`,
        type: 'VENUE' as const,
        entityId: venue.id,
        title: venue.name,
        subtitle: `${venue.address_city}, ${venue.address_state}${
          venue.address_country ? `, ${venue.address_country}` : ''
        }`,
        detail: `${eventCount} ${eventLabel}`,
        latitude: venue.latitude as number,
        longitude: venue.longitude as number,
      };
    });

  const eventMarkers = events
    .map((event) => {
      const venue = venueById.get(event.venue_id);
      if (!venue || venue.latitude === null || venue.longitude === null) {
        return null;
      }
      return {
        id: `event-${event.id}`,
        type: 'EVENT' as const,
        entityId: event.id,
        title: event.title,
        subtitle: `${formatDate(event.start_datetime)} - ${venue.name}`,
        latitude: venue.latitude,
        longitude: venue.longitude,
      };
    })
    .filter((marker): marker is NonNullable<typeof marker> => Boolean(marker));

  const markers = [...eventMarkers, ...venueMarkers];

  const venueIds = venues.map((venue) => venue.id);
  const favoritesResult =
    user && venueIds.length > 0
      ? await getOptionalUserFavorites('VENUE', venueIds)
      : { data: [], error: null };
  const favoriteVenueIds = (favoritesResult.data ?? []).map((favorite) => favorite.entity_id);

  const errorMessage = eventsResult.error || venuesResult.error || favoritesResult.error;

  return (
    <section className="px-6 py-12 sm:py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-[0.3em] text-brand-300">Map</p>
          <h1 className="font-display text-3xl text-slate-100 sm:text-4xl">
            Live map of events and venues
          </h1>
          <p className="text-sm text-slate-300">
            Use the map to explore approved venues and upcoming events across the western circuit.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/events"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-100 transition hover:bg-white/10"
            >
              Browse events
            </Link>
            <Link
              href="/venues"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-100 transition hover:bg-white/10"
            >
              Browse venues
            </Link>
          </div>
        </header>

        {errorMessage ? (
          <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-5 py-4 text-sm text-red-100">
            {errorMessage}
          </div>
        ) : null}

        <MapDirectory
          markers={markers}
          favoriteVenueIds={favoriteVenueIds}
          isSignedIn={Boolean(user)}
          userId={user?.id}
        />
      </div>
    </section>
  );
}
