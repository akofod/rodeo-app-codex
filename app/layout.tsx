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
                  <p className="font-display text-sm tracking-wide text-brand-100 transition group-hover:text-brand-50 sm:text-base lg:text-lg">
                    Western Sports Hub
                  </p>
                  <p className="hidden text-xs uppercase tracking-[0.3em] text-brand-200 transition group-hover:text-brand-100 lg:block">
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
          <main className="flex-1">{children}</main>
          <footer className="border-t border-white/10 bg-night-950/95">
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
              <div className="flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-slate-200 sm:flex-row sm:items-center sm:justify-between">
                <span>&copy; {new Date().getFullYear()} Western Sports Hub.</span>
                <span className="text-slate-300">Rodeo discovery network.</span>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

