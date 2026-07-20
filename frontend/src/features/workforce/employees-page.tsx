import { startTransition, useDeferredValue, useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FileBadge2, FileUp, Plus, Save, Search, ShieldCheck, Trash2, UsersRound } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/features/auth/auth-context'
import {
  createEmployee,
  deleteEmployeeDocument,
  getEmployee,
  getEmployeeAuditLogs,
  getEmployeeLookups,
  getEmployees,
  updateEmployee,
  uploadEmployeeDocument,
  type EmployeeMutationPayload,
} from '@/features/workforce/workforce-api'
import { getErrorData, getErrorMessage } from '@/lib/http'
import type {
  AuditLog,
  Employee,
  EmployeeBankAccount,
  EmployeeCertification,
  EmployeeEducation,
  EmployeeEmergencyContact,
  EmployeeExperience,
  EmployeeFamilyMember,
  EmployeeHistoryEntry,
  EmployeeSkill,
} from '@/types/api'

interface DraftSalaryHistory {
  id?: number
  component: string
  amount: string
  currency: string
  pay_frequency: string
  effective_date: string
  end_date: string
  is_current: boolean
  notes: string
}

interface DraftContract {
  id?: number
  contract_type: string
  contract_number: string
  start_date: string
  end_date: string
  status: string
  terms: string
  notes: string
}

interface EmployeeDraft {
  employee_number: string
  first_name: string
  middle_name: string
  last_name: string
  preferred_name: string
  work_email: string
  personal_email: string
  phone: string
  gender: string
  marital_status: string
  place_of_birth: string
  address: string
  city: string
  state: string
  postal_code: string
  country: string
  identity_card_number: string
  passport_number: string
  passport_expiry_date: string
  npwp_number: string
  bpjs_health_number: string
  bpjs_employment_number: string
  job_title: string
  employment_type: string
  employment_status: string
  department_id: string
  branch_id: string
  team_id: string
  division_id: string
  position_id: string
  manager_id: string
  user_id: string
  hire_date: string
  birth_date: string
  family: EmployeeFamilyMember[]
  emergency_contacts: EmployeeEmergencyContact[]
  educations: EmployeeEducation[]
  experiences: EmployeeExperience[]
  skills: EmployeeSkill[]
  certifications: EmployeeCertification[]
  bank_accounts: EmployeeBankAccount[]
  salary_histories: DraftSalaryHistory[]
  contracts: DraftContract[]
}

interface DocumentDraft {
  category: string
  label: string
  issued_at: string
  expires_at: string
  notes: string
  file: File | null
}

const statusVariantMap = {
  active: 'success',
  probation: 'warning',
  resigned: 'danger',
  inactive: 'neutral',
} as const

const documentCategoryOptions = [
  { value: 'photo', label: 'Photo' },
  { value: 'identity-card', label: 'Identity Card' },
  { value: 'passport', label: 'Passport' },
  { value: 'npwp', label: 'NPWP' },
  { value: 'bpjs', label: 'BPJS' },
  { value: 'contract', label: 'Contract' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'other', label: 'Other' },
]

