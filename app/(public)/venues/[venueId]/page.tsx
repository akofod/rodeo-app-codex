import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import DetailMedia from '@/components/details/DetailMedia';
import { formatAddressLine, normalizeWebsiteUrl } from '@/lib/format/directory';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { getApprovedVenues } from '@/lib/supabase/venues';

type VenueDetailPageProps = {
  params: {
    venueId: string;
  };
};

export const dynamic = 'force-dynamic';

export const metadata: Metadata = buildPageMetadata({
  title: 'Venue details',
  description: 'View venue details.',
  path: '/venues',
});

export default async function VenueDetailPage({ params }: VenueDetailPageProps) {
  const venuesResult = await getApprovedVenues();
  const venues = venuesResult.data ?? [];
  const venue = venues.find((item) => item.id === params.venueId);

  if (!venue) {
    notFound();
  }

  return (
    <section className="px-6 py-12 sm:py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/venues"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-100 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/60"
          >
            Back to venues
          </Link>
        </div>
        <article className="grid gap-6 rounded-3xl border border-white/10 bg-night-800/80 p-6 shadow-glow md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-brand-300">Venue details</p>
            <h1 className="font-display text-3xl text-slate-100">{venue.name}</h1>
            <p className="text-sm text-slate-300">
              {formatAddressLine({
                street: venue.address_street,
                city: venue.address_city,
                state: venue.address_state,
                zip: venue.address_zip,
                country: venue.address_country,
              })}
            </p>
            {normalizeWebsiteUrl(venue.website_url) ? (
              <a
                href={normalizeWebsiteUrl(venue.website_url) ?? undefined}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-full border border-brand-400/50 bg-brand-400/20 px-4 py-2 text-xs uppercase tracking-[0.2em] text-brand-100 transition hover:border-brand-300 hover:bg-brand-400/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/60"
              >
                Visit website
              </a>
            ) : (
              <p className="text-sm text-slate-400">Website not provided</p>
            )}
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-night-900/70">
            <DetailMedia alt={`${venue.name} venue image`} emptyLabel="No venue image provided" />
          </div>
        </article>
      </div>
    </section>
  );
}
