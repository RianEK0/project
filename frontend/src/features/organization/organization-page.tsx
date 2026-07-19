import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2, Plus, UsersRound } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/features/auth/auth-context'
import {
  createTeam,
  getOrganizationStructure,
  getTeams,
  type CreateTeamPayload,
} from '@/features/organization/organization-api'
import { getDepartments, getEmployees } from '@/features/workforce/workforce-api'
import { getErrorMessage } from '@/lib/http'

const teamSchema = z.object({
  department_id: z.string().min(1, 'Pilih department.'),
  name: z.string().min(3, 'Nama team wajib diisi.'),
  code: z.string().min(2, 'Kode team wajib diisi.'),
  description: z.string().optional(),
  lead_employee_id: z.string().optional(),
})

type TeamFormValues = z.infer<typeof teamSchema>

export function OrganizationPage() {
  const { session } = useAuth()
  const queryClient = useQueryClient()
  const canManageTeams = session?.user.permissions.includes('teams.manage') ?? false

  const structureQuery = useQuery({
    queryKey: ['organization', 'structure'],
    queryFn: getOrganizationStructure,
  })

  const teamsQuery = useQuery({
    queryKey: ['teams'],
    queryFn: getTeams,
  })

  const departmentsQuery = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
  })

  const employeesQuery = useQuery({
    queryKey: ['employees', 'team-form'],
    queryFn: () => getEmployees(),
  })

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      department_id: '',
      name: '',
      code: '',
      description: '',
      lead_employee_id: '',
    },
  })

  const selectedDepartmentId = form.watch('department_id')
  const departmentField = form.register('department_id')
  const availableLeads = employeesQuery.data?.items.filter((employee) => {
    if (!selectedDepartmentId) {
      return true
    }

    return employee.department?.id === Number(selectedDepartmentId)
  }) ?? []

  const createMutation = useMutation({
    mutationFn: (payload: CreateTeamPayload) => createTeam(payload),
    onSuccess: () => {
      form.reset({
        department_id: '',
        name: '',
        code: '',
        description: '',
        lead_employee_id: '',
      })

      void queryClient.invalidateQueries({ queryKey: ['organization'] })
      void queryClient.invalidateQueries({ queryKey: ['teams'] })
      void queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    createMutation.mutate({
      department_id: Number(values.department_id),
      name: values.name,
      code: values.code,
      description: values.description || undefined,
      lead_employee_id: values.lead_employee_id ? Number(values.lead_employee_id) : undefined,
    })
  })

  const totalDepartments = structureQuery.data?.length ?? 0
  const totalTeams = structureQuery.data?.reduce((sum, department) => sum + department.teams_count, 0) ?? 0
  const totalEmployees = structureQuery.data?.reduce(
    (sum, department) => sum + department.employees_count,
    0,
  ) ?? 0

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <section className="space-y-6">
        <Card>
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <span className="section-kicker">Organization Structure</span>
              <div>
                <CardTitle className="text-3xl">Struktur organisasi yang mudah dipahami tim</CardTitle>
                <CardDescription className="mt-2 max-w-2xl text-base leading-7">
                  Department, team, dan penanggung jawabnya diringkas dalam pola visual
                  yang lebih rapi untuk dipakai HRBP dan line manager.
                </CardDescription>
              </div>
            </div>
            <div className="rounded-[24px] bg-app-accent px-5 py-4 text-white shadow-[0_24px_40px_-28px_rgba(19,35,60,0.8)]">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-[color:var(--app-highlight)]" />
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-300">
                    Active Structure
                  </p>
                  <p className="mt-1 text-lg font-semibold">{totalTeams} teams active</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="data-grid">
            <MetricCard label="Departments" value={totalDepartments} />
            <MetricCard label="Teams" value={totalTeams} />
            <MetricCard label="Employees Mapped" value={totalEmployees} />
            <MetricCard label="Team Registry" value={teamsQuery.data?.length ?? 0} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organization Structure</CardTitle>
            <CardDescription>
              Ringkasan department, jumlah headcount, dan team yang aktif di dalamnya.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {structureQuery.isLoading ? (
              <p className="text-sm text-app-muted-foreground">Loading organization map...</p>
            ) : null}

            {!structureQuery.isLoading && structureQuery.data?.map((department) => (
              <article
                className="data-row px-5 py-5"
                key={department.id}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold">{department.name}</p>
                      <Badge variant="neutral">{department.code}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-app-muted-foreground">
                      Cost center:
                      {' '}
                      <span className="font-medium text-app-foreground">
                        {department.cost_center ?? 'Not assigned'}
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="success">{department.employees_count} employees</Badge>
                    <Badge variant="warning">{department.teams_count} teams</Badge>
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  {department.teams.length > 0 ? department.teams.map((team) => (
                    <div
                      className="rounded-[22px] border border-app-border bg-app-background/55 px-4 py-4"
                      key={team.id}
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold">{team.name}</p>
                            <span className="font-mono text-xs text-app-muted-foreground">
                              {team.code}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-app-muted-foreground">
                            Lead:
                            {' '}
                            <span className="font-medium text-app-foreground">
                              {team.lead?.full_name ?? 'Not assigned'}
                            </span>
                          </p>
                        </div>
                        <Badge variant="neutral">{team.employees_count} members</Badge>
                      </div>
                    </div>
                  )) : (
                    <div className="rounded-[22px] border border-dashed border-app-border px-4 py-5 text-sm text-app-muted-foreground">
                      Belum ada team untuk department ini.
                    </div>
                  )}
                </div>
              </article>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Registry</CardTitle>
            <CardDescription>
              Daftar team lintas department untuk reference HRBP dan line manager.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {teamsQuery.isLoading ? (
              <p className="text-sm text-app-muted-foreground">Loading team registry...</p>
            ) : null}

            {!teamsQuery.isLoading && teamsQuery.data?.map((team) => (
              <article
                className="data-row flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between"
                key={team.id}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{team.name}</p>
                    <span className="font-mono text-xs text-app-muted-foreground">
                      {team.code}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-app-muted-foreground">
                    {team.department?.name ?? 'No department'}
                    {' • '}
                    Lead:
                    {' '}
                    {team.lead?.full_name ?? 'Pending assignment'}
                  </p>
                </div>
                <Badge variant="neutral">{team.employees_count} employees</Badge>
              </article>
            ))}

            {!teamsQuery.isLoading && teamsQuery.data?.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-app-border px-6 py-10 text-center">
                <UsersRound className="mx-auto h-8 w-8 text-app-muted-foreground" />
                <p className="mt-3 text-lg font-semibold">No teams created yet</p>
                <p className="mt-1 text-sm text-app-muted-foreground">
                  Team registry akan muncul di sini setelah struktur organisasi mulai dibangun.
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <aside className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create Team
            </CardTitle>
            <CardDescription>
              Setup team baru lengkap dengan department owner dan optional lead employee.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {canManageTeams ? (
              <form className="space-y-4" onSubmit={onSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="department_id">Department</Label>
                  <select
                    className="field-select"
                    id="department_id"
                    {...departmentField}
                    onChange={(event) => {
                      departmentField.onChange(event)
                      form.setValue('lead_employee_id', '')
                    }}
                  >
                    <option value="">Select department</option>
                    {departmentsQuery.data?.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-rose-700">
                    {form.formState.errors.department_id?.message}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Team Name</Label>
                    <input
                      className="field-select"
                      id="name"
                      {...form.register('name')}
                    />
                    <p className="text-sm text-rose-700">{form.formState.errors.name?.message}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Team Code</Label>
                    <input
                      className="field-select"
                      id="code"
                      {...form.register('code')}
                    />
                    <p className="text-sm text-rose-700">{form.formState.errors.code?.message}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lead_employee_id">Team Lead</Label>
                  <select
                    className="field-select"
                    id="lead_employee_id"
                    {...form.register('lead_employee_id')}
                  >
                    <option value="">Assign later</option>
                    {availableLeads.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.full_name}
                        {' • '}
                        {employee.employee_number}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    className="field-area"
                    id="description"
                    {...form.register('description')}
                  />
                </div>

                {createMutation.isError ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {getErrorMessage(createMutation.error)}
                  </div>
                ) : null}

                <Button className="w-full" disabled={createMutation.isPending} type="submit">
                  {createMutation.isPending ? 'Creating team...' : 'Create Team'}
                </Button>
              </form>
            ) : (
              <div className="rounded-[24px] border border-dashed border-app-border px-5 py-8 text-center">
                <p className="font-semibold">Team management restricted</p>
                <p className="mt-2 text-sm leading-6 text-app-muted-foreground">
                  Akun ini hanya punya akses view terhadap struktur organisasi.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat-card">
      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-app-muted-foreground">{label}</p>
      <p className="mt-3 text-3xl font-extrabold tracking-[-0.05em]">{value}</p>
    </div>
  )
}
