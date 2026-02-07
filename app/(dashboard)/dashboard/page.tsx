import Link from 'next/link';
import { redirect } from 'next/navigation';

import { signOut } from '@/app/(auth)/actions';
import { getServiceCategoryLabel } from '@/lib/services/categories';
import { getUserFavorites } from '@/lib/supabase/favorites';
import { getProfileByUserId } from '@/lib/supabase/profiles';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Event, Service, Venue } from '@/types/database';

type FavoriteEvent = Pick<
  Event,
  'id' | 'title' | 'start_datetime' | 'venue_id' | 'official_website_url' | 'flyer_image_url'
>;

type FavoriteService = Pick<
  Service,
  'id' | 'name' | 'category' | 'website_url' | 'zip_code' | 'service_radius_miles'
>;

type FavoriteVenue = Pick<
  Venue,
  'id' | 'name' | 'address_city' | 'address_state' | 'address_country' | 'website_url'
>;

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  const [{ data: profile }, favoritesResult] = await Promise.all([
    getProfileByUserId(user.id),
    getUserFavorites(user.id),
  ]);

  const isAdmin = profile?.role === 'ADMIN';
  const favorites = favoritesResult.data ?? [];
  const favoriteEventIds = favorites
    .filter((favorite) => favorite.entity_type === 'EVENT')
    .map((favorite) => favorite.entity_id);
  const favoriteServiceIds = favorites
    .filter((favorite) => favorite.entity_type === 'SERVICE')
    .map((favorite) => favorite.entity_id);
  const favoriteVenueIds = favorites
    .filter((favorite) => favorite.entity_type === 'VENUE')
    .map((favorite) => favorite.entity_id);

  let favoriteEvents: FavoriteEvent[] = [];
  let favoriteServices: FavoriteService[] = [];
  let favoriteVenues: FavoriteVenue[] = [];
  let venueById = new Map<string, FavoriteVenue>();
  let favoritesError = favoritesResult.error ?? null;
  const eventVenueIds = new Set<string>();

  if (favoriteEventIds.length > 0) {
    const { data, error } = await supabase
      .from('events')
      .select('id, title, start_datetime, venue_id, official_website_url, flyer_image_url')
      .in('id', favoriteEventIds)
      .eq('status', 'APPROVED')
      .order('start_datetime', { ascending: true });
    favoriteEvents = data ?? [];
    favoritesError = favoritesError ?? error?.message ?? null;

    favoriteEvents.forEach((event) => {
      eventVenueIds.add(event.venue_id);
    });
  }

  if (favoriteServiceIds.length > 0) {
    const { data, error } = await supabase
      .from('services')
      .select('id, name, category, website_url, zip_code, service_radius_miles')
      .in('id', favoriteServiceIds)
      .eq('status', 'APPROVED')
      .order('name', { ascending: true });
    favoriteServices = data ?? [];
    favoritesError = favoritesError ?? error?.message ?? null;
  }

  const combinedVenueIds = new Set<string>();
  eventVenueIds.forEach((venueId) => combinedVenueIds.add(venueId));
  favoriteVenueIds.forEach((venueId) => combinedVenueIds.add(venueId));
  if (combinedVenueIds.size > 0) {
    const { data: venuesData, error: venuesError } = await supabase
      .from('venues')
      .select('id, name, address_city, address_state, address_country, website_url')
      .in('id', Array.from(combinedVenueIds))
      .eq('status', 'APPROVED');
    const venues = venuesData ?? [];
    venueById = new Map(venues.map((venue) => [venue.id, venue]));
    favoriteVenues = favoriteVenueIds
      .map((venueId) => venueById.get(venueId))
      .filter((venue): venue is Venue => Boolean(venue));
    favoritesError = favoritesError ?? venuesError?.message ?? null;
  }
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

  return (
    <section className="px-6 py-16 sm:py-20">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="rounded-3xl border border-white/10 bg-night-800/80 p-6 shadow-glow">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-brand-300">Dashboard</p>
              <h1 className="mt-4 font-display text-3xl text-slate-100 sm:text-4xl">
                Welcome back, {profile?.full_name || user.email}
              </h1>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-100 transition hover:bg-white/10"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-night-900/70 p-5">
            <h2 className="font-display text-xl text-slate-100">Your submissions</h2>
            <p className="mt-2 text-sm text-slate-300">
              Jump into your venues and events to track approvals.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/dashboard/venues"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-100 transition hover:bg-white/10"
              >
                Manage venues
              </Link>
              <Link
                href="/dashboard/events"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-100 transition hover:bg-white/10"
              >
                Manage events
              </Link>
              <Link
                href="/dashboard/services"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-100 transition hover:bg-white/10"
              >
                Manage services
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-night-900/70 p-5">
            <h2 className="font-display text-xl text-slate-100">Explore the hub</h2>
            <p className="mt-2 text-sm text-slate-300">
              Jump back to the public directory or submit a new event.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/"
                className="text-sm uppercase tracking-[0.2em] text-brand-200 hover:text-brand-100"
              >
                Back to homepage
              </Link>
              {isAdmin ? (
                <Link
                  href="/admin"
                  className="text-sm uppercase tracking-[0.2em] text-brand-200 hover:text-brand-100"
                >
                  Admin approvals
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-night-900/70 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-brand-300">Favorites</p>
              <h2 className="mt-3 font-display text-2xl text-slate-100">Saved for later</h2>
              <p className="mt-2 text-sm text-slate-300">
                Keep an eye on the events, venues, and services you have bookmarked.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-brand-200">
              <Link href="/events" className="hover:text-brand-100">
                Browse events
              </Link>
              <Link href="/venues" className="hover:text-brand-100">
                Browse venues
              </Link>
              <Link href="/services" className="hover:text-brand-100">
                Browse services
              </Link>
            </div>
          </div>

          {favoritesError ? (
            <div className="mt-4 rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {favoritesError}
            </div>
          ) : null}

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-night-800/70 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-100">Favorite events</h3>
                <span className="text-xs uppercase tracking-[0.2em] text-brand-300">
                  {favoriteEvents.length} saved
                </span>
              </div>
              <div className="mt-4 grid gap-3">
                {favoriteEvents.length > 0 ? (
                  favoriteEvents.map((event) => {
                    const venue = venueById.get(event.venue_id);
                    return (
                      <div
                        key={event.id}
                        className="rounded-2xl border border-white/10 bg-night-900/70 p-4"
                      >
                        <p className="text-sm font-semibold text-slate-100">{event.title}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          {formatDate(event.start_datetime)}
                        </p>
                        {venue ? (
                          <p className="mt-1 text-xs text-slate-500">
                            {venue.name} - {venue.address_city}, {venue.address_state}
                            {venue.address_country ? `, ${venue.address_country}` : ''}
                          </p>
                        ) : null}
                        {event.official_website_url ? (
                          <a
                            href={event.official_website_url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex text-xs uppercase tracking-[0.2em] text-brand-200 hover:text-brand-100"
                          >
                            Event website
                          </a>
                        ) : null}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-400">
                    No favorite events yet. Tap the heart on an event to save it.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-night-800/70 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-100">Favorite venues</h3>
                <span className="text-xs uppercase tracking-[0.2em] text-brand-300">
                  {favoriteVenues.length} saved
                </span>
              </div>
              <div className="mt-4 grid gap-3">
                {favoriteVenues.length > 0 ? (
                  favoriteVenues.map((venue) => (
                    <div
                      key={venue.id}
                      className="rounded-2xl border border-white/10 bg-night-900/70 p-4"
                    >
                      <p className="text-sm font-semibold text-slate-100">{venue.name}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {venue.address_city}, {venue.address_state}
                        {venue.address_country ? `, ${venue.address_country}` : ''}
                      </p>
                      {venue.website_url ? (
                        <a
                          href={venue.website_url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex text-xs uppercase tracking-[0.2em] text-brand-200 hover:text-brand-100"
                        >
                          Venue website
                        </a>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">
                    No favorite venues yet. Save arenas and grounds for quick access.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-night-800/70 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-100">Favorite services</h3>
                <span className="text-xs uppercase tracking-[0.2em] text-brand-300">
                  {favoriteServices.length} saved
                </span>
              </div>
              <div className="mt-4 grid gap-3">
                {favoriteServices.length > 0 ? (
                  favoriteServices.map((service) => (
                    <div
                      key={service.id}
                      className="rounded-2xl border border-white/10 bg-night-900/70 p-4"
                    >
                      <p className="text-sm font-semibold text-slate-100">{service.name}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {getServiceCategoryLabel(service.category)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {service.zip_code} - {service.service_radius_miles} mi radius
                      </p>
                      {service.website_url ? (
                        <a
                          href={service.website_url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex text-xs uppercase tracking-[0.2em] text-brand-200 hover:text-brand-100"
                        >
                          Service website
                        </a>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">
                    No favorite services yet. Save providers you want to revisit later.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
