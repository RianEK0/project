import type { PropsWithChildren, ReactNode } from 'react'
import { KeyRound, MailCheck, ShieldCheck, Smartphone, TimerReset } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { env } from '@/lib/env'

const highlights = [
  {
    title: 'Adaptive Login',
    description: 'JWT access token, rotating refresh token, remember me, dan challenge 2FA.',
    icon: KeyRound,
  },
  {
    title: 'Trusted Devices',
    description: 'Setiap perangkat login dicatat sebagai session yang bisa dicabut satu per satu.',
    icon: Smartphone,
  },
  {
    title: 'Identity Proofing',
    description: 'Email verification, password reset aman, CAPTCHA, dan lockout berbasis percobaan.',
    icon: MailCheck,
  },
  {
    title: 'Continuous Audit',
    description: 'Riwayat login dan perubahan keamanan tersusun sebagai jejak operasi yang bisa ditinjau.',
    icon: TimerReset,
  },
]

interface AuthShellProps extends PropsWithChildren {
  kicker: string
  title: string
  description: string
  footer?: ReactNode
}

export function AuthShell({
  kicker,
  title,
  description,
  footer,
  children,
}: AuthShellProps) {
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-[1520px] gap-6 px-4 py-5 lg:grid-cols-[1.04fr_0.96fr] xl:px-6">
      <section className="panel hero-panel relative flex flex-col justify-between p-8 lg:p-10 xl:p-12">
        <div className="space-y-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              {kicker}
            </div>
            <h1 className="max-w-4xl text-4xl font-extrabold tracking-[-0.05em] text-white md:text-6xl">
              Lapisan autentikasi yang siap untuk operasi HR skala besar.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-slate-200 md:text-lg">
              Autentikasi modern di sini bukan sekadar halaman login, tetapi control plane
              untuk identitas, perangkat, dan jejak keamanan.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {highlights.map(({ title: itemTitle, description: itemDescription, icon: Icon }, index) => (
              <article
                className="stagger-rise rounded-[26px] border border-white/10 bg-white/7 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm"
                key={itemTitle}
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <div className="mb-4 inline-flex rounded-2xl bg-white/10 px-3 py-3 text-[color:var(--app-highlight)]">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-white">{itemTitle}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {itemDescription}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-black/12 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-slate-300">
                Security Surface
              </p>
              <p className="mt-2 text-lg font-bold text-white">
                Session-aware, multi-device, dan siap untuk audit operasional.
              </p>
            </div>
            <Badge className="border-white/10 bg-white/8 text-white" variant="neutral">
              {env.appName}
            </Badge>
          </div>
        </div>
      </section>

      <section className="panel mesh-card p-6 lg:p-8 xl:p-10">
        <Card className="border-none bg-transparent p-0 shadow-none">
          <CardHeader>
            <div className="section-kicker w-fit">{kicker}</div>
            <CardTitle className="pt-3 text-3xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {children}
            {footer}
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
