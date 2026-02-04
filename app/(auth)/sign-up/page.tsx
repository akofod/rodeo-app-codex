import Link from 'next/link';

import { signUpWithEmail, signInWithGoogle } from '../actions';

type SignUpPageProps = {
  searchParams?: {
    error?: string;
  };
};

export default function SignUpPage({ searchParams }: SignUpPageProps) {
  const errorMessage = searchParams?.error ? decodeURIComponent(searchParams.error) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-2xl border border-white/10 bg-night-900/80 p-6">
        <h2 className="font-display text-2xl text-slate-100">Create account</h2>
        <p className="mt-2 text-sm text-slate-300">
          Start listing events, venues, and trusted service providers.
        </p>
        {errorMessage ? (
          <div className="mt-4 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {errorMessage}
          </div>
        ) : null}
        <form action={signUpWithEmail} className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm text-slate-300">
            Full name
            <input
              type="text"
              name="fullName"
              autoComplete="name"
              className="rounded-xl border border-white/10 bg-night-800/80 px-4 py-2 text-slate-100 placeholder:text-slate-500"
              placeholder="Riley Morgan"
            />
          </label>
          <label className="grid gap-2 text-sm text-slate-300">
            Email
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              className="rounded-xl border border-white/10 bg-night-800/80 px-4 py-2 text-slate-100 placeholder:text-slate-500"
              placeholder="you@example.com"
            />
          </label>
          <label className="grid gap-2 text-sm text-slate-300">
            Password
            <input
              type="password"
              name="password"
              autoComplete="new-password"
              required
              className="rounded-xl border border-white/10 bg-night-800/80 px-4 py-2 text-slate-100 placeholder:text-slate-500"
              placeholder="Minimum 6 characters"
            />
          </label>
          <button
            type="submit"
            className="mt-2 rounded-full border border-brand-400/50 bg-brand-400/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand-100 transition hover:border-brand-300 hover:bg-brand-400/30"
          >
            Create account
          </button>
        </form>
      </div>
      <div className="flex flex-col justify-between gap-6 rounded-2xl border border-white/10 bg-night-900/60 p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-brand-300">Already onboard?</p>
          <h3 className="mt-3 font-display text-xl text-slate-100">Sign back in</h3>
          <p className="mt-2 text-sm text-slate-300">
            Pick up where you left off with submissions and favorites.
          </p>
        </div>
        <div className="grid gap-3">
          <form action={signInWithGoogle}>
            <button
              type="submit"
              className="w-full rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-100 transition hover:bg-white/10"
            >
              Continue with Google
            </button>
          </form>
          <Link
            href="/sign-in"
            className="text-center text-sm uppercase tracking-[0.2em] text-brand-200 hover:text-brand-100"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
