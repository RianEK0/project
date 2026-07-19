import { http } from '@/lib/http'
import type {
  ApiEnvelope,
  OrganizationUnit,
  Team,
} from '@/types/api'

export interface CreateTeamPayload {
  department_id: number
  name: string
  code: string
  description?: string
  lead_employee_id?: number
}

export async function getOrganizationStructure() {
  const { data } = await http.get<ApiEnvelope<OrganizationUnit[]>>('/organization/structure')
  return data.data
}

export async function getTeams() {
  const { data } = await http.get<ApiEnvelope<Team[]>>('/teams')
  return data.data
}

export async function createTeam(payload: CreateTeamPayload) {
  const { data } = await http.post<ApiEnvelope<Team>>('/teams', payload)
  return data.data
}
