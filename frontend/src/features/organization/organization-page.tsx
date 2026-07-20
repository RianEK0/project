import { useDeferredValue, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Building2,
  Building,
  ChevronRight,
  Network,
  Plus,
  Search,
  ShieldCheck,
  UsersRound,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/features/auth/auth-context'
import {
  createOrganizationUnit,
  getOrganizationLookups,
  getOrganizationStructure,
  type CreateOrganizationUnitPayload,
} from '@/features/organization/organization-api'
import { getErrorData, getErrorMessage } from '@/lib/http'
import type {
  OrganizationBranchNode,
  OrganizationChartNode,
  OrganizationCompanyNode,
  OrganizationDepartmentNode,
  OrganizationDivisionNode,
  OrganizationPositionNode,
  OrganizationSectionNode,
  ReportingLine,
} from '@/types/api'

type UnitType = 'company' | 'branch' | 'department' | 'division' | 'section' | 'position'

interface UnitDraft {
  type: UnitType
  name: string
  code: string
  description: string
  company_id: string
  department_id: string
  division_id: string
  section_id: string
  head_employee_id: string
  legal_name: string
  email: string
  phone: string
  website: string
  address: string
  cost_center: string
  grade: string
  is_active: boolean
}

export function OrganizationPage() {
  const { session } = useAuth()
  const queryClient = useQueryClient()
  const [reportingSearch, setReportingSearch] = useState('')
  const [unitDraft, setUnitDraft] = useState<UnitDraft>(createEmptyUnitDraft())
  const deferredReportingSearch = useDeferredValue(reportingSearch)
  const canManageStructure = session?.user.permissions.includes('teams.manage') ?? false

  const structureQuery = useQuery({
    queryKey: ['organization', 'overview'],
    queryFn: getOrganizationStructure,
  })

  const lookupsQuery = useQuery({
    queryKey: ['organization', 'lookups'],
    queryFn: getOrganizationLookups,
  })

  const createUnitMutation = useMutation({
    mutationFn: (payload: CreateOrganizationUnitPayload) => createOrganizationUnit(payload),
    onSuccess: () => {
      setUnitDraft(createEmptyUnitDraft())
      void queryClient.invalidateQueries({ queryKey: ['organization'] })
      void queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
    },
  })

  const structure = structureQuery.data
  const lookups = lookupsQuery.data
  const sectionsForDraft = lookups?.sections.filter((section) => {
    if (!unitDraft.division_id) {
      return true
    }

    return section.division?.id === Number(unitDraft.division_id)
  }) ?? []

  const filteredReportingLines = structure?.reporting_lines.filter((line) => {
    if (!deferredReportingSearch.trim()) {
      return true
    }

    const keyword = deferredReportingSearch.toLowerCase()
    const haystack = [
      line.employee?.full_name,
      line.employee?.employee_number,
      line.employee?.job_title,
      line.manager?.full_name,
      line.branch?.name,
      line.department?.name,
      line.division?.name,
      line.section?.name,
      line.position?.name,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return haystack.includes(keyword)
  }) ?? []

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    createUnitMutation.mutate(toOrganizationUnitPayload(unitDraft))
  }

  const validationErrors = getErrorData<Record<string, string[]>>(createUnitMutation.error)

  return (
    <div className="grid gap-6 xl:grid-cols-[1.06fr_0.94fr]">
      <section className="space-y-6">
        <Card>
          <CardHeader className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <span className="section-kicker">Organization Structure</span>
              <div>
                <CardTitle className="text-3xl">Company hierarchy dan reporting line yang jelas</CardTitle>
                <CardDescription className="mt-2 max-w-2xl text-base leading-7">
                  Pantau struktur resmi perusahaan dari company sampai position, lengkap
                  dengan manager per unit, reporting line karyawan, dan organization chart.
                </CardDescription>
              </div>
            </div>
            <div className="rounded-[24px] bg-app-accent px-5 py-4 text-white shadow-[0_24px_40px_-28px_rgba(19,35,60,0.8)]">
              <div className="flex items-center gap-3">
                <Network className="h-5 w-5 text-[color:var(--app-highlight)]" />
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-300">
                    Organization Grid
                  </p>
                  <p className="mt-1 text-lg font-semibold">
                    {structure?.summary.active_reporting_lines ?? 0} reporting lines
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="data-grid">
            <MetricCard label="Companies" value={structure?.summary.companies ?? 0} />
            <MetricCard label="Branches" value={structure?.summary.branches ?? 0} />
            <MetricCard label="Sections" value={structure?.summary.sections ?? 0} />
            <MetricCard label="Positions" value={structure?.summary.positions ?? 0} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hierarchy Explorer</CardTitle>
            <CardDescription>
              Company, branch, department, division, section, dan position dalam satu peta struktur.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {structureQuery.isLoading ? (
              <p className="text-sm text-app-muted-foreground">Loading organization hierarchy...</p>
            ) : null}

            {!structureQuery.isLoading && structure?.companies.map((company) => (
              <CompanyHierarchyCard company={company} key={company.id} />
            ))}

            {!structureQuery.isLoading && (structure?.companies.length ?? 0) === 0 ? (
              <div className="rounded-[24px] border border-dashed border-app-border px-6 py-10 text-center">
                <Building2 className="mx-auto h-8 w-8 text-app-muted-foreground" />
                <p className="mt-3 text-lg font-semibold">No hierarchy mapped yet</p>
                <p className="mt-1 text-sm text-app-muted-foreground">
                  Tambahkan company dan unit organisasi dari panel kanan.
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organization Chart</CardTitle>
            <CardDescription>
              Visualisasi pohon manager dan direct report dari data employee yang aktif.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {structure?.organization_chart.map((node) => (
              <OrganizationChartTree key={node.id} node={node} />
            ))}

            {(structure?.organization_chart.length ?? 0) === 0 ? (
              <div className="rounded-[24px] border border-dashed border-app-border px-6 py-8 text-center text-sm text-app-muted-foreground">
                Belum ada node organization chart yang bisa ditampilkan.
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
              Manage Structure
            </CardTitle>
            <CardDescription>
              Buat company, branch, department, division, section, atau position langsung dari dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {canManageStructure ? (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <Field label="Unit Type">
                  <select
                    className="field-select"
                    value={unitDraft.type}
                    onChange={(event) => setUnitDraft(() => ({
                      ...createEmptyUnitDraft(),
                      type: event.target.value as UnitType,
                    }))}
                  >
                    <option value="company">Company</option>
                    <option value="branch">Branch</option>
                    <option value="department">Department</option>
                    <option value="division">Division</option>
                    <option value="section">Section</option>
                    <option value="position">Position</option>
                  </select>
                </Field>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Name">
                    <Input
                      value={unitDraft.name}
                      onChange={(event) => setUnitDraft((current) => ({ ...current, name: event.target.value }))}
                    />
                  </Field>
                  <Field label="Code">
                    <Input
                      value={unitDraft.code}
                      onChange={(event) => setUnitDraft((current) => ({ ...current, code: event.target.value }))}
                    />
                  </Field>
                </div>

                {unitDraft.type === 'company' ? (
                  <>
                    <Field label="Legal Name">
                      <Input
                        value={unitDraft.legal_name}
                        onChange={(event) => setUnitDraft((current) => ({ ...current, legal_name: event.target.value }))}
                      />
                    </Field>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Email">
                        <Input
                          type="email"
                          value={unitDraft.email}
                          onChange={(event) => setUnitDraft((current) => ({ ...current, email: event.target.value }))}
                        />
                      </Field>
                      <Field label="Phone">
                        <Input
                          value={unitDraft.phone}
                          onChange={(event) => setUnitDraft((current) => ({ ...current, phone: event.target.value }))}
                        />
                      </Field>
                    </div>
                    <Field label="Website">
                      <Input
                        value={unitDraft.website}
                        onChange={(event) => setUnitDraft((current) => ({ ...current, website: event.target.value }))}
                      />
                    </Field>
                    <Field label="Address">
                      <textarea
                        className="field-area"
                        value={unitDraft.address}
                        onChange={(event) => setUnitDraft((current) => ({ ...current, address: event.target.value }))}
                      />
                    </Field>
                  </>
                ) : null}

                {unitDraft.type === 'branch' ? (
                  <>
                    <Field label="Company">
                      <select
                        className="field-select"
                        value={unitDraft.company_id}
                        onChange={(event) => setUnitDraft((current) => ({ ...current, company_id: event.target.value }))}
                      >
                        <option value="">Select company</option>
                        {lookups?.companies.map((company) => (
                          <option key={company.id} value={company.id}>
                            {company.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Phone">
                        <Input
                          value={unitDraft.phone}
                          onChange={(event) => setUnitDraft((current) => ({ ...current, phone: event.target.value }))}
                        />
                      </Field>
                      <Field label="Branch Manager">
                        <select
                          className="field-select"
                          value={unitDraft.head_employee_id}
                          onChange={(event) => setUnitDraft((current) => ({ ...current, head_employee_id: event.target.value }))}
                        >
                          <option value="">Select manager</option>
                          {lookups?.employees.map((employee) => (
                            <option key={employee.id} value={employee.id}>
                              {employee.full_name}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    <Field label="Address">
                      <textarea
                        className="field-area"
                        value={unitDraft.address}
                        onChange={(event) => setUnitDraft((current) => ({ ...current, address: event.target.value }))}
                      />
                    </Field>
                    <label className="inline-flex items-center gap-3 text-sm font-medium text-app-foreground">
                      <input
                        checked={unitDraft.is_active}
                        className="h-4 w-4"
                        type="checkbox"
                        onChange={(event) => setUnitDraft((current) => ({ ...current, is_active: event.target.checked }))}
                      />
                      Active branch
                    </label>
                  </>
                ) : null}

                {unitDraft.type === 'department' ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Cost Center">
                      <Input
                        value={unitDraft.cost_center}
                        onChange={(event) => setUnitDraft((current) => ({ ...current, cost_center: event.target.value }))}
                      />
                    </Field>
                    <Field label="Department Head">
                      <select
                        className="field-select"
                        value={unitDraft.head_employee_id}
                        onChange={(event) => setUnitDraft((current) => ({ ...current, head_employee_id: event.target.value }))}
                      >
                        <option value="">Select head</option>
                        {lookups?.employees.map((employee) => (
                          <option key={employee.id} value={employee.id}>
                            {employee.full_name}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                ) : null}

                {unitDraft.type === 'division' ? (
                  <>
                    <Field label="Department">
                      <select
                        className="field-select"
                        value={unitDraft.department_id}
                        onChange={(event) => setUnitDraft((current) => ({
                          ...current,
                          department_id: event.target.value,
                          division_id: '',
                          section_id: '',
                        }))}
                      >
                        <option value="">Select department</option>
                        {lookups?.departments.map((department) => (
                          <option key={department.id} value={department.id}>
                            {department.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Division Head">
                      <select
                        className="field-select"
                        value={unitDraft.head_employee_id}
                        onChange={(event) => setUnitDraft((current) => ({ ...current, head_employee_id: event.target.value }))}
                      >
                        <option value="">Select head</option>
                        {lookups?.employees.map((employee) => (
                          <option key={employee.id} value={employee.id}>
                            {employee.full_name}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </>
                ) : null}

                {unitDraft.type === 'section' ? (
                  <>
                    <Field label="Division">
                      <select
                        className="field-select"
                        value={unitDraft.division_id}
                        onChange={(event) => setUnitDraft((current) => ({
                          ...current,
                          division_id: event.target.value,
                          section_id: '',
                        }))}
                      >
                        <option value="">Select division</option>
                        {lookups?.divisions.map((division) => (
                          <option key={division.id} value={division.id}>
                            {division.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Section Head">
                      <select
                        className="field-select"
                        value={unitDraft.head_employee_id}
                        onChange={(event) => setUnitDraft((current) => ({ ...current, head_employee_id: event.target.value }))}
                      >
                        <option value="">Select head</option>
                        {lookups?.employees.map((employee) => (
                          <option key={employee.id} value={employee.id}>
                            {employee.full_name}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </>
                ) : null}

                {unitDraft.type === 'position' ? (
                  <>
                    <Field label="Division">
                      <select
                        className="field-select"
                        value={unitDraft.division_id}
                        onChange={(event) => setUnitDraft((current) => ({
                          ...current,
                          division_id: event.target.value,
                          section_id: '',
                        }))}
                      >
                        <option value="">Select division</option>
                        {lookups?.divisions.map((division) => (
                          <option key={division.id} value={division.id}>
                            {division.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Section">
                      <select
                        className="field-select"
                        value={unitDraft.section_id}
                        onChange={(event) => setUnitDraft((current) => ({ ...current, section_id: event.target.value }))}
                      >
                        <option value="">Assign later</option>
                        {sectionsForDraft.map((section) => (
                          <option key={section.id} value={section.id}>
                            {section.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Grade">
                      <Input
                        value={unitDraft.grade}
                        onChange={(event) => setUnitDraft((current) => ({ ...current, grade: event.target.value }))}
                      />
                    </Field>
                  </>
                ) : null}

                {(unitDraft.type === 'department'
                  || unitDraft.type === 'division'
                  || unitDraft.type === 'section'
                  || unitDraft.type === 'position') ? (
                  <Field label="Description">
                    <textarea
                      className="field-area"
                      value={unitDraft.description}
                      onChange={(event) => setUnitDraft((current) => ({ ...current, description: event.target.value }))}
                    />
                  </Field>
                ) : null}

                {createUnitMutation.error ? (
                  <div className="rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-800">
                    <p className="font-semibold">{getErrorMessage(createUnitMutation.error)}</p>
                    {validationErrors ? (
                      <ul className="mt-3 list-disc space-y-1 pl-5">
                        {Object.entries(validationErrors).slice(0, 5).map(([field, messages]) => (
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

                <Button disabled={createUnitMutation.isPending} type="submit">
                  <Plus className="h-4 w-4" />
                  {createUnitMutation.isPending ? 'Creating...' : 'Create Unit'}
                </Button>
              </form>
            ) : (
              <p className="rounded-[22px] border border-dashed border-app-border px-4 py-5 text-sm text-app-muted-foreground">
                Anda belum memiliki permission untuk mengelola struktur organisasi.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <CardTitle>Reporting Lines</CardTitle>
              <CardDescription>
                Lacak siapa melapor ke siapa, lengkap dengan unit kerjanya.
              </CardDescription>
            </div>
            <div className="w-full md:max-w-sm">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-app-muted-foreground" />
                <Input
                  className="pl-11"
                  placeholder="Cari employee, manager, atau unit"
                  value={reportingSearch}
                  onChange={(event) => setReportingSearch(event.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredReportingLines.map((line, index) => (
              <ReportingLineRow key={`${line.employee?.id ?? 'line'}-${index}`} line={line} />
            ))}

            {filteredReportingLines.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-app-border px-6 py-8 text-center">
                <UsersRound className="mx-auto h-8 w-8 text-app-muted-foreground" />
                <p className="mt-3 text-lg font-semibold">No reporting lines found</p>
                <p className="mt-1 text-sm text-app-muted-foreground">
                  Ubah kata kunci pencarian atau lengkapi manager pada data employee.
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Operational Teams
            </CardTitle>
            <CardDescription>
              Layer operasional team tetap terlihat di samping struktur formal perusahaan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {structure?.operational_teams.map((team) => (
              <article
                className="rounded-[22px] border border-app-border bg-white/72 px-4 py-4"
                key={team.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{team.name}</p>
                      <Badge variant="neutral">{team.code}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-app-muted-foreground">
                      {team.department?.name ?? 'No department'}
                      {' • '}
                      Lead:
                      {' '}
                      {team.lead?.full_name ?? 'Pending assignment'}
                    </p>
                  </div>
                  <Badge variant="warning">{team.employees_count} members</Badge>
                </div>
              </article>
            ))}

            {(structure?.operational_teams.length ?? 0) === 0 ? (
              <div className="rounded-[22px] border border-dashed border-app-border px-4 py-5 text-sm text-app-muted-foreground">
                Belum ada operational team yang dibuat.
              </div>
            ) : null}
          </CardContent>
        </Card>
      </aside>
    </div>
  )
}

function CompanyHierarchyCard({ company }: { company: OrganizationCompanyNode }) {
  return (
    <article className="data-row px-5 py-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-lg font-semibold">{company.name}</p>
            <Badge variant="neutral">{company.code}</Badge>
          </div>
          <p className="mt-2 text-sm text-app-muted-foreground">
            {company.legal_name ?? 'No legal name'}
            {' • '}
            {company.email ?? 'No email'}
          </p>
        </div>
        <Badge variant="success">{company.headcount} mapped employees</Badge>
      </div>

      <div className="mt-5 space-y-4">
        {company.branches.map((branch) => (
          <div className="rounded-[24px] border border-app-border bg-app-background/55 px-4 py-4" key={branch.id}>
            <BranchBlock branch={branch} />
          </div>
        ))}
      </div>
    </article>
  )
}

function BranchBlock({ branch }: { branch: OrganizationBranchNode }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Building className="h-4 w-4 text-app-muted-foreground" />
            <p className="font-semibold">{branch.name}</p>
            <Badge variant="neutral">{branch.code}</Badge>
          </div>
          <p className="mt-1 text-sm text-app-muted-foreground">
            Manager:
            {' '}
            <span className="font-medium text-app-foreground">
              {branch.manager?.full_name ?? 'Not assigned'}
            </span>
            {' • '}
            {branch.address ?? 'No address'}
          </p>
        </div>
        <Badge variant="warning">{branch.headcount} employees</Badge>
      </div>

      <div className="space-y-3 border-l border-app-border pl-4">
        {branch.departments.map((department) => (
          <DepartmentBlock department={department} key={`${branch.id}-${department.code ?? department.id}`} />
        ))}
        {branch.departments.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-app-border px-4 py-4 text-sm text-app-muted-foreground">
            Branch ini belum memiliki department dengan headcount.
          </div>
        ) : null}
      </div>
    </div>
  )
}

function DepartmentBlock({ department }: { department: OrganizationDepartmentNode }) {
  return (
    <div className="rounded-[20px] border border-app-border bg-white/74 px-4 py-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{department.name ?? 'Unknown department'}</p>
            {department.code ? <Badge variant="neutral">{department.code}</Badge> : null}
          </div>
          <p className="mt-1 text-sm text-app-muted-foreground">
            Head:
            {' '}
            {department.manager?.full_name ?? 'Not assigned'}
            {' • '}
            {department.cost_center ?? 'No cost center'}
          </p>
        </div>
        <Badge variant="success">{department.headcount} headcount</Badge>
      </div>

      <div className="mt-4 space-y-3 border-l border-app-border pl-4">
        {department.divisions.map((division) => (
          <DivisionBlock division={division} key={`${department.code ?? department.id}-${division.code ?? division.id}`} />
        ))}
      </div>
    </div>
  )
}

function DivisionBlock({ division }: { division: OrganizationDivisionNode }) {
  return (
    <div className="rounded-[18px] border border-app-border bg-[#fffaf2] px-4 py-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{division.name ?? 'Unknown division'}</p>
            {division.code ? <Badge variant="neutral">{division.code}</Badge> : null}
          </div>
          <p className="mt-1 text-sm text-app-muted-foreground">
            Head:
            {' '}
            {division.manager?.full_name ?? 'Not assigned'}
          </p>
        </div>
        <Badge variant="warning">{division.headcount} employees</Badge>
      </div>

      <div className="mt-4 space-y-3 border-l border-app-border pl-4">
        {division.sections.map((section) => (
          <SectionBlock key={`${division.code ?? division.id}-${section.code ?? section.id}`} section={section} />
        ))}
        {division.positions.map((position) => (
          <PositionBlock key={`${division.code ?? division.id}-${position.code}`} position={position} />
        ))}
      </div>
    </div>
  )
}

function SectionBlock({ section }: { section: OrganizationSectionNode }) {
  return (
    <div className="rounded-[18px] border border-app-border bg-white/86 px-4 py-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{section.name ?? 'Unknown section'}</p>
            {section.code ? <Badge variant="neutral">{section.code}</Badge> : null}
          </div>
          <p className="mt-1 text-sm text-app-muted-foreground">
            Head:
            {' '}
            {section.manager?.full_name ?? 'Not assigned'}
          </p>
        </div>
        <Badge variant="success">{section.headcount} employees</Badge>
      </div>

      <div className="mt-4 grid gap-3">
        {section.positions.map((position) => (
          <PositionBlock key={`${section.code ?? section.id}-${position.code}`} position={position} />
        ))}
      </div>
    </div>
  )
}

function PositionBlock({ position }: { position: OrganizationPositionNode }) {
  return (
    <div className="rounded-[16px] border border-app-border bg-app-background/70 px-4 py-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{position.name}</p>
            <Badge variant="neutral">{position.code}</Badge>
            {position.grade ? <Badge variant="warning">{position.grade}</Badge> : null}
          </div>
          <p className="mt-1 text-sm text-app-muted-foreground">
            {position.description ?? 'No description'}
          </p>
        </div>
        <Badge variant="warning">{position.headcount} assigned</Badge>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {position.employees.map((employee) => (
          <Badge key={employee.id} variant="success">
            {employee.full_name}
          </Badge>
        ))}
      </div>
    </div>
  )
}

function OrganizationChartTree({ node, level = 0 }: { node: OrganizationChartNode; level?: number }) {
  return (
    <div className={level > 0 ? 'border-l border-app-border pl-4' : ''}>
      <article className="rounded-[22px] border border-app-border bg-white/72 px-4 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold">{node.name}</p>
              <Badge variant="neutral">{node.employee_number}</Badge>
            </div>
            <p className="mt-1 text-sm text-app-muted-foreground">{node.title}</p>
            <p className="mt-1 text-xs text-app-muted-foreground">
              {[node.branch, node.department, node.division, node.section, node.position]
                .filter(Boolean)
                .join(' • ')}
            </p>
          </div>
          <Badge variant="warning">{node.reports_count} direct reports</Badge>
        </div>
      </article>

      {node.children.length > 0 ? (
        <div className="mt-3 space-y-3">
          {node.children.map((child) => (
            <OrganizationChartTree key={child.id} level={level + 1} node={child} />
          ))}
        </div>
      ) : null}
    </div>
  )
}

function ReportingLineRow({ line }: { line: ReportingLine }) {
  return (
    <article className="rounded-[22px] border border-app-border bg-white/72 px-4 py-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{line.employee?.full_name ?? 'Unknown employee'}</p>
            {line.employee?.employee_number ? (
              <Badge variant="neutral">{line.employee.employee_number}</Badge>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-app-muted-foreground">
            {line.employee?.job_title ?? 'No job title'}
          </p>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-app-muted-foreground">
            <span className="font-medium text-app-foreground">
              {line.manager?.full_name ?? 'No manager'}
            </span>
            <ChevronRight className="h-4 w-4" />
            <span>
              {[line.branch?.name, line.department?.name, line.division?.name, line.section?.name, line.position?.name]
                .filter(Boolean)
                .join(' • ')}
            </span>
          </p>
        </div>
        <Badge variant="success">{line.direct_reports_count} reports</Badge>
      </div>
    </article>
  )
}

function Field({
  children,
  label,
}: {
  children: React.ReactNode
  label: string
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: number }) {
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

function createEmptyUnitDraft(): UnitDraft {
  return {
    type: 'branch',
    name: '',
    code: '',
    description: '',
    company_id: '',
    department_id: '',
    division_id: '',
    section_id: '',
    head_employee_id: '',
    legal_name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    cost_center: '',
    grade: '',
    is_active: true,
  }
}

function toOrganizationUnitPayload(draft: UnitDraft): CreateOrganizationUnitPayload {
  return {
    type: draft.type,
    name: draft.name.trim(),
    code: draft.code.trim(),
    description: emptyToUndefined(draft.description),
    company_id: toNumberOrUndefined(draft.company_id),
    department_id: toNumberOrUndefined(draft.department_id),
    division_id: toNumberOrUndefined(draft.division_id),
    section_id: toNumberOrUndefined(draft.section_id),
    head_employee_id: toNumberOrUndefined(draft.head_employee_id),
    legal_name: emptyToUndefined(draft.legal_name),
    email: emptyToUndefined(draft.email),
    phone: emptyToUndefined(draft.phone),
    website: emptyToUndefined(draft.website),
    address: emptyToUndefined(draft.address),
    cost_center: emptyToUndefined(draft.cost_center),
    grade: emptyToUndefined(draft.grade),
    is_active: draft.type === 'branch' ? draft.is_active : undefined,
  }
}

function emptyToUndefined(value: string) {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function toNumberOrUndefined(value: string) {
  return value ? Number(value) : undefined
}
