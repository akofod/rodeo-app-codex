import Image from 'next/image';
import Link from 'next/link';

import heroImage from '@/assets/western_sports_hub_home.png';

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden px-6 py-10 sm:py-14 lg:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(216,127,27,0.24),_transparent_55%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent via-night-900/60 to-night-900" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 lg:gap-10">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="max-w-3xl">
              <h1 className="font-display text-3xl leading-tight text-slate-50 sm:text-4xl md:text-5xl lg:text-6xl">
                Find rodeos, jackpots, and western events.
              </h1>
              <p className="mt-3 text-base text-slate-100 sm:text-xl lg:text-2xl">
                Events, venues, and trusted pros in one hub for fans, producers, and providers.
              </p>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:gap-3">
                <Link
                  href="/events"
                  className="rounded-full border border-brand-400/50 bg-brand-400/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-brand-100 transition hover:border-brand-300 hover:bg-brand-400/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/60"
                >
                  Explore events
                </Link>
              </div>
            </div>
            <div className="relative mx-auto hidden max-w-[16rem] sm:max-w-xs md:block md:max-w-sm lg:mx-0 lg:max-w-none lg:pr-4">
              <Image
                src={heroImage}
                alt="Western Sports Hub hero"
                className="h-auto w-full rounded-3xl object-cover lg:scale-[0.9]"
                sizes="(max-width: 768px) 70vw, (max-width: 1024px) 40vw, 32vw"
                priority
              />
            </div>
          </div>
        </div>
      </section>
      <section className="relative px-6 pb-6">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-night-900/40 to-night-900" />
        <div className="relative mx-auto max-w-6xl">
          <div className="rounded-3xl border border-white/25 bg-night-800/90 p-5 shadow-[0_14px_34px_rgba(0,0,0,0.45)] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-brand-100">Quick search</p>
                <h2 className="mt-2 font-display text-xl text-slate-100 sm:text-2xl">
                  Find events near your location.
                </h2>
                <p className="mt-2 text-base text-slate-100">
                  Enter a city, state, or zip code to surface the closest rodeos and jackpots.
                </p>
              </div>
            </div>
            <form action="/events" method="get" className="mt-5 grid gap-3 md:grid-cols-6 md:gap-3">
              <div className="flex flex-col gap-2 md:col-span-6 lg:col-span-4">
                <label
                  htmlFor="location"
                  className="text-xs uppercase tracking-[0.22em] text-brand-100"
                >
                  Location
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  placeholder="City, State or Zip Code"
                  className="w-full rounded-2xl border border-white/10 bg-night-900/70 px-4 py-3 text-sm text-slate-100 transition placeholder:text-slate-400 focus:border-brand-400/60 focus:outline-none focus:ring-2 focus:ring-brand-400/30"
                />
              </div>
              <div className="flex flex-col gap-2 md:col-span-3 lg:col-span-1">
                <label
                  htmlFor="radius"
                  className="text-xs uppercase tracking-[0.22em] text-brand-100"
                >
                  Radius
                </label>
                <select
                  id="radius"
                  name="radius"
                  defaultValue="50"
                  className="w-full rounded-2xl border border-white/10 bg-night-900/70 px-4 py-3 text-sm text-slate-100 transition focus:border-brand-400/60 focus:outline-none focus:ring-2 focus:ring-brand-400/30"
                >
                  <option value="10">10 miles</option>
                  <option value="25">25 miles</option>
                  <option value="50">50 miles</option>
                  <option value="100">100 miles</option>
                  <option value="250">250 miles</option>
                </select>
              </div>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-full border border-brand-400/50 bg-brand-400/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-brand-100 transition hover:border-brand-300 hover:bg-brand-400/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/60 md:col-span-3 md:self-end lg:col-span-1"
              >
                Search events
              </button>
            </form>
          </div>
        </div>
      </section>
      <section className="relative px-6 pb-20 pt-4">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-night-800/60 to-night-900" />
        <div className="relative mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex h-full flex-col rounded-3xl border border-white/25 bg-night-800/90 p-6 shadow-[0_14px_34px_rgba(0,0,0,0.45)] md:col-span-2 lg:col-span-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-brand-400/30 bg-brand-400/10 text-brand-100">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 6.5l5-2 6 2 5-2v13l-5 2-6-2-5 2v-13z" />
                <path d="M9 4.5v13" />
                <path d="M15 6.5v13" />
              </svg>
            </div>
            <p className="mt-4 text-sm uppercase tracking-[0.24em] text-brand-100">Map preview</p>
            <h2 className="mt-4 font-display text-2xl text-slate-100">
              A single map of the western circuit.
            </h2>
            <p className="mt-3 text-base text-slate-200">
              Mapbox-powered discovery will highlight approved events and venues by discipline,
              date, and distance.
            </p>
            <div className="mt-auto pt-6">
              <Link
                href="/map"
                className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-100 transition hover:border-brand-300 hover:text-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/60"
              >
                Open map
              </Link>
            </div>
          </div>
          <div className="flex h-full flex-col rounded-3xl border border-white/25 bg-night-800/90 p-6 shadow-[0_14px_34px_rgba(0,0,0,0.45)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-brand-400/30 bg-brand-400/10 text-brand-100">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="4.5" />
                <path d="M16 16l4 4" />
              </svg>
            </div>
            <p className="mt-4 text-sm uppercase tracking-[0.24em] text-brand-100">
              Browse all events
            </p>
            <h2 className="mt-4 font-display text-2xl text-slate-100">
              Explore the full event calendar.
            </h2>
            <p className="mt-3 text-base text-slate-200">
              Browse every approved event and use filters to narrow by location, date, and more.
            </p>
            <div className="mt-auto pt-6">
              <Link
                href="/events"
                className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-100 transition hover:border-brand-300 hover:text-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/60"
              >
                View events
              </Link>
            </div>
          </div>
          <div className="flex h-full flex-col rounded-3xl border border-white/25 bg-night-800/90 p-6 shadow-[0_14px_34px_rgba(0,0,0,0.45)]">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-brand-400/30 bg-brand-400/10 text-brand-100">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 5v6a5 5 0 0 0 10 0V5" />
                <path d="M7 5h2" />
                <path d="M15 5h2" />
              </svg>
            </div>
            <p className="mt-4 text-sm uppercase tracking-[0.24em] text-brand-100">
              Service network
            </p>
            <h2 className="mt-4 font-display text-2xl text-slate-100">
              Services vetted by the community.
            </h2>
            <p className="mt-3 text-base text-slate-200">
              Each listing is reviewed before going live so riders can trust the providers they
              find.
            </p>
            <div className="mt-auto pt-6">
              <Link
                href="/services"
                className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-100 transition hover:border-brand-300 hover:text-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/60"
              >
                Browse services
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
