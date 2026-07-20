import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Copy,
  KeyRound,
  LaptopMinimal,
  LockKeyhole,
  MailCheck,
  ScanFace,
  Smartphone,
  Trash2,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  beginTwoFactorSetup,
  changePassword,
  confirmTwoFactorSetup,
  disableTwoFactor,
  getLoginHistory,
  getSessions,
  resendVerificationEmail,
  revokeOtherSessions,
  revokeSession,
} from '@/features/auth/api'
import { useAuth } from '@/features/auth/auth-context'
import { getErrorMessage } from '@/lib/http'

export function SecurityPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { session, setSession, signOut } = useAuth()
  const [setupCode, setSetupCode] = useState('')
  const [disablePassword, setDisablePassword] = useState('')
  const [disableCode, setDisableCode] = useState('')
  const [disableRecoveryCode, setDisableRecoveryCode] = useState('')
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  })
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])

  const sessionsQuery = useQuery({
    queryKey: ['auth', 'sessions'],
    queryFn: getSessions,
  })

  const loginHistoryQuery = useQuery({
    queryKey: ['auth', 'login-history'],
    queryFn: getLoginHistory,
  })

  const resendVerificationMutation = useMutation({
    mutationFn: resendVerificationEmail,
  })

  const setupTwoFactorMutation = useMutation({
    mutationFn: beginTwoFactorSetup,
  })

  const confirmTwoFactorMutation = useMutation({
    mutationFn: confirmTwoFactorSetup,
    onSuccess: (payload) => {
      setRecoveryCodes(payload.recovery_codes)
      setSetupCode('')
      queryClient.invalidateQueries({ queryKey: ['auth', 'sessions'] })
      setSession((current) => current
        ? {
            ...current,
            user: {
              ...current.user,
              two_factor_enabled: true,
            },
          }
        : current)
    },
  })

  const disableTwoFactorMutation = useMutation({
    mutationFn: disableTwoFactor,
    onSuccess: () => {
      setDisablePassword('')
      setDisableCode('')
      setDisableRecoveryCode('')
      setRecoveryCodes([])
      setSession((current) => current
        ? {
            ...current,
            user: {
              ...current.user,
              two_factor_enabled: false,
            },
          }
        : current)
    },
  })

  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      signOut()
      navigate('/login?passwordChanged=1')
    },
  })

  const revokeSessionMutation = useMutation({
    mutationFn: revokeSession,
    onSuccess: (payload) => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'sessions'] })

      if (payload.signed_out) {
        signOut()
      }
    },
  })

  const revokeOthersMutation = useMutation({
    mutationFn: revokeOtherSessions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'sessions'] })
    },
  })

  const copyText = async (value: string) => {
    await navigator.clipboard?.writeText(value)
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[1.02fr_0.98fr]">
        <Card>
          <CardHeader>
            <div className="section-kicker w-fit">Identity Health</div>
            <CardTitle className="pt-3 text-2xl">Status identitas dan verifikasi</CardTitle>
            <CardDescription>
              Ringkasan kondisi akun, verifikasi email, dan kontrol dasar autentikasi.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-[24px] border border-app-border bg-white/66 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-app-foreground">
                  <MailCheck className="h-4 w-4 text-[color:var(--app-highlight)]" />
                  Email Verification
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Badge variant={session?.user.email_verified_at ? 'success' : 'warning'}>
                    {session?.user.email_verified_at ? 'Verified' : 'Pending'}
                  </Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-app-muted-foreground">
                  {session?.user.email_verified_at
                    ? 'Alamat email kerja sudah tervalidasi untuk akses operasional.'
                    : 'Akun belum diverifikasi. Tautan verifikasi dapat dikirim ulang dari sini.'}
                </p>
                {!session?.user.email_verified_at ? (
                  <Button
                    className="mt-4"
                    size="sm"
                    type="button"
                    variant="secondary"
                    onClick={() => resendVerificationMutation.mutate()}
                    disabled={resendVerificationMutation.isPending}
                  >
                    Kirim Ulang Verifikasi
                  </Button>
                ) : null}
              </div>

              <div className="rounded-[24px] border border-app-border bg-white/66 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-app-foreground">
                  <ScanFace className="h-4 w-4 text-[color:var(--app-highlight)]" />
                  Two Factor Authentication
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Badge variant={session?.user.two_factor_enabled ? 'success' : 'warning'}>
                    {session?.user.two_factor_enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-app-muted-foreground">
                  {session?.user.two_factor_enabled
                    ? 'Authenticator aktif. Login sensitif sekarang meminta kode tambahan.'
                    : 'Aktifkan authenticator untuk mengurangi risiko penyalahgunaan kredensial.'}
                </p>
              </div>
            </div>

            {resendVerificationMutation.isSuccess ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                Tautan verifikasi email berhasil dikirim ulang.
              </div>
            ) : null}

            {resendVerificationMutation.isError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {getErrorMessage(resendVerificationMutation.error)}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="section-kicker w-fit">2FA Control</div>
            <CardTitle className="pt-3 text-2xl">Google Authenticator</CardTitle>
            <CardDescription>
              Aktifkan, konfirmasi, dan kelola recovery code untuk dua faktor.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!session?.user.two_factor_enabled ? (
              <>
                {setupTwoFactorMutation.data ? (
                  <div className="space-y-4 rounded-[24px] border border-app-border bg-white/68 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-app-foreground">
                      <KeyRound className="h-4 w-4 text-[color:var(--app-highlight)]" />
                      Manual setup key
                    </div>
                    <div className="rounded-[20px] border border-app-border bg-[#fff9f0] p-4">
                      <p className="text-sm font-semibold text-app-foreground">Secret</p>
                      <p className="mt-2 break-all font-mono text-sm text-app-foreground">
                        {setupTwoFactorMutation.data.secret}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          type="button"
                          variant="secondary"
                          onClick={() => void copyText(setupTwoFactorMutation.data.secret)}
                        >
                          <Copy className="h-4 w-4" />
                          Copy Secret
                        </Button>
                        <Button
                          size="sm"
                          type="button"
                          variant="secondary"
                          onClick={() => void copyText(setupTwoFactorMutation.data.otpauth_uri)}
                        >
                          <Copy className="h-4 w-4" />
                          Copy OTP URI
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="setup-code">Kode dari Authenticator</Label>
                      <Input
                        id="setup-code"
                        inputMode="numeric"
                        placeholder="123456"
                        value={setupCode}
                        onChange={(event) => setSetupCode(event.target.value)}
                      />
                    </div>

                    <Button
                      type="button"
                      onClick={() => confirmTwoFactorMutation.mutate(setupCode)}
                      disabled={confirmTwoFactorMutation.isPending}
                    >
                      {confirmTwoFactorMutation.isPending ? 'Confirming...' : 'Aktifkan 2FA'}
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    onClick={() => setupTwoFactorMutation.mutate()}
                    disabled={setupTwoFactorMutation.isPending}
                  >
                    {setupTwoFactorMutation.isPending ? 'Preparing...' : 'Mulai Setup 2FA'}
                  </Button>
                )}
              </>
            ) : (
              <div className="space-y-4 rounded-[24px] border border-app-border bg-white/68 p-4">
                <div className="space-y-2">
                  <Label htmlFor="disable-password">Password Saat Ini</Label>
                  <Input
                    id="disable-password"
                    type="password"
                    value={disablePassword}
                    onChange={(event) => setDisablePassword(event.target.value)}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="disable-code">Kode Authenticator</Label>
                    <Input
                      id="disable-code"
                      placeholder="123456"
                      value={disableCode}
                      onChange={(event) => setDisableCode(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="disable-recovery">Recovery Code</Label>
                    <Input
                      id="disable-recovery"
                      placeholder="RECOVERYCODE"
                      value={disableRecoveryCode}
                      onChange={(event) => setDisableRecoveryCode(event.target.value)}
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  variant="danger"
                  onClick={() => disableTwoFactorMutation.mutate({
                    password: disablePassword,
                    code: disableCode || undefined,
                    recovery_code: disableRecoveryCode || undefined,
                  })}
                  disabled={disableTwoFactorMutation.isPending}
                >
                  Nonaktifkan 2FA
                </Button>
              </div>
            )}

            {recoveryCodes.length > 0 ? (
              <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-900">Recovery codes</p>
                <p className="mt-2 text-sm leading-6 text-amber-800">
                  Simpan kode ini di tempat aman. Kode hanya ditampilkan sekali setelah aktivasi.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {recoveryCodes.map((code) => (
                    <Badge key={code} variant="warning">
                      {code}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}

            {setupTwoFactorMutation.isError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {getErrorMessage(setupTwoFactorMutation.error)}
              </div>
            ) : null}

            {confirmTwoFactorMutation.isError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {getErrorMessage(confirmTwoFactorMutation.error)}
              </div>
            ) : null}

            {disableTwoFactorMutation.isError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {getErrorMessage(disableTwoFactorMutation.error)}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
        <Card>
          <CardHeader>
            <div className="section-kicker w-fit">Password Policy</div>
            <CardTitle className="pt-3 text-2xl">Ganti password</CardTitle>
            <CardDescription>
              Password baru wajib kuat dan tidak boleh sama dengan riwayat password sebelumnya.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current_password">Password Saat Ini</Label>
              <Input
                id="current_password"
                type="password"
                value={passwordForm.current_password}
                onChange={(event) => setPasswordForm((current) => ({
                  ...current,
                  current_password: event.target.value,
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password Baru</Label>
              <Input
                id="password"
                type="password"
                value={passwordForm.password}
                onChange={(event) => setPasswordForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
              <Input
                id="password_confirmation"
                type="password"
                value={passwordForm.password_confirmation}
                onChange={(event) => setPasswordForm((current) => ({
                  ...current,
                  password_confirmation: event.target.value,
                }))}
              />
            </div>

            <Button
              type="button"
              onClick={() => changePasswordMutation.mutate(passwordForm)}
              disabled={changePasswordMutation.isPending}
            >
              <LockKeyhole className="h-4 w-4" />
              {changePasswordMutation.isPending ? 'Updating...' : 'Perbarui Password'}
            </Button>

            {changePasswordMutation.isError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {getErrorMessage(changePasswordMutation.error)}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="section-kicker w-fit">Session Management</div>
            <CardTitle className="pt-3 text-2xl">Perangkat aktif</CardTitle>
            <CardDescription>
              Tinjau perangkat yang sedang memiliki session aktif dan cabut akses bila diperlukan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-end">
              <Button
                size="sm"
                type="button"
                variant="secondary"
                onClick={() => revokeOthersMutation.mutate()}
                disabled={revokeOthersMutation.isPending}
              >
                Cabut Session Lain
              </Button>
            </div>

            <div className="space-y-3">
              {sessionsQuery.data?.map((item) => (
                <div
                  className="data-row flex flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between"
                  key={item.id}
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="inline-flex items-center gap-2 text-sm font-semibold text-app-foreground">
                        <LaptopMinimal className="h-4 w-4 text-[color:var(--app-highlight)]" />
                        {item.device_name ?? 'Unnamed device'}
                      </div>
                      {item.is_current ? <Badge variant="success">Current</Badge> : null}
                      {item.remember ? <Badge variant="neutral">Remember me</Badge> : null}
                    </div>
                    <p className="text-sm text-app-muted-foreground">
                      {item.ip_address ?? 'Unknown IP'} · {item.user_agent ?? 'Unknown agent'}
                    </p>
                    <p className="text-xs text-app-muted-foreground">
                      Last seen: {item.last_seen_at ?? '-'} · Expires: {item.expires_at}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    type="button"
                    variant="danger"
                    onClick={() => revokeSessionMutation.mutate(item.id)}
                    disabled={revokeSessionMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                    Revoke
                  </Button>
                </div>
              ))}
            </div>

            {revokeSessionMutation.isError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {getErrorMessage(revokeSessionMutation.error)}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="section-kicker w-fit">Login History</div>
          <CardTitle className="pt-3 text-2xl">Riwayat akses terbaru</CardTitle>
          <CardDescription>
            Catatan login berhasil maupun gagal untuk peninjauan keamanan cepat.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loginHistoryQuery.data?.map((item) => (
            <div className="data-row flex flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between" key={item.id}>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-app-foreground">
                    <Smartphone className="h-4 w-4 text-[color:var(--app-highlight)]" />
                    {item.device_name ?? item.email}
                  </div>
                  <Badge variant={item.successful ? 'success' : 'danger'}>
                    {item.successful ? 'Success' : 'Failed'}
                  </Badge>
                  {item.two_factor_passed ? <Badge variant="neutral">2FA</Badge> : null}
                </div>
                <p className="text-sm text-app-muted-foreground">
                  {item.ip_address ?? 'Unknown IP'} · {item.user_agent ?? 'Unknown agent'}
                </p>
              </div>
              <div className="text-right text-sm text-app-muted-foreground">
                <p>{item.attempted_at}</p>
                <p>{item.failure_reason ?? 'Authenticated successfully'}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
