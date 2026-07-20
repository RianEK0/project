import { http } from '@/lib/http'
import type {
  ApiEnvelope,
  AuthDeviceSession,
  AuthSession,
  CaptchaChallenge,
  LoginHistoryEntry,
  TwoFactorChallenge,
  TwoFactorSetup,
} from '@/types/api'

export interface LoginPayload {
  email: string
  password: string
  remember: boolean
  captcha_id: string
  captcha_answer: string
  device_name?: string | null
}

export interface VerifyTwoFactorLoginPayload {
  challenge_id: string
  code?: string
  recovery_code?: string
}

export interface ForgotPasswordPayload {
  email: string
  captcha_id: string
  captcha_answer: string
}

export interface ResetPasswordPayload {
  email: string
  token: string
  password: string
  password_confirmation: string
}

export interface ChangePasswordPayload {
  current_password: string
  password: string
  password_confirmation: string
}

export interface DisableTwoFactorPayload {
  password: string
  code?: string
  recovery_code?: string
}

export async function getCaptcha() {
  const { data } = await http.get<ApiEnvelope<CaptchaChallenge>>('/auth/captcha')

  return data.data
}

export async function login(payload: LoginPayload) {
  const { data } = await http.post<ApiEnvelope<AuthSession | TwoFactorChallenge>>('/auth/login', payload)

  return data.data
}

export async function verifyTwoFactorLogin(payload: VerifyTwoFactorLoginPayload) {
  const { data } = await http.post<ApiEnvelope<AuthSession>>('/auth/login/2fa', payload)

  return data.data
}

export async function refreshSession(refresh_token: string) {
  const { data } = await http.post<ApiEnvelope<AuthSession>>('/auth/refresh', { refresh_token })

  return data.data
}

export async function logout() {
  await http.post('/auth/logout')
}

export async function forgotPassword(payload: ForgotPasswordPayload) {
  await http.post('/auth/forgot-password', payload)
}

export async function resetPassword(payload: ResetPasswordPayload) {
  await http.post('/auth/reset-password', payload)
}

export async function resendVerificationEmail() {
  await http.post('/auth/email/verification-notification')
}

export async function getSessions() {
  const { data } = await http.get<ApiEnvelope<AuthDeviceSession[]>>('/auth/sessions')

  return data.data
}

export async function revokeSession(sessionId: string) {
  const { data } = await http.delete<ApiEnvelope<{ signed_out: boolean }>>(`/auth/sessions/${sessionId}`)

  return data.data
}

export async function revokeOtherSessions() {
  const { data } = await http.delete<ApiEnvelope<{ revoked_sessions: number }>>('/auth/sessions/others')

  return data.data
}

export async function getLoginHistory() {
  const { data } = await http.get<ApiEnvelope<LoginHistoryEntry[]>>('/auth/login-history')

  return data.data
}

export async function beginTwoFactorSetup() {
  const { data } = await http.post<ApiEnvelope<TwoFactorSetup>>('/auth/two-factor/setup')

  return data.data
}

export async function confirmTwoFactorSetup(code: string) {
  const { data } = await http.post<ApiEnvelope<{ recovery_codes: string[] }>>('/auth/two-factor/confirm', { code })

  return data.data
}

export async function disableTwoFactor(payload: DisableTwoFactorPayload) {
  await http.delete('/auth/two-factor', { data: payload })
}

export async function changePassword(payload: ChangePasswordPayload) {
  const { data } = await http.post<ApiEnvelope<{ signed_out: boolean }>>('/auth/change-password', payload)

  return data.data
}
