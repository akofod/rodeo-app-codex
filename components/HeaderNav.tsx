'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type HeaderNavProps = {
  isAuthenticated: boolean;
  userInitial: string;
  onSignOut: () => void;
};

const baseNavLinkClass =
  'inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[13px] font-semibold uppercase tracking-[0.2em] text-brand-200 transition hover:border-brand-300 hover:text-brand-100';
const activeNavLinkClass =
  'border-brand-400/60 bg-brand-400/10 text-brand-100 shadow-[0_0_12px_rgba(216,127,27,0.2)]';
const mobileNavLinkClass =
  'rounded-xl px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-200 transition hover:bg-white/10';
const mobileActiveClass = 'bg-white/10 text-brand-100';

export default function HeaderNav({ isAuthenticated, userInitial, onSignOut }: HeaderNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (!pathname) {
      return false;
    }
    if (href === '/') {
      return pathname === '/';
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const navLinkClass = (href: string) =>
    `${baseNavLinkClass} ${isActive(href) ? activeNavLinkClass : ''}`.trim();

  const mobileLinkClass = (href: string) =>
    `${mobileNavLinkClass} ${isActive(href) ? mobileActiveClass : ''}`.trim();

  return (
    <nav className="flex items-center gap-3">
      <div className="hidden items-center gap-3 sm:flex">
        <Link href="/events" className={navLinkClass('/events')} aria-current={isActive('/events') ? 'page' : undefined}>
          Events
        </Link>
        <Link href="/venues" className={navLinkClass('/venues')} aria-current={isActive('/venues') ? 'page' : undefined}>
          Venues
        </Link>
        <Link href="/services" className={navLinkClass('/services')} aria-current={isActive('/services') ? 'page' : undefined}>
          Services
        </Link>
        {isAuthenticated ? (
          <>
            <Link
              href="/dashboard"
              className={navLinkClass('/dashboard')}
              aria-current={isActive('/dashboard') ? 'page' : undefined}
            >
              Dashboard
            </Link>
            <details className="relative">
              <summary className="list-none rounded-full border border-white/10 bg-white/5 p-1 text-brand-100 transition hover:border-brand-300 hover:text-brand-50 [&::-webkit-details-marker]:hidden">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-400/20 text-sm font-semibold text-brand-100">
                  {userInitial}
                </span>
              </summary>
              <div className="absolute right-0 mt-2 min-w-[160px] rounded-2xl border border-white/10 bg-night-900/95 p-2 shadow-glow">
                <form action={onSignOut}>
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
          <Link href="/sign-in" className={navLinkClass('/sign-in')} aria-current={isActive('/sign-in') ? 'page' : undefined}>
            Sign In
          </Link>
        )}
      </div>
      <details className="relative sm:hidden">
        <summary className="list-none rounded-full border border-white/15 bg-white/5 p-2 text-brand-100 transition hover:border-brand-300 hover:text-brand-50 [&::-webkit-details-marker]:hidden">
          <span className="sr-only">Open menu</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          >
            <path d="M4 7h16" />
            <path d="M4 12h16" />
            <path d="M4 17h16" />
          </svg>
        </summary>
        <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/10 bg-night-900/95 p-2 shadow-glow">
          <div className="flex flex-col gap-1">
            <Link href="/events" className={mobileLinkClass('/events')} aria-current={isActive('/events') ? 'page' : undefined}>
              Events
            </Link>
            <Link href="/venues" className={mobileLinkClass('/venues')} aria-current={isActive('/venues') ? 'page' : undefined}>
              Venues
            </Link>
            <Link
              href="/services"
              className={mobileLinkClass('/services')}
              aria-current={isActive('/services') ? 'page' : undefined}
            >
              Services
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className={mobileLinkClass('/dashboard')}
                  aria-current={isActive('/dashboard') ? 'page' : undefined}
                >
                  Dashboard
                </Link>
                <form action={onSignOut}>
                  <button
                    type="submit"
                    className="w-full rounded-xl px-3 py-2 text-left text-xs uppercase tracking-[0.2em] text-slate-200 transition hover:bg-white/10"
                  >
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <Link href="/sign-in" className={mobileLinkClass('/sign-in')} aria-current={isActive('/sign-in') ? 'page' : undefined}>
                Sign In
              </Link>
            )}
          </div>
        </div>
      </details>
    </nav>
  );
}
