import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowLeft, Send } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { forgotPassword, getCaptcha } from '@/features/auth/api'
import { AuthShell } from '@/features/auth/auth-shell'
import { CaptchaBlock } from '@/features/auth/captcha-block'
import { getErrorMessage } from '@/lib/http'

const forgotPasswordSchema = z.object({
  email: z.email({ message: 'Email harus valid.' }),
})

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordPage() {
  const [captchaAnswer, setCaptchaAnswer] = useState('')
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const captchaQuery = useQuery({
    queryKey: ['auth', 'captcha', 'forgot-password'],
    queryFn: getCaptcha,
  })

  const mutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: (_, variables) => {
      setSubmittedEmail(variables.email)
    },
    onError: () => {
      setCaptchaAnswer('')
      void captchaQuery.refetch()
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    if (!captchaQuery.data) {
      return
    }

    mutation.mutate({
      email: values.email,
      captcha_id: captchaQuery.data.captcha_id,
      captcha_answer: captchaAnswer,
    })
  })

  return (
    <AuthShell
      kicker="Password Recovery"
      title="Pulihkan akses akun"
      description="Gunakan email kerja Anda. Sistem akan mengirim tautan reset yang berlaku singkat dan tetap dilindungi CAPTCHA."
    >
      {submittedEmail ? (
        <div className="space-y-4 rounded-[26px] border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
          <p>
            Jika
            {' '}
            <strong>{submittedEmail}</strong>
            {' '}
            terdaftar, tautan reset password telah dikirim.
          </p>
          <Link className="font-semibold underline-offset-4 hover:underline" to="/login">
            Kembali ke login
          </Link>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" placeholder="nama@enterprise-hris.local" {...form.register('email')} />
            <p className="text-sm text-rose-700">{form.formState.errors.email?.message}</p>
          </div>

          <CaptchaBlock
            challenge={captchaQuery.data}
            disabled={mutation.isPending || captchaQuery.isFetching}
            value={captchaAnswer}
            onChange={setCaptchaAnswer}
            onRefresh={() => {
              setCaptchaAnswer('')
              void captchaQuery.refetch()
            }}
          />

          {mutation.isError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {getErrorMessage(mutation.error)}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Sending...' : 'Kirim Tautan Reset'}
              <Send className="h-4 w-4" />
            </Button>
            <Button asChild type="button" variant="secondary">
              <Link to="/login">
                <ArrowLeft className="h-4 w-4" />
                Kembali
              </Link>
            </Button>
          </div>
        </form>
      )}
    </AuthShell>
  )
}
