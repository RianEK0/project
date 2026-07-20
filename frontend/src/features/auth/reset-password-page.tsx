import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { ArrowRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { resetPassword } from '@/features/auth/api'
import { AuthShell } from '@/features/auth/auth-shell'
import { getErrorMessage } from '@/lib/http'

const resetPasswordSchema = z
  .object({
    email: z.email({ message: 'Email harus valid.' }),
    token: z.string().min(1, 'Token reset wajib ada.'),
    password: z.string().min(12, 'Password minimal 12 karakter.'),
    password_confirmation: z.string().min(12, 'Konfirmasi password minimal 12 karakter.'),
  })
  .refine((value) => value.password === value.password_confirmation, {
    message: 'Konfirmasi password harus sama.',
    path: ['password_confirmation'],
  })

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: searchParams.get('email') ?? '',
      token: searchParams.get('token') ?? '',
      password: '',
      password_confirmation: '',
    },
  })

  const mutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      navigate('/login?reset=success')
    },
  })

  const onSubmit = form.handleSubmit((values) => mutation.mutate(values))

  return (
    <AuthShell
      kicker="Reset Password"
      title="Tetapkan password baru"
      description="Tautan reset ini bersifat sementara. Gunakan password yang kuat, unik, dan berbeda dari riwayat sebelumnya."
    >
      <form className="space-y-5" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" placeholder="nama@enterprise-hris.local" {...form.register('email')} />
          <p className="text-sm text-rose-700">{form.formState.errors.email?.message}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="token">Reset Token</Label>
          <Input id="token" placeholder="Tempel token reset" {...form.register('token')} />
          <p className="text-sm text-rose-700">{form.formState.errors.token?.message}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password Baru</Label>
          <Input id="password" type="password" {...form.register('password')} />
          <p className="text-sm text-rose-700">{form.formState.errors.password?.message}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
          <Input id="password_confirmation" type="password" {...form.register('password_confirmation')} />
          <p className="text-sm text-rose-700">
            {form.formState.errors.password_confirmation?.message}
          </p>
        </div>

        {mutation.isError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {getErrorMessage(mutation.error)}
          </div>
        ) : null}

        <Button className="w-full" size="lg" type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Updating...' : 'Perbarui Password'}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
    </AuthShell>
  )
}
