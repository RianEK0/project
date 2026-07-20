import { useDeferredValue, useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Fingerprint, KeySquare, RefreshCcw, Search, ShieldCheck, UsersRound } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { getAccessControlOverview, updateRolePermissions, updateUserRoles } from '@/features/access-control/access-control-api'
import { useAuth } from '@/features/auth/auth-context'
import { getErrorMessage } from '@/lib/http'

const groupLabelMap: Record<string, string> = {
  'access-control': 'Access Control',
  assets: 'Assets',
  attendance: 'Attendance',
  dashboard: 'Dashboard',
  employees: 'Employees',
  governance: 'Governance',
  leave: 'Leave',
  notifications: 'Notifications',
  organization: 'Organization',
  payroll: 'Payroll',
  performance: 'Performance',
  recruitment: 'Recruitment',
  support: 'Support',
}

export function AccessControlPage() {
  const queryClient = useQueryClient()
  const { session } = useAuth()
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)
  const [rolePermissionDrafts, setRolePermissionDrafts] = useState<Record<number, number[]>>({})
  const [userRoleDrafts, setUserRoleDrafts] = useState<Record<number, number[]>>({})
  const [userSearch, setUserSearch] = useState('')
  const deferredUserSearch = useDeferredValue(userSearch)

  const overviewQuery = useQuery({
    queryKey: ['access-control', 'overview'],
    queryFn: getAccessControlOverview,
  })

  useEffect(() => {
    if (!overviewQuery.data) {
      return
    }

    if (selectedRoleId === null && overviewQuery.data.roles.length > 0) {
      setSelectedRoleId(overviewQuery.data.roles[0].id)
    }

    setRolePermissionDrafts((current) => {
      if (Object.keys(current).length > 0) {
        return current
      }

      return Object.fromEntries(
        overviewQuery.data.roles.map((role) => [role.id, role.permissions.map((permission) => permission.id)]),
      )
    })

    setUserRoleDrafts((current) => {
      if (Object.keys(current).length > 0) {
        return current
      }

      return Object.fromEntries(
        overviewQuery.data.users.map((user) => [user.id, user.roles.map((role) => role.id)]),
      )
    })
  }, [overviewQuery.data, selectedRoleId])

  const updateRolePermissionsMutation = useMutation({
    mutationFn: ({ roleId, permissionIds }: { roleId: number; permissionIds: number[] }) =>
      updateRolePermissions(roleId, permissionIds),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['access-control', 'overview'] })
    },
  })

  const updateUserRolesMutation = useMutation({
    mutationFn: ({ userId, roleIds }: { userId: number; roleIds: number[] }) =>
      updateUserRoles(userId, roleIds),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['access-control', 'overview'] })
    },
  })

  const selectedRole = overviewQuery.data?.roles.find((role) => role.id === selectedRoleId) ?? null
  const groupedPermissions = overviewQuery.data?.permissions.reduce<Record<string, typeof overviewQuery.data.permissions>>(
    (groups, permission) => {
      groups[permission.group] = [...(groups[permission.group] ?? []), permission]
      return groups
    },
    {},
  ) ?? {}

  const filteredUsers = overviewQuery.data?.users.filter((user) => {
    const keyword = deferredUserSearch.trim().toLowerCase()

    if (keyword.length === 0) {
      return true
    }

    return [
      user.name,
      user.email,
      user.employee?.employee_number ?? '',
      user.employee?.department ?? '',
      ...user.roles.map((role) => role.label),
    ].some((candidate) => candidate.toLowerCase().includes(keyword))
  }) ?? []

  const toggleRolePermission = (roleId: number, permissionId: number) => {
    setRolePermissionDrafts((current) => {
      const selectedPermissions = current[roleId] ?? []
      const nextPermissions = selectedPermissions.includes(permissionId)
        ? selectedPermissions.filter((id) => id !== permissionId)
        : [...selectedPermissions, permissionId]

      return {
        ...current,
        [roleId]: nextPermissions,
      }
    })
  }

  const toggleUserRole = (userId: number, roleId: number) => {
    setUserRoleDrafts((current) => {
      const selectedRoles = current[userId] ?? []
      const nextRoles = selectedRoles.includes(roleId)
        ? selectedRoles.filter((id) => id !== roleId)
        : [...selectedRoles, roleId]

      return {
        ...current,
        [userId]: nextRoles,
      }
    })
  }

  const canManageAccessControl = (
    session?.user.permissions.includes('roles.manage')
    || session?.user.permissions.includes('users.manage')
  ) ?? false

  if (!canManageAccessControl) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Control unavailable</CardTitle>
          <CardDescription>
            Role Anda belum memiliki permission untuk membuka manajemen RBAC.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (overviewQuery.isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading access control</CardTitle>
          <CardDescription>Menyusun katalog role, permission, dan user assignment.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (overviewQuery.isError || !overviewQuery.data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access control unavailable</CardTitle>
          <CardDescription>{getErrorMessage(overviewQuery.error)}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="hero-panel">
        <CardHeader className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="border-white/10 bg-white/8 text-white" variant="neutral">
              RBAC Workspace
            </Badge>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
              <ShieldCheck className="h-3.5 w-3.5 text-[color:var(--app-highlight)]" />
              Permission Matrix
            </div>
          </div>
          <div className="space-y-3">
            <CardTitle className="max-w-3xl text-4xl font-extrabold tracking-[-0.06em] text-white md:text-5xl">
              Role, permission, dan assignment user sekarang bisa dikendalikan dari dashboard.
            </CardTitle>
            <CardDescription className="max-w-2xl text-base leading-8 text-slate-200">
              Halaman ini merangkum default role organisasi, matrix permission lintas modul,
              dan assignment role per user supaya kontrol akses tidak lagi tersebar di seed file.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <div className="section-kicker w-fit">Default Roles</div>
            <CardTitle className="pt-3 text-2xl">Katalog role organisasi</CardTitle>
            <CardDescription>
              Pilih role untuk meninjau dan mengubah permission yang dimilikinya.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {overviewQuery.data.roles.map((role) => (
              <button
                className={[
                  'data-row flex w-full items-start justify-between px-4 py-4 text-left',
                  selectedRoleId === role.id ? 'border-[color:rgba(185,123,49,0.34)]' : '',
                ].join(' ')}
                key={role.id}
                onClick={() => setSelectedRoleId(role.id)}
                type="button"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-bold text-app-foreground">{role.label}</p>
                    {role.is_locked ? <Badge variant="warning">System</Badge> : null}
                  </div>
                  <p className="text-sm leading-6 text-app-muted-foreground">{role.description}</p>
                </div>
                <div className="rounded-[18px] bg-black/4 px-3 py-2 text-sm font-semibold text-app-foreground">
                  {role.users_count} users
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <div className="section-kicker w-fit">Permissions</div>
              <div>
                <CardTitle className="pt-3 text-2xl">
                  {selectedRole?.label ?? 'Permission Matrix'}
                </CardTitle>
                <CardDescription className="mt-2">
                  Ubah permission per role dan simpan hasilnya langsung dari dashboard.
                </CardDescription>
              </div>
            </div>

            {selectedRole ? (
              <Button
                disabled={
                  !overviewQuery.data.can_manage_roles
                  || selectedRole.is_locked
                  || updateRolePermissionsMutation.isPending
                }
                type="button"
                onClick={() => updateRolePermissionsMutation.mutate({
                  roleId: selectedRole.id,
                  permissionIds: rolePermissionDrafts[selectedRole.id] ?? [],
                })}
              >
                <KeySquare className="h-4 w-4" />
                {updateRolePermissionsMutation.isPending ? 'Saving...' : 'Simpan Permission'}
              </Button>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-5">
            {selectedRole?.is_locked ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Super Admin selalu mewarisi seluruh permission sistem dan tidak dapat diubah dari matrix ini.
              </div>
            ) : null}

            {Object.entries(groupedPermissions).map(([group, permissions]) => (
              <section className="rounded-[26px] border border-app-border bg-white/62 p-4" key={group}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-app-foreground">
                      {groupLabelMap[group] ?? group}
                    </p>
                    <p className="text-xs text-app-muted-foreground">{group}</p>
                  </div>
                  <Badge variant="neutral">{permissions.length} permissions</Badge>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {permissions.map((permission) => (
                    <label
                      className="rounded-[20px] border border-app-border bg-white/72 px-4 py-3 text-sm"
                      key={permission.id}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          checked={(rolePermissionDrafts[selectedRole?.id ?? -1] ?? []).includes(permission.id)}
                          className="mt-1 h-4 w-4 rounded border-app-border accent-[color:var(--app-highlight)]"
                          disabled={!selectedRole || !overviewQuery.data.can_manage_roles || selectedRole.is_locked}
                          type="checkbox"
                          onChange={() => selectedRole && toggleRolePermission(selectedRole.id, permission.id)}
                        />
                        <div>
                          <p className="font-semibold text-app-foreground">{permission.label}</p>
                          <p className="mt-1 text-xs leading-5 text-app-muted-foreground">
                            {permission.description ?? permission.code}
                          </p>
                          <p className="mt-2 font-mono text-[11px] text-app-muted-foreground">
                            {permission.code}
                          </p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </section>
            ))}

            {updateRolePermissionsMutation.isError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {getErrorMessage(updateRolePermissionsMutation.error)}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="section-kicker w-fit">User Assignments</div>
            <div>
              <CardTitle className="pt-3 text-2xl">Assignment role per user</CardTitle>
              <CardDescription className="mt-2">
                Sinkronkan role user langsung dari dashboard agar kontrol akses tetap operasional.
              </CardDescription>
            </div>
          </div>

          <div className="w-full md:max-w-md">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-app-muted-foreground" />
              <Input
                className="pl-11"
                placeholder="Cari nama, email, department, atau role"
                value={userSearch}
                onChange={(event) => setUserSearch(event.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredUsers.map((user) => (
            <article className="data-row space-y-4 px-5 py-5" key={user.id}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-lg font-bold text-app-foreground">{user.name}</p>
                    <Badge variant={user.status === 'active' ? 'success' : 'warning'}>
                      {user.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-app-muted-foreground">{user.email}</p>
                  <p className="text-sm text-app-muted-foreground">
                    {user.employee
                      ? `${user.employee.employee_number} • ${user.employee.department ?? 'No department'}`
                      : 'Tidak terhubung ke profil employee'}
                  </p>
                  <p className="text-xs text-app-muted-foreground">
                    Last login: {user.last_login_at ?? 'Belum pernah login'}
                  </p>
                </div>

                <Button
                  disabled={!overviewQuery.data.can_manage_users || updateUserRolesMutation.isPending}
                  type="button"
                  onClick={() => updateUserRolesMutation.mutate({
                    userId: user.id,
                    roleIds: userRoleDrafts[user.id] ?? [],
                  })}
                >
                  <RefreshCcw className="h-4 w-4" />
                  {updateUserRolesMutation.isPending ? 'Saving...' : 'Simpan Role'}
                </Button>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {overviewQuery.data.roles.map((role) => (
                  <label
                    className="rounded-[20px] border border-app-border bg-white/76 px-4 py-3 text-sm"
                    key={`${user.id}-${role.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        checked={(userRoleDrafts[user.id] ?? []).includes(role.id)}
                        className="mt-1 h-4 w-4 rounded border-app-border accent-[color:var(--app-highlight)]"
                        disabled={!overviewQuery.data.can_manage_users}
                        type="checkbox"
                        onChange={() => toggleUserRole(user.id, role.id)}
                      />
                      <div>
                        <p className="font-semibold text-app-foreground">{role.label}</p>
                        <p className="mt-1 text-xs leading-5 text-app-muted-foreground">
                          {role.description}
                        </p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </article>
          ))}

          {filteredUsers.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-app-border px-6 py-10 text-center">
              <UsersRound className="mx-auto h-8 w-8 text-app-muted-foreground" />
              <p className="mt-3 text-lg font-semibold">Tidak ada user yang cocok</p>
              <p className="mt-1 text-sm text-app-muted-foreground">
                Ubah kata kunci pencarian untuk menemukan user yang ingin Anda atur.
              </p>
            </div>
          ) : null}

          {updateUserRolesMutation.isError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {getErrorMessage(updateUserRolesMutation.error)}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <InfoCard
          icon={ShieldCheck}
          label="Roles"
          value={overviewQuery.data.roles.length}
          description="Default role organisasi yang siap dipakai dan disesuaikan."
        />
        <InfoCard
          icon={Fingerprint}
          label="Permissions"
          value={overviewQuery.data.permissions.length}
          description="Permission aktif lintas dashboard, workforce, leave, governance, dan support."
        />
        <InfoCard
          icon={UsersRound}
          label="Managed Users"
          value={overviewQuery.data.users.length}
          description="Akun yang dapat langsung disinkronkan role-nya dari halaman ini."
        />
      </div>
    </div>
  )
}

function InfoCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: typeof ShieldCheck
  label: string
  value: number
  description: string
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between">
        <div>
          <p className="text-sm text-app-muted-foreground">{label}</p>
          <p className="mt-3 text-4xl font-extrabold tracking-[-0.05em]">{value}</p>
          <p className="mt-3 text-sm leading-6 text-app-muted-foreground">{description}</p>
        </div>
        <div className="rounded-2xl bg-black/5 p-3 text-[color:var(--app-highlight)]">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  )
}
