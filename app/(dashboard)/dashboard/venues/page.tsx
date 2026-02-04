import Link from 'next/link';

import { getUserVenues } from '@/lib/supabase/venues';

import { createVenueAction } from './actions';

export const dynamic = 'force-dynamic';

type VenuesPageProps = {
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

export default async function VenuesPage({ searchParams }: VenuesPageProps) {
  const { data: venues, error } = await getUserVenues();
  const errorMessage = searchParams?.error ? decodeURIComponent(searchParams.error) : error;
  const successMessage = searchParams?.success ? decodeURIComponent(searchParams.success) : null;

  return (
    <section className="px-6 py-12 sm:py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.3em] text-brand-300">Venues</p>
          <h1 className="font-display text-3xl text-slate-100 sm:text-4xl">Manage your venues</h1>
          <p className="text-sm text-slate-300">
            Submit new venues for approval. Approved venues unlock event submissions.
          </p>
          <Link
            href="/dashboard"
            className="text-xs uppercase tracking-[0.2em] text-brand-200 hover:text-brand-100"
          >
            Back to dashboard
          </Link>
        </header>

        {errorMessage ? (
          <div className="rounded-2xl border border-red-400/40 bg-red-500/10 px-5 py-4 text-sm text-red-100">
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-100">
            {successMessage}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-night-800/80 p-6 shadow-glow">
            <h2 className="font-display text-2xl text-slate-100">Add a venue</h2>
            <p className="mt-2 text-sm text-slate-300">
              Include a full address so we can geocode it for map discovery.
            </p>
            <form action={createVenueAction} className="mt-6 grid gap-4">
              <label className="grid gap-2 text-sm text-slate-300">
                Venue name
                <input
                  type="text"
                  name="name"
                  required
                  className="rounded-xl border border-white/10 bg-night-900/70 px-4 py-2 text-slate-100"
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-300">
                Street address
                <input
                  type="text"
                  name="address_street"
                  required
                  className="rounded-xl border border-white/10 bg-night-900/70 px-4 py-2 text-slate-100"
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="grid gap-2 text-sm text-slate-300">
                  City
                  <input
                    type="text"
                    name="address_city"
                    required
                    className="rounded-xl border border-white/10 bg-night-900/70 px-4 py-2 text-slate-100"
                  />
                </label>
                <label className="grid gap-2 text-sm text-slate-300">
                  State
                  <input
                    type="text"
                    name="address_state"
                    required
                    className="rounded-xl border border-white/10 bg-night-900/70 px-4 py-2 text-slate-100"
                    placeholder="TX"
                  />
                </label>
                <label className="grid gap-2 text-sm text-slate-300">
                  ZIP
                  <input
                    type="text"
                    name="address_zip"
                    required
                    className="rounded-xl border border-white/10 bg-night-900/70 px-4 py-2 text-slate-100"
                  />
                </label>
              </div>
              <label className="grid gap-2 text-sm text-slate-300">
                Country
                <select
                  name="address_country"
                  required
                  defaultValue="United States"
                  className="rounded-xl border border-white/10 bg-night-900/70 px-4 py-2 text-slate-100"
                >
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="Mexico">Mexico</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm text-slate-300">
                Website (optional)
                <input
                  type="url"
                  name="website_url"
                  className="rounded-xl border border-white/10 bg-night-900/70 px-4 py-2 text-slate-100"
                />
              </label>
              <button
                type="submit"
                className="mt-2 rounded-full border border-brand-400/50 bg-brand-400/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand-100 transition hover:border-brand-300 hover:bg-brand-400/30"
              >
                Submit venue
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-white/10 bg-night-900/70 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl text-slate-100">Your venues</h2>
              <span className="text-xs uppercase tracking-[0.3em] text-brand-300">
                {venues?.length ?? 0} total
              </span>
            </div>
            <div className="mt-4 grid gap-3">
              {venues && venues.length > 0 ? (
                venues.map((venue) => (
                  <div
                    key={venue.id}
                    className="rounded-2xl border border-white/10 bg-night-800/70 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-100">{venue.name}</p>
                        <p className="text-xs text-slate-400">
                          {venue.address_street}, {venue.address_city}, {venue.address_state}{' '}
                          {venue.address_zip}
                          {venue.address_country ? `, ${venue.address_country}` : ''}
                        </p>
                      </div>
                      <span
                        className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.2em] ${
                          statusStyles[venue.status] ?? statusStyles.PENDING
                        }`}
                      >
                        {venue.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">
                  No venues yet. Submit your first venue to unlock event submissions.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
