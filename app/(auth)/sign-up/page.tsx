import Link from 'next/link';

import AuthSignUpForm from '../AuthSignUpForm';
import { signUpWithEmail } from '../actions';

type SignUpPageProps = {
  searchParams?: {
    error?: string;
  };
};

export default function SignUpPage({ searchParams }: SignUpPageProps) {
  const errorMessage = searchParams?.error ? decodeURIComponent(searchParams.error) : null;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_0.72fr]">
      <div className="rounded-2xl border border-white/10 bg-night-900/80 p-6">
        <h2 className="font-display text-2xl text-slate-100">Create account</h2>
        <p className="mt-2 text-sm text-slate-300">
          Create your account to submit listings and save favorites.
        </p>
        {errorMessage ? (
          <div className="mt-4 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {errorMessage}
          </div>
        ) : null}
        <AuthSignUpForm action={signUpWithEmail} />
      </div>
      <div className="rounded-2xl border border-white/10 bg-night-900/60 p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-brand-300">Already onboard?</p>
          <h3 className="mt-3 font-display text-xl text-slate-100">Sign back in</h3>
          <p className="mt-2 text-sm text-slate-300">
            Return to your dashboard, favorites, and submissions.
          </p>
        </div>
        <div className="mt-6 grid gap-3">
          <Link
            href="/sign-in"
            className="inline-flex w-fit rounded-full border border-white/10 bg-white/5 px-4 py-2 text-center text-xs uppercase tracking-[0.2em] text-brand-200 transition hover:bg-white/10 hover:text-brand-100"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
