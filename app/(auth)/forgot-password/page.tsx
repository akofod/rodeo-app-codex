import Link from 'next/link';

import { requestPasswordReset } from '../actions';

type ForgotPasswordPageProps = {
  searchParams?: {
    error?: string;
    success?: string;
  };
};

export default function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const errorMessage = searchParams?.error ? decodeURIComponent(searchParams.error) : null;
  const successMessage = searchParams?.success ? decodeURIComponent(searchParams.success) : null;

  return (
    <div className="mx-auto w-full max-w-xl rounded-2xl border border-white/10 bg-night-900/80 p-6">
      <h2 className="font-display text-2xl text-slate-100">Reset password</h2>
      <p className="mt-2 text-sm text-slate-200">
        Enter the email for your account and we will send a password reset link.
      </p>
      {errorMessage ? (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100"
        >
          {errorMessage}
        </div>
      ) : null}
      {successMessage ? (
        <div
          role="status"
          className="mt-4 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100"
        >
          {successMessage}
        </div>
      ) : null}
      <form action={requestPasswordReset} className="mt-6 grid gap-4">
        <label className="grid gap-2 text-sm text-slate-200">
          Email
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            className="rounded-xl border border-white/10 bg-night-800/80 px-4 py-2 text-slate-100 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/60"
            placeholder="you@example.com"
          />
        </label>
        <button
          type="submit"
          className="rounded-full border border-brand-400/50 bg-brand-400/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand-100 transition hover:border-brand-300 hover:bg-brand-400/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/60"
        >
          Send reset link
        </button>
      </form>
      <Link
        href="/sign-in"
        className="mt-4 inline-flex text-xs uppercase tracking-[0.2em] text-brand-200 transition hover:text-brand-100"
      >
        Back to sign in
      </Link>
    </div>
  );
}
