import type { Metadata } from 'next';
import Link from 'next/link';
import { Cinzel, Source_Sans_3 } from 'next/font/google';

import './globals.css';

import { getSiteUrl, siteDescription, siteName } from '@/lib/seo/site';
import { createSupabaseServerClient } from '@/lib/supabase/server';

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

  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body>
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-white/10 bg-night-900/90 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <Link href="/" className="group">
                <div>
                  <p className="font-display text-lg tracking-wide text-brand-100 transition group-hover:text-brand-50">
                    Western Sports Hub
                  </p>
                  <p className="text-xs uppercase tracking-[0.3em] text-brand-400/80 transition group-hover:text-brand-200">
                    Rodeo discovery network
                  </p>
                </div>
              </Link>
              <nav className="flex items-center gap-4 text-sm text-slate-300">
                <Link href="/events" className="hidden transition hover:text-slate-100 sm:inline">
                  Events
                </Link>
                <Link href="/venues" className="hidden transition hover:text-slate-100 sm:inline">
                  Venues
                </Link>
                <Link href="/services" className="hidden transition hover:text-slate-100 sm:inline">
                  Services
                </Link>
                {user ? (
                  <Link
                    href="/dashboard"
                    className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-brand-200 transition hover:border-brand-300 hover:text-brand-100"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/sign-in"
                    className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-brand-200 transition hover:border-brand-300 hover:text-brand-100"
                  >
                    Sign In
                  </Link>
                )}
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-brand-200">
                  Beta
                </span>
              </nav>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-white/10 bg-night-900/80">
            <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
              <span>Built for the western community.</span>
              <span>Events and services coming soon.</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
