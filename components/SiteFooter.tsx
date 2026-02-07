'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type SiteFooterProps = {
  isAuthenticated: boolean;
};

const compactRoutes = ['/dashboard', '/map', '/events', '/venues', '/services'];

const isCompactRoute = (pathname: string) =>
  compactRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

export default function SiteFooter({ isAuthenticated }: SiteFooterProps) {
  const pathname = usePathname() ?? '/';
  const compact = isCompactRoute(pathname);

  if (compact) {
    return (
      <footer className="border-t border-white/10 bg-night-950/95">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-3">
            <Link href="/events" className="transition hover:text-brand-100">
              Events
            </Link>
            <Link href="/venues" className="transition hover:text-brand-100">
              Venues
            </Link>
            <Link href="/services" className="transition hover:text-brand-100">
              Services
            </Link>
            {isAuthenticated ? (
              <Link href="/dashboard" className="transition hover:text-brand-100">
                Dashboard
              </Link>
            ) : (
              <Link href="/sign-in" className="transition hover:text-brand-100">
                Sign In
              </Link>
            )}
            <Link href="/privacy" className="transition hover:text-brand-100">
              Privacy
            </Link>
            <Link href="/terms" className="transition hover:text-brand-100">
              Terms
            </Link>
          </div>
          <span>&copy; {new Date().getFullYear()} Western Sports Hub.</span>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-white/10 bg-night-950/95">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 text-base text-slate-200 sm:gap-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr]">
          <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-1">
            <span className="text-sm uppercase tracking-[0.3em] text-brand-200">Western Sports Hub</span>
            <p className="text-base leading-relaxed text-slate-100">
              Built for the western community. Discover events, venues, and trusted pros in one
              place.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm uppercase tracking-[0.3em] text-brand-200">Navigate</span>
            <div className="flex flex-col gap-1.5">
              <Link href="/events" className="transition hover:text-brand-100">
                Events
              </Link>
              <Link href="/venues" className="transition hover:text-brand-100">
                Venues
              </Link>
              <Link href="/services" className="transition hover:text-brand-100">
                Services
              </Link>
              {isAuthenticated ? (
                <Link href="/dashboard" className="transition hover:text-brand-100">
                  Dashboard
                </Link>
              ) : (
                <Link href="/sign-in" className="transition hover:text-brand-100">
                  Sign In
                </Link>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm uppercase tracking-[0.3em] text-brand-200">Company</span>
            <div className="flex flex-col gap-1.5">
              <Link href="/about" className="transition hover:text-brand-100">
                About
              </Link>
              <Link href="/contact" className="transition hover:text-brand-100">
                Contact
              </Link>
              <Link href="/privacy" className="transition hover:text-brand-100">
                Privacy Policy
              </Link>
              <Link href="/terms" className="transition hover:text-brand-100">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 border-t border-white/10 pt-5 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; {new Date().getFullYear()} Western Sports Hub.</span>
          <span className="text-slate-300">Rodeo discovery network.</span>
        </div>
      </div>
    </footer>
  );
}
