import { startTransition, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowRight, KeyRound, LifeBuoy, MailWarning, ShieldCheck } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { login, getCaptcha, verifyTwoFactorLogin } from '@/features/auth/api'
import { AuthShell } from '@/features/auth/auth-shell'
import { CaptchaBlock } from '@/features/auth/captcha-block'
import { useAuth } from '@/features/auth/auth-context'
import { getErrorData, getErrorMessage } from '@/lib/http'
import type { TwoFactorChallenge } from '@/types/api'

const loginSchema = z.object({
  email: z.email({ message: 'Email harus valid.' }),
  password: z.string().min(8, 'Password minimal 8 karakter.'),
  remember: z.boolean(),
})

const twoFactorSchema = z
  .object({
    code: z.string(),
    recovery_code: z.string(),
  })
  .refine(
    (value) => value.code.trim().length > 0 || value.recovery_code.trim().length > 0,
    'Masukkan kode authenticator atau recovery code.',
  )

type LoginValues = z.infer<typeof loginSchema>
type TwoFactorValues = z.infer<typeof twoFactorSchema>

function resolveDeviceName() {
  if (typeof window === 'undefined') {
    return null
  }

  const platform = window.navigator.platform || 'Unknown platform'
  const language = window.navigator.language || 'Unknown locale'

  return `${platform} · ${language}`
}

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setSession } = useAuth()
  const [captchaAnswer, setCaptchaAnswer] = useState('')
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null)
  const [twoFactorChallenge, setTwoFactorChallenge] = useState<TwoFactorChallenge | null>(null)
  const [twoFactorMode, setTwoFactorMode] = useState<'authenticator' | 'recovery'>('authenticator')

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@enterprise-hris.local',
      password: 'Password123!',
      remember: true,
    },
  })

  const twoFactorForm = useForm<TwoFactorValues>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: {
      code: '',
      recovery_code: '',
    },
  })

  const captchaQuery = useQuery({
    queryKey: ['auth', 'captcha', 'login'],
    queryFn: getCaptcha,
  })

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      if ('requires_two_factor' in response) {
        setTwoFactorChallenge(response)
        setUnverifiedEmail(null)
        return
      }

      startTransition(() => {
        setSession(response)
        navigate('/dashboard')
      })
    },
    onError: (error) => {
      setTwoFactorChallenge(null)
      void captchaQuery.refetch()
      setCaptchaAnswer('')

      const errorData = getErrorData<{ requires_email_verification?: boolean; email?: string }>(error)
      setUnverifiedEmail(errorData?.requires_email_verification ? errorData.email ?? null : null)
    },
  })

  const twoFactorMutation = useMutation({
    mutationFn: verifyTwoFactorLogin,
    onSuccess: (response) => {
      startTransition(() => {
        setSession(response)
        navigate('/dashboard')
      })
    },
  })

  const onSubmit = loginForm.handleSubmit((values) => {
    if (!captchaQuery.data) {
      return
    }

    loginMutation.mutate({
      email: values.email,
      password: values.password,
      remember: values.remember,
      captcha_id: captchaQuery.data.captcha_id,
      captcha_answer: captchaAnswer,
      device_name: resolveDeviceName(),
    })
  })

  const onSubmitTwoFactor = twoFactorForm.handleSubmit((values) => {
    if (!twoFactorChallenge) {
      return
    }

    twoFactorMutation.mutate({
      challenge_id: twoFactorChallenge.challenge_id,
      code: values.code.trim() || undefined,
      recovery_code: values.recovery_code.trim() || undefined,
    })
  })

  const statusNotice = searchParams.get('verified') === '1'
    ? 'Email berhasil diverifikasi. Silakan masuk kembali.'
    : searchParams.get('reset') === 'success'
      ? 'Password berhasil direset. Gunakan password baru Anda untuk masuk.'
      : searchParams.get('passwordChanged') === '1'
        ? 'Password berhasil diperbarui. Silakan masuk kembali.'
        : null

  return (
    <AuthShell
      kicker="Secure Access"
      title={twoFactorChallenge ? 'Verifikasi langkah kedua' : 'Masuk ke ruang kerja HR'}
      description={
        twoFactorChallenge
          ? 'Kredensial utama sudah valid. Selesaikan challenge authenticator atau recovery code untuk membuka session perangkat.'
          : 'JWT access token, refresh rotation, session per-device, dan audit login sudah aktif di permukaan autentikasi ini.'
      }
      footer={(
        <div className="rounded-[24px] border border-app-border bg-black/4 px-4 py-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-app-foreground">
            <ShieldCheck className="h-4 w-4 text-[color:var(--app-highlight)]" />
            Seed accounts untuk validasi cepat
          </div>
          <p className="mt-2 text-sm leading-6 text-app-muted-foreground">
            Administrator:
            {' '}
            <strong>admin@enterprise-hris.local</strong>
            {' / '}
            <strong>Password123!</strong>
          </p>
        </div>
      )}
    >
      {statusNotice ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {statusNotice}
        </div>
      ) : null}

      {unverifiedEmail ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Email
          {' '}
          <strong>{unverifiedEmail}</strong>
          {' '}
          belum diverifikasi. Sistem sudah mengirim ulang tautan verifikasi ke email tersebut.
        </div>
      ) : null}

      {twoFactorChallenge ? (
        <form className="space-y-5" onSubmit={onSubmitTwoFactor}>
          <div className="rounded-[24px] border border-app-border bg-white/68 p-4">
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                type="button"
                variant={twoFactorMode === 'authenticator' ? 'default' : 'secondary'}
                onClick={() => setTwoFactorMode('authenticator')}
              >
                <KeyRound className="h-4 w-4" />
                Authenticator
              </Button>
              <Button
                size="sm"
                type="button"
                variant={twoFactorMode === 'recovery' ? 'default' : 'secondary'}
                onClick={() => setTwoFactorMode('recovery')}
              >
                <LifeBuoy className="h-4 w-4" />
                Recovery Code
              </Button>
            </div>
          </div>

          {twoFactorMode === 'authenticator' ? (
            <div className="space-y-2">
              <Label htmlFor="code">Kode Authenticator</Label>
              <Input
                id="code"
                inputMode="numeric"
                placeholder="123456"
                {...twoFactorForm.register('code')}
              />
              <p className="text-sm text-rose-700">
                {twoFactorForm.formState.errors.code?.message ?? twoFactorForm.formState.errors.root?.message}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="recovery_code">Recovery Code</Label>
              <Input
                id="recovery_code"
                placeholder="MASUKKANRECOVERY"
                {...twoFactorForm.register('recovery_code')}
              />
              <p className="text-sm text-rose-700">
                {twoFactorForm.formState.errors.recovery_code?.message ?? twoFactorForm.formState.errors.root?.message}
              </p>
            </div>
          )}

          {twoFactorMutation.isError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {getErrorMessage(twoFactorMutation.error)}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={twoFactorMutation.isPending}>
              {twoFactorMutation.isPending ? 'Verifying...' : 'Selesaikan Login'}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setTwoFactorChallenge(null)
                twoFactorForm.reset()
              }}
            >
              Kembali
            </Button>
          </div>
        </form>
      ) : (
        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="admin@enterprise-hris.local"
              {...loginForm.register('email')}
            />
            <p className="text-sm text-rose-700">{loginForm.formState.errors.email?.message}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Password123!"
              {...loginForm.register('password')}
            />
            <p className="text-sm text-rose-700">{loginForm.formState.errors.password?.message}</p>
          </div>

          <label className="flex items-center gap-3 rounded-[20px] border border-app-border bg-white/54 px-4 py-3 text-sm font-medium text-app-foreground">
            <input
              className="h-4 w-4 rounded border-app-border accent-[color:var(--app-highlight)]"
              type="checkbox"
              {...loginForm.register('remember')}
            />
            Simpan session lebih lama di perangkat ini
          </label>

          <CaptchaBlock
            challenge={captchaQuery.data}
            disabled={loginMutation.isPending || captchaQuery.isFetching}
            value={captchaAnswer}
            onChange={setCaptchaAnswer}
            onRefresh={() => {
              setCaptchaAnswer('')
              void captchaQuery.refetch()
            }}
          />

          {loginMutation.isError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {getErrorMessage(loginMutation.error)}
            </div>
          ) : null}

          <Button className="w-full" size="lg" type="submit" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? 'Signing in...' : 'Masuk ke Dashboard'}
            <ArrowRight className="h-4 w-4" />
          </Button>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <Link className="font-semibold text-app-accent underline-offset-4 hover:underline" to="/forgot-password">
              Lupa password?
            </Link>
            <div className="flex items-center gap-2 text-app-muted-foreground">
              <MailWarning className="h-4 w-4" />
              Email verification & lockout aktif
            </div>
          </div>
        </form>
      )}
    </AuthShell>
  )
}
