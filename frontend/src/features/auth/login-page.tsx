import { startTransition } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { ArrowRight, Building2, CalendarClock, LockKeyhole, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/features/auth/auth-context'
import { login } from '@/features/auth/api'
import { env } from '@/lib/env'
import { getErrorMessage } from '@/lib/http'

const loginSchema = z.object({
  email: z.email({ message: 'Email harus valid.' }),
  password: z.string().min(8, 'Password minimal 8 karakter.'),
})

type LoginValues = z.infer<typeof loginSchema>

const highlights = [
  {
    title: 'Workforce',
    description: 'Direktori karyawan, struktur tim, dan status kepegawaian dalam satu tempat.',
    icon: Users,
  },
  {
    title: 'Organization',
    description: 'Department, team, dan reporting line siap dipakai untuk operasi harian.',
    icon: Building2,
  },
  {
    title: 'Leave Flow',
    description: 'Pengajuan cuti bergerak dari employee ke manager lalu HR tanpa pindah layar.',
    icon: CalendarClock,
  },
  {
    title: 'Governance',
    description: 'Approval, audit trail, dan proteksi role sudah aktif sejak fondasi pertama.',
    icon: Sparkles,
  },
]

export function LoginPage() {
  const navigate = useNavigate()
  const { setSession } = useAuth()
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@enterprise-hris.local',
      password: 'Password123!',
    },
  })

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (session) => {
      startTransition(() => {
        setSession(session)
        navigate('/dashboard')
      })
    },
  })

  const onSubmit = form.handleSubmit((values) => mutation.mutate(values))

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-[1520px] gap-6 px-4 py-5 lg:grid-cols-[1.12fr_0.88fr] xl:px-6">
      <section className="panel hero-panel relative flex flex-col justify-between p-8 lg:p-10 xl:p-12">
        <div className="relative space-y-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-200">
              <LockKeyhole className="h-3.5 w-3.5" />
              Enterprise HRIS
            </div>
            <h1 className="max-w-4xl text-4xl font-extrabold tracking-[-0.05em] text-white md:text-6xl">
              Satu ruang kerja untuk operasi people, approval, dan kontrol.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-slate-200 md:text-lg">
              Tampilan ini sekarang diarahkan menjadi lebih tegas dan operasional:
              bukan landing page generik, tetapi control surface untuk tim HR,
              line manager, dan administrator.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {highlights.map(({ title, description, icon: Icon }, index) => (
              <article
                className="stagger-rise rounded-[26px] border border-white/10 bg-white/7 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm"
                key={title}
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <div className="mb-4 inline-flex rounded-2xl bg-white/10 px-3 py-3 text-[color:var(--app-highlight)]">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-white">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-black/12 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-slate-300">
                Pilot Accounts
              </p>
              <p className="mt-2 text-lg font-bold text-white">
                Gunakan akun seed untuk meninjau dashboard, approval, dan audit trail.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm font-semibold text-white">
              {env.appName}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Badge className="border-white/10 bg-white/8 text-white" variant="neutral">
              admin@enterprise-hris.local
            </Badge>
            <Badge className="border-white/10 bg-white/8 text-white" variant="neutral">
              alya.pratama@enterprise-hris.local
            </Badge>
            <Badge className="border-white/10 bg-white/8 text-white" variant="neutral">
              rafi.saputra@enterprise-hris.local
            </Badge>
            <Badge className="border-white/10 bg-white/8 text-white" variant="neutral">
              Password123!
            </Badge>
          </div>
        </div>
      </section>

      <section className="panel mesh-card p-6 lg:p-8 xl:p-10">
        <Card className="border-none bg-transparent p-0 shadow-none">
          <CardHeader>
            <div className="section-kicker w-fit">Secure Access</div>
            <CardTitle className="pt-3 text-3xl">Masuk ke ruang kerja HR</CardTitle>
            <CardDescription>
              Gunakan akun kerja atau seed account untuk mulai meninjau modul yang sudah aktif.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="admin@enterprise-hris.local"
                  {...form.register('email')}
                />
                <p className="text-sm text-rose-700">
                  {form.formState.errors.email?.message}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password123!"
                  {...form.register('password')}
                />
                <p className="text-sm text-rose-700">
                  {form.formState.errors.password?.message}
                </p>
              </div>

              {mutation.isError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {getErrorMessage(mutation.error)}
                </div>
              ) : null}

              <Button className="w-full" size="lg" type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Signing in...' : 'Masuk ke Dashboard'}
                <ArrowRight className="h-4 w-4" />
              </Button>

              <div className="rounded-[24px] border border-app-border bg-black/4 px-4 py-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-app-foreground">
                  <ShieldCheck className="h-4 w-4 text-[color:var(--app-highlight)]" />
                  Kredensial awal
                </div>
                <p className="mt-2 text-sm leading-6 text-app-muted-foreground">
                  Admin default:
                  {' '}
                  <strong>admin@enterprise-hris.local</strong>
                  {' / '}
                  <strong>Password123!</strong>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
