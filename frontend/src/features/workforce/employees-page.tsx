import { useDeferredValue, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Filter, Plus, Search, UsersRound } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/features/auth/auth-context'
import { getTeams } from '@/features/organization/organization-api'
import {
  createEmployee,
  getDepartments,
  getEmployees,
  type CreateEmployeePayload,
} from '@/features/workforce/workforce-api'
import { getErrorMessage } from '@/lib/http'

const employeeSchema = z.object({
  employee_number: z.string().min(3, 'Employee number wajib diisi.'),
  first_name: z.string().min(2, 'Nama depan wajib diisi.'),
  last_name: z.string().min(2, 'Nama belakang wajib diisi.'),
  work_email: z.email({ message: 'Email kerja harus valid.' }),
  personal_email: z.string().optional(),
  phone: z.string().optional(),
  job_title: z.string().min(2, 'Job title wajib diisi.'),
  employment_type: z.enum(['permanent', 'contract', 'probation', 'internship']),
  employment_status: z.enum(['active', 'inactive', 'probation', 'resigned']),
  department_id: z.string().min(1, 'Pilih department.'),
  team_id: z.string().optional(),
  hire_date: z.string().min(1, 'Hire date wajib diisi.'),
  birth_date: z.string().optional(),
})

type EmployeeFormValues = z.infer<typeof employeeSchema>

const statusVariantMap = {
  active: 'success',
  probation: 'warning',
  resigned: 'danger',
  inactive: 'neutral',
} as const

