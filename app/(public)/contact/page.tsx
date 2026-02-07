import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact | Western Sports Hub',
};

export default function ContactPage() {
  return (
    <section className="mx-auto grid w-full max-w-5xl gap-6 px-6 py-16 md:px-10">
      <p className="text-xs uppercase tracking-[0.28em] text-brand-100/90">Company</p>
      <h1 className="font-display text-4xl uppercase tracking-[0.08em] text-slate-100 md:text-5xl">
        Contact
      </h1>
      <p className="max-w-3xl text-base text-slate-200/90 md:text-lg">
        For listing support or partnership inquiries, reach out to the Western Sports Hub team at
        support@westernsportshub.com.
      </p>
    </section>
  );
}
