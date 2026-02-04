import Image from 'next/image';
import Link from 'next/link';

import heroImage from '@/assets/western_sports_hub_home.png';

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden px-6 py-16 sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(216,127,27,0.24),_transparent_55%)]" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-10">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-400/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-brand-200">
                North America - Beta access
              </span>
              <h1 className="mt-6 font-display text-4xl leading-tight text-slate-50 sm:text-5xl lg:text-6xl">
                Find rodeos, jackpots, and western events.
              </h1>
              <p className="mt-4 text-xl text-slate-300 sm:text-2xl">
                Events, venues, and trusted pros in one hub for fans, producers, and providers.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/events"
                  className="rounded-full border border-brand-400/50 bg-brand-400/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand-100 transition hover:border-brand-300 hover:bg-brand-400/30"
                >
                  Explore Events
                </Link>
              </div>
            </div>
            <div className="overflow-hidden rounded-3xl">
              <Image
                src={heroImage}
                alt="Western Sports Hub hero"
                className="h-full w-full object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
                priority
              />
            </div>
          </div>
          <div className="grid gap-6 rounded-3xl border border-white/15 bg-night-900/60 p-8 shadow-glow sm:grid-cols-3">
            <div className="rounded-2xl border border-white/20 bg-night-800/80 p-6 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-400/20 text-brand-100">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.25 3.75a7.5 7.5 0 1 0 7.5 7.5h2.25m-2.25 0a7.47 7.47 0 0 0-2.2-5.3M21 21l-3.75-3.75"
                  />
                </svg>
              </div>
              <p className="mt-4 text-xs uppercase tracking-[0.3em] text-brand-300">Discovery</p>
              <p className="mt-3 text-sm text-slate-200">
                Radius-based search across rodeos, bull riding, jackpots, and clinics.
              </p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-night-800/80 p-6 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-400/20 text-brand-100">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Zm-9 11.25a6 6 0 0 1 12 0"
                  />
                </svg>
              </div>
              <p className="mt-4 text-xs uppercase tracking-[0.3em] text-brand-300">Community</p>
              <p className="mt-3 text-sm text-slate-200">
                Producers and riders submit events and venues with quick approval workflows.
              </p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-night-800/80 p-6 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-400/20 text-brand-100">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.25 6.75h3a1.5 1.5 0 0 1 1.5 1.5v3m-4.5-4.5-9.5 9.5a1.5 1.5 0 0 0 0 2.12l1.88 1.88a1.5 1.5 0 0 0 2.12 0l9.5-9.5m-4.5-4.5 4.5 4.5"
                  />
                </svg>
              </div>
              <p className="mt-4 text-xs uppercase tracking-[0.3em] text-brand-300">Services</p>
              <p className="mt-3 text-sm text-slate-200">
                Surface trusted farriers, trainers, and contractors near any venue.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="relative px-6 pb-20 pt-12">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-night-800/60 to-night-900" />
        <div className="relative mx-auto grid max-w-6xl gap-6 md:grid-cols-[1.2fr_1fr]">
          <div className="rounded-3xl border border-white/15 bg-night-800/80 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
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
          <div className="rounded-3xl border border-white/15 bg-night-800/80 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
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
