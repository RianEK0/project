'use client';

import { useState } from 'react';
import { LogOut, LoaderCircle, ShieldCheck, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { SurfaceCard, cn } from '@nova/ui';

import { apiClient } from '@/services/api/client';

type LogoutButtonProps = {
  redirectTo?: string;
  tone?: 'dashboard' | 'portal';
  userLabel: string;
  workspaceLabel: string;
};

const toneMap = {
  dashboard: {
    button:
      'border-slate-200 bg-white/80 text-slate-700 hover:border-rose-300 hover:bg-rose-50/80 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200 dark:hover:border-rose-900 dark:hover:bg-rose-950/30',
    confirm: 'bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200',
    icon: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-200',
  },
  portal: {
    button:
      'border-emerald-200 bg-white/85 text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50 dark:border-emerald-900 dark:bg-slate-950/60 dark:text-emerald-200 dark:hover:bg-emerald-950/30',
    confirm: 'bg-emerald-600 text-white hover:bg-emerald-500',
    icon: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200',
  },
} as const;

export function LogoutButton({
  redirectTo = '/login',
  tone = 'dashboard',
  userLabel,
  workspaceLabel,
}: LogoutButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const palette = toneMap[tone];

  async function handleLogout() {
    setIsSubmitting(true);

    try {
      await apiClient.post<{ message?: string }>('/auth/logout');
    } catch {
      // Tetap lanjut membersihkan sesi lokal agar user bisa keluar dengan mulus.
    } finally {
      apiClient.setAccessToken(null);
      setIsSubmitting(false);
      setIsOpen(false);
      toast.success('Anda sudah keluar dari NovaERP.');
      router.replace(redirectTo);
      router.refresh();
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          'inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium transition',
          palette.button,
        )}
      >
        <LogOut className="size-4" />
        Keluar
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Tutup dialog logout"
            onClick={() => !isSubmitting && setIsOpen(false)}
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
          />

          <SurfaceCard className="relative w-full max-w-md rounded-[34px] border-white/60 p-6 shadow-[0_36px_120px_-44px_rgba(15,23,42,0.45)] md:p-7">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'inline-flex size-12 items-center justify-center rounded-2xl',
                    palette.icon,
                  )}
                >
                  <LogOut className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                    Logout
                  </p>
                  <h3 className="font-display text-2xl font-semibold">Keluar dari workspace?</h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => !isSubmitting && setIsOpen(false)}
                className="rounded-2xl border border-slate-200/80 p-2 text-slate-500 transition hover:text-slate-950 dark:border-slate-800 dark:hover:text-slate-50"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="mt-4 text-sm leading-7 text-muted">
              Anda akan mengakhiri sesi aktif di browser ini. Data tetap aman, dan Anda bisa login
              lagi kapan saja.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/55">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">User</p>
                <p className="mt-1 text-sm font-semibold">{userLabel}</p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/55">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Workspace</p>
                <p className="mt-1 text-sm font-semibold">{workspaceLabel}</p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-dashed border-slate-200/80 bg-slate-50/85 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/55">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 inline-flex size-8 items-center justify-center rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                  <ShieldCheck className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Sesi akan ditutup dengan aman</p>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    Token akses lokal dibersihkan dan refresh session ikut diakhiri.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
                className="flex-1 rounded-2xl border border-slate-200/80 px-4 py-3 text-sm font-semibold transition hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => void handleLogout()}
                disabled={isSubmitting}
                className={cn(
                  'inline-flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60',
                  palette.confirm,
                )}
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    Mengakhiri sesi...
                  </>
                ) : (
                  <>
                    <LogOut className="size-4" />
                    Logout sekarang
                  </>
                )}
              </button>
            </div>
          </SurfaceCard>
        </div>
      ) : null}
    </>
  );
}
