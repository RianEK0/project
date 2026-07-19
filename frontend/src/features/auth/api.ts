import { http } from '@/lib/http'
import type { ApiEnvelope, AuthSession } from '@/types/api'

export interface LoginPayload {
  email: string
  password: string
}

export async function login(payload: LoginPayload) {
  const { data } = await http.post<ApiEnvelope<AuthSession>>('/auth/login', payload)

  return data.data
}

export async function logout() {
  await http.post('/auth/logout')
}
