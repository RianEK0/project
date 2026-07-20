import { http } from '@/lib/http'
import type {
  ApiEnvelope,
  ItAsset,
  ItAssetAssignment,
  ItAssetLookups,
  ItAssetMaintenance,
  ItAssetOverview,
} from '@/types/api'

export interface ItAssetFilters {
  category?: string
  status?: string
  employee_id?: number
}

export interface CreateItAssetPayload {
  asset_code?: string
  category: string
  name: string
  brand?: string
  model?: string
  serial_number?: string
  phone_number?: string
  license_key?: string
  license_expires_at?: string
  vendor_name?: string
  purchase_date?: string
  purchase_cost?: number
  currency?: string
  branch_id?: number
  warranty_expires_at?: string
  maintenance_due_at?: string
  status?: string
  notes?: string
}

export interface AssignItAssetPayload {
  employee_id: number
  assigned_at?: string
  expected_return_at?: string
  assignment_condition?: string
  assignment_notes?: string
}

export interface ReturnItAssetAssignmentPayload {
  returned_at?: string
  return_condition?: string
  return_notes?: string
}

export interface CreateItAssetMaintenancePayload {
  maintenance_type?: string
  vendor_name?: string
  scheduled_at?: string
  started_at?: string
  completed_at?: string
  status?: string
  warranty_claim?: boolean
  cost_amount?: number
  currency?: string
  notes?: string
  resolution?: string
  next_maintenance_due_at?: string
}

export async function getAssetsOverview() {
  const { data } = await http.get<ApiEnvelope<ItAssetOverview>>('/assets/overview')
  return data.data
}

export async function getAssetsLookups() {
  const { data } = await http.get<ApiEnvelope<ItAssetLookups>>('/assets/lookups')
  return data.data
}

export async function getAssets(filters: ItAssetFilters = {}) {
  const { data } = await http.get<ApiEnvelope<ItAsset[]>>('/assets', {
    params: filters,
  })

  return data.data
}

export async function getAsset(assetId: number) {
  const { data } = await http.get<ApiEnvelope<ItAsset>>(`/assets/${assetId}`)
  return data.data
}

export async function createAsset(payload: CreateItAssetPayload) {
  const { data } = await http.post<ApiEnvelope<ItAsset>>('/assets', payload)
  return data.data
}

export async function assignAsset(assetId: number, payload: AssignItAssetPayload) {
  const { data } = await http.post<ApiEnvelope<ItAssetAssignment>>(`/assets/${assetId}/assignments`, payload)
  return data.data
}

export async function returnAssetAssignment(assignmentId: number, payload: ReturnItAssetAssignmentPayload) {
  const { data } = await http.post<ApiEnvelope<ItAssetAssignment>>(`/assets/assignments/${assignmentId}/return`, payload)
  return data.data
}

export async function createAssetMaintenance(assetId: number, payload: CreateItAssetMaintenancePayload) {
  const { data } = await http.post<ApiEnvelope<ItAssetMaintenance>>(`/assets/${assetId}/maintenance`, payload)
  return data.data
}
