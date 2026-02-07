import Link from 'next/link';

import DraftPersistence from '@/components/forms/DraftPersistence';
import ServiceImageField from '@/components/forms/ServiceImageField';
import SubmitButton from '@/components/forms/SubmitButton';
import { getServiceCategoryLabel, SERVICE_CATEGORY_OPTIONS } from '@/lib/services/categories';
import { getUserServices } from '@/lib/supabase/services';

import { createServiceAction } from './actions';

export const dynamic = 'force-dynamic';

type ServicesPageProps = {
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

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  const { data: services, error } = await getUserServices();
  const errorMessage = searchParams?.error ? decodeURIComponent(searchParams.error) : error;
  const successMessage = searchParams?.success ? decodeURIComponent(searchParams.success) : null;

  return (
    <section className="px-6 py-12 sm:py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.3em] text-brand-300">Services</p>
          <h1 className="font-display text-3xl text-slate-100 sm:text-4xl">Manage your services</h1>
          <p className="text-sm text-slate-300">
            List your business or service for approval before it appears in the directory.
          </p>
          <Link
            href="/dashboard"
            className="text-xs uppercase tracking-[0.2em] text-brand-200 hover:text-brand-100"
          >
            Back to dashboard
          </Link>
        </header>

        {errorMessage ? (
          <div
            role="alert"
            className="rounded-2xl border border-red-400/40 bg-red-500/10 px-5 py-4 text-sm text-red-100"
          >
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div
            role="status"
            className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-100"
          >
            {successMessage}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-night-800/80 p-6 shadow-glow">
            <h2 className="font-display text-2xl text-slate-100">Add a service</h2>
            <p className="mt-2 text-sm text-slate-300">
              Tell the community what you offer and how far you travel.
            </p>
            <form action={createServiceAction} className="mt-6 grid gap-4">
              <DraftPersistence
                storageKey="service-form-draft"
                fieldNames={[
                  'name',
                  'category',
                  'description',
                  'image_url',
                  'contact_name',
                  'contact_email',
                  'specialties',
                  'phone',
                  'website_url',
                  'pricing_details',
                  'availability_notes',
                  'service_radius_miles',
                  'zip_code',
                ]}
              />
              <p className="text-xs text-slate-300">
                Draft fields are saved in this browser while you complete the form.
              </p>
              <label className="grid gap-2 text-sm text-slate-200">
                Service name (required)
                <input
                  type="text"
                  name="name"
                  required
                  className="rounded-xl border border-white/10 bg-night-900/70 px-4 py-2 text-slate-100 placeholder:text-slate-400"
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-200">
                Category (required)
                <select
                  name="category"
                  required
                  defaultValue=""
                  className="rounded-xl border border-white/10 bg-night-900/70 px-4 py-2 text-slate-100"
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {SERVICE_CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm text-slate-200">
                Description (optional)
                <textarea
                  name="description"
                  rows={3}
                  className="rounded-xl border border-white/10 bg-night-900/70 px-4 py-2 text-slate-100 placeholder:text-slate-400"
                />
              </label>
              <ServiceImageField />
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm text-slate-200">
                  Contact person (optional)
                  <input
                    type="text"
                    name="contact_name"
                    placeholder="e.g., Riley Morgan"
                    className="rounded-xl border border-white/10 bg-night-900/70 px-4 py-2 text-slate-100 placeholder:text-slate-400"
                  />
                </label>
                <label className="grid gap-2 text-sm text-slate-200">
                  Contact email (optional)
                  <input
                    type="email"
                    name="contact_email"
                    placeholder="name@example.com"
                    className="rounded-xl border border-white/10 bg-night-900/70 px-4 py-2 text-slate-100 placeholder:text-slate-400"
                  />
                </label>
              </div>
              <label className="grid gap-2 text-sm text-slate-200">
                Specialties (optional)
                <input
                  type="text"
                  name="specialties"
                  placeholder="e.g., Barrel horses, youth clinics"
                  className="rounded-xl border border-white/10 bg-night-900/70 px-4 py-2 text-slate-100 placeholder:text-slate-400"
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm text-slate-200">
                  Phone (optional)
                  <input
                    type="tel"
                    name="phone"
                    className="rounded-xl border border-white/10 bg-night-900/70 px-4 py-2 text-slate-100 placeholder:text-slate-400"
                  />
                </label>
                <label className="grid gap-2 text-sm text-slate-200">
                  Website (optional)
                  <input
                    type="url"
                    name="website_url"
                    placeholder="https://example.com"
                    className="rounded-xl border border-white/10 bg-night-900/70 px-4 py-2 text-slate-100 placeholder:text-slate-400"
                  />
                  <span className="text-xs text-slate-300">
                    Use a full URL starting with https://.
                  </span>
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm text-slate-200">
                  Pricing details (optional)
                  <textarea
                    name="pricing_details"
                    rows={2}
                    placeholder="Share hourly rate, package range, or estimate details."
                    className="rounded-xl border border-white/10 bg-night-900/70 px-4 py-2 text-slate-100 placeholder:text-slate-400"
                  />
                </label>
                <label className="grid gap-2 text-sm text-slate-200">
                  Availability notes (optional)
                  <textarea
                    name="availability_notes"
                    rows={2}
                    placeholder="Include days, travel windows, or booking lead times."
                    className="rounded-xl border border-white/10 bg-night-900/70 px-4 py-2 text-slate-100 placeholder:text-slate-400"
                  />
                </label>
              </div>
              <p className="text-xs text-slate-300">
                Add at least one contact method (phone or website) so customers can reach you.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm text-slate-200">
                  Service radius (miles) (required)
                  <input
                    type="number"
                    name="service_radius_miles"
                    min={1}
                    required
                    className="rounded-xl border border-white/10 bg-night-900/70 px-4 py-2 text-slate-100 placeholder:text-slate-400"
                  />
                </label>
                <label className="grid gap-2 text-sm text-slate-200">
                  ZIP code (required)
                  <input
                    type="text"
                    name="zip_code"
                    required
                    className="rounded-xl border border-white/10 bg-night-900/70 px-4 py-2 text-slate-100 placeholder:text-slate-400"
                  />
                </label>
              </div>
              <SubmitButton
                label="Submit service"
                pendingLabel="Submitting..."
                className="mt-2 rounded-full border border-brand-400/50 bg-brand-400/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand-100 transition hover:border-brand-300 hover:bg-brand-400/30"
              />
            </form>
          </div>

          <div className="rounded-3xl border border-white/10 bg-night-900/70 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl text-slate-100">Your services</h2>
              <span className="text-xs uppercase tracking-[0.3em] text-brand-300">
                {services?.length ?? 0} total
              </span>
            </div>
            <div className="mt-4 grid gap-3">
              {services && services.length > 0 ? (
                services.map((service) => (
                  <div
                    key={service.id}
                    className="rounded-2xl border border-white/10 bg-night-800/70 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-100">{service.name}</p>
                        <p className="text-xs text-slate-400">
                          {getServiceCategoryLabel(service.category)} -{' '}
                          {service.service_radius_miles} miles - {service.zip_code}
                        </p>
                      </div>
                      <span
                        className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.2em] ${
                          statusStyles[service.status] ?? statusStyles.PENDING
                        }`}
                      >
                        {service.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">
                  No services yet. Submit your first service to reach the community.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