export function EmployeesPage() {
  const { session } = useAuth()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const canCreate = session?.user.permissions.includes('employees.create') ?? false

  const employeesQuery = useQuery({
    queryKey: ['employees', deferredSearch],
    queryFn: () => getEmployees(deferredSearch),
  })

  const departmentsQuery = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
  })

  const teamsQuery = useQuery({
    queryKey: ['teams'],
    queryFn: getTeams,
  })

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      employee_number: '',
      first_name: '',
      last_name: '',
      work_email: '',
      personal_email: '',
      phone: '',
      job_title: '',
      employment_type: 'permanent',
      employment_status: 'active',
      department_id: '',
      team_id: '',
      hire_date: new Date().toISOString().slice(0, 10),
      birth_date: '',
    },
  })

  const selectedDepartmentId = form.watch('department_id')
  const departmentField = form.register('department_id')
  const availableTeams = teamsQuery.data?.filter((team) => {
    if (!selectedDepartmentId) {
      return true
    }

    return team.department?.id === Number(selectedDepartmentId)
  }) ?? []

  const createMutation = useMutation({
    mutationFn: (payload: CreateEmployeePayload) => createEmployee(payload),
    onSuccess: () => {
      form.reset({
        employee_number: '',
        first_name: '',
        last_name: '',
        work_email: '',
        personal_email: '',
        phone: '',
        job_title: '',
        employment_type: 'permanent',
        employment_status: 'active',
        department_id: '',
        team_id: '',
        hire_date: new Date().toISOString().slice(0, 10),
        birth_date: '',
      })

      void queryClient.invalidateQueries({ queryKey: ['employees'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      void queryClient.invalidateQueries({ queryKey: ['organization'] })
      void queryClient.invalidateQueries({ queryKey: ['teams'] })
      void queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
    },
  })

  const onSubmit = form.handleSubmit((values) => {
    createMutation.mutate({
      employee_number: values.employee_number,
      first_name: values.first_name,
      last_name: values.last_name,
      work_email: values.work_email,
      job_title: values.job_title,
      employment_type: values.employment_type,
      employment_status: values.employment_status,
      department_id: Number(values.department_id),
      team_id: values.team_id ? Number(values.team_id) : undefined,
      hire_date: values.hire_date,
      personal_email: values.personal_email || undefined,
      phone: values.phone || undefined,
      birth_date: values.birth_date || undefined,
    })
  })

  const totalEmployees = employeesQuery.data?.meta?.total ?? employeesQuery.data?.items.length ?? 0
  const activeEmployees = employeesQuery.data?.items.filter(
    (employee) => employee.employment_status === 'active',
  ).length ?? 0

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <section className="space-y-6">
        <Card>
          <CardHeader className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <span className="section-kicker">Workforce Directory</span>
              <div>
                <CardTitle className="text-3xl">Direktori karyawan yang siap dipakai kerja</CardTitle>
                <CardDescription className="mt-2 text-base">
                  Semua identitas kerja, job title, department, dan team diringkas
                  dalam satu registry yang mudah dipindai.
                </CardDescription>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <InfoStat label="Total" value={totalEmployees} />
                <InfoStat label="Active" value={activeEmployees} />
                <InfoStat label="Teams" value={teamsQuery.data?.length ?? 0} />
              </div>
            </div>

            <div className="w-full md:max-w-lg">
              <div className="rounded-[26px] border border-app-border bg-white/68 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]">
                <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-[0.28em] text-app-muted-foreground">
                  Search and Scope
                </p>
                <div className="flex w-full items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-app-muted-foreground" />
                    <Input
                      className="pl-11"
                      placeholder="Cari nama, job title, atau email"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                    />
                  </div>
                  <Button size="sm" variant="secondary" type="button">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daftar karyawan</CardTitle>
            <CardDescription>Hasil pencarian terbaru dari workforce registry.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {employeesQuery.isLoading ? (
              <p className="text-sm text-app-muted-foreground">Loading workforce registry...</p>
            ) : (
              employeesQuery.data?.items.map((employee) => (
                <article
                  className="data-row flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center lg:justify-between"
                  key={employee.id}
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-bold">{employee.full_name}</p>
                      <Badge
                        variant={
                          statusVariantMap[
                            employee.employment_status as keyof typeof statusVariantMap
                          ] ?? 'neutral'
                        }
                      >
                        {employee.employment_status}
                      </Badge>
                    </div>
                    <p className="text-sm text-app-muted-foreground">
                      {employee.job_title}
                      {' • '}
                      {employee.department?.name ?? 'No department'}
                      {' • '}
                      {employee.team?.name ?? 'No team'}
                    </p>
                    <p className="font-mono text-xs text-app-muted-foreground">
                      {employee.employee_number}
                      {' • '}
                      {employee.work_email}
                    </p>
                  </div>
                  <div className="rounded-[20px] bg-black/4 px-4 py-3 text-sm text-app-muted-foreground">
                    Hire date:
                    {' '}
                    <span className="font-semibold text-app-foreground">{employee.hire_date}</span>
                  </div>
                </article>
              ))
            )}

            {!employeesQuery.isLoading && employeesQuery.data?.items.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-app-border px-6 py-10 text-center">
                <UsersRound className="mx-auto h-8 w-8 text-app-muted-foreground" />
                <p className="mt-3 text-lg font-semibold">No employees found</p>
                <p className="mt-1 text-sm text-app-muted-foreground">
                  Ubah kata kunci pencarian atau tambahkan employee baru dari panel kanan.
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
              Tambah Karyawan
            </CardTitle>
            <CardDescription>
              Form ini menulis data langsung ke backend melalui workflow validasi yang sama.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {canCreate ? (
              <form className="space-y-4" onSubmit={onSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="employee_number">Employee Number</Label>
                    <Input id="employee_number" {...form.register('employee_number')} />
                    <p className="text-sm text-rose-700">
                      {form.formState.errors.employee_number?.message}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department_id">Department</Label>
                    <select
                      className="field-select"
                      id="department_id"
                      {...departmentField}
                      onChange={(event) => {
                        departmentField.onChange(event)
                        form.setValue('team_id', '')
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="team_id">Team</Label>
                  <select className="field-select" id="team_id" {...form.register('team_id')}>
                    <option value="">Assign later</option>
                    {availableTeams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                        {' • '}
                        {team.code}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input id="first_name" {...form.register('first_name')} />
                    <p className="text-sm text-rose-700">
                      {form.formState.errors.first_name?.message}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input id="last_name" {...form.register('last_name')} />
                    <p className="text-sm text-rose-700">
                      {form.formState.errors.last_name?.message}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="work_email">Work Email</Label>
                  <Input id="work_email" type="email" {...form.register('work_email')} />
                  <p className="text-sm text-rose-700">
                    {form.formState.errors.work_email?.message}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job_title">Job Title</Label>
                  <Input id="job_title" {...form.register('job_title')} />
                  <p className="text-sm text-rose-700">
                    {form.formState.errors.job_title?.message}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="employment_type">Employment Type</Label>
                    <select className="field-select" id="employment_type" {...form.register('employment_type')}>
                      <option value="permanent">Permanent</option>
                      <option value="contract">Contract</option>
                      <option value="probation">Probation</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="employment_status">Employment Status</Label>
                    <select className="field-select" id="employment_status" {...form.register('employment_status')}>
                      <option value="active">Active</option>
                      <option value="probation">Probation</option>
                      <option value="inactive">Inactive</option>
                      <option value="resigned">Resigned</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hire_date">Hire Date</Label>
                  <Input id="hire_date" type="date" {...form.register('hire_date')} />
                  <p className="text-sm text-rose-700">
                    {form.formState.errors.hire_date?.message}
                  </p>
                </div>

                {createMutation.isError ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {getErrorMessage(createMutation.error)}
                  </div>
                ) : null}

                <Button className="w-full" type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Saving employee...' : 'Create Employee'}
                </Button>
              </form>
            ) : (
              <div className="rounded-[24px] border border-dashed border-app-border px-5 py-8 text-center">
                <p className="font-semibold">Create permission not granted</p>
                <p className="mt-2 text-sm leading-6 text-app-muted-foreground">
                  Role Anda hanya memiliki akses baca terhadap employee directory.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  )
}

function InfoStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat-card">
      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-app-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-2xl font-extrabold tracking-[-0.05em]">{value}</p>
    </div>
  )
}
