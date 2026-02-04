import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Cinzel, Source_Sans_3 } from 'next/font/google';

import './globals.css';

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
const navLinkClass =
  'inline-flex items-center rounded-full border border-white/10 px-4 py-1.5 text-[12px] uppercase tracking-[0.2em] text-brand-200 transition hover:border-brand-300 hover:text-brand-100';

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
                  <p className="text-xs uppercase tracking-[0.3em] text-brand-400/80 transition group-hover:text-brand-200">
                    Rodeo discovery network
                  </p>
                </div>
              </Link>
              <nav className="flex items-center gap-3">
                <Link href="/events" className={`${navLinkClass} hidden sm:inline-flex`}>
                  Events
                </Link>
                <Link href="/venues" className={`${navLinkClass} hidden sm:inline-flex`}>
                  Venues
                </Link>
                <Link href="/services" className={`${navLinkClass} hidden sm:inline-flex`}>
                  Services
                </Link>
                {user ? (
                  <>
                    <Link href="/dashboard" className={navLinkClass}>
                      Dashboard
                    </Link>
                    <details className="relative">
                      <summary className="list-none rounded-full border border-white/10 bg-white/5 p-1 text-brand-100 transition hover:border-brand-300 hover:text-brand-50 [&::-webkit-details-marker]:hidden">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-400/20 text-sm font-semibold text-brand-100">
                          {userInitial}
                        </span>
                      </summary>
                      <div className="absolute right-0 mt-2 min-w-[160px] rounded-2xl border border-white/10 bg-night-900/95 p-2 shadow-glow">
                        <form action={signOut}>
                          <button
                            type="submit"
                            className="w-full rounded-xl px-3 py-2 text-left text-[11px] uppercase tracking-[0.2em] text-slate-200 transition hover:bg-white/10"
                          >
                            Sign out
                          </button>
                        </form>
                      </div>
                    </details>
                  </>
                ) : (
                  <Link href="/sign-in" className={navLinkClass}>
                    Sign In
                  </Link>
                )}
              </nav>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-white/10 bg-night-900/80">
            <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8 text-xs text-slate-400">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs uppercase tracking-[0.3em] text-brand-300">
                  Western Sports Hub
                </span>
                <div className="flex flex-wrap gap-3">
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
              <div className="flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <span>Built for the western community.</span>
                <div className="flex flex-wrap gap-3">
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
          </footer>
        </div>
      </body>
    </html>
  );
}
