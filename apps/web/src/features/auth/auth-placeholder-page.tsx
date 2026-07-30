import Link from 'next/link';

import { SurfaceCard } from '@nova/ui';

type AuthPlaceholderPageProps = {
  title: string;
  description: string;
};

export function AuthPlaceholderPage({
  title,
  description,
}: AuthPlaceholderPageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <SurfaceCard className="w-full max-w-xl p-8">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-muted">Auth Route</p>
          <h1 className="font-display text-3xl font-semibold">
            {title}
          </h1>
          <p className="text-base leading-7 text-muted">{description}</p>
        </div>
        <div className="mt-8 flex gap-3">
          <Link
            href="/login"
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white dark:bg-white dark:text-slate-950"
          >
            Back to login
          </Link>
          <Link href="/" className="rounded-full border px-5 py-3 text-sm font-medium">
            Return home
          </Link>
        </div>
      </SurfaceCard>
    </main>
  );
}

