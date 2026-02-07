'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';

type AuthSignUpFormProps = {
  action: (formData: FormData) => void;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthSignUpForm({ action }: AuthSignUpFormProps) {
  const emailErrorId = 'sign-up-email-error';
  const passwordErrorId = 'sign-up-password-error';
  const consentErrorId = 'sign-up-consent-error';
  const passwordHintId = 'sign-up-password-hint';
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [consentError, setConsentError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');
    const acceptedTerms = formData.get('accept_terms') === 'on';

    let hasError = false;
    if (!emailPattern.test(email)) {
      setEmailError('Enter a valid email address.');
      hasError = true;
    } else {
      setEmailError(null);
    }

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      hasError = true;
    } else {
      setPasswordError(null);
    }

    if (!acceptedTerms) {
      setConsentError('You must accept the terms to create an account.');
      hasError = true;
    } else {
      setConsentError(null);
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
        Full name
        <input
          type="text"
          name="fullName"
          autoComplete="name"
          className="rounded-xl border border-white/10 bg-night-800/80 px-4 py-2 text-slate-100 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/60"
          placeholder="Riley Morgan"
        />
      </label>
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
            autoComplete="new-password"
            required
            minLength={6}
            aria-invalid={Boolean(passwordError)}
            aria-describedby={
              passwordError ? `${passwordHintId} ${passwordErrorId}` : passwordHintId
            }
            className="w-full bg-transparent text-slate-100 placeholder:text-slate-400 focus:outline-none"
            placeholder="Minimum 6 characters"
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
        <span id={passwordHintId} className="text-xs text-slate-300">
          Use at least 6 characters and avoid reusing passwords from other apps.
        </span>
        {passwordError ? (
          <span id={passwordErrorId} role="alert" className="text-xs text-red-200">
            {passwordError}
          </span>
        ) : null}
      </label>
      <p className="text-xs text-slate-300">
        By creating an account you agree to the Terms of Service and Privacy Policy.
      </p>
      <label className="flex items-start gap-2 text-xs text-slate-200">
        <input
          type="checkbox"
          name="accept_terms"
          aria-invalid={Boolean(consentError)}
          aria-describedby={consentError ? consentErrorId : undefined}
          className="mt-0.5 h-4 w-4 accent-brand-400"
        />
        <span>
          I agree to the{' '}
          <Link
            href="/terms"
            className="text-brand-200 underline underline-offset-4 hover:text-brand-100"
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link
            href="/privacy"
            className="text-brand-200 underline underline-offset-4 hover:text-brand-100"
          >
            Privacy Policy
          </Link>
          .
        </span>
      </label>
      {consentError ? (
        <span id={consentErrorId} role="alert" className="text-xs text-red-200">
          {consentError}
        </span>
      ) : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 rounded-full border border-brand-400/50 bg-brand-400/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand-100 transition hover:border-brand-300 hover:bg-brand-400/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300/60 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Creating account...' : 'Create account'}
      </button>
    </form>
  );
}
