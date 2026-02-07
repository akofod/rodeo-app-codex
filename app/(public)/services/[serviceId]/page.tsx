import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import DetailMedia from '@/components/details/DetailMedia';
import { formatPhoneNumber, normalizeWebsiteUrl } from '@/lib/format/directory';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { getServiceCategoryLabel } from '@/lib/services/categories';
import { getApprovedServices } from '@/lib/supabase/services';

type ServiceDetailPageProps = {
  params: {
    serviceId: string;
  };
};

export const dynamic = 'force-dynamic';

export const metadata: Metadata = buildPageMetadata({
  title: 'Service details',
  description: 'View service details.',
  path: '/services',
});

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const servicesResult = await getApprovedServices();
  const services = servicesResult.data ?? [];
  const service = services.find((item) => item.id === params.serviceId);

  if (!service) {
    notFound();
  }

  return (
    <section className="px-6 py-12 sm:py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/services"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-100 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/60"
          >
            Back to services
          </Link>
        </div>
        <article className="grid gap-6 rounded-3xl border border-white/10 bg-night-800/80 p-6 shadow-glow md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-brand-300">Service details</p>
            <h1 className="font-display text-3xl text-slate-100">{service.name}</h1>
            <p className="text-sm text-slate-300">{getServiceCategoryLabel(service.category)}</p>
            <p className="text-sm text-slate-300">
              Service radius: {service.service_radius_miles} miles from {service.zip_code}
            </p>
            {service.description ? (
              <p className="text-sm text-slate-200">{service.description}</p>
            ) : null}
            {service.specialties ? (
              <p className="text-sm text-slate-200">
                <span className="font-semibold text-slate-100">Specialties:</span>{' '}
                {service.specialties}
              </p>
            ) : null}
            {service.pricing_details ? (
              <p className="text-sm text-slate-200">
                <span className="font-semibold text-slate-100">Pricing:</span>{' '}
                {service.pricing_details}
              </p>
            ) : null}
            {service.availability_notes ? (
              <p className="text-sm text-slate-200">
                <span className="font-semibold text-slate-100">Availability:</span>{' '}
                {service.availability_notes}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-brand-200">
              {service.contact_name ? <span>Contact: {service.contact_name}</span> : null}
              {service.contact_email ? <span>{service.contact_email}</span> : null}
              <span>{formatPhoneNumber(service.phone)}</span>
              {normalizeWebsiteUrl(service.website_url) ? (
                <a
                  href={normalizeWebsiteUrl(service.website_url) ?? undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/60"
                >
                  Visit website
                </a>
              ) : (
                <span>Website not provided</span>
              )}
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-night-900/70">
            <DetailMedia
              alt={`${service.name} service image`}
              imageUrl={service.image_url}
              emptyLabel="No service image provided"
            />
          </div>
        </article>
      </div>
    </section>
  );
}
