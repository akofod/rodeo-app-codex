import type { Metadata } from 'next';
import Link from 'next/link';

import { buildPageMetadata } from '@/lib/seo/metadata';
import { getOptionalUser } from '@/lib/supabase/guards';
import { getOptionalUserFavorites } from '@/lib/supabase/favorites';
import { getApprovedServices } from '@/lib/supabase/services';

import { toggleServiceFavoriteAction } from './actions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = buildPageMetadata({
  title: 'Services',
  description: 'Find approved farriers, trainers, and western lifestyle providers.',
  path: '/services',
});

type ServicesPublicPageProps = {
  searchParams?: {
    error?: string;
  };
};

export default async function ServicesPublicPage({ searchParams }: ServicesPublicPageProps) {
  const { user } = await getOptionalUser();
  const servicesResult = await getApprovedServices();
  const services = servicesResult.data ?? [];
  const serviceIds = services.map((service) => service.id);

  const favoritesResult =
    user && serviceIds.length > 0
      ? await getOptionalUserFavorites('SERVICE', serviceIds)
      : { data: [], error: null };

  const favoriteIds = new Set((favoritesResult.data ?? []).map((favorite) => favorite.entity_id));
  const errorMessage =
    searchParams?.error
      ? decodeURIComponent(searchParams.error)
      : servicesResult.error || favoritesResult.error;

  return (
    <section className="px-6 py-12 sm:py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-3">
          <p className="text-xs uppercase tracking-[0.3em] text-brand-300">Services</p>
          <h1 className="font-display text-3xl text-slate-100 sm:text-4xl">
            Approved service providers
          </h1>
          <p className="text-sm text-slate-300">
            Find trusted farriers, trainers, and western lifestyle partners near your arena.
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
              href="/dashboard/services"
              className="rounded-full border border-brand-400/50 bg-brand-400/20 px-4 py-2 text-xs uppercase tracking-[0.2em] text-brand-100 transition hover:border-brand-300 hover:bg-brand-400/30"
            >
              Submit a service
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
              <h2 className="font-display text-2xl text-slate-100">Directory</h2>
              <span className="text-xs uppercase tracking-[0.3em] text-brand-300">
                {services.length} listed
              </span>
            </div>
            <div className="mt-4 grid gap-4">
              {services.length > 0 ? (
                services.map((service) => {
                  const isFavorited = favoriteIds.has(service.id);
                  return (
                    <article
                      key={service.id}
                      className="rounded-2xl border border-white/10 bg-night-900/70 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-brand-200">
                            {service.category}
                          </p>
                          <h3 className="mt-2 text-lg font-semibold text-slate-100">
                            {service.name}
                          </h3>
                          <p className="mt-1 text-sm text-slate-400">
                            {service.service_radius_miles} mile radius - {service.zip_code}
                          </p>
                        </div>
                        {user ? (
                          <form action={toggleServiceFavoriteAction}>
                            <input type="hidden" name="entity_id" value={service.id} />
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
                      {service.description ? (
                        <p className="mt-3 text-sm text-slate-300">{service.description}</p>
                      ) : null}
                      <div className="mt-3 flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-brand-200">
                        {service.phone ? <span>{service.phone}</span> : null}
                        {service.website_url ? (
                          <a
                            href={service.website_url}
                            rel="noreferrer"
                            target="_blank"
                            className="hover:text-brand-100"
                          >
                            Visit website
                          </a>
                        ) : null}
                      </div>
                    </article>
                  );
                })
              ) : (
                <p className="text-sm text-slate-400">
                  No approved services yet. Be the first to submit one for review.
                </p>
              )}
            </div>
          </div>

          <aside className="rounded-3xl border border-white/10 bg-night-900/70 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-brand-300">Grow your reach</p>
            <h2 className="mt-4 font-display text-2xl text-slate-100">Get listed</h2>
            <p className="mt-3 text-sm text-slate-300">
              Submit your service once and we will notify you when it is approved for the
              directory.
            </p>
            <Link
              href="/dashboard/services"
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