export function EmployeesPage() {
  const { session } = useAuth()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null)
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [draft, setDraft] = useState<EmployeeDraft>(createEmptyDraft())
  const [documentDraft, setDocumentDraft] = useState<DocumentDraft>(createEmptyDocumentDraft())
  const deferredSearch = useDeferredValue(search)

  const canCreate = session?.user.permissions.includes('employees.create') ?? false
  const canUpdate = session?.user.permissions.includes('employees.update') ?? false

  const employeesQuery = useQuery({
    queryKey: ['employees', deferredSearch],
    queryFn: () => getEmployees(deferredSearch),
  })

  const lookupsQuery = useQuery({
    queryKey: ['employee-lookups'],
    queryFn: getEmployeeLookups,
  })

  const detailQuery = useQuery({
    queryKey: ['employee', selectedEmployeeId],
    queryFn: () => getEmployee(selectedEmployeeId as number),
    enabled: selectedEmployeeId !== null && !isCreatingNew,
  })

  const employeeAuditLogsQuery = useQuery({
    queryKey: ['employee-audit-logs', selectedEmployeeId],
    queryFn: () => getEmployeeAuditLogs(selectedEmployeeId as number),
    enabled: selectedEmployeeId !== null && !isCreatingNew,
  })

  useEffect(() => {
    if (isCreatingNew || selectedEmployeeId !== null) {
      return
    }

    const firstEmployee = employeesQuery.data?.items[0]

    if (firstEmployee) {
      setSelectedEmployeeId(firstEmployee.id)
    }
  }, [employeesQuery.data?.items, isCreatingNew, selectedEmployeeId])

  useEffect(() => {
    if (!detailQuery.data || isCreatingNew) {
      return
    }

    startTransition(() => {
      setDraft(employeeToDraft(detailQuery.data))
    })
  }, [detailQuery.data, isCreatingNew])

  const createMutation = useMutation({
    mutationFn: (payload: EmployeeMutationPayload) => createEmployee(payload),
    onSuccess: (employee) => {
      hydrateAfterMutation(employee)
      setIsCreatingNew(false)
      setSelectedEmployeeId(employee.id)
    },
  })

  const updateMutation = useMutation({
    mutationFn: (payload: EmployeeMutationPayload) => updateEmployee(selectedEmployeeId as number, payload),
    onSuccess: (employee) => {
      hydrateAfterMutation(employee)
    },
  })

  const uploadDocumentMutation = useMutation({
    mutationFn: () => {
      if (!selectedEmployeeId || !documentDraft.file) {
        throw new Error('Pilih employee dan file dokumen terlebih dahulu.')
      }

      return uploadEmployeeDocument(selectedEmployeeId, {
        category: documentDraft.category,
        label: documentDraft.label,
        file: documentDraft.file,
        issued_at: emptyToUndefined(documentDraft.issued_at),
        expires_at: emptyToUndefined(documentDraft.expires_at),
        notes: emptyToUndefined(documentDraft.notes),
      })
    },
    onSuccess: (employee) => {
      hydrateAfterMutation(employee)
      setDocumentDraft(createEmptyDocumentDraft())
    },
  })

  const deleteDocumentMutation = useMutation({
    mutationFn: (documentId: number) => deleteEmployeeDocument(selectedEmployeeId as number, documentId),
    onSuccess: (employee) => {
      hydrateAfterMutation(employee)
    },
  })

  const handleSelectEmployee = (employeeId: number) => {
    setIsCreatingNew(false)
    setSelectedEmployeeId(employeeId)
  }

  const handleCreateNew = () => {
    setIsCreatingNew(true)
    setSelectedEmployeeId(null)
    setDraft(createEmptyDraft())
    setDocumentDraft(createEmptyDocumentDraft())
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const payload = draftToPayload(draft)

    if (isCreatingNew) {
      createMutation.mutate(payload)
      return
    }

    if (!selectedEmployeeId) {
      return
    }

    updateMutation.mutate(payload)
  }

  const saveError = createMutation.error ?? updateMutation.error
  const saveValidationErrors = getErrorData<Record<string, string[]>>(saveError)
  const selectedEmployee = detailQuery.data
  const isSaving = createMutation.isPending || updateMutation.isPending
  const activeEmployees = employeesQuery.data?.items.filter(
    (employee) => employee.employment_status === 'active',
  ).length ?? 0
  const totalEmployees = employeesQuery.data?.meta?.total ?? employeesQuery.data?.items.length ?? 0
  const lookups = lookupsQuery.data
  const availableTeams = lookups?.teams.filter((team) => {
    if (!draft.department_id) {
      return true
    }

    return team.department?.id === Number(draft.department_id)
  }) ?? []
  const availableDivisions = lookups?.divisions.filter((division) => {
    if (!draft.department_id) {
      return true
    }

    return division.department?.id === Number(draft.department_id)
  }) ?? []
  const availablePositions = lookups?.positions.filter((position) => {
    if (!draft.division_id) {
      return true
    }

    return position.division?.id === Number(draft.division_id)
  }) ?? []

  return (
    <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
      <section className="space-y-6">
        <Card>
          <CardHeader className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <span className="section-kicker">Employee Management</span>
              <div>
                <CardTitle className="text-3xl">Profil, payroll, dokumen, dan histori karyawan</CardTitle>
                <CardDescription className="mt-2 max-w-2xl text-base leading-7">
                  Workspace ini menyatukan data identitas, struktur organisasi, family,
                  bank account, salary, contract, upload document, history, dan audit log.
                </CardDescription>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <InfoStat label="Total" value={totalEmployees} />
                <InfoStat label="Active" value={activeEmployees} />
                <InfoStat label="Branches" value={lookups?.branches.length ?? 0} />
              </div>
            </div>

            <div className="w-full md:max-w-lg">
              <div className="rounded-[26px] border border-app-border bg-white/68 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)]">
                <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-[0.28em] text-app-muted-foreground">
                  Search Directory
                </p>
                <div className="flex w-full items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-app-muted-foreground" />
                    <Input
                      className="pl-11"
                      placeholder="Cari nama, employee code, email, NPWP, atau job title"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                    />
                  </div>
                  {canCreate ? (
                    <Button size="sm" type="button" onClick={handleCreateNew}>
                      <Plus className="h-4 w-4" />
                      Baru
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employee Directory</CardTitle>
            <CardDescription>Pilih employee untuk membuka detail lengkapnya.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {employeesQuery.isLoading ? (
              <p className="text-sm text-app-muted-foreground">Loading employee directory...</p>
            ) : null}

            {!employeesQuery.isLoading && employeesQuery.data?.items.map((employee) => {
              const isActive = !isCreatingNew && selectedEmployeeId === employee.id

              return (
                <button
                  className={[
                    'data-row flex w-full flex-col gap-3 px-5 py-4 text-left transition',
                    isActive ? 'border-[rgba(185,123,49,0.5)] bg-[#fffaf2]' : '',
                  ].join(' ')}
                  key={employee.id}
                  onClick={() => handleSelectEmployee(employee.id)}
                  type="button"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
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
                        {employee.branch?.code ? (
                          <Badge variant="neutral">{employee.branch.code}</Badge>
                        ) : null}
                      </div>
                      <p className="text-sm text-app-muted-foreground">
                        {employee.job_title}
                        {' • '}
                        {employee.department?.name ?? 'No department'}
                        {' • '}
                        {employee.position?.name ?? 'No position'}
                      </p>
                      <p className="font-mono text-xs text-app-muted-foreground">
                        {employee.employee_code}
                        {' • '}
                        {employee.work_email}
                      </p>
                    </div>

                    <div className="rounded-[20px] bg-black/4 px-4 py-3 text-sm text-app-muted-foreground">
                      Hire date:
                      {' '}
                      <span className="font-semibold text-app-foreground">
                        {formatDate(employee.hire_date)}
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}

            {!employeesQuery.isLoading && employeesQuery.data?.items.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-app-border px-6 py-10 text-center">
                <UsersRound className="mx-auto h-8 w-8 text-app-muted-foreground" />
                <p className="mt-3 text-lg font-semibold">No employees found</p>
                <p className="mt-1 text-sm text-app-muted-foreground">
                  Ubah kata kunci pencarian atau tambahkan employee baru.
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <Card>
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <span className="section-kicker">
                {isCreatingNew ? 'New Employee' : 'Employee Profile'}
              </span>
              <div>
                <CardTitle className="text-3xl">
                  {isCreatingNew ? 'Buat profil employee baru' : (selectedEmployee?.full_name ?? 'Employee detail')}
                </CardTitle>
                <CardDescription className="mt-2 max-w-2xl text-base leading-7">
                  Kelola identitas, data legal, relasi keluarga, payroll, kontrak, dan file
                  pendukung dari satu form.
                </CardDescription>
              </div>
            </div>

            <div className="rounded-[26px] bg-app-accent px-5 py-4 text-white shadow-[0_24px_40px_-28px_rgba(19,35,60,0.8)]">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Current Scope</p>
              <p className="mt-1 text-lg font-semibold">
                {isCreatingNew ? 'Draft employee' : draft.employee_number || 'No employee code'}
              </p>
              <p className="mt-1 text-sm text-slate-300">
                {draft.department_id
                  ? lookups?.departments.find((department) => department.id === Number(draft.department_id))?.name
                  : 'Unassigned department'}
              </p>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="space-y-6 pt-6">
            {saveError ? (
              <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800">
                <p className="font-semibold">{getErrorMessage(saveError)}</p>
                {saveValidationErrors ? (
                  <ul className="mt-3 list-disc space-y-1 pl-5">
                    {Object.entries(saveValidationErrors).slice(0, 6).map(([field, messages]) => (
                      <li key={field}>
                        {field}
                        {': '}
                        {messages.join(', ')}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="flex flex-wrap gap-3">
                {(isCreatingNew ? canCreate : canUpdate) ? (
                  <Button disabled={isSaving} type="submit">
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Employee'}
                  </Button>
                ) : null}
                {isCreatingNew ? (
                  <Button type="button" variant="secondary" onClick={() => {
                    setIsCreatingNew(false)
                    if (employeesQuery.data?.items[0]) {
                      setSelectedEmployeeId(employeesQuery.data.items[0].id)
                    }
                  }}>
                    Cancel Draft
                  </Button>
                ) : null}
              </div>

              <SectionCard
                description="Data profil utama, employee code, kontak, identitas pribadi, dan legal ID."
                title="Profile & Identity"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Employee Code">
                    <Input
                      required
                      value={draft.employee_number}
                      onChange={(event) => setDraft((current) => ({ ...current, employee_number: event.target.value }))}
                    />
                  </Field>
                  <Field label="Work Email">
                    <Input
                      required
                      type="email"
                      value={draft.work_email}
                      onChange={(event) => setDraft((current) => ({ ...current, work_email: event.target.value }))}
                    />
                  </Field>
                  <Field label="First Name">
                    <Input
                      required
                      value={draft.first_name}
                      onChange={(event) => setDraft((current) => ({ ...current, first_name: event.target.value }))}
                    />
                  </Field>
                  <Field label="Middle Name">
                    <Input
                      value={draft.middle_name}
                      onChange={(event) => setDraft((current) => ({ ...current, middle_name: event.target.value }))}
                    />
                  </Field>
                  <Field label="Last Name">
                    <Input
                      required
                      value={draft.last_name}
                      onChange={(event) => setDraft((current) => ({ ...current, last_name: event.target.value }))}
                    />
                  </Field>
                  <Field label="Preferred Name">
                    <Input
                      value={draft.preferred_name}
                      onChange={(event) => setDraft((current) => ({ ...current, preferred_name: event.target.value }))}
                    />
                  </Field>
                  <Field label="Phone">
                    <Input
                      value={draft.phone}
                      onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))}
                    />
                  </Field>
                  <Field label="Personal Email">
                    <Input
                      type="email"
                      value={draft.personal_email}
                      onChange={(event) => setDraft((current) => ({ ...current, personal_email: event.target.value }))}
                    />
                  </Field>
                  <Field label="Gender">
                    <select
                      className="field-select"
                      value={draft.gender}
                      onChange={(event) => setDraft((current) => ({ ...current, gender: event.target.value }))}
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </Field>
                  <Field label="Marital Status">
                    <select
                      className="field-select"
                      value={draft.marital_status}
                      onChange={(event) => setDraft((current) => ({ ...current, marital_status: event.target.value }))}
                    >
                      <option value="">Select status</option>
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="divorced">Divorced</option>
                      <option value="widowed">Widowed</option>
                    </select>
                  </Field>
                  <Field label="Place of Birth">
                    <Input
                      value={draft.place_of_birth}
                      onChange={(event) => setDraft((current) => ({ ...current, place_of_birth: event.target.value }))}
                    />
                  </Field>
                  <Field label="Birth Date">
                    <Input
                      type="date"
                      value={draft.birth_date}
                      onChange={(event) => setDraft((current) => ({ ...current, birth_date: event.target.value }))}
                    />
                  </Field>
                  <Field label="NIK">
                    <Input
                      value={draft.identity_card_number}
                      onChange={(event) => setDraft((current) => ({ ...current, identity_card_number: event.target.value }))}
                    />
                  </Field>
                  <Field label="Passport Number">
                    <Input
                      value={draft.passport_number}
                      onChange={(event) => setDraft((current) => ({ ...current, passport_number: event.target.value }))}
                    />
                  </Field>
                  <Field label="Passport Expiry">
                    <Input
                      type="date"
                      value={draft.passport_expiry_date}
                      onChange={(event) => setDraft((current) => ({ ...current, passport_expiry_date: event.target.value }))}
                    />
                  </Field>
                  <Field label="NPWP">
                    <Input
                      value={draft.npwp_number}
                      onChange={(event) => setDraft((current) => ({ ...current, npwp_number: event.target.value }))}
                    />
                  </Field>
                  <Field label="BPJS Health">
                    <Input
                      value={draft.bpjs_health_number}
                      onChange={(event) => setDraft((current) => ({ ...current, bpjs_health_number: event.target.value }))}
                    />
                  </Field>
                  <Field label="BPJS Employment">
                    <Input
                      value={draft.bpjs_employment_number}
                      onChange={(event) => setDraft((current) => ({ ...current, bpjs_employment_number: event.target.value }))}
                    />
                  </Field>
                  <Field className="md:col-span-2" label="Address">
                    <textarea
                      className="field-area"
                      value={draft.address}
                      onChange={(event) => setDraft((current) => ({ ...current, address: event.target.value }))}
                    />
                  </Field>
                  <Field label="City">
                    <Input
                      value={draft.city}
                      onChange={(event) => setDraft((current) => ({ ...current, city: event.target.value }))}
                    />
                  </Field>
                  <Field label="State / Province">
                    <Input
                      value={draft.state}
                      onChange={(event) => setDraft((current) => ({ ...current, state: event.target.value }))}
                    />
                  </Field>
                  <Field label="Postal Code">
                    <Input
                      value={draft.postal_code}
                      onChange={(event) => setDraft((current) => ({ ...current, postal_code: event.target.value }))}
                    />
                  </Field>
                  <Field label="Country">
                    <Input
                      value={draft.country}
                      onChange={(event) => setDraft((current) => ({ ...current, country: event.target.value }))}
                    />
                  </Field>
                </div>
              </SectionCard>

              <SectionCard
                description="Department, branch, division, position, status, kontrak kerja, dan reporting line."
                title="Employment & Organization"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Job Title">
                    <Input
                      required
                      value={draft.job_title}
                      onChange={(event) => setDraft((current) => ({ ...current, job_title: event.target.value }))}
                    />
                  </Field>
                  <Field label="Department">
                    <select
                      className="field-select"
                      required
                      value={draft.department_id}
                      onChange={(event) => {
                        const nextDepartmentId = event.target.value

                        setDraft((current) => ({
                          ...current,
                          department_id: nextDepartmentId,
                          team_id: '',
                          division_id: '',
                          position_id: '',
                        }))
                      }}
                    >
                      <option value="">Select department</option>
                      {lookups?.departments.map((department) => (
                        <option key={department.id} value={department.id}>
                          {department.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Branch">
                    <select
                      className="field-select"
                      value={draft.branch_id}
                      onChange={(event) => setDraft((current) => ({ ...current, branch_id: event.target.value }))}
                    >
                      <option value="">Select branch</option>
                      {lookups?.branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Division">
                    <select
                      className="field-select"
                      value={draft.division_id}
                      onChange={(event) => {
                        const nextDivisionId = event.target.value

                        setDraft((current) => ({
                          ...current,
                          division_id: nextDivisionId,
                          position_id: '',
                        }))
                      }}
                    >
                      <option value="">Select division</option>
                      {availableDivisions.map((division) => (
                        <option key={division.id} value={division.id}>
                          {division.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Position">
                    <select
                      className="field-select"
                      value={draft.position_id}
                      onChange={(event) => setDraft((current) => ({ ...current, position_id: event.target.value }))}
                    >
                      <option value="">Select position</option>
                      {availablePositions.map((position) => (
                        <option key={position.id} value={position.id}>
                          {position.name}
                          {position.grade ? ` • ${position.grade}` : ''}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Team">
                    <select
                      className="field-select"
                      value={draft.team_id}
                      onChange={(event) => setDraft((current) => ({ ...current, team_id: event.target.value }))}
                    >
                      <option value="">Assign later</option>
                      {availableTeams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Manager">
                    <select
                      className="field-select"
                      value={draft.manager_id}
                      onChange={(event) => setDraft((current) => ({ ...current, manager_id: event.target.value }))}
                    >
                      <option value="">Select manager</option>
                      {lookups?.managers.map((manager) => (
                        <option key={manager.id} value={manager.id}>
                          {manager.full_name}
                          {' • '}
                          {manager.job_title}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Employment Type">
                    <select
                      className="field-select"
                      required
                      value={draft.employment_type}
                      onChange={(event) => setDraft((current) => ({ ...current, employment_type: event.target.value }))}
                    >
                      {lookups?.employment_types.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Employment Status">
                    <select
                      className="field-select"
                      required
                      value={draft.employment_status}
                      onChange={(event) => setDraft((current) => ({ ...current, employment_status: event.target.value }))}
                    >
                      {lookups?.employment_statuses.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Hire Date">
                    <Input
                      required
                      type="date"
                      value={draft.hire_date}
                      onChange={(event) => setDraft((current) => ({ ...current, hire_date: event.target.value }))}
                    />
                  </Field>
                </div>
              </SectionCard>

              <SectionCard
                description="Keluarga dan emergency contact untuk kebutuhan administratif dan keadaan darurat."
                title="Family & Emergency Contact"
              >
                <RepeaterHeader
                  buttonLabel="Tambah Family"
                  onAdd={() => setDraft((current) => ({
                    ...current,
                    family: [
                      ...current.family,
                      { name: '', relationship: '', birth_date: '', occupation: '', dependent: false },
                    ],
                  }))}
                  title="Family"
                />
                <div className="space-y-4">
                  {draft.family.map((member, index) => (
                    <div className="rounded-[24px] border border-app-border bg-white/68 p-4" key={`family-${index}`}>
                      <div className="mb-4 flex items-center justify-between">
                        <p className="font-semibold">Family Member {index + 1}</p>
                        <Button
                          size="sm"
                          type="button"
                          variant="secondary"
                          onClick={() => setDraft((current) => ({
                            ...current,
                            family: removeArrayItem(current.family, index),
                          }))}
                        >
                          <Trash2 className="h-4 w-4" />
                          Hapus
                        </Button>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Name">
                          <Input
                            value={member.name}
                            onChange={(event) => setDraft((current) => ({
                              ...current,
                              family: updateArrayItem(current.family, index, { name: event.target.value }),
                            }))}
                          />
                        </Field>
                        <Field label="Relationship">
                          <Input
                            value={member.relationship}
                            onChange={(event) => setDraft((current) => ({
                              ...current,
                              family: updateArrayItem(current.family, index, { relationship: event.target.value }),
                            }))}
                          />
                        </Field>
                        <Field label="Birth Date">
                          <Input
                            type="date"
                            value={member.birth_date ?? ''}
                            onChange={(event) => setDraft((current) => ({
                              ...current,
                              family: updateArrayItem(current.family, index, { birth_date: event.target.value }),
                            }))}
                          />
                        </Field>
                        <Field label="Occupation">
                          <Input
                            value={member.occupation ?? ''}
                            onChange={(event) => setDraft((current) => ({
                              ...current,
                              family: updateArrayItem(current.family, index, { occupation: event.target.value }),
                            }))}
                          />
                        </Field>
                        <label className="inline-flex items-center gap-3 text-sm font-medium text-app-foreground">
                          <input
                            checked={member.dependent ?? false}
                            className="h-4 w-4"
                            type="checkbox"
                            onChange={(event) => setDraft((current) => ({
                              ...current,
                              family: updateArrayItem(current.family, index, { dependent: event.target.checked }),
                            }))}
                          />
                          Dependent
                        </label>
                      </div>
                    </div>
                  ))}
                  {draft.family.length === 0 ? <EmptyRepeater text="Belum ada data family." /> : null}
                </div>

                <div className="mt-6">
                  <RepeaterHeader
                    buttonLabel="Tambah Contact"
                    onAdd={() => setDraft((current) => ({
                      ...current,
                      emergency_contacts: [
                        ...current.emergency_contacts,
                        { name: '', relationship: '', phone: '', email: '', address: '' },
                      ],
                    }))}
                    title="Emergency Contact"
                  />
                  <div className="space-y-4">
                    {draft.emergency_contacts.map((contact, index) => (
                      <div className="rounded-[24px] border border-app-border bg-white/68 p-4" key={`emergency-${index}`}>
                        <div className="mb-4 flex items-center justify-between">
                          <p className="font-semibold">Emergency Contact {index + 1}</p>
                          <Button
                            size="sm"
                            type="button"
                            variant="secondary"
                            onClick={() => setDraft((current) => ({
                              ...current,
                              emergency_contacts: removeArrayItem(current.emergency_contacts, index),
                            }))}
                          >
                            <Trash2 className="h-4 w-4" />
                            Hapus
                          </Button>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <Field label="Name">
                            <Input
                              value={contact.name}
                              onChange={(event) => setDraft((current) => ({
                                ...current,
                                emergency_contacts: updateArrayItem(current.emergency_contacts, index, { name: event.target.value }),
                              }))}
                            />
                          </Field>
                          <Field label="Relationship">
                            <Input
                              value={contact.relationship}
                              onChange={(event) => setDraft((current) => ({
                                ...current,
                                emergency_contacts: updateArrayItem(current.emergency_contacts, index, { relationship: event.target.value }),
                              }))}
                            />
                          </Field>
                          <Field label="Phone">
                            <Input
                              value={contact.phone}
                              onChange={(event) => setDraft((current) => ({
                                ...current,
                                emergency_contacts: updateArrayItem(current.emergency_contacts, index, { phone: event.target.value }),
                              }))}
                            />
                          </Field>
                          <Field label="Email">
                            <Input
                              type="email"
                              value={contact.email ?? ''}
                              onChange={(event) => setDraft((current) => ({
                                ...current,
                                emergency_contacts: updateArrayItem(current.emergency_contacts, index, { email: event.target.value }),
                              }))}
                            />
                          </Field>
                          <Field className="md:col-span-2" label="Address">
                            <textarea
                              className="field-area"
                              value={contact.address ?? ''}
                              onChange={(event) => setDraft((current) => ({
                                ...current,
                                emergency_contacts: updateArrayItem(current.emergency_contacts, index, { address: event.target.value }),
                              }))}
                            />
                          </Field>
                        </div>
                      </div>
                    ))}
                    {draft.emergency_contacts.length === 0 ? (
                      <EmptyRepeater text="Belum ada emergency contact." />
                    ) : null}
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                description="Riwayat pendidikan, pengalaman kerja, skill, dan sertifikasi profesional."
                title="Education, Experience, Skill & Certification"
              >
                <SimpleEducationSection draft={draft} setDraft={setDraft} />
                <div className="mt-6">
                  <SimpleExperienceSection draft={draft} setDraft={setDraft} />
                </div>
                <div className="mt-6">
                  <SimpleSkillSection draft={draft} setDraft={setDraft} />
                </div>
                <div className="mt-6">
                  <SimpleCertificationSection draft={draft} setDraft={setDraft} />
                </div>
              </SectionCard>

              <SectionCard
                description="Informasi rekening bank, salary history, dan contract history."
                title="Bank, Salary & Contract"
              >
                <SimpleBankSection draft={draft} setDraft={setDraft} />
                <div className="mt-6">
                  <SimpleSalarySection draft={draft} setDraft={setDraft} />
                </div>
                <div className="mt-6">
                  <SimpleContractSection draft={draft} setDraft={setDraft} />
                </div>
              </SectionCard>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileUp className="h-5 w-5" />
              Upload Document
            </CardTitle>
            <CardDescription>
              Upload photo, identity card, passport, NPWP, BPJS, kontrak, atau dokumen pendukung lain.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedEmployeeId || isCreatingNew ? (
              <p className="rounded-[20px] border border-dashed border-app-border px-4 py-4 text-sm text-app-muted-foreground">
                Simpan employee terlebih dahulu untuk mengunggah dokumen dan menautkannya ke profil.
              </p>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Category">
                    <select
                      className="field-select"
                      value={documentDraft.category}
                      onChange={(event) => setDocumentDraft((current) => ({ ...current, category: event.target.value }))}
                    >
                      {documentCategoryOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Label">
                    <Input
                      value={documentDraft.label}
                      onChange={(event) => setDocumentDraft((current) => ({ ...current, label: event.target.value }))}
                    />
                  </Field>
                  <Field label="Issued At">
                    <Input
                      type="date"
                      value={documentDraft.issued_at}
                      onChange={(event) => setDocumentDraft((current) => ({ ...current, issued_at: event.target.value }))}
                    />
                  </Field>
                  <Field label="Expires At">
                    <Input
                      type="date"
                      value={documentDraft.expires_at}
                      onChange={(event) => setDocumentDraft((current) => ({ ...current, expires_at: event.target.value }))}
                    />
                  </Field>
                  <Field className="md:col-span-2" label="Notes">
                    <textarea
                      className="field-area"
                      value={documentDraft.notes}
                      onChange={(event) => setDocumentDraft((current) => ({ ...current, notes: event.target.value }))}
                    />
                  </Field>
                  <Field className="md:col-span-2" label="File">
                    <input
                      className="block w-full rounded-[18px] border border-app-border bg-white/86 px-4 py-3 text-sm"
                      type="file"
                      onChange={(event) => setDocumentDraft((current) => ({
                        ...current,
                        file: event.target.files?.[0] ?? null,
                      }))}
                    />
                  </Field>
                </div>

                {uploadDocumentMutation.error ? (
                  <p className="text-sm text-rose-700">{getErrorMessage(uploadDocumentMutation.error)}</p>
                ) : null}

                <Button
                  disabled={!documentDraft.file || uploadDocumentMutation.isPending}
                  type="button"
                  onClick={() => uploadDocumentMutation.mutate()}
                >
                  <FileBadge2 className="h-4 w-4" />
                  {uploadDocumentMutation.isPending ? 'Uploading...' : 'Upload Document'}
                </Button>

                <div className="space-y-3">
                  {selectedEmployee?.documents.map((document) => (
                    <article
                      className="data-row flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center lg:justify-between"
                      key={document.id}
                    >
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{document.label}</p>
                          <Badge variant="neutral">{document.category}</Badge>
                        </div>
                        <p className="text-sm text-app-muted-foreground">
                          {document.file_name}
                          {' • '}
                          {document.uploaded_by?.name ?? 'System'}
                        </p>
                        <a
                          className="text-sm font-medium text-app-accent underline-offset-4 hover:underline"
                          href={document.file_url}
                          rel="noreferrer"
                          target="_blank"
                        >
                          Open file
                        </a>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm text-app-muted-foreground">
                          {formatDate(document.created_at)}
                        </span>
                        {canUpdate ? (
                          <Button
                            disabled={deleteDocumentMutation.isPending}
                            size="sm"
                            type="button"
                            variant="secondary"
                            onClick={() => deleteDocumentMutation.mutate(document.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Hapus
                          </Button>
                        ) : null}
                      </div>
                    </article>
                  ))}
                  {selectedEmployee?.documents.length === 0 ? (
                    <EmptyRepeater text="Belum ada dokumen yang diunggah." />
                  ) : null}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>History</CardTitle>
              <CardDescription>
                Timeline perubahan utama dari join date, salary, kontrak, dan dokumen.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedEmployee?.history.map((entry, index) => (
                <HistoryRow entry={entry} key={`${entry.type}-${entry.date}-${index}`} />
              ))}
              {(selectedEmployee?.history.length ?? 0) === 0 ? (
                <EmptyRepeater text="Belum ada riwayat yang tampil untuk employee ini." />
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Audit Log
              </CardTitle>
              <CardDescription>
                Jejak perubahan sistem khusus untuk employee yang sedang dipilih.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {employeeAuditLogsQuery.isLoading ? (
                <p className="text-sm text-app-muted-foreground">Loading employee audit log...</p>
              ) : null}

              {employeeAuditLogsQuery.data?.items.map((log) => (
                <AuditLogRow key={log.id} log={log} />
              ))}

              {!employeeAuditLogsQuery.isLoading && (employeeAuditLogsQuery.data?.items.length ?? 0) === 0 ? (
                <EmptyRepeater text="Belum ada audit log untuk employee ini." />
              ) : null}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )

  function hydrateAfterMutation(employee: Employee) {
    setDraft(employeeToDraft(employee))
    void queryClient.invalidateQueries({ queryKey: ['employees'] })
    void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    void queryClient.invalidateQueries({ queryKey: ['organization'] })
    void queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
    void queryClient.invalidateQueries({ queryKey: ['employee', employee.id] })
    void queryClient.invalidateQueries({ queryKey: ['employee-audit-logs', employee.id] })
  }
}

function SimpleEducationSection({
  draft,
  setDraft,
}: {
  draft: EmployeeDraft
  setDraft: React.Dispatch<React.SetStateAction<EmployeeDraft>>
}) {
  return (
    <>
      <RepeaterHeader
        buttonLabel="Tambah Education"
        onAdd={() => setDraft((current) => ({
          ...current,
          educations: [
            ...current.educations,
            { institution: '', degree: '', major: '', start_year: undefined, end_year: undefined, gpa: undefined },
          ],
        }))}
        title="Education"
      />
      <div className="space-y-4">
        {draft.educations.map((education, index) => (
          <div className="rounded-[24px] border border-app-border bg-white/68 p-4" key={`education-${index}`}>
            <div className="mb-4 flex items-center justify-between">
              <p className="font-semibold">Education {index + 1}</p>
              <Button
                size="sm"
                type="button"
                variant="secondary"
                onClick={() => setDraft((current) => ({
                  ...current,
                  educations: removeArrayItem(current.educations, index),
                }))}
              >
                <Trash2 className="h-4 w-4" />
                Hapus
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Institution">
                <Input
                  value={education.institution}
                  onChange={(event) => setDraft((current) => ({
                    ...current,
                    educations: updateArrayItem(current.educations, index, { institution: event.target.value }),
                  }))}
                />
              </Field>
              <Field label="Degree">
                <Input
                  value={education.degree}
                  onChange={(event) => setDraft((current) => ({
                    ...current,
                    educations: updateArrayItem(current.educations, index, { degree: event.target.value }),
                  }))}
                />
              </Field>
              <Field label="Major">
                <Input
                  value={education.major ?? ''}
                  onChange={(event) => setDraft((current) => ({
                    ...current,
                    educations: updateArrayItem(current.educations, index, { major: event.target.value }),
                  }))}
                />
              </Field>
              <Field label="GPA">
                <Input
                  type="number"
                  value={education.gpa ?? ''}
                  onChange={(event) => setDraft((current) => ({
                    ...current,
                    educations: updateArrayItem(current.educations, index, {
                      gpa: event.target.value ? Number(event.target.value) : undefined,
                    }),
                  }))}
                />
              </Field>
              <Field label="Start Year">
                <Input
                  type="number"
                  value={education.start_year ?? ''}
                  onChange={(event) => setDraft((current) => ({
                    ...current,
                    educations: updateArrayItem(current.educations, index, {
                      start_year: event.target.value ? Number(event.target.value) : undefined,
                    }),
                  }))}
                />
              </Field>
              <Field label="End Year">
                <Input
                  type="number"
                  value={education.end_year ?? ''}
                  onChange={(event) => setDraft((current) => ({
                    ...current,
                    educations: updateArrayItem(current.educations, index, {
                      end_year: event.target.value ? Number(event.target.value) : undefined,
                    }),
                  }))}
                />
              </Field>
            </div>
          </div>
        ))}
        {draft.educations.length === 0 ? <EmptyRepeater text="Belum ada riwayat pendidikan." /> : null}
      </div>
    </>
  )
}

function SimpleExperienceSection({
  draft,
  setDraft,
}: {
  draft: EmployeeDraft
  setDraft: React.Dispatch<React.SetStateAction<EmployeeDraft>>
}) {
  return (
    <>
      <RepeaterHeader
        buttonLabel="Tambah Experience"
        onAdd={() => setDraft((current) => ({
          ...current,
          experiences: [
            ...current.experiences,
            { company: '', position: '', start_date: '', end_date: '', description: '' },
          ],
        }))}
        title="Experience"
      />
      <div className="space-y-4">
        {draft.experiences.map((experience, index) => (
          <div className="rounded-[24px] border border-app-border bg-white/68 p-4" key={`experience-${index}`}>
            <div className="mb-4 flex items-center justify-between">
              <p className="font-semibold">Experience {index + 1}</p>
              <Button
                size="sm"
                type="button"
                variant="secondary"
                onClick={() => setDraft((current) => ({
                  ...current,
                  experiences: removeArrayItem(current.experiences, index),
                }))}
              >
                <Trash2 className="h-4 w-4" />
                Hapus
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Company">
                <Input
                  value={experience.company}
                  onChange={(event) => setDraft((current) => ({
                    ...current,
                    experiences: updateArrayItem(current.experiences, index, { company: event.target.value }),
                  }))}
                />
              </Field>
              <Field label="Position">
                <Input
                  value={experience.position}
                  onChange={(event) => setDraft((current) => ({
                    ...current,
                    experiences: updateArrayItem(current.experiences, index, { position: event.target.value }),
                  }))}
                />
              </Field>
              <Field label="Start Date">
                <Input
                  type="date"
                  value={experience.start_date}
                  onChange={(event) => setDraft((current) => ({
                    ...current,
                    experiences: updateArrayItem(current.experiences, index, { start_date: event.target.value }),
                  }))}
                />
              </Field>
              <Field label="End Date">
                <Input
                  type="date"
                  value={experience.end_date ?? ''}
                  onChange={(event) => setDraft((current) => ({
                    ...current,
                    experiences: updateArrayItem(current.experiences, index, { end_date: event.target.value }),
                  }))}
                />
              </Field>
              <Field className="md:col-span-2" label="Description">
                <textarea
                  className="field-area"
                  value={experience.description ?? ''}
                  onChange={(event) => setDraft((current) => ({
                    ...current,
                    experiences: updateArrayItem(current.experiences, index, { description: event.target.value }),
                  }))}
                />
              </Field>
            </div>
          </div>
        ))}
        {draft.experiences.length === 0 ? <EmptyRepeater text="Belum ada riwayat pengalaman." /> : null}
      </div>
    </>
  )
}

function SimpleSkillSection({
  draft,
  setDraft,
}: {
  draft: EmployeeDraft
  setDraft: React.Dispatch<React.SetStateAction<EmployeeDraft>>
}) {
  return (
    <>
      <RepeaterHeader
        buttonLabel="Tambah Skill"
        onAdd={() => setDraft((current) => ({
          ...current,
          skills: [...current.skills, { name: '', category: '', level: 'intermediate', notes: '' }],
        }))}
        title="Skill"
      />
      <div className="space-y-4">
        {draft.skills.map((skill, index) => (
          <div className="rounded-[24px] border border-app-border bg-white/68 p-4" key={`skill-${index}`}>
            <div className="mb-4 flex items-center justify-between">
              <p className="font-semibold">Skill {index + 1}</p>
              <Button
                size="sm"
                type="button"
                variant="secondary"
                onClick={() => setDraft((current) => ({
                  ...current,
                  skills: removeArrayItem(current.skills, index),
                }))}
              >
                <Trash2 className="h-4 w-4" />
                Hapus
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Name">
                <Input
                  value={skill.name}
                  onChange={(event) => setDraft((current) => ({
                    ...current,
                    skills: updateArrayItem(current.skills, index, { name: event.target.value }),
                  }))}
                />
              </Field>
              <Field label="Category">
                <Input
                  value={skill.category ?? ''}
                  onChange={(event) => setDraft((current) => ({
                    ...current,
                    skills: updateArrayItem(current.skills, index, { category: event.target.value }),
                  }))}
                />
              </Field>
              <Field label="Level">
                <select
                  className="field-select"
                  value={skill.level ?? 'intermediate'}
                  onChange={(event) => setDraft((current) => ({
                    ...current,
                    skills: updateArrayItem(current.skills, index, { level: event.target.value }),
                  }))}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </Field>
              <Field className="md:col-span-2" label="Notes">
                <textarea
                  className="field-area"
                  value={skill.notes ?? ''}
                  onChange={(event) => setDraft((current) => ({
                    ...current,
                    skills: updateArrayItem(current.skills, index, { notes: event.target.value }),
                  }))}
                />
              </Field>
            </div>
          </div>
        ))}
        {draft.skills.length === 0 ? <EmptyRepeater text="Belum ada skill yang dicatat." /> : null}
      </div>
    </>
  )
}

function SimpleCertificationSection({
  draft,
  setDraft,
}: {
  draft: EmployeeDraft
  setDraft: React.Dispatch<React.SetStateAction<EmployeeDraft>>
}) {
  return (
    <>
      <RepeaterHeader
        buttonLabel="Tambah Certification"
        onAdd={() => setDraft((current) => ({
          ...current,
          certifications: [
            ...current.certifications,
            { name: '', issuer: '', credential_id: '', issued_at: '', expires_at: '' },
          ],
        }))}
        title="Certification"
      />
      <div className="space-y-4">
        {draft.certifications.map((certification, index) => (
          <div className="rounded-[24px] border border-app-border bg-white/68 p-4" key={`cert-${index}`}>
            <div className="mb-4 flex items-center justify-between">
              <p className="font-semibold">Certification {index + 1}</p>
              <Button
                size="sm"
                type="button"
                variant="secondary"
                onClick={() => setDraft((current) => ({
                  ...current,
                  certifications: removeArrayItem(current.certifications, index),
                }))}
              >
                <Trash2 className="h-4 w-4" />
                Hapus
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Name">
                <Input
                  value={certification.name}
                  onChange={(event) => setDraft((current) => ({
                    ...current,
                    certifications: updateArrayItem(current.certifications, index, { name: event.target.value }),
                  }))}
                />
              </Field>
              <Field label="Issuer">
                <Input
                  value={certification.issuer ?? ''}
                  onChange={(event) => setDraft((current) => ({
                    ...current,
                    certifications: updateArrayItem(current.certifications, index, { issuer: event.target.value }),
                  }))}
                />
              </Field>
              <Field label="Credential ID">
                <Input
                  value={certification.credential_id ?? ''}
                  onChange={(event) => setDraft((current) => ({
                    ...current,
                    certifications: updateArrayItem(current.certifications, index, { credential_id: event.target.value }),
                  }))}
                />
              </Field>
              <Field label="Issued At">
                <Input
                  type="date"
                  value={certification.issued_at ?? ''}
                  onChange={(event) => setDraft((current) => ({
                    ...current,
                    certifications: updateArrayItem(current.certifications, index, { issued_at: event.target.value }),
                  }))}
                />
              </Field>
              <Field label="Expires At">
                <Input
                  type="date"
                  value={certification.expires_at ?? ''}
                  onChange={(event) => setDraft((current) => ({
                    ...current,
                    certifications: updateArrayItem(current.certifications, index, { expires_at: event.target.value }),
                  }))}
                />
              </Field>
            </div>
          </div>
        ))}
        {draft.certifications.length === 0 ? <EmptyRepeater text="Belum ada certification." /> : null}
      </div>
    </>
  )
}

function SimpleBankSection({
  draft,
  setDraft,
}: {
  draft: EmployeeDraft
  setDraft: React.Dispatch<React.SetStateAction<EmployeeDraft>>
}) {
  return (
    <>
      <RepeaterHeader
        buttonLabel="Tambah Bank"
        onAdd={() => setDraft((current) => ({
          ...current,
          bank_accounts: [
            ...current.bank_accounts,
            { bank_name: '', account_name: '', account_number: '', branch: '', is_primary: current.bank_accounts.length === 0 },
          ],
        }))}
        title="Bank Account"
      />
      <div className="space-y-4">
        {draft.bank_accounts.map((bankAccount, index) => (
          <div className="rounded-[24px] border border-app-border bg-white/68 p-4" key={`bank-${index}`}>
            <div className="mb-4 flex items-center justify-between">
              <p className="font-semibold">Bank Account {index + 1}</p>
              <Button
                size="sm"
                type="button"
                variant="secondary"
                onClick={() => setDraft((current) => ({
                  ...current,
                  bank_accounts: removeArrayItem(current.bank_accounts, index),
                }))}
              >
                <Trash2 className="h-4 w-4" />
                Hapus
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Bank Name">
                <Input
                  value={bankAccount.bank_name}
                  onChange={(event) => setDraft((current) => ({
                    ...current,
                    bank_accounts: updateArrayItem(current.bank_accounts, index, { bank_name: event.target.value }),
                  }))}
                />
              </Field>
              <Field label="Account Name">
                <Input
                  value={bankAccount.account_name}
                  onChange={(event) => setDraft((current) => ({
                    ...current,
                    bank_accounts: updateArrayItem(current.bank_accounts, index, { account_name: event.target.value }),
                  }))}
                />
              </Field>
              <Field label="Account Number">
                <Input
                  value={bankAccount.account_number}
                  onChange={(event) => setDraft((current) => ({
                    ...current,
                    bank_accounts: updateArrayItem(current.bank_accounts, index, { account_number: event.target.value }),
                  }))}
                />
              </Field>
              <Field label="Branch">
                <Input
                  value={bankAccount.branch ?? ''}
                  onChange={(event) => setDraft((current) => ({
                    ...current,
                    bank_accounts: updateArrayItem(current.bank_accounts, index, { branch: event.target.value }),
                  }))}
                />
              </Field>
              <label className="inline-flex items-center gap-3 text-sm font-medium text-app-foreground">
                <input
                  checked={bankAccount.is_primary ?? false}
                  className="h-4 w-4"
                  type="checkbox"
                  onChange={(event) => setDraft((current) => ({
                    ...current,
                    bank_accounts: current.bank_accounts.map((item, itemIndex) => ({
                      ...item,
                      is_primary: itemIndex === index ? event.target.checked : false,
                    })),
                  }))}
                />
                Primary account
              </label>
            </div>
          </div>
        ))}
        {draft.bank_accounts.length === 0 ? <EmptyRepeater text="Belum ada data rekening bank." /> : null}
      </div>
    </>
  )
}

function SimpleSalarySection({
  draft,
  setDraft,
}: {
  draft: EmployeeDraft
  setDraft: React.Dispatch<React.SetStateAction<EmployeeDraft>>
}) {
  return (
    <>
      <RepeaterHeader
        buttonLabel="Tambah Salary"
        onAdd={() => setDraft((current) => ({
          ...current,
          salary_histories: [
            ...current.salary_histories,
            {
              component: 'Base Salary',
              amount: '',
              currency: 'IDR',
              pay_frequency: 'monthly',
              effective_date: '',
              end_date: '',
              is_current: current.salary_histories.length === 0,
              notes: '',
            },
          ],
        }))}
        title="Salary History"
      />
      <div className="space-y-4">
        {draft.salary_histories.map((salary, index) => (
          <div className="rounded-[24px] border border-app-border bg-white/68 p-4" key={`salary-${salary.id ?? index}`}>
            <div className="mb-4 flex items-center justify-between">
              <p className="font-semibold">Salary Record {index + 1}</p>
              <Button
                size="sm"
                type="button"
                variant="secondary"
                onClick={() => setDraft((current) => ({
                  ...current,
                  salary_histories: removeArrayItem(current.salary_histories, index),
                }))}
              >
                <Trash2 className="h-4 w-4" />
                Hapus
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Component">
                <Input
                  value={salary.component}
                  onChange={(event) => setDraft((current) => ({
                    ...current,
                    salary_histories: updateArrayItem(current.salary_histories, index, { component: event.target.value }),
                  }))}
                />
              </Field>
              <Field label="Amount">
                <Input
                  type="number"
                  value={salary.amount}
                  onChange={(event) => setDraft((current) => ({
                    ...current,
                    salary_histories: updateArrayItem(current.salary_histories, index, { amount: event.target.value }),
                  }))}
                />
              </Field>
              <Field label="Currency">
                <Input
                  value={salary.currency}
                  onChange={(event) => setDraft((current) => ({
                    ...current,
                    salary_histories: updateArrayItem(current.salary_histories, index, { currency: event.target.value }),
                  }))}
                />
              </Field>
              <Field label="Pay Frequency">
                <Input
                  value={salary.pay_frequency}
                  onChange={(event) => setDraft((current) => ({
                    ...current,
                    salary_histories: updateArrayItem(current.salary_histories, index, { pay_frequency: event.target.value }),
                  }))}
                />
              </Field>
              <Field label="Effective Date">
                <Input
                  type="date"
                  value={salary.effective_date}
                  onChange={(event) => setDraft((current) => ({
                    ...current,
                    salary_histories: updateArrayItem(current.salary_histories, index, { effective_date: event.target.value }),
                  }))}
                />
              </Field>
              <Field label="End Date">
                <Input
                  type="date"
                  value={salary.end_date}
                  onChange={(event) => setDraft((current) => ({
                    ...current,
                    salary_histories: updateArrayItem(current.salary_histories, index, { end_date: event.target.value }),
                  }))}
                />
              </Field>
              <Field className="md:col-span-2" label="Notes">
                <textarea
                  className="field-area"
                  value={salary.notes}
                  onChange={(event) => setDraft((current) => ({
                    ...current,
                    salary_histories: updateArrayItem(current.salary_histories, index, { notes: event.target.value }),
                  }))}
                />
              </Field>
            </div>
          </div>
        ))}
        {draft.salary_histories.length === 0 ? <EmptyRepeater text="Belum ada salary history." /> : null}
      </div>
    </>
  )
}

function SimpleContractSection({
  draft,
  setDraft,
}: {
  draft: EmployeeDraft
  setDraft: React.Dispatch<React.SetStateAction<EmployeeDraft>>
}) {
  return (
    <>
      <RepeaterHeader
        buttonLabel="Tambah Contract"
        onAdd={() => setDraft((current) => ({
          ...current,
          contracts: [
            ...current.contracts,
            {
              contract_type: 'permanent',
              contract_number: '',
              start_date: '',
              end_date: '',
              status: 'active',
              terms: '',
              notes: '',
            },
          ],
        }))}
        title="Contract"
      />
      <div className="space-y-4">
        {draft.contracts.map((contract, index) => (
          <div className="rounded-[24px] border border-app-border bg-white/68 p-4" key={`contract-${contract.id ?? index}`}>
            <div className="mb-4 flex items-center justify-between">
              <p className="font-semibold">Contract {index + 1}</p>
              <Button
                size="sm"
                type="button"
                variant="secondary"
                onClick={() => setDraft((current) => ({
                  ...current,
                  contracts: removeArrayItem(current.contracts, index),
                }))}
              >
                <Trash2 className="h-4 w-4" />
                Hapus
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Contract Type">
                <Input
                  value={contract.contract_type}
                  onChange={(event) => setDraft((current) => ({
                    ...current,
                    contracts: updateArrayItem(current.contracts, index, { contract_type: event.target.value }),
                  }))}
                />
              </Field>
              <Field label="Contract Number">
                <Input
                  value={contract.contract_number}
                  onChange={(event) => setDraft((current) => ({
                    ...current,
                    contracts: updateArrayItem(current.contracts, index, { contract_number: event.target.value }),
                  }))}
                />
              </Field>
              <Field label="Start Date">
                <Input
                  type="date"
                  value={contract.start_date}
                  onChange={(event) => setDraft((current) => ({
                    ...current,
                    contracts: updateArrayItem(current.contracts, index, { start_date: event.target.value }),
                  }))}
                />
              </Field>
              <Field label="End Date">
                <Input
                  type="date"
                  value={contract.end_date}
                  onChange={(event) => setDraft((current) => ({
                    ...current,
                    contracts: updateArrayItem(current.contracts, index, { end_date: event.target.value }),
                  }))}
                />
              </Field>
              <Field label="Status">
                <select
                  className="field-select"
                  value={contract.status}
                  onChange={(event) => setDraft((current) => ({
                    ...current,
                    contracts: updateArrayItem(current.contracts, index, { status: event.target.value }),
                  }))}
                >
                  <option value="active">Active</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="expired">Expired</option>
                  <option value="ended">Ended</option>
                </select>
              </Field>
              <Field className="md:col-span-2" label="Terms">
                <textarea
                  className="field-area"
                  value={contract.terms}
                  onChange={(event) => setDraft((current) => ({
                    ...current,
                    contracts: updateArrayItem(current.contracts, index, { terms: event.target.value }),
                  }))}
                />
              </Field>
              <Field className="md:col-span-2" label="Notes">
                <textarea
                  className="field-area"
                  value={contract.notes}
                  onChange={(event) => setDraft((current) => ({
                    ...current,
                    contracts: updateArrayItem(current.contracts, index, { notes: event.target.value }),
                  }))}
                />
              </Field>
            </div>
          </div>
        ))}
        {draft.contracts.length === 0 ? <EmptyRepeater text="Belum ada contract history." /> : null}
      </div>
    </>
  )
}

function Field({
  children,
  className,
  label,
}: {
  children: React.ReactNode
  className?: string
  label: string
}) {
  return (
    <div className={['space-y-2', className ?? ''].join(' ')}>
      <Label>{label}</Label>
      {children}
    </div>
  )
}

function SectionCard({
  children,
  description,
  title,
}: {
  children: React.ReactNode
  description: string
  title: string
}) {
  return (
    <details className="data-row px-5 py-5" open>
      <summary className="cursor-pointer list-none">
        <p className="text-lg font-semibold">{title}</p>
        <p className="mt-1 text-sm text-app-muted-foreground">{description}</p>
      </summary>
      <div className="mt-5">{children}</div>
    </details>
  )
}

function RepeaterHeader({
  buttonLabel,
  onAdd,
  title,
}: {
  buttonLabel: string
  onAdd: () => void
  title: string
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-lg font-semibold">{title}</p>
      <Button size="sm" type="button" variant="secondary" onClick={onAdd}>
        <Plus className="h-4 w-4" />
        {buttonLabel}
      </Button>
    </div>
  )
}

function InfoStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[22px] border border-app-border bg-white/74 px-4 py-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-app-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-2xl font-extrabold tracking-[-0.05em] text-app-foreground">
        {new Intl.NumberFormat('id-ID').format(value)}
      </p>
    </div>
  )
}

function EmptyRepeater({ text }: { text: string }) {
  return (
    <div className="rounded-[20px] border border-dashed border-app-border px-4 py-5 text-sm text-app-muted-foreground">
      {text}
    </div>
  )
}

function AuditLogRow({ log }: { log: AuditLog }) {
  return (
    <article className="rounded-[22px] border border-app-border bg-white/72 px-4 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{log.summary}</p>
            <Badge variant="neutral">{log.action}</Badge>
          </div>
          <p className="mt-1 text-sm text-app-muted-foreground">
            {log.actor?.name ?? 'System'}
            {' • '}
            {log.actor?.email ?? 'No email'}
          </p>
        </div>
        <span className="text-sm text-app-muted-foreground">{formatDateTime(log.created_at)}</span>
      </div>
      {log.new_values ? (
        <details className="mt-3">
          <summary className="cursor-pointer text-sm font-medium">View payload</summary>
          <pre className="mt-3 overflow-x-auto rounded-[18px] bg-black/5 px-4 py-3 text-xs leading-6 text-app-muted-foreground">
            {JSON.stringify(log.new_values, null, 2)}
          </pre>
        </details>
      ) : null}
    </article>
  )
}

function HistoryRow({ entry }: { entry: EmployeeHistoryEntry }) {
  return (
    <article className="rounded-[22px] border border-app-border bg-white/72 px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{entry.title}</p>
            <Badge variant="neutral">{entry.type}</Badge>
          </div>
          <p className="mt-1 text-sm text-app-muted-foreground">{entry.description}</p>
        </div>
        <span className="text-sm text-app-muted-foreground">{formatDate(entry.date)}</span>
      </div>
    </article>
  )
}

function createEmptyDraft(): EmployeeDraft {
  const today = new Date().toISOString().slice(0, 10)

  return {
    employee_number: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    preferred_name: '',
    work_email: '',
    personal_email: '',
    phone: '',
    gender: '',
    marital_status: '',
    place_of_birth: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Indonesia',
    identity_card_number: '',
    passport_number: '',
    passport_expiry_date: '',
    npwp_number: '',
    bpjs_health_number: '',
    bpjs_employment_number: '',
    job_title: '',
    employment_type: 'permanent',
    employment_status: 'active',
    department_id: '',
    branch_id: '',
    team_id: '',
    division_id: '',
    position_id: '',
    manager_id: '',
    user_id: '',
    hire_date: today,
    birth_date: '',
    family: [],
    emergency_contacts: [],
    educations: [],
    experiences: [],
    skills: [],
    certifications: [],
    bank_accounts: [],
    salary_histories: [],
    contracts: [],
  }
}

function createEmptyDocumentDraft(): DocumentDraft {
  return {
    category: 'identity-card',
    label: '',
    issued_at: '',
    expires_at: '',
    notes: '',
    file: null,
  }
}

function employeeToDraft(employee: Employee): EmployeeDraft {
  return {
    employee_number: employee.employee_number,
    first_name: employee.first_name,
    middle_name: employee.middle_name ?? '',
    last_name: employee.last_name,
    preferred_name: employee.preferred_name ?? '',
    work_email: employee.work_email,
    personal_email: employee.personal_email ?? '',
    phone: employee.phone ?? '',
    gender: employee.gender ?? '',
    marital_status: employee.marital_status ?? '',
    place_of_birth: employee.place_of_birth ?? '',
    address: employee.address ?? '',
    city: employee.city ?? '',
    state: employee.state ?? '',
    postal_code: employee.postal_code ?? '',
    country: employee.country ?? '',
    identity_card_number: employee.identity_card_number ?? '',
    passport_number: employee.passport_number ?? '',
    passport_expiry_date: employee.passport_expiry_date ?? '',
    npwp_number: employee.npwp_number ?? '',
    bpjs_health_number: employee.bpjs_health_number ?? '',
    bpjs_employment_number: employee.bpjs_employment_number ?? '',
    job_title: employee.job_title,
    employment_type: employee.employment_type,
    employment_status: employee.employment_status,
    department_id: employee.department?.id ? String(employee.department.id) : '',
    branch_id: employee.branch?.id ? String(employee.branch.id) : '',
    team_id: employee.team?.id ? String(employee.team.id) : '',
    division_id: employee.division?.id ? String(employee.division.id) : '',
    position_id: employee.position?.id ? String(employee.position.id) : '',
    manager_id: employee.manager?.id ? String(employee.manager.id) : '',
    user_id: employee.user?.id ? String(employee.user.id) : '',
    hire_date: employee.hire_date,
    birth_date: employee.birth_date ?? '',
    family: employee.family,
    emergency_contacts: employee.emergency_contacts,
    educations: employee.educations,
    experiences: employee.experiences,
    skills: employee.skills,
    certifications: employee.certifications,
    bank_accounts: employee.bank_accounts,
    salary_histories: employee.salary_histories.map((salary) => ({
      id: salary.id,
      component: salary.component,
      amount: String(salary.amount),
      currency: salary.currency,
      pay_frequency: salary.pay_frequency,
      effective_date: salary.effective_date,
      end_date: salary.end_date ?? '',
      is_current: salary.is_current,
      notes: salary.notes ?? '',
    })),
    contracts: employee.contracts.map((contract) => ({
      id: contract.id,
      contract_type: contract.contract_type,
      contract_number: contract.contract_number ?? '',
      start_date: contract.start_date,
      end_date: contract.end_date ?? '',
      status: contract.status,
      terms: contract.terms ?? '',
      notes: contract.notes ?? '',
    })),
  }
}

function draftToPayload(draft: EmployeeDraft): EmployeeMutationPayload {
  return {
    employee_number: draft.employee_number.trim(),
    first_name: draft.first_name.trim(),
    middle_name: emptyToUndefined(draft.middle_name),
    last_name: draft.last_name.trim(),
    preferred_name: emptyToUndefined(draft.preferred_name),
    work_email: draft.work_email.trim(),
    personal_email: emptyToUndefined(draft.personal_email),
    phone: emptyToUndefined(draft.phone),
    gender: emptyToUndefined(draft.gender),
    marital_status: emptyToUndefined(draft.marital_status),
    place_of_birth: emptyToUndefined(draft.place_of_birth),
    address: emptyToUndefined(draft.address),
    city: emptyToUndefined(draft.city),
    state: emptyToUndefined(draft.state),
    postal_code: emptyToUndefined(draft.postal_code),
    country: emptyToUndefined(draft.country),
    identity_card_number: emptyToUndefined(draft.identity_card_number),
    passport_number: emptyToUndefined(draft.passport_number),
    passport_expiry_date: emptyToUndefined(draft.passport_expiry_date),
    npwp_number: emptyToUndefined(draft.npwp_number),
    bpjs_health_number: emptyToUndefined(draft.bpjs_health_number),
    bpjs_employment_number: emptyToUndefined(draft.bpjs_employment_number),
    job_title: draft.job_title.trim(),
    employment_type: draft.employment_type,
    employment_status: draft.employment_status,
    department_id: Number(draft.department_id),
    branch_id: toNumberOrUndefined(draft.branch_id),
    team_id: toNumberOrUndefined(draft.team_id),
    division_id: toNumberOrUndefined(draft.division_id),
    position_id: toNumberOrUndefined(draft.position_id),
    manager_id: toNumberOrUndefined(draft.manager_id),
    user_id: toNumberOrUndefined(draft.user_id),
    hire_date: draft.hire_date,
    birth_date: emptyToUndefined(draft.birth_date),
    family: draft.family.map((member) => ({
      ...member,
      name: member.name.trim(),
      relationship: member.relationship.trim(),
      birth_date: emptyToUndefined(member.birth_date),
      occupation: emptyToUndefined(member.occupation),
      dependent: member.dependent ?? false,
    })).filter((member) => member.name && member.relationship),
    emergency_contacts: draft.emergency_contacts.map((contact) => ({
      ...contact,
      name: contact.name.trim(),
      relationship: contact.relationship.trim(),
      phone: contact.phone.trim(),
      email: emptyToUndefined(contact.email),
      address: emptyToUndefined(contact.address),
    })).filter((contact) => contact.name && contact.relationship && contact.phone),
    educations: draft.educations.map((education) => ({
      institution: education.institution.trim(),
      degree: education.degree.trim(),
      major: emptyToUndefined(education.major),
      start_year: education.start_year,
      end_year: education.end_year,
      gpa: education.gpa,
    })).filter((education) => education.institution && education.degree),
    experiences: draft.experiences.map((experience) => ({
      company: experience.company.trim(),
      position: experience.position.trim(),
      start_date: experience.start_date,
      end_date: emptyToUndefined(experience.end_date),
      description: emptyToUndefined(experience.description),
    })).filter((experience) => experience.company && experience.position && experience.start_date),
    skills: draft.skills.map((skill) => ({
      name: skill.name.trim(),
      category: emptyToUndefined(skill.category),
      level: emptyToUndefined(skill.level),
      notes: emptyToUndefined(skill.notes),
    })).filter((skill) => skill.name),
    certifications: draft.certifications.map((certification) => ({
      name: certification.name.trim(),
      issuer: emptyToUndefined(certification.issuer),
      credential_id: emptyToUndefined(certification.credential_id),
      issued_at: emptyToUndefined(certification.issued_at),
      expires_at: emptyToUndefined(certification.expires_at),
    })).filter((certification) => certification.name),
    bank_accounts: draft.bank_accounts.map((bankAccount) => ({
      bank_name: bankAccount.bank_name.trim(),
      account_name: bankAccount.account_name.trim(),
      account_number: bankAccount.account_number.trim(),
      branch: emptyToUndefined(bankAccount.branch),
      is_primary: bankAccount.is_primary ?? false,
    })).filter((bankAccount) => bankAccount.bank_name && bankAccount.account_name && bankAccount.account_number),
    salary_histories: draft.salary_histories.map((salary) => ({
      ...(salary.id ? { id: salary.id } : {}),
      component: salary.component.trim(),
      amount: Number(salary.amount || 0),
      currency: salary.currency.trim() || 'IDR',
      pay_frequency: salary.pay_frequency.trim() || 'monthly',
      effective_date: salary.effective_date,
      end_date: emptyToUndefined(salary.end_date),
      is_current: salary.is_current,
      notes: emptyToUndefined(salary.notes),
    })).filter((salary) => salary.component && salary.effective_date),
    contracts: draft.contracts.map((contract) => ({
      ...(contract.id ? { id: contract.id } : {}),
      contract_type: contract.contract_type.trim(),
      contract_number: emptyToUndefined(contract.contract_number),
      start_date: contract.start_date,
      end_date: emptyToUndefined(contract.end_date),
      status: contract.status,
      terms: emptyToUndefined(contract.terms),
      notes: emptyToUndefined(contract.notes),
    })).filter((contract) => contract.contract_type && contract.start_date),
  }
}

function emptyToUndefined(value?: string | null) {
  if (!value) {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function toNumberOrUndefined(value: string) {
  return value ? Number(value) : undefined
}

function updateArrayItem<T>(items: T[], index: number, nextValue: Partial<T>) {
  return items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...nextValue } : item))
}

function removeArrayItem<T>(items: T[], index: number) {
  return items.filter((_, itemIndex) => itemIndex !== index)
}

function formatDate(value?: string | null) {
  if (!value) {
    return 'N/A'
  }

  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value))
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}
