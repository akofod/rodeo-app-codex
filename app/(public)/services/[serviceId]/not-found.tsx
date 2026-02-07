import Link from 'next/link';

export default function ServiceDetailNotFound() {
  return (
    <section className="px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-white/10 bg-night-800/80 p-6 shadow-glow">
          <h1 className="font-display text-2xl text-slate-100">Service not found</h1>
          <p className="mt-2 text-sm text-slate-300">
            The service you requested may not be approved or is no longer available.
          </p>
          <Link
            href="/services"
            className="mt-4 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-100 transition hover:bg-white/10"
          >
            Browse services
          </Link>
        </div>
      </div>
    </section>
  );
}
