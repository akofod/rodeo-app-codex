'use client';

import Link from 'next/link';

export default function EventDetailError() {
  return (
    <section className="px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-red-400/30 bg-red-500/10 p-6">
          <p className="text-sm text-red-100">
            We could not load this event right now. Please refresh or try again later.
          </p>
          <Link
            href="/events"
            className="mt-4 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-100 transition hover:bg-white/10"
          >
            Back to events
          </Link>
        </div>
      </div>
    </section>
  );
}
