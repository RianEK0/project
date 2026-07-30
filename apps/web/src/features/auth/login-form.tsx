'use client';

import { ArrowRight, Boxes, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@nova/validation';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { SurfaceCard } from '@nova/ui';
import { NovaLogo, NovaLogoMark } from '@/components/nova-logo';
import { apiClient } from '@/services/api/client';

const formSchema = loginSchema.extend({
  rememberMe: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const DEMO_PASSWORD = 'NovaERP@123';

const demoAccounts = [
  {
    label: 'Admin',
    email: 'admin@novaerp.local',
    password: DEMO_PASSWORD,
  },
  {
    label: 'Owner',
    email: 'owner@novaerp.local',
    password: DEMO_PASSWORD,
  },
] as const;

const quickHighlights = [
  {
    icon: ShieldCheck,
    label: 'Akses',
    value: 'Login aman',
  },
  {
    icon: Boxes,
    label: 'Modul',
    value: 'Siap dipakai',
  },
  {
    icon: Sparkles,
    label: 'AI',
    value: 'Jawaban jelas',
  },
] as const;

export function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: 'admin@novaerp.local',
      password: DEMO_PASSWORD,
      rememberMe: true,
    },
  });

  async function signIn(email: string, password: string): Promise<void> {
    setIsSubmitting(true);

    try {
      const response = await apiClient.post<{
        data?: {
          accessToken?: string;
        };
      }>('/auth/login', {
        email,
        password,
      });

      apiClient.setAccessToken(response.data?.accessToken ?? null);
      toast.success('Login berhasil. Mengarahkan ke workspace...');
      router.push('/app');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sign in.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onSubmit(values: FormValues): Promise<void> {
    await signIn(values.email, values.password);
  }

  async function signInAsDemo(email: string, password: string): Promise<void> {
    reset({
      email,
      password,
      rememberMe: true,
    });

    await signIn(email, password);
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 md:px-8 md:py-10">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#eef6ff_0%,#f8fbff_48%,#eef2ff_100%)] dark:bg-[linear-gradient(180deg,#020617_0%,#071225_52%,#0f172a_100%)]" />
      <div className="pointer-events-none absolute left-[8%] top-14 size-72 rounded-full bg-sky-400/18 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 right-[10%] size-80 rounded-full bg-cyan-300/14 blur-3xl" />

      <div className="relative mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl items-center gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="surface relative overflow-hidden rounded-[36px] border border-white/60 p-8 md:p-10">
          <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/60 to-transparent" />
          <div className="absolute -right-14 top-10 size-44 rounded-full border border-white/50 bg-white/35 blur-2xl dark:border-slate-700 dark:bg-slate-900/20" />

          <NovaLogo caption={null} markClassName="size-14" />

          <div className="mt-10 max-w-xl space-y-4">
            <span className="inline-flex rounded-full border border-sky-200/70 bg-white/65 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-700 shadow-sm dark:border-sky-900/60 dark:bg-slate-950/30 dark:text-sky-300">
              Demo login
            </span>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl dark:text-slate-50">
              Masuk cepat ke workspace NovaERP.
            </h1>
            <p className="max-w-lg text-base leading-7 text-muted md:text-lg">
              Pakai akun demo yang sudah siap atau login dengan akun Anda sendiri.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {quickHighlights.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="rounded-3xl border border-white/65 bg-white/70 px-4 py-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/40"
                >
                  <div className="mb-4 inline-flex size-10 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                    <Icon className="size-4" />
                  </div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
                    {item.label}
                  </p>
                  <p className="mt-1 text-base font-semibold text-slate-950 dark:text-slate-50">
                    {item.value}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <SurfaceCard className="rounded-[36px] border border-white/60 bg-white/88 p-7 shadow-[0_32px_90px_-42px_rgba(15,23,42,0.45)] backdrop-blur md:p-8 dark:border-slate-800 dark:bg-slate-950/82">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
                Login
              </p>
              <h2 className="font-display text-3xl font-semibold text-slate-950 dark:text-slate-50">
                Masuk ke NovaERP
              </h2>
            </div>
            <NovaLogoMark className="size-12" />
          </div>

          <div className="mb-6 grid gap-2 sm:grid-cols-2">
            {demoAccounts.map((account) => (
              <button
                key={account.email}
                type="button"
                disabled={isSubmitting}
                onClick={() => signInAsDemo(account.email, account.password)}
                className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-left text-sm shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:bg-white disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950/50 dark:hover:border-sky-800 dark:hover:bg-slate-950"
              >
                <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  {account.label}
                </span>
                <span className="mt-1 block font-medium text-slate-950 dark:text-slate-50">
                  {account.email}
                </span>
              </button>
            ))}
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="w-full rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3.5 text-sm shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white dark:border-slate-800 dark:bg-slate-950/60 dark:focus:border-sky-700"
                {...register('email')}
              />
              {errors.email && <p className="text-sm text-rose-600">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="w-full rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3.5 text-sm shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:bg-white dark:border-slate-800 dark:bg-slate-950/60 dark:focus:border-sky-700"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-rose-600">{errors.password.message}</p>
              )}
            </div>

            <label className="flex items-center gap-3 text-sm text-muted">
              <input
                type="checkbox"
                className="size-4 rounded border border-slate-300 dark:border-slate-700"
                {...register('rememberMe')}
              />
              Tetap masuk
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              {isSubmitting ? 'Memproses...' : 'Masuk'}
              {!isSubmitting && <ArrowRight className="size-4" />}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm text-muted">
            <Link href="/forgot-password">Lupa password</Link>
            <Link href="/register">Buat akun</Link>
          </div>
        </SurfaceCard>
      </div>
    </main>
  );
}
