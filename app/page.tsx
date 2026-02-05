import Image from 'next/image';
import Link from 'next/link';

import heroImage from '@/assets/western_sports_hub_home.png';

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden px-6 py-16 sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(216,127,27,0.24),_transparent_55%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent via-night-900/60 to-night-900" />
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
            <div className="relative">
              <Image
                src={heroImage}
                alt="Western Sports Hub hero"
                className="h-full w-full rounded-3xl object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
                priority
              />
            </div>
          </div>
        </div>
      </section>
      <section className="relative px-6 pb-20 pt-12">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-night-800/60 to-night-900" />
        <div className="relative mx-auto grid max-w-6xl gap-6 md:grid-cols-[1.2fr_1fr]">
          <div className="rounded-3xl border border-white/25 bg-night-800/90 p-6 shadow-[0_14px_34px_rgba(0,0,0,0.45)]">
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
          <div className="rounded-3xl border border-white/25 bg-night-800/90 p-6 shadow-[0_14px_34px_rgba(0,0,0,0.45)]">
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
