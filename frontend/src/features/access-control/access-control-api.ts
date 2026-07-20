import { http } from '@/lib/http'
import type { AccessControlOverview, AccessControlRole, AccessControlUser, ApiEnvelope } from '@/types/api'

export async function getAccessControlOverview() {
  const { data } = await http.get<ApiEnvelope<AccessControlOverview>>('/access-control')

  return data.data
}

export async function updateRolePermissions(roleId: number, permissionIds: number[]) {
  const { data } = await http.put<ApiEnvelope<AccessControlRole>>(
    `/access-control/roles/${roleId}/permissions`,
    { permission_ids: permissionIds },
  )

  return data.data
}

export async function updateUserRoles(userId: number, roleIds: number[]) {
  const { data } = await http.put<ApiEnvelope<AccessControlUser>>(
    `/access-control/users/${userId}/roles`,
    { role_ids: roleIds },
  )

  return data.data
}
