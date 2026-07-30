import { ArrowRight, Bot, Boxes, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';

import { SurfaceCard } from '@nova/ui';
import { NovaLogo, NovaLogoMark } from '@/components/nova-logo';

const quickMetrics = [
  { label: 'Tenant', value: '12 aktif' },
  { label: 'Approval', value: '38 pending' },
  { label: 'Cashflow', value: '+18.4%' },
] as const;

const focusCards = [
  {
    icon: ShieldCheck,
    title: 'Kontrol rapi',
    description: 'Akses, approval, dan audit tetap jelas.',
  },
  {
    icon: Boxes,
    title: 'Operasional nyambung',
    description: 'Finance, warehouse, sales, dan procurement tetap satu alur.',
  },
  {
    icon: Bot,
    title: 'AI lebih jelas',
    description: 'Jawaban lebih mudah dipahami dan ada langkah lanjut.',
  },
] as const;

const productSignals = [
  'Dashboard bersih',
  'Ekspor cepat',
  'AI yang jelas',
] as const;

export default function PublicHomePage() {
  return (
    <main className="hero-grid relative min-h-screen overflow-hidden px-4 py-6 md:px-8 md:py-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(circle_at_15%_20%,rgba(34,211,238,0.16),transparent_26%),radial-gradient(circle_at_85%_18%,rgba(14,165,233,0.12),transparent_24%)]" />
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="surface flex items-center justify-between gap-4 rounded-full border border-white/60 px-5 py-3 shadow-[0_18px_50px_-34px_rgba(15,23,42,0.32)]">
          <NovaLogo caption={null} />
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-full border border-slate-300/80 px-4 py-2 text-sm font-medium transition hover:border-sky-300 dark:border-slate-700"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              Mulai
            </Link>
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
          <SurfaceCard
            tone="accent"
            className="relative overflow-hidden rounded-[40px] border-white/70 px-8 py-9 md:px-10 md:py-11"
          >
            <div className="absolute inset-y-0 right-0 hidden w-[42%] bg-gradient-to-l from-sky-400/10 to-transparent lg:block" />
            <div className="absolute -left-10 bottom-10 size-40 rounded-full bg-cyan-300/18 blur-3xl" />
            <div className="relative z-10 max-w-2xl space-y-7">
              <div className="space-y-4">
                <span className="inline-flex rounded-full border border-sky-200/70 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700 shadow-sm dark:border-sky-900/60 dark:bg-slate-950/35 dark:text-sky-300">
                  NovaERP
                </span>
                <h1 className="font-display text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl dark:text-slate-50">
                  ERP enterprise yang rapi, cepat, dan enak dipakai.
                </h1>
                <p className="max-w-xl text-base leading-7 text-muted md:text-lg">
                  Operasi, finance, warehouse, sales, dan AI dalam satu workspace yang terasa
                  tenang.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                >
                  Buka workspace
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/app"
                  className="rounded-full border border-slate-300/80 bg-white/65 px-5 py-3 text-sm font-semibold transition hover:border-sky-300 dark:border-slate-700 dark:bg-slate-950/20"
                >
                  Lihat dashboard
                </Link>
              </div>

              <div className="flex flex-wrap gap-2">
                {productSignals.map((signal) => (
                  <span
                    key={signal}
                    className="rounded-full border border-white/70 bg-white/72 px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950/35 dark:text-slate-200"
                  >
                    {signal}
                  </span>
                ))}
              </div>
            </div>
          </SurfaceCard>

          <div className="grid gap-4">
            <SurfaceCard className="relative overflow-hidden rounded-[40px] border-white/70 p-7 md:p-8">
              <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/70 to-transparent" />
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
                    Workspace live
                  </p>
                  <h2 className="font-display text-2xl font-semibold text-slate-950 dark:text-slate-50">
                    Ringkas, langsung ke inti
                  </h2>
                </div>
                <NovaLogoMark className="size-12" />
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {quickMetrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-3xl border border-slate-200/80 bg-white/82 px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/55"
                  >
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
                      {metric.label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">
                      {metric.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[28px] border border-slate-200/80 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/55">
                <div className="flex items-center gap-3">
                  <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                    <Sparkles className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">
                      AI assistant
                    </p>
                    <p className="text-sm text-muted">Jawaban lebih jelas dan mudah dipahami.</p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white dark:bg-white dark:text-slate-950">
                    Ringkasan penjualan siap dibaca
                  </div>
                  <div className="rounded-2xl border border-slate-200/80 px-4 py-3 text-sm dark:border-slate-800">
                    Rekomendasi stok disertai alasan
                  </div>
                  <div className="rounded-2xl border border-slate-200/80 px-4 py-3 text-sm dark:border-slate-800">
                    Langkah lanjut diarahkan ke modul terkait
                  </div>
                </div>
              </div>
            </SurfaceCard>

            <div className="grid gap-4 md:grid-cols-3">
              {focusCards.map((card) => {
                const Icon = card.icon;

                return (
                  <SurfaceCard key={card.title} className="rounded-[32px] p-6">
                    <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="mt-5 font-display text-2xl font-semibold text-slate-950 dark:text-slate-50">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-muted">{card.description}</p>
                  </SurfaceCard>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
