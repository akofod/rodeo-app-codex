'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';

type AuthSignInFormProps = {
  action: (formData: FormData) => void;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthSignInForm({ action }: AuthSignInFormProps) {
  const emailErrorId = 'sign-in-email-error';
  const passwordErrorId = 'sign-in-password-error';
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    let hasError = false;
    if (!emailPattern.test(email)) {
      setEmailError('Enter a valid email address.');
      hasError = true;
    } else {
      setEmailError(null);
    }

    if (!password) {
      setPasswordError('Enter your password.');
      hasError = true;
    } else {
      setPasswordError(null);
    }

    if (hasError) {
      event.preventDefault();
      return;
    }

    setIsSubmitting(true);
  };

  return (
    <form action={action} onSubmit={handleSubmit} className="mt-6 grid gap-4">
      <label className="grid gap-2 text-sm text-slate-200">
        Email
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          aria-invalid={Boolean(emailError)}
          aria-describedby={emailError ? emailErrorId : undefined}
          className="rounded-xl border border-white/10 bg-night-800/80 px-4 py-2 text-slate-100 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/60"
          placeholder="you@example.com"
        />
        {emailError ? (
          <span id={emailErrorId} role="alert" className="text-xs text-red-200">
            {emailError}
          </span>
        ) : null}
      </label>
      <label className="grid gap-2 text-sm text-slate-200">
        Password
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-night-800/80 px-3 py-2 focus-within:ring-2 focus-within:ring-brand-300/60">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            autoComplete="current-password"
            required
            aria-invalid={Boolean(passwordError)}
            aria-describedby={passwordError ? passwordErrorId : undefined}
            className="w-full bg-transparent text-slate-100 placeholder:text-slate-400 focus:outline-none"
            placeholder="********"
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
            className="text-xs uppercase tracking-[0.18em] text-brand-200 transition hover:text-brand-100"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        {passwordError ? (
          <span id={passwordErrorId} role="alert" className="text-xs text-red-200">
            {passwordError}
          </span>
        ) : null}
      </label>
      <div className="flex items-center justify-end">
        <Link
          href="/forgot-password"
          className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-200 transition hover:text-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/60"
        >
          Forgot password?
        </Link>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 rounded-full border border-brand-400/50 bg-brand-400/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand-100 transition hover:border-brand-300 hover:bg-brand-400/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/60 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
