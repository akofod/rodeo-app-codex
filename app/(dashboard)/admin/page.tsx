import Link from 'next/link';

import { getServiceCategoryLabel } from '@/lib/services/categories';
import { getPendingEvents, getPendingServices, getPendingVenues } from '@/lib/supabase/admin-data';
import { getApprovedVenues } from '@/lib/supabase/venues';

import {
  updateEventStatusAction,
  updateServiceStatusAction,
  updateVenueStatusAction,
} from './actions';

export const dynamic = 'force-dynamic';

type AdminPageProps = {
  searchParams?: {
    error?: string;
    success?: string;
  };
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

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const [venuesResult, eventsResult, servicesResult, approvedVenuesResult] = await Promise.all([
    getPendingVenues(),
    getPendingEvents(),
    getPendingServices(),
    getApprovedVenues(),
  ]);

  const venues = venuesResult.data ?? [];
  const events = eventsResult.data ?? [];
  const services = servicesResult.data ?? [];
  const approvedVenues = approvedVenuesResult.data ?? [];
  const approvedVenueIds = new Set(approvedVenues.map((venue) => venue.id));

  const venueNamesById = new Map(
    [...approvedVenues, ...venues].map((venue) => [venue.id, venue.name]),
  );
  const errorMessage = searchParams?.error
    ? decodeURIComponent(searchParams.error)
    : venuesResult.error || eventsResult.error || servicesResult.error;
  const successMessage = searchParams?.success ? decodeURIComponent(searchParams.success) : null;

  return (
    <section className="px-6 py-12 sm:py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.3em] text-brand-300">Admin</p>
          <h1 className="font-display text-3xl text-slate-100 sm:text-4xl">Review submissions</h1>
          <p className="text-sm text-slate-300">
            Approve or reject venue, event, and service submissions.
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

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-3xl border border-white/10 bg-night-800/80 p-6 shadow-glow">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl text-slate-100">Pending venues</h2>
              <span className="text-xs uppercase tracking-[0.3em] text-brand-300">
                {venues.length} total
              </span>
            </div>
            <div className="mt-4 grid gap-4">
              {venues.length > 0 ? (
                venues.map((venue) => (
                  <div
                    key={venue.id}
                    className="rounded-2xl border border-white/10 bg-night-900/70 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-100">{venue.name}</p>
                        <p className="text-xs text-slate-400">
                          {venue.address_city}, {venue.address_state}
                          {venue.address_country ? `, ${venue.address_country}` : ''}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <form action={updateVenueStatusAction}>
                          <input type="hidden" name="venue_id" value={venue.id} />
                          <button
                            type="submit"
                            name="status"
                            value="APPROVED"
                            className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-emerald-100 transition hover:border-emerald-300"
                          >
                            Approve
                          </button>
                        </form>
                        <form action={updateVenueStatusAction}>
                          <input type="hidden" name="venue_id" value={venue.id} />
                          <button
                            type="submit"
                            name="status"
                            value="REJECTED"
                            className="rounded-full border border-red-400/40 bg-red-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-red-100 transition hover:border-red-300"
                          >
                            Reject
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">No pending venues right now.</p>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-night-900/70 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl text-slate-100">Pending events</h2>
              <span className="text-xs uppercase tracking-[0.3em] text-brand-300">
                {events.length} total
              </span>
            </div>
            <div className="mt-4 grid gap-4">
              {events.length > 0 ? (
                events.map((event) => {
                  const venueName = venueNamesById.get(event.venue_id);
                  const isVenueApproved = approvedVenueIds.has(event.venue_id);
                  return (
                    <div
                      key={event.id}
                      className="rounded-2xl border border-white/10 bg-night-800/70 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-100">{event.title}</p>
                          <p className="text-xs text-slate-400">
                            {formatDate(event.start_datetime)} - {venueName ?? event.venue_id}
                          </p>
                          {!isVenueApproved ? (
                            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-amber-200">
                              Venue pending approval
                            </p>
                          ) : null}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <form action={updateEventStatusAction}>
                            <input type="hidden" name="event_id" value={event.id} />
                            <button
                              type="submit"
                              name="status"
                              value="APPROVED"
                              className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-emerald-100 transition hover:border-emerald-300"
                              disabled={!isVenueApproved}
                            >
                              Approve
                            </button>
                          </form>
                          <form action={updateEventStatusAction}>
                            <input type="hidden" name="event_id" value={event.id} />
                            <button
                              type="submit"
                              name="status"
                              value="REJECTED"
                              className="rounded-full border border-red-400/40 bg-red-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-red-100 transition hover:border-red-300"
                            >
                              Reject
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-400">No pending events right now.</p>
              )}
            </div>
          </section>
        </div>

        <section className="rounded-3xl border border-white/10 bg-night-900/70 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl text-slate-100">Pending services</h2>
            <span className="text-xs uppercase tracking-[0.3em] text-brand-300">
              {services.length} total
            </span>
          </div>
          <div className="mt-4 grid gap-4">
            {services.length > 0 ? (
              services.map((service) => (
                <div
                  key={service.id}
                  className="rounded-2xl border border-white/10 bg-night-800/70 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{service.name}</p>
                      <p className="text-xs text-slate-400">
                        {getServiceCategoryLabel(service.category)} - {service.zip_code}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <form action={updateServiceStatusAction}>
                        <input type="hidden" name="service_id" value={service.id} />
                        <button
                          type="submit"
                          name="status"
                          value="APPROVED"
                          className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-emerald-100 transition hover:border-emerald-300"
                        >
                          Approve
                        </button>
                      </form>
                      <form action={updateServiceStatusAction}>
                        <input type="hidden" name="service_id" value={service.id} />
                        <button
                          type="submit"
                          name="status"
                          value="REJECTED"
                          className="rounded-full border border-red-400/40 bg-red-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-red-100 transition hover:border-red-300"
                        >
                          Reject
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">No pending services right now.</p>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
