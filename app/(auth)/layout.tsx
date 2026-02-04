export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden px-6 py-16 sm:py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(216,127,27,0.18),_transparent_60%)]" />
      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-10">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.3em] text-brand-300">Access</p>
          <h1 className="mt-4 font-display text-3xl text-slate-100 sm:text-4xl">
            Join the Western Sports Hub
          </h1>
          <p className="mt-3 text-sm text-slate-300">
            Keep your listings, favorites, and approvals in one place.
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-night-800/80 p-6 shadow-glow sm:p-8">
          {children}
        </div>
      </div>
    </section>
  );
}
