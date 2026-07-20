import { http } from '@/lib/http'
import type {
  ApiEnvelope,
  OrganizationLookups,
  OrganizationOverview,
  Team,
} from '@/types/api'

export interface CreateTeamPayload {
  department_id: number
  name: string
  code: string
  description?: string
  lead_employee_id?: number
}

export interface CreateOrganizationUnitPayload {
  type: 'company' | 'branch' | 'department' | 'division' | 'section' | 'position'
  name: string
  code: string
  description?: string
  company_id?: number
  department_id?: number
  division_id?: number
  section_id?: number
  head_employee_id?: number
  legal_name?: string
  email?: string
  phone?: string
  website?: string
  address?: string
  cost_center?: string
  grade?: string
  is_active?: boolean
}

export async function getOrganizationStructure() {
  const { data } = await http.get<ApiEnvelope<OrganizationOverview>>('/organization/structure')
  return data.data
}

export async function getOrganizationLookups() {
  const { data } = await http.get<ApiEnvelope<OrganizationLookups>>('/organization/lookups')
  return data.data
}

export async function createOrganizationUnit(payload: CreateOrganizationUnitPayload) {
  const { data } = await http.post<ApiEnvelope<{ type: string; item: Record<string, unknown> }>>(
    '/organization/units',
    payload,
  )

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
