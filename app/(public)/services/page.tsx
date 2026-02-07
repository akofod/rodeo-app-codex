import type { Metadata } from 'next';
import Link from 'next/link';

import { formatPhoneNumber, normalizeWebsiteUrl } from '@/lib/format/directory';
import { buildPageMetadata } from '@/lib/seo/metadata';
import {
  getServiceCategoryLabel,
  normalizeServiceCategory,
  SERVICE_CATEGORY_OPTIONS,
} from '@/lib/services/categories';
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
    q?: string;
    sort?: string;
    category?: string;
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
  const errorMessage = searchParams?.error
    ? decodeURIComponent(searchParams.error)
    : servicesResult.error || favoritesResult.error;
  const query = (searchParams?.q ?? '').trim().toLowerCase();
  const sort = searchParams?.sort ?? 'name-asc';
  const category = normalizeServiceCategory(searchParams?.category ?? '') ?? '';
  const filteredServices = services.filter((service) => {
    if (category && normalizeServiceCategory(service.category) !== category) {
      return false;
    }
    if (!query) {
      return true;
    }
    return `${service.name} ${getServiceCategoryLabel(service.category)} ${service.description ?? ''} ${service.zip_code}`
      .toLowerCase()
      .includes(query);
  });
  const sortedServices = [...filteredServices].sort((left, right) => {
    if (sort === 'name-desc') {
      return right.name.localeCompare(left.name);
    }
    return left.name.localeCompare(right.name);
  });

  return (
    <section className="px-6 py-10 sm:py-14 lg:py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <header className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.3em] text-brand-300">Services</p>
          <h1 className="font-display text-3xl text-slate-100 sm:text-4xl">
            Approved service providers
          </h1>
          <p className="text-sm text-slate-300">
            Find trusted farriers, trainers, and western lifestyle partners near your arena.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/services"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-100 transition hover:bg-white/10"
            >
              Browse all services
            </Link>
            <Link
              href="/map"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-100 transition hover:bg-white/10"
            >
              View map
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

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-white/10 bg-night-800/80 p-6 shadow-glow">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-2xl text-slate-100">Directory</h2>
              <span className="text-xs uppercase tracking-[0.3em] text-brand-300">
                {sortedServices.length} listed
              </span>
            </div>
            <form className="mt-4 grid gap-3 rounded-2xl border border-white/10 bg-night-900/60 p-4 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto]">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search provider or ZIP"
                className="rounded-xl border border-white/10 bg-night-900/70 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-400 sm:col-span-2 lg:col-span-1"
              />
              <select
                name="category"
                defaultValue={category}
                className="rounded-xl border border-white/10 bg-night-900/70 px-4 py-2 text-sm text-slate-100"
              >
                <option value="">All categories</option>
                {SERVICE_CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                name="sort"
                defaultValue={sort}
                className="rounded-xl border border-white/10 bg-night-900/70 px-4 py-2 text-sm text-slate-100"
              >
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
              </select>
              <button
                type="submit"
                className="rounded-full border border-brand-400/50 bg-brand-400/20 px-4 py-2 text-xs uppercase tracking-[0.2em] text-brand-100 transition hover:border-brand-300 hover:bg-brand-400/30"
              >
                Apply
              </button>
            </form>
            <div className="mt-5 grid gap-5">
              {!user && sortedServices.length > 0 ? (
                <div className="rounded-2xl border border-brand-400/30 bg-brand-400/10 px-4 py-3 text-sm text-brand-100">
                  Want to save listings?{' '}
                  <Link
                    href="/sign-in"
                    className="underline underline-offset-4 hover:text-brand-50"
                  >
                    Sign in to favorite services
                  </Link>
                  .
                </div>
              ) : null}
              {sortedServices.length > 0 ? (
                sortedServices.map((service) => {
                  const isFavorited = favoriteIds.has(service.id);
                  return (
                    <article
                      key={service.id}
                      className="flex h-full flex-col rounded-2xl border border-white/10 bg-night-900/70 p-4"
                    >
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-brand-200">
                            {getServiceCategoryLabel(service.category)}
                          </p>
                          <Link
                            href={`/services/${service.id}`}
                            className="mt-2 block text-lg font-semibold text-slate-100 underline-offset-4 transition hover:text-brand-100 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/60"
                          >
                            {service.name}
                          </Link>
                          <p className="mt-1 text-sm text-slate-300">
                            {service.service_radius_miles} mile radius - {service.zip_code}
                          </p>
                        </div>
                        {service.description ? (
                          <p className="text-sm text-slate-300">{service.description}</p>
                        ) : null}
                        <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-brand-200">
                          <span>{formatPhoneNumber(service.phone)}</span>
                          {normalizeWebsiteUrl(service.website_url) ? (
                            <a
                              href={normalizeWebsiteUrl(service.website_url) ?? undefined}
                              rel="noreferrer"
                              target="_blank"
                              className="transition hover:text-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/60"
                            >
                              Visit website
                            </a>
                          ) : (
                            <span>Website not provided</span>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
                        <Link
                          href={`/services/${service.id}`}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-100 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/60"
                        >
                          View details
                        </Link>
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
                              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-100 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/60 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isFavorited ? 'Favorited' : 'Add to favorites'}
                            </button>
                          </form>
                        ) : null}
                      </div>
                    </article>
                  );
                })
              ) : (
                <p className="text-sm text-slate-300">
                  No approved services yet. Be the first to submit one for review.
                </p>
              )}
            </div>
          </div>

          <aside className="rounded-3xl border border-white/10 bg-night-900/70 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-brand-300">Grow your reach</p>
            <h2 className="mt-3 font-display text-2xl text-slate-100">Get listed</h2>
            <p className="mt-2 text-sm text-slate-300">
              Submit your service once and we will notify you when it is approved for the directory.
            </p>
            <ul className="mt-4 space-y-1 text-sm text-slate-200">
              <li>- Reach event producers and venue operators.</li>
              <li>- Show coverage radius and specialties in one profile.</li>
            </ul>
            <Link
              href={user ? '/dashboard/services' : '/sign-in'}
              className="mt-5 inline-flex rounded-full border border-brand-400/50 bg-brand-400/20 px-5 py-2 text-xs uppercase tracking-[0.2em] text-brand-100 transition hover:border-brand-300 hover:bg-brand-400/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/60"
            >
              {user ? 'Submit a service' : 'Sign in to submit'}
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
