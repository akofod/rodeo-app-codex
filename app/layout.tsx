import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Cinzel, Source_Sans_3 } from 'next/font/google';

import './globals.css';

import HeaderNav from '@/components/HeaderNav';
import { signOut } from '@/app/(auth)/actions';
import { getSiteUrl, siteDescription, siteName } from '@/lib/seo/site';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import logo from '@/assets/western_sports_hub_logo.svg';

const displayFont = Cinzel({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '600', '700'],
});

const bodyFont = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700'],
});

const appUrl = getSiteUrl();
export const metadata: Metadata = {
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  metadataBase: new URL(appUrl),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: siteName,
    description: siteDescription,
    url: '/',
    siteName,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: siteName,
    description: siteDescription,
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle()
    : { data: null };
  const displayName =
    profile?.full_name ||
    (typeof user?.user_metadata?.display_name === 'string'
      ? user.user_metadata.display_name
      : '') ||
    user?.email ||
    '';
  const userInitial = displayName.trim().charAt(0).toUpperCase() || 'U';

  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body>
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-white/10 bg-night-900/90 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
              <Link href="/" className="group flex items-center gap-2">
                <Image
                  src={logo}
                  alt="Western Sports Hub logo"
                  width={40}
                  height={40}
                  className="h-10 w-10"
                  priority
                />
                <div>
                  <p className="font-display text-lg tracking-wide text-brand-100 transition group-hover:text-brand-50">
                    Western Sports Hub
                  </p>
                  <p className="text-sm uppercase tracking-[0.3em] text-brand-200 transition group-hover:text-brand-100">
                    Rodeo discovery network
                  </p>
                </div>
              </Link>
              <HeaderNav
                isAuthenticated={Boolean(user)}
                userInitial={userInitial}
                onSignOut={signOut}
              />
            </div>
          </header>
          <section className="border-b border-white/10 bg-night-900/80">
            <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6">
              <form
                action="/events"
                method="get"
                className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-night-950/70 p-4 shadow-[0_12px_32px_rgba(0,0,0,0.35)] sm:flex-row sm:items-center"
              >
                <div className="flex flex-1 flex-col gap-2">
                  <label
                    htmlFor="location"
                    className="text-xs uppercase tracking-[0.3em] text-brand-200"
                  >
                    Location
                  </label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    placeholder="City, State or Zip Code"
                    className="w-full rounded-2xl border border-white/10 bg-night-900/70 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 transition focus:border-brand-400/60 focus:outline-none focus:ring-2 focus:ring-brand-400/30"
                  />
                </div>
                <div className="flex flex-col gap-2 sm:w-48">
                  <label
                    htmlFor="radius"
                    className="text-xs uppercase tracking-[0.3em] text-brand-200"
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
                <div className="sm:self-end">
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center rounded-full border border-brand-400/50 bg-brand-400/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand-100 transition hover:border-brand-300 hover:bg-brand-400/30"
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>
          </section>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-white/10 bg-night-950/90">
            <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12 text-base text-slate-200">
              <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
                <div className="flex flex-col gap-3">
                  <span className="text-sm uppercase tracking-[0.3em] text-brand-200">
                    Western Sports Hub
                  </span>
                  <p className="text-base text-slate-100">
                    Built for the western community. Discover events, venues, and trusted pros in
                    one place.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <span className="text-sm uppercase tracking-[0.3em] text-brand-200">
                    Navigate
                  </span>
                  <div className="flex flex-col gap-2">
                    <Link href="/events" className="hover:text-brand-100">
                      Events
                    </Link>
                    <Link href="/venues" className="hover:text-brand-100">
                      Venues
                    </Link>
                    <Link href="/services" className="hover:text-brand-100">
                      Services
                    </Link>
                    {user ? (
                      <Link href="/dashboard" className="hover:text-brand-100">
                        Dashboard
                      </Link>
                    ) : (
                      <Link href="/sign-in" className="hover:text-brand-100">
                        Sign In
                      </Link>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <span className="text-sm uppercase tracking-[0.3em] text-brand-200">Company</span>
                  <div className="flex flex-col gap-2">
                    <Link href="/about" className="hover:text-brand-100">
                      About
                    </Link>
                    <Link href="/contact" className="hover:text-brand-100">
                      Contact
                    </Link>
                    <Link href="/privacy" className="hover:text-brand-100">
                      Privacy Policy
                    </Link>
                    <Link href="/terms" className="hover:text-brand-100">
                      Terms of Service
                    </Link>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between">
                <span>© {new Date().getFullYear()} Western Sports Hub.</span>
                <span className="text-slate-400">Rodeo discovery network.</span>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
