import type { Metadata } from 'next';
import Link from 'next/link';

import { buildPageMetadata } from '@/lib/seo/metadata';
import { getOptionalUserFavorites } from '@/lib/supabase/favorites';
import { getOptionalUser } from '@/lib/supabase/guards';
import { getApprovedVenues } from '@/lib/supabase/venues';

import { toggleVenueFavoriteAction } from './actions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = buildPageMetadata({
  title: 'Venues',
  description: 'Explore approved arenas, fairgrounds, and ranches hosting western sports.',
  path: '/venues',
});

type VenuesPublicPageProps = {
  searchParams?: {
    error?: string;
  };
};

export default async function VenuesPublicPage({ searchParams }: VenuesPublicPageProps) {
  const { user } = await getOptionalUser();
  const { data: venues, error } = await getApprovedVenues();
  const venueList = venues ?? [];
  const venueIds = venueList.map((venue) => venue.id);
  const favoritesResult =
    user && venueIds.length > 0
      ? await getOptionalUserFavorites('VENUE', venueIds)
      : { data: [], error: null };
  const favoriteIds = new Set((favoritesResult.data ?? []).map((favorite) => favorite.entity_id));
  const errorMessage = searchParams?.error
    ? decodeURIComponent(searchParams.error)
    : error || favoritesResult.error;

  return (
    <section className="px-6 py-12 sm:py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-[0.3em] text-brand-300">Venues</p>
          <h1 className="font-display text-3xl text-slate-100 sm:text-4xl">
            Approved venues across North America
          </h1>
          <p className="text-sm text-slate-300">
            Explore the arenas, fairgrounds, and ranches that host western sports events.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/events"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-100 transition hover:bg-white/10"
            >
              Browse events
            </Link>
            <Link
              href="/map"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-100 transition hover:bg-white/10"
            >
              Map view
            </Link>
            <Link
              href="/dashboard/venues"
              className="rounded-full border border-brand-400/50 bg-brand-400/20 px-4 py-2 text-xs uppercase tracking-[0.2em] text-brand-100 transition hover:border-brand-300 hover:bg-brand-400/30"
            >
              Submit a venue
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
              <h2 className="font-display text-2xl text-slate-100">Venue directory</h2>
              <span className="text-xs uppercase tracking-[0.3em] text-brand-300">
                {venueList.length} venues
              </span>
            </div>
            <div className="mt-4 grid gap-4">
              {venueList.length > 0 ? (
                venueList.map((venue) => {
                  const isFavorited = favoriteIds.has(venue.id);
                  const favoriteButtonStyles = isFavorited
                    ? 'border-brand-300/60 bg-brand-400/20 text-brand-100 hover:bg-brand-400/30'
                    : 'border-white/10 bg-white/5 text-slate-100 hover:bg-white/10';
                  const heartStyles = isFavorited
                    ? 'fill-brand-200 text-brand-200'
                    : 'fill-transparent text-slate-300';

                  return (
                    <article
                      key={venue.id}
                      className="rounded-2xl border border-white/10 bg-night-900/70 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-100">{venue.name}</h3>
                          <p className="mt-2 text-sm text-slate-400">
                            {venue.address_street}, {venue.address_city}, {venue.address_state}{' '}
                            {venue.address_zip}
                            {venue.address_country ? `, ${venue.address_country}` : ''}
                          </p>
                        </div>
                        {user ? (
                          <form action={toggleVenueFavoriteAction}>
                            <input type="hidden" name="entity_id" value={venue.id} />
                            <input
                              type="hidden"
                              name="is_favorited"
                              value={isFavorited ? 'true' : 'false'}
                            />
                            <button
                              type="submit"
                              aria-pressed={isFavorited}
                              aria-label={
                                isFavorited ? 'Remove from favorites' : 'Add to favorites'
                              }
                              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.2em] transition ${favoriteButtonStyles}`}
                            >
                              <svg
                                aria-hidden="true"
                                viewBox="0 0 24 24"
                                className={`h-4 w-4 ${heartStyles}`}
                              >
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                              </svg>
                              {isFavorited ? 'Favorited' : 'Favorite'}
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
                      {venue.website_url ? (
                        <a
                          href={venue.website_url}
                          rel="noreferrer"
                          target="_blank"
                          className="mt-3 inline-flex text-xs uppercase tracking-[0.2em] text-brand-200 hover:text-brand-100"
                        >
                          Visit website
                        </a>
                      ) : null}
                    </article>
                  );
                })
              ) : (
                <p className="text-sm text-slate-400">
                  No approved venues yet. Submit the first venue to help build the directory.
                </p>
              )}
            </div>
          </div>

          <aside className="rounded-3xl border border-white/10 bg-night-900/70 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-brand-300">Add a venue</p>
            <h2 className="mt-4 font-display text-2xl text-slate-100">Get listed</h2>
            <p className="mt-3 text-sm text-slate-300">
              Share a venue with the community. Approved venues unlock event submissions.
            </p>
            <Link
              href="/dashboard/venues"
              className="mt-6 inline-flex rounded-full border border-brand-400/50 bg-brand-400/20 px-5 py-2 text-xs uppercase tracking-[0.2em] text-brand-100 transition hover:border-brand-300 hover:bg-brand-400/30"
            >
              Sign in to submit
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
