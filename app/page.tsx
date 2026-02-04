import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden px-6 py-16 sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(216,127,27,0.24),_transparent_55%)]" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-400/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-brand-200">
              North America - Beta access
            </span>
            <h1 className="mt-6 font-display text-4xl leading-tight text-slate-50 sm:text-5xl lg:text-6xl">
              Find every rodeo, jackpot, and western lifestyle event in one place.
            </h1>
            <p className="mt-4 text-lg text-slate-300">
              Western Sports Hub connects fans, producers, and service providers with a single
              directory of events, venues, and trusted professionals.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/events"
                className="rounded-full border border-brand-400/50 bg-brand-400/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand-100 transition hover:border-brand-300 hover:bg-brand-400/30"
              >
                Explore Events
              </Link>
              <Link
                href="/dashboard/events"
                className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-100 transition hover:bg-white/10"
              >
                Submit an Event
              </Link>
            </div>
          </div>
          <div className="grid gap-4 rounded-3xl border border-white/10 bg-night-800/80 p-6 shadow-glow sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-night-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-brand-300">Discovery</p>
              <p className="mt-3 text-sm text-slate-200">
                Radius-based search across rodeos, bull riding, jackpots, and clinics.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-night-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-brand-300">Community</p>
              <p className="mt-3 text-sm text-slate-200">
                Producers and riders submit events and venues with quick approval workflows.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-night-900/70 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-brand-300">Services</p>
              <p className="mt-3 text-sm text-slate-200">
                Surface trusted farriers, trainers, and contractors near any venue.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="px-6 pb-20">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-[1.2fr_1fr]">
          <div className="rounded-3xl border border-white/10 bg-night-800/70 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-brand-300">Map Preview</p>
            <h2 className="mt-4 font-display text-2xl text-slate-100">
              A single map of the western circuit.
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              Mapbox-powered discovery will highlight approved events and venues by discipline,
              date, and distance.
            </p>
            <Link
              href="/map"
              className="mt-4 inline-flex text-xs uppercase tracking-[0.2em] text-brand-200 hover:text-brand-100"
            >
              Open map
            </Link>
          </div>
          <div className="rounded-3xl border border-white/10 bg-night-900/70 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-brand-300">Service Network</p>
            <h2 className="mt-4 font-display text-2xl text-slate-100">
              Services vetted by the community.
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              Each listing is reviewed before going live so riders can trust the providers they
              find.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
