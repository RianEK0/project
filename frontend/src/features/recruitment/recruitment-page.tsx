import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Briefcase,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Send,
  Upload,
  UserRoundPlus,
  UsersRound,
  WalletCards,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/features/auth/auth-context'
import {
  createRecruitmentCandidate,
  createRecruitmentVacancy,
  getRecruitmentApplication,
  getRecruitmentApplications,
  getRecruitmentCandidates,
  getRecruitmentInterviewSchedule,
  getRecruitmentLookups,
  getRecruitmentOverview,
  getRecruitmentVacancies,
  hireRecruitmentCandidate,
  recordRecruitmentAssessment,
  scheduleRecruitmentInterview,
  updateRecruitmentApplication,
  type RecruitmentApplicationFilters,
} from '@/features/recruitment/recruitment-api'
import { getErrorMessage } from '@/lib/http'

const badgeVariantMap = {
  draft: 'neutral',
  open: 'success',
  on_hold: 'warning',
  closed: 'neutral',
  filled: 'success',
  active: 'neutral',
  hired: 'success',
  rejected: 'danger',
  withdrawn: 'warning',
  applied: 'neutral',
  screening: 'warning',
  interview: 'neutral',
  assessment: 'warning',
  offer: 'warning',
  scheduled: 'warning',
  completed: 'success',
  cancelled: 'danger',
  'no_show': 'danger',
  assigned: 'warning',
  submitted: 'neutral',
  reviewed: 'neutral',
  passed: 'success',
  failed: 'danger',
} as const

export function RecruitmentPage() {
  const { session } = useAuth()
  const queryClient = useQueryClient()
  const canView = session?.user.permissions.includes('recruitment.view') ?? false
  const canManage = session?.user.permissions.includes('recruitment.manage') ?? false
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null)
  const [applicationFilters, setApplicationFilters] = useState({
    stage: '',
    vacancy_id: '',
    status: '',
  })
  const [scheduleFilters, setScheduleFilters] = useState({
    start_date: todayString(),
    end_date: addDaysString(14),
  })
  const [vacancyForm, setVacancyForm] = useState({
    title: '',
    employment_type: 'permanent',
    workplace_type: 'hybrid',
    status: 'open',
    department_id: '',
    branch_id: '',
    position_id: '',
    hiring_manager_id: '',
    openings_count: '1',
    min_experience_years: '0',
    salary_min: '',
    salary_max: '',
    currency: 'IDR',
    publish_date: todayString(),
    close_date: '',
    description: '',
    requirements: '',
    notes: '',
  })
  const [candidateForm, setCandidateForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    source: 'LinkedIn',
    location: '',
    current_company: '',
    current_position: '',
    experience_years: '0',
    expected_salary: '',
    currency: 'IDR',
    summary: '',
    vacancy_id: '',
    application_notes: '',
    cv: null as File | null,
  })
  const [applicationForm, setApplicationForm] = useState({
    stage: '',
    status: '',
    rating: '',
    offer_sent_at: '',
    offer_accepted_at: '',
    rejection_reason: '',
    notes: '',
    offer_letter: null as File | null,
  })
  const [interviewForm, setInterviewForm] = useState({
    title: '',
    interview_type: 'technical',
    scheduled_at: nextDateTimeString(1, 10),
    duration_minutes: '60',
    location: 'Google Meet',
    notes: '',
  })
  const [assessmentForm, setAssessmentForm] = useState({
    title: '',
    assessment_type: 'assignment',
    assigned_at: nextDateTimeString(0, 9),
    due_at: nextDateTimeString(3, 17),
    completed_at: '',
    status: 'assigned',
    score: '',
    max_score: '100',
    result: '',
    notes: '',
  })
  const [hireForm, setHireForm] = useState({
    hire_date: todayString(),
    employment_type: 'permanent',
    job_title: '',
    department_id: '',
    branch_id: '',
    position_id: '',
    manager_id: '',
    work_email: '',
    base_salary: '',
    salary_currency: 'IDR',
    contract_number: '',
    contract_end_date: '',
    notes: '',
    create_contract: true,
  })

  const overviewQuery = useQuery({
    queryKey: ['recruitment', 'overview'],
    queryFn: getRecruitmentOverview,
    enabled: canView,
  })

  const lookupsQuery = useQuery({
    queryKey: ['recruitment', 'lookups'],
    queryFn: getRecruitmentLookups,
    enabled: canView,
  })

  const vacanciesQuery = useQuery({
    queryKey: ['recruitment', 'vacancies'],
    queryFn: getRecruitmentVacancies,
    enabled: canView,
  })

  const candidatesQuery = useQuery({
    queryKey: ['recruitment', 'candidates'],
    queryFn: getRecruitmentCandidates,
    enabled: canView,
  })

  const applicationsQuery = useQuery({
    queryKey: ['recruitment', 'applications', applicationFilters],
    queryFn: () => getRecruitmentApplications(normalizeApplicationFilters(applicationFilters)),
    enabled: canView,
  })

  const selectedApplicationQuery = useQuery({
    queryKey: ['recruitment', 'applications', selectedApplicationId, 'detail'],
    queryFn: () => getRecruitmentApplication(selectedApplicationId as number),
    enabled: canView && selectedApplicationId !== null,
  })

  const scheduleQuery = useQuery({
    queryKey: ['recruitment', 'schedule', scheduleFilters],
    queryFn: () => getRecruitmentInterviewSchedule(scheduleFilters),
    enabled: canView,
  })

  useEffect(() => {
    const defaults = lookupsQuery.data?.defaults

    if (!defaults) {
      return
    }

    setVacancyForm((current) => current.title
      ? current
      : {
        ...current,
        status: defaults.status,
        currency: defaults.currency,
        publish_date: defaults.publish_date,
      })

    setCandidateForm((current) => ({
      ...current,
      currency: current.currency || defaults.currency,
    }))

    setHireForm((current) => ({
      ...current,
      hire_date: current.hire_date || defaults.hire_date,
      salary_currency: current.salary_currency || defaults.currency,
    }))
  }, [lookupsQuery.data])

  useEffect(() => {
    const applications = applicationsQuery.data ?? []

    if (applications.length === 0) {
      setSelectedApplicationId(null)
      return
    }

    if (selectedApplicationId === null || !applications.some((application) => application.id === selectedApplicationId)) {
      setSelectedApplicationId(applications[0]?.id ?? null)
    }
  }, [applicationsQuery.data, selectedApplicationId])

  useEffect(() => {
    const application = selectedApplicationQuery.data

    if (!application) {
      return
    }

    setApplicationForm({
      stage: application.stage,
      status: application.status,
      rating: application.rating !== null ? String(application.rating) : '',
      offer_sent_at: toDateTimeInputValue(application.offer_sent_at),
      offer_accepted_at: toDateTimeInputValue(application.offer_accepted_at),
      rejection_reason: application.rejection_reason ?? '',
      notes: application.notes ?? '',
      offer_letter: null,
    })

    setInterviewForm((current) => ({
      ...current,
      title: application.vacancy ? `${application.vacancy.title} Interview` : 'Candidate Interview',
    }))

    setAssessmentForm((current) => ({
      ...current,
      title: application.vacancy ? `${application.vacancy.title} Assessment` : 'Candidate Assessment',
    }))

    setHireForm((current) => ({
      ...current,
      job_title: current.job_title || application.vacancy?.title || '',
      department_id: application.vacancy?.department
        ? String(vacanciesQuery.data?.find((vacancy) => vacancy.id === application.vacancy?.id)?.department?.id ?? '')
        : current.department_id,
      branch_id: application.vacancy?.branch
        ? String(vacanciesQuery.data?.find((vacancy) => vacancy.id === application.vacancy?.id)?.branch?.id ?? '')
        : current.branch_id,
    }))
  }, [selectedApplicationQuery.data, vacanciesQuery.data])

  const invalidateRecruitment = () => {
    void queryClient.invalidateQueries({ queryKey: ['recruitment'] })
    void queryClient.invalidateQueries({ queryKey: ['employees'] })
    void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    void queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
  }

  const createVacancyMutation = useMutation({
    mutationFn: createRecruitmentVacancy,
    onSuccess: () => {
      setVacancyForm((current) => ({
        ...current,
        title: '',
        openings_count: '1',
        min_experience_years: '0',
        salary_min: '',
        salary_max: '',
        close_date: '',
        description: '',
        requirements: '',
        notes: '',
      }))
      invalidateRecruitment()
    },
  })

  const createCandidateMutation = useMutation({
    mutationFn: createRecruitmentCandidate,
    onSuccess: (candidate) => {
      setCandidateForm({
        full_name: '',
        email: '',
        phone: '',
        source: 'LinkedIn',
        location: '',
        current_company: '',
        current_position: '',
        experience_years: '0',
        expected_salary: '',
        currency: lookupsQuery.data?.defaults.currency ?? 'IDR',
        summary: '',
        vacancy_id: '',
        application_notes: '',
        cv: null,
      })

      if (candidate.applications[0]?.id) {
        setSelectedApplicationId(candidate.applications[0].id)
      }

      invalidateRecruitment()
    },
  })

  const updateApplicationMutation = useMutation({
    mutationFn: ({ applicationId, payload }: { applicationId: number; payload: Parameters<typeof updateRecruitmentApplication>[1] }) =>
      updateRecruitmentApplication(applicationId, payload),
    onSuccess: () => {
      invalidateRecruitment()
    },
  })

  const scheduleInterviewMutation = useMutation({
    mutationFn: ({ applicationId, payload }: { applicationId: number; payload: Parameters<typeof scheduleRecruitmentInterview>[1] }) =>
      scheduleRecruitmentInterview(applicationId, payload),
    onSuccess: () => {
      setInterviewForm((current) => ({
        ...current,
        scheduled_at: nextDateTimeString(1, 10),
        notes: '',
      }))
      invalidateRecruitment()
    },
  })

  const recordAssessmentMutation = useMutation({
    mutationFn: ({ applicationId, payload }: { applicationId: number; payload: Parameters<typeof recordRecruitmentAssessment>[1] }) =>
      recordRecruitmentAssessment(applicationId, payload),
    onSuccess: () => {
      setAssessmentForm((current) => ({
        ...current,
        score: '',
        result: '',
        notes: '',
      }))
      invalidateRecruitment()
    },
  })

  const hireCandidateMutation = useMutation({
    mutationFn: ({ applicationId, payload }: { applicationId: number; payload: Parameters<typeof hireRecruitmentCandidate>[1] }) =>
      hireRecruitmentCandidate(applicationId, payload),
    onSuccess: () => {
      invalidateRecruitment()
    },
  })

  const selectedApplication = selectedApplicationQuery.data ?? null
  const stages = lookupsQuery.data?.stages ?? [
    { value: 'applied', label: 'Applied' },
    { value: 'screening', label: 'Screening' },
    { value: 'interview', label: 'Interview' },
    { value: 'assessment', label: 'Assessment' },
    { value: 'offer', label: 'Offer' },
    { value: 'hired', label: 'Hired' },
    { value: 'rejected', label: 'Rejected' },
  ]
  const groupedApplications = Object.fromEntries(
    stages.map((stage) => [
      stage.value,
      (applicationsQuery.data ?? []).filter((application) => application.stage === stage.value),
    ]),
  ) as Record<string, typeof applicationsQuery.data>

  if (!canView) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recruitment access is unavailable</CardTitle>
          <CardDescription>
            Role ini belum memiliki permission `recruitment.view`, jadi workspace recruitment belum bisa dibuka.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const handleCreateVacancy = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    createVacancyMutation.mutate({
      title: vacancyForm.title,
      employment_type: vacancyForm.employment_type,
      workplace_type: vacancyForm.workplace_type,
      status: vacancyForm.status,
      department_id: toOptionalNumber(vacancyForm.department_id),
      branch_id: toOptionalNumber(vacancyForm.branch_id),
      position_id: toOptionalNumber(vacancyForm.position_id),
      hiring_manager_id: toOptionalNumber(vacancyForm.hiring_manager_id),
      openings_count: toNumber(vacancyForm.openings_count),
      min_experience_years: toNumber(vacancyForm.min_experience_years),
      salary_min: toOptionalNumber(vacancyForm.salary_min),
      salary_max: toOptionalNumber(vacancyForm.salary_max),
      currency: vacancyForm.currency,
      publish_date: vacancyForm.publish_date,
      close_date: vacancyForm.close_date || undefined,
      description: vacancyForm.description || undefined,
      requirements: vacancyForm.requirements || undefined,
      notes: vacancyForm.notes || undefined,
    })
  }

  const handleCreateCandidate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    createCandidateMutation.mutate({
      full_name: candidateForm.full_name,
      email: candidateForm.email,
      phone: candidateForm.phone || undefined,
      source: candidateForm.source || undefined,
      location: candidateForm.location || undefined,
      current_company: candidateForm.current_company || undefined,
      current_position: candidateForm.current_position || undefined,
      experience_years: toNumber(candidateForm.experience_years),
      expected_salary: toOptionalNumber(candidateForm.expected_salary),
      currency: candidateForm.currency,
      summary: candidateForm.summary || undefined,
      vacancy_id: toOptionalNumber(candidateForm.vacancy_id),
      application_notes: candidateForm.application_notes || undefined,
      cv: candidateForm.cv ?? undefined,
    })
  }

  const handleUpdateApplication = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedApplication) {
      return
    }

    updateApplicationMutation.mutate({
      applicationId: selectedApplication.id,
      payload: {
        stage: applicationForm.stage,
        status: applicationForm.status,
        rating: applicationForm.rating ? toNumber(applicationForm.rating) : undefined,
        offer_sent_at: applicationForm.offer_sent_at || undefined,
        offer_accepted_at: applicationForm.offer_accepted_at || undefined,
        rejection_reason: applicationForm.rejection_reason || undefined,
        notes: applicationForm.notes || undefined,
        offer_letter: applicationForm.offer_letter ?? undefined,
      },
    })
  }

  const handleScheduleInterview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedApplication) {
      return
    }

    scheduleInterviewMutation.mutate({
      applicationId: selectedApplication.id,
      payload: {
        title: interviewForm.title,
        interview_type: interviewForm.interview_type,
        scheduled_at: interviewForm.scheduled_at,
        duration_minutes: toNumber(interviewForm.duration_minutes),
        location: interviewForm.location || undefined,
        notes: interviewForm.notes || undefined,
      },
    })
  }

  const handleRecordAssessment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedApplication) {
      return
    }

    recordAssessmentMutation.mutate({
      applicationId: selectedApplication.id,
      payload: {
        title: assessmentForm.title,
        assessment_type: assessmentForm.assessment_type,
        assigned_at: assessmentForm.assigned_at || undefined,
        due_at: assessmentForm.due_at || undefined,
        completed_at: assessmentForm.completed_at || undefined,
        status: assessmentForm.status,
        score: assessmentForm.score ? toNumber(assessmentForm.score) : undefined,
        max_score: assessmentForm.max_score ? toNumber(assessmentForm.max_score) : undefined,
        result: assessmentForm.result || undefined,
        notes: assessmentForm.notes || undefined,
      },
    })
  }

  const handleHireCandidate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedApplication) {
      return
    }

    hireCandidateMutation.mutate({
      applicationId: selectedApplication.id,
      payload: {
        hire_date: hireForm.hire_date,
        employment_type: hireForm.employment_type,
        job_title: hireForm.job_title || undefined,
        department_id: toOptionalNumber(hireForm.department_id),
        branch_id: toOptionalNumber(hireForm.branch_id),
        position_id: toOptionalNumber(hireForm.position_id),
        manager_id: toOptionalNumber(hireForm.manager_id),
        work_email: hireForm.work_email || undefined,
        base_salary: toOptionalNumber(hireForm.base_salary),
        salary_currency: hireForm.salary_currency,
        contract_number: hireForm.contract_number || undefined,
        contract_end_date: hireForm.contract_end_date || undefined,
        create_contract: hireForm.create_contract,
        notes: hireForm.notes || undefined,
      },
    })
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <Card className="hero-panel">
          <CardHeader className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="border-white/10 bg-white/8 text-white" variant="neutral">
                Recruitment Workspace
              </Badge>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
                <Briefcase className="h-3.5 w-3.5 text-[color:var(--app-highlight)]" />
                Hiring Pipeline
              </div>
            </div>
            <div className="space-y-3">
              <CardTitle className="max-w-3xl text-4xl font-extrabold tracking-[-0.06em] text-white md:text-5xl">
                Rekrut kandidat yang tepat tanpa kehilangan konteks di setiap stage.
              </CardTitle>
              <CardDescription className="max-w-3xl text-base leading-8 text-slate-200">
                Modul ini merangkum job vacancy, candidate, CV, interview, assessment, offer letter, hiring, interview schedule, dan recruitment dashboard dari satu workspace yang lebih rapi.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard icon={Briefcase} label="Open Vacancies" value={String(overviewQuery.data?.stats.open_vacancies ?? 0)} />
              <MetricCard icon={UsersRound} label="Candidates" value={String(overviewQuery.data?.stats.active_candidates ?? 0)} />
              <MetricCard icon={ClipboardCheck} label="Applications" value={String(overviewQuery.data?.stats.active_applications ?? 0)} />
              <MetricCard icon={CheckCircle2} label="Hires" value={String(overviewQuery.data?.stats.hires ?? 0)} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] border border-white/10 bg-black/12 px-5 py-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">Offer Acceptance</p>
                <p className="mt-3 text-3xl font-bold text-white">
                  {`${overviewQuery.data?.stats.offer_acceptance_rate ?? 0}%`}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  {overviewQuery.data?.stats.offers_sent ?? 0} offer telah dikirim pada Minggu, 19 Juli 2026 snapshot ini.
                </p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-black/12 px-5 py-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">Upcoming Interviews</p>
                <p className="mt-3 text-3xl font-bold text-white">
                  {overviewQuery.data?.stats.upcoming_interviews ?? 0}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  Interview schedule bisa langsung dipantau dan ditindaklanjuti dari panel kanan bawah.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <span className="section-kicker">Pipeline Snapshot</span>
            <CardTitle className="pt-3 text-2xl">Ringkasan stage yang sedang berjalan</CardTitle>
            <CardDescription>
              Dashboard recruitment ini memperlihatkan distribusi kandidat di setiap stage pada Minggu, 19 Juli 2026.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {overviewQuery.data?.pipeline.map((item) => (
              <article className="data-row flex items-center justify-between px-5 py-4" key={item.stage}>
                <div>
                  <p className="font-semibold">{humanize(item.stage)}</p>
                  <p className="text-sm text-app-muted-foreground">Current pipeline stage</p>
                </div>
                <Badge variant={badgeVariantMap[item.stage as keyof typeof badgeVariantMap] ?? 'neutral'}>
                  {item.count}
                </Badge>
              </article>
            ))}

            {!overviewQuery.isLoading && (overviewQuery.data?.pipeline.length ?? 0) === 0 ? (
              <EmptyState text="Belum ada data pipeline recruitment." />
            ) : null}
          </CardContent>
        </Card>
      </section>

      {canManage ? (
        <section className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <span className="section-kicker">Job Vacancy</span>
              <CardTitle className="pt-3 text-2xl">Buka vacancy baru</CardTitle>
              <CardDescription>
                Vacancy menyimpan posisi, department, branch, hiring manager, salary range, dan jumlah kebutuhan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleCreateVacancy}>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Title">
                    <Input onChange={(event) => setVacancyForm((current) => ({ ...current, title: event.currentTarget.value }))} value={vacancyForm.title} />
                  </Field>
                  <Field label="Employment Type">
                    <select className="field-select" onChange={(event) => setVacancyForm((current) => ({ ...current, employment_type: event.currentTarget.value }))} value={vacancyForm.employment_type}>
                      {lookupsQuery.data?.employment_types.map((item) => (
                        <option key={item.value} value={item.value}>{item.label}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Workplace Type">
                    <select className="field-select" onChange={(event) => setVacancyForm((current) => ({ ...current, workplace_type: event.currentTarget.value }))} value={vacancyForm.workplace_type}>
                      {lookupsQuery.data?.workplace_types.map((item) => (
                        <option key={item.value} value={item.value}>{item.label}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Status">
                    <select className="field-select" onChange={(event) => setVacancyForm((current) => ({ ...current, status: event.currentTarget.value }))} value={vacancyForm.status}>
                      {lookupsQuery.data?.vacancy_statuses.map((item) => (
                        <option key={item.value} value={item.value}>{item.label}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Department">
                    <select className="field-select" onChange={(event) => setVacancyForm((current) => ({ ...current, department_id: event.currentTarget.value }))} value={vacancyForm.department_id}>
                      <option value="">Select department</option>
                      {lookupsQuery.data?.departments.map((item) => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Branch">
                    <select className="field-select" onChange={(event) => setVacancyForm((current) => ({ ...current, branch_id: event.currentTarget.value }))} value={vacancyForm.branch_id}>
                      <option value="">Select branch</option>
                      {lookupsQuery.data?.branches.map((item) => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Position">
                    <select className="field-select" onChange={(event) => setVacancyForm((current) => ({ ...current, position_id: event.currentTarget.value }))} value={vacancyForm.position_id}>
                      <option value="">Select position</option>
                      {lookupsQuery.data?.positions.map((item) => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Hiring Manager">
                    <select className="field-select" onChange={(event) => setVacancyForm((current) => ({ ...current, hiring_manager_id: event.currentTarget.value }))} value={vacancyForm.hiring_manager_id}>
                      <option value="">Select hiring manager</option>
                      {lookupsQuery.data?.hiring_managers.map((item) => (
                        <option key={item.id} value={item.id}>{item.full_name}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Openings">
                    <Input onChange={(event) => setVacancyForm((current) => ({ ...current, openings_count: event.currentTarget.value }))} type="number" value={vacancyForm.openings_count} />
                  </Field>
                  <Field label="Min Experience">
                    <Input onChange={(event) => setVacancyForm((current) => ({ ...current, min_experience_years: event.currentTarget.value }))} step="0.5" type="number" value={vacancyForm.min_experience_years} />
                  </Field>
                  <Field label="Salary Min">
                    <Input onChange={(event) => setVacancyForm((current) => ({ ...current, salary_min: event.currentTarget.value }))} type="number" value={vacancyForm.salary_min} />
                  </Field>
                  <Field label="Salary Max">
                    <Input onChange={(event) => setVacancyForm((current) => ({ ...current, salary_max: event.currentTarget.value }))} type="number" value={vacancyForm.salary_max} />
                  </Field>
                  <Field label="Publish Date">
                    <Input onChange={(event) => setVacancyForm((current) => ({ ...current, publish_date: event.currentTarget.value }))} type="date" value={vacancyForm.publish_date} />
                  </Field>
                  <Field label="Close Date">
                    <Input onChange={(event) => setVacancyForm((current) => ({ ...current, close_date: event.currentTarget.value }))} type="date" value={vacancyForm.close_date} />
                  </Field>
                </div>
                <Field label="Description">
                  <textarea className="field-area" onChange={(event) => setVacancyForm((current) => ({ ...current, description: event.currentTarget.value }))} value={vacancyForm.description} />
                </Field>
                <Field label="Requirements">
                  <textarea className="field-area" onChange={(event) => setVacancyForm((current) => ({ ...current, requirements: event.currentTarget.value }))} value={vacancyForm.requirements} />
                </Field>
                <Field label="Notes">
                  <textarea className="field-area" onChange={(event) => setVacancyForm((current) => ({ ...current, notes: event.currentTarget.value }))} value={vacancyForm.notes} />
                </Field>
                {createVacancyMutation.isError ? <p className="text-sm text-red-700">{getErrorMessage(createVacancyMutation.error)}</p> : null}
                <Button disabled={createVacancyMutation.isPending || vacancyForm.title.trim().length < 3} type="submit">
                  <Send className="h-4 w-4" />
                  {createVacancyMutation.isPending ? 'Creating vacancy...' : 'Create Vacancy'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <span className="section-kicker">Candidate Intake</span>
              <CardTitle className="pt-3 text-2xl">Tambah candidate baru</CardTitle>
              <CardDescription>
                Candidate bisa langsung dihubungkan ke vacancy sekaligus mengunggah CV untuk memulai pipeline.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleCreateCandidate}>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Full Name">
                    <Input onChange={(event) => setCandidateForm((current) => ({ ...current, full_name: event.currentTarget.value }))} value={candidateForm.full_name} />
                  </Field>
                  <Field label="Email">
                    <Input onChange={(event) => setCandidateForm((current) => ({ ...current, email: event.currentTarget.value }))} type="email" value={candidateForm.email} />
                  </Field>
                  <Field label="Phone">
                    <Input onChange={(event) => setCandidateForm((current) => ({ ...current, phone: event.currentTarget.value }))} value={candidateForm.phone} />
                  </Field>
                  <Field label="Source">
                    <Input onChange={(event) => setCandidateForm((current) => ({ ...current, source: event.currentTarget.value }))} value={candidateForm.source} />
                  </Field>
                  <Field label="Location">
                    <Input onChange={(event) => setCandidateForm((current) => ({ ...current, location: event.currentTarget.value }))} value={candidateForm.location} />
                  </Field>
                  <Field label="Current Company">
                    <Input onChange={(event) => setCandidateForm((current) => ({ ...current, current_company: event.currentTarget.value }))} value={candidateForm.current_company} />
                  </Field>
                  <Field label="Current Position">
                    <Input onChange={(event) => setCandidateForm((current) => ({ ...current, current_position: event.currentTarget.value }))} value={candidateForm.current_position} />
                  </Field>
                  <Field label="Experience Years">
                    <Input onChange={(event) => setCandidateForm((current) => ({ ...current, experience_years: event.currentTarget.value }))} step="0.5" type="number" value={candidateForm.experience_years} />
                  </Field>
                  <Field label="Expected Salary">
                    <Input onChange={(event) => setCandidateForm((current) => ({ ...current, expected_salary: event.currentTarget.value }))} type="number" value={candidateForm.expected_salary} />
                  </Field>
                  <Field label="Vacancy">
                    <select className="field-select" onChange={(event) => setCandidateForm((current) => ({ ...current, vacancy_id: event.currentTarget.value }))} value={candidateForm.vacancy_id}>
                      <option value="">Standalone candidate</option>
                      {vacanciesQuery.data?.map((vacancy) => (
                        <option key={vacancy.id} value={vacancy.id}>{vacancy.title}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Field label="Summary">
                  <textarea className="field-area" onChange={(event) => setCandidateForm((current) => ({ ...current, summary: event.currentTarget.value }))} value={candidateForm.summary} />
                </Field>
                <Field label="Application Notes">
                  <textarea className="field-area" onChange={(event) => setCandidateForm((current) => ({ ...current, application_notes: event.currentTarget.value }))} value={candidateForm.application_notes} />
                </Field>
                <div className="space-y-2">
                  <Label>CV Upload</Label>
                  <input accept=".pdf,.doc,.docx" className="field-select pt-3" onChange={(event) => setCandidateForm((current) => ({ ...current, cv: event.currentTarget.files?.[0] ?? null }))} type="file" />
                </div>
                {createCandidateMutation.isError ? <p className="text-sm text-red-700">{getErrorMessage(createCandidateMutation.error)}</p> : null}
                <Button disabled={createCandidateMutation.isPending || !candidateForm.full_name || !candidateForm.email} type="submit">
                  <UserRoundPlus className="h-4 w-4" />
                  {createCandidateMutation.isPending ? 'Saving candidate...' : 'Create Candidate'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <span className="section-kicker">Vacancy Feed</span>
            <CardTitle className="pt-3 text-2xl">Job vacancy aktif dan terkini</CardTitle>
            <CardDescription>
              Snapshot vacancy dengan jumlah kandidat aktif dan hire yang sudah terjadi.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {vacanciesQuery.data?.map((vacancy) => (
              <article className="data-row px-5 py-4" key={vacancy.id}>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{vacancy.title}</p>
                      <Badge variant={badgeVariantMap[vacancy.status as keyof typeof badgeVariantMap] ?? 'neutral'}>
                        {humanize(vacancy.status)}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-app-muted-foreground">
                      {vacancy.code}
                      {' • '}
                      {vacancy.department?.name ?? 'No department'}
                      {' • '}
                      {vacancy.branch?.name ?? 'No branch'}
                    </p>
                  </div>
                  <div className="text-right text-sm text-app-muted-foreground">
                    <p>{vacancy.active_applications_count ?? 0} active</p>
                    <p>{vacancy.hired_applications_count ?? 0} hired</p>
                  </div>
                </div>
              </article>
            ))}

            {!vacanciesQuery.isLoading && (vacanciesQuery.data?.length ?? 0) === 0 ? (
              <EmptyState text="Belum ada vacancy recruitment." />
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <span className="section-kicker">Candidate Feed</span>
            <CardTitle className="pt-3 text-2xl">Candidate yang paling baru dan paling relevan</CardTitle>
            <CardDescription>
              Lihat sumber kandidat, pengalaman, ekspektasi salary, dan stage aplikasi yang sedang berjalan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(candidatesQuery.data ?? []).slice(0, 6).map((candidate) => (
              <article className="data-row px-5 py-4" key={candidate.id}>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{candidate.full_name}</p>
                        <Badge variant={badgeVariantMap[candidate.status as keyof typeof badgeVariantMap] ?? 'neutral'}>
                          {humanize(candidate.status)}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-app-muted-foreground">
                        {candidate.source ?? 'Unknown source'}
                        {' • '}
                        {candidate.current_position ?? 'No current position'}
                        {' • '}
                        {candidate.experience_years} years
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {candidate.cv_url ? (
                        <Button onClick={() => openExternal(candidate.cv_url ?? '')} size="sm" type="button" variant="secondary">
                          <Upload className="h-4 w-4" />
                          CV
                        </Button>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {candidate.applications.map((application) => (
                      <button
                        className="rounded-full border border-app-border bg-app-background/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-app-foreground"
                        key={application.id}
                        onClick={() => setSelectedApplicationId(application.id)}
                        type="button"
                      >
                        {application.vacancy?.title ?? 'Application'}
                        {' • '}
                        {humanize(application.stage)}
                      </button>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="section-kicker">Pipeline Board</span>
            <CardTitle className="pt-3 text-2xl">Stage per application yang terlihat</CardTitle>
            <CardDescription>
              Filter pipeline berdasarkan stage, vacancy, atau status untuk memantau pergerakan kandidat dengan cepat.
            </CardDescription>
          </div>
          <div className="grid w-full gap-3 md:max-w-3xl md:grid-cols-3">
            <select className="field-select" onChange={(event) => setApplicationFilters((current) => ({ ...current, stage: event.currentTarget.value }))} value={applicationFilters.stage}>
              <option value="">All stages</option>
              {stages.map((stage) => (
                <option key={stage.value} value={stage.value}>{stage.label}</option>
              ))}
            </select>
            <select className="field-select" onChange={(event) => setApplicationFilters((current) => ({ ...current, vacancy_id: event.currentTarget.value }))} value={applicationFilters.vacancy_id}>
              <option value="">All vacancies</option>
              {vacanciesQuery.data?.map((vacancy) => (
                <option key={vacancy.id} value={vacancy.id}>{vacancy.title}</option>
              ))}
            </select>
            <select className="field-select" onChange={(event) => setApplicationFilters((current) => ({ ...current, status: event.currentTarget.value }))} value={applicationFilters.status}>
              <option value="">All statuses</option>
              {lookupsQuery.data?.application_statuses.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stages.map((stage) => (
              <section className="space-y-3" key={stage.value}>
                <div className="rounded-[20px] border border-app-border bg-app-background/60 px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{stage.label}</p>
                    <Badge variant={badgeVariantMap[stage.value as keyof typeof badgeVariantMap] ?? 'neutral'}>
                      {groupedApplications[stage.value]?.length ?? 0}
                    </Badge>
                  </div>
                </div>
                {(groupedApplications[stage.value] ?? []).map((application) => (
                  <button
                    className={[
                      'data-row w-full px-4 py-4 text-left transition',
                      selectedApplicationId === application.id ? 'border-[rgba(185,123,49,0.38)] bg-app-background/70' : '',
                    ].join(' ')}
                    key={application.id}
                    onClick={() => setSelectedApplicationId(application.id)}
                    type="button"
                  >
                    <p className="font-semibold">{application.candidate?.full_name ?? 'Candidate'}</p>
                    <p className="mt-2 text-sm text-app-muted-foreground">
                      {application.vacancy?.title ?? 'Vacancy'}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant={badgeVariantMap[application.status as keyof typeof badgeVariantMap] ?? 'neutral'}>
                        {humanize(application.status)}
                      </Badge>
                      {application.rating !== null ? (
                        <Badge variant="neutral">Score {application.rating}</Badge>
                      ) : null}
                    </div>
                  </button>
                ))}
              </section>
            ))}
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <Card>
          <CardHeader>
            <span className="section-kicker">Application Detail</span>
            <CardTitle className="pt-3 text-2xl">
              {selectedApplication?.candidate?.full_name ?? 'Select an application'}
            </CardTitle>
            <CardDescription>
              Detail kandidat, offer context, interview trail, assessment result, dan hiring action berkumpul di sini.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {selectedApplicationQuery.isLoading ? (
              <p className="text-sm text-app-muted-foreground">Loading application detail...</p>
            ) : null}

            {selectedApplication ? (
              <>
                <div className="grid gap-3 md:grid-cols-2">
                  <DetailPill label="Vacancy" value={selectedApplication.vacancy?.title ?? 'N/A'} />
                  <DetailPill label="Stage" value={humanize(selectedApplication.stage)} />
                  <DetailPill label="Status" value={humanize(selectedApplication.status)} />
                  <DetailPill
                    label="Expected Salary"
                    value={
                      selectedApplication.candidate?.expected_salary !== null && selectedApplication.candidate?.expected_salary !== undefined
                        ? formatCurrency(
                          selectedApplication.candidate.expected_salary,
                          selectedApplication.candidate.currency || 'IDR',
                        )
                        : 'Not specified'
                    }
                  />
                </div>

                <div className="rounded-[24px] border border-app-border bg-app-background/60 px-5 py-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-semibold">{selectedApplication.candidate?.full_name ?? 'Candidate'}</p>
                      <p className="mt-2 text-sm text-app-muted-foreground">
                        {selectedApplication.candidate?.email ?? 'No email'}
                        {' • '}
                        {selectedApplication.candidate?.source ?? 'Unknown source'}
                        {' • '}
                        {selectedApplication.candidate?.current_position ?? 'No current position'}
                        {' • '}
                        {selectedApplication.candidate?.experience_years ?? 0} years
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {selectedApplication.candidate?.cv_url ? (
                        <Button onClick={() => openExternal(selectedApplication.candidate?.cv_url ?? '')} size="sm" type="button" variant="secondary">
                          <Upload className="h-4 w-4" />
                          Open CV
                        </Button>
                      ) : null}
                      {selectedApplication.offer_letter_url ? (
                        <Button onClick={() => openExternal(selectedApplication.offer_letter_url ?? '')} size="sm" type="button" variant="secondary">
                          <FileText className="h-4 w-4" />
                          Offer Letter
                        </Button>
                      ) : null}
                    </div>
                  </div>
                  {selectedApplication.notes ? (
                    <p className="mt-4 text-sm leading-7 text-app-muted-foreground">{selectedApplication.notes}</p>
                  ) : null}
                  {selectedApplication.candidate?.summary ? (
                    <p className="mt-3 text-sm leading-7 text-app-muted-foreground">
                      {selectedApplication.candidate.summary}
                    </p>
                  ) : null}
                </div>

                {canManage ? (
                  <form className="space-y-4" onSubmit={handleUpdateApplication}>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Stage">
                        <select className="field-select" onChange={(event) => setApplicationForm((current) => ({ ...current, stage: event.currentTarget.value }))} value={applicationForm.stage}>
                          {stages.map((stage) => (
                            <option key={stage.value} value={stage.value}>{stage.label}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Status">
                        <select className="field-select" onChange={(event) => setApplicationForm((current) => ({ ...current, status: event.currentTarget.value }))} value={applicationForm.status}>
                          {lookupsQuery.data?.application_statuses.map((item) => (
                            <option key={item.value} value={item.value}>{item.label}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Rating">
                        <Input onChange={(event) => setApplicationForm((current) => ({ ...current, rating: event.currentTarget.value }))} step="0.1" type="number" value={applicationForm.rating} />
                      </Field>
                      <Field label="Offer Sent At">
                        <Input onChange={(event) => setApplicationForm((current) => ({ ...current, offer_sent_at: event.currentTarget.value }))} type="datetime-local" value={applicationForm.offer_sent_at} />
                      </Field>
                      <Field label="Offer Accepted At">
                        <Input onChange={(event) => setApplicationForm((current) => ({ ...current, offer_accepted_at: event.currentTarget.value }))} type="datetime-local" value={applicationForm.offer_accepted_at} />
                      </Field>
                      <Field label="Rejection Reason">
                        <Input onChange={(event) => setApplicationForm((current) => ({ ...current, rejection_reason: event.currentTarget.value }))} value={applicationForm.rejection_reason} />
                      </Field>
                    </div>
                    <Field label="Notes">
                      <textarea className="field-area" onChange={(event) => setApplicationForm((current) => ({ ...current, notes: event.currentTarget.value }))} value={applicationForm.notes} />
                    </Field>
                    <div className="space-y-2">
                      <Label>Offer Letter Upload</Label>
                      <input accept=".pdf,.doc,.docx" className="field-select pt-3" onChange={(event) => setApplicationForm((current) => ({ ...current, offer_letter: event.currentTarget.files?.[0] ?? null }))} type="file" />
                    </div>
                    {updateApplicationMutation.isError ? <p className="text-sm text-red-700">{getErrorMessage(updateApplicationMutation.error)}</p> : null}
                    <Button disabled={updateApplicationMutation.isPending} type="submit">
                      <Send className="h-4 w-4" />
                      {updateApplicationMutation.isPending ? 'Updating pipeline...' : 'Update Pipeline'}
                    </Button>
                  </form>
                ) : null}

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[24px] border border-app-border bg-white/72 px-5 py-5">
                    <p className="font-semibold">Interview Trail</p>
                    <div className="mt-3 space-y-3">
                      {selectedApplication.interviews.map((interview) => (
                        <div className="rounded-[18px] bg-black/4 px-4 py-3" key={interview.id}>
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-medium">{interview.title}</p>
                            <Badge variant={badgeVariantMap[interview.status as keyof typeof badgeVariantMap] ?? 'neutral'}>
                              {humanize(interview.status)}
                            </Badge>
                          </div>
                          <p className="mt-2 text-sm text-app-muted-foreground">
                            {formatDateTime(interview.scheduled_at)}
                            {' • '}
                            {interview.location ?? 'No location'}
                          </p>
                        </div>
                      ))}
                      {selectedApplication.interviews.length === 0 ? <EmptyState text="Belum ada interview untuk application ini." /> : null}
                    </div>
                  </div>
                  <div className="rounded-[24px] border border-app-border bg-white/72 px-5 py-5">
                    <p className="font-semibold">Assessment Trail</p>
                    <div className="mt-3 space-y-3">
                      {selectedApplication.assessments.map((assessment) => (
                        <div className="rounded-[18px] bg-black/4 px-4 py-3" key={assessment.id}>
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-medium">{assessment.title}</p>
                            <Badge variant={badgeVariantMap[assessment.status as keyof typeof badgeVariantMap] ?? 'neutral'}>
                              {humanize(assessment.status)}
                            </Badge>
                          </div>
                          <p className="mt-2 text-sm text-app-muted-foreground">
                            {assessment.score !== null ? `Score ${assessment.score}/${assessment.max_score ?? '-'}` : 'No score yet'}
                          </p>
                        </div>
                      ))}
                      {selectedApplication.assessments.length === 0 ? <EmptyState text="Belum ada assessment untuk application ini." /> : null}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <EmptyState text="Pilih application dari pipeline board untuk melihat detailnya." />
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="section-kicker">Interview Schedule</span>
                <CardTitle className="pt-3 text-2xl">Jadwal interview yang akan datang</CardTitle>
                <CardDescription>
                  Pantau interview berdasarkan rentang tanggal dan buka kandidat terkait dari daftar ini.
                </CardDescription>
              </div>
              <div className="grid w-full gap-3 md:max-w-xl md:grid-cols-2">
                <Input onChange={(event) => setScheduleFilters((current) => ({ ...current, start_date: event.currentTarget.value }))} type="date" value={scheduleFilters.start_date} />
                <Input onChange={(event) => setScheduleFilters((current) => ({ ...current, end_date: event.currentTarget.value }))} type="date" value={scheduleFilters.end_date} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {scheduleQuery.data?.map((interview) => (
                <button className="data-row w-full px-5 py-4 text-left" key={interview.id} onClick={() => setSelectedApplicationId(interview.application?.id ?? null)} type="button">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold">{interview.title}</p>
                      <p className="mt-2 text-sm text-app-muted-foreground">
                        {interview.application?.candidate?.full_name ?? 'Candidate'}
                        {' • '}
                        {interview.application?.vacancy?.title ?? 'Vacancy'}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={badgeVariantMap[interview.status as keyof typeof badgeVariantMap] ?? 'neutral'}>
                        {humanize(interview.status)}
                      </Badge>
                      <p className="mt-2 text-xs text-app-muted-foreground">{formatDateTime(interview.scheduled_at)}</p>
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {canManage && selectedApplication ? (
            <>
              <Card>
                <CardHeader>
                  <span className="section-kicker">Interview</span>
                  <CardTitle className="pt-3 text-2xl">Jadwalkan interview</CardTitle>
                  <CardDescription>
                    Tambahkan sesi interview baru ke application yang sedang dipilih.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" onSubmit={handleScheduleInterview}>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Title">
                        <Input onChange={(event) => setInterviewForm((current) => ({ ...current, title: event.currentTarget.value }))} value={interviewForm.title} />
                      </Field>
                      <Field label="Interview Type">
                        <select className="field-select" onChange={(event) => setInterviewForm((current) => ({ ...current, interview_type: event.currentTarget.value }))} value={interviewForm.interview_type}>
                          {lookupsQuery.data?.interview_types.map((item) => (
                            <option key={item.value} value={item.value}>{item.label}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Schedule">
                        <Input onChange={(event) => setInterviewForm((current) => ({ ...current, scheduled_at: event.currentTarget.value }))} type="datetime-local" value={interviewForm.scheduled_at} />
                      </Field>
                      <Field label="Duration">
                        <Input onChange={(event) => setInterviewForm((current) => ({ ...current, duration_minutes: event.currentTarget.value }))} type="number" value={interviewForm.duration_minutes} />
                      </Field>
                    </div>
                    <Field label="Location">
                      <Input onChange={(event) => setInterviewForm((current) => ({ ...current, location: event.currentTarget.value }))} value={interviewForm.location} />
                    </Field>
                    <Field label="Notes">
                      <textarea className="field-area" onChange={(event) => setInterviewForm((current) => ({ ...current, notes: event.currentTarget.value }))} value={interviewForm.notes} />
                    </Field>
                    {scheduleInterviewMutation.isError ? <p className="text-sm text-red-700">{getErrorMessage(scheduleInterviewMutation.error)}</p> : null}
                    <Button disabled={scheduleInterviewMutation.isPending} type="submit">
                      <CalendarDays className="h-4 w-4" />
                      {scheduleInterviewMutation.isPending ? 'Scheduling...' : 'Schedule Interview'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <span className="section-kicker">Assessment</span>
                  <CardTitle className="pt-3 text-2xl">Catat hasil assessment</CardTitle>
                  <CardDescription>
                    Simpan technical test, assignment, case study, atau psychometric result ke timeline kandidat.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" onSubmit={handleRecordAssessment}>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Title">
                        <Input onChange={(event) => setAssessmentForm((current) => ({ ...current, title: event.currentTarget.value }))} value={assessmentForm.title} />
                      </Field>
                      <Field label="Assessment Type">
                        <select className="field-select" onChange={(event) => setAssessmentForm((current) => ({ ...current, assessment_type: event.currentTarget.value }))} value={assessmentForm.assessment_type}>
                          {lookupsQuery.data?.assessment_types.map((item) => (
                            <option key={item.value} value={item.value}>{item.label}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Status">
                        <select className="field-select" onChange={(event) => setAssessmentForm((current) => ({ ...current, status: event.currentTarget.value }))} value={assessmentForm.status}>
                          {['assigned', 'submitted', 'reviewed', 'passed', 'failed'].map((item) => (
                            <option key={item} value={item}>{humanize(item)}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Assigned At">
                        <Input onChange={(event) => setAssessmentForm((current) => ({ ...current, assigned_at: event.currentTarget.value }))} type="datetime-local" value={assessmentForm.assigned_at} />
                      </Field>
                      <Field label="Due At">
                        <Input onChange={(event) => setAssessmentForm((current) => ({ ...current, due_at: event.currentTarget.value }))} type="datetime-local" value={assessmentForm.due_at} />
                      </Field>
                      <Field label="Completed At">
                        <Input onChange={(event) => setAssessmentForm((current) => ({ ...current, completed_at: event.currentTarget.value }))} type="datetime-local" value={assessmentForm.completed_at} />
                      </Field>
                      <Field label="Score">
                        <Input onChange={(event) => setAssessmentForm((current) => ({ ...current, score: event.currentTarget.value }))} type="number" value={assessmentForm.score} />
                      </Field>
                      <Field label="Max Score">
                        <Input onChange={(event) => setAssessmentForm((current) => ({ ...current, max_score: event.currentTarget.value }))} type="number" value={assessmentForm.max_score} />
                      </Field>
                    </div>
                    <Field label="Result">
                      <Input onChange={(event) => setAssessmentForm((current) => ({ ...current, result: event.currentTarget.value }))} value={assessmentForm.result} />
                    </Field>
                    <Field label="Notes">
                      <textarea className="field-area" onChange={(event) => setAssessmentForm((current) => ({ ...current, notes: event.currentTarget.value }))} value={assessmentForm.notes} />
                    </Field>
                    {recordAssessmentMutation.isError ? <p className="text-sm text-red-700">{getErrorMessage(recordAssessmentMutation.error)}</p> : null}
                    <Button disabled={recordAssessmentMutation.isPending} type="submit">
                      <ClipboardCheck className="h-4 w-4" />
                      {recordAssessmentMutation.isPending ? 'Recording...' : 'Record Assessment'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <span className="section-kicker">Hiring</span>
                  <CardTitle className="pt-3 text-2xl">Ubah kandidat menjadi employee</CardTitle>
                  <CardDescription>
                    Hiring action akan membuat employee baru di workforce dan menandai application sebagai hired.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" onSubmit={handleHireCandidate}>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Hire Date">
                        <Input onChange={(event) => setHireForm((current) => ({ ...current, hire_date: event.currentTarget.value }))} type="date" value={hireForm.hire_date} />
                      </Field>
                      <Field label="Employment Type">
                        <select className="field-select" onChange={(event) => setHireForm((current) => ({ ...current, employment_type: event.currentTarget.value }))} value={hireForm.employment_type}>
                          {lookupsQuery.data?.employment_types.map((item) => (
                            <option key={item.value} value={item.value}>{item.label}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Job Title">
                        <Input onChange={(event) => setHireForm((current) => ({ ...current, job_title: event.currentTarget.value }))} value={hireForm.job_title} />
                      </Field>
                      <Field label="Work Email">
                        <Input onChange={(event) => setHireForm((current) => ({ ...current, work_email: event.currentTarget.value }))} type="email" value={hireForm.work_email} />
                      </Field>
                      <Field label="Department">
                        <select className="field-select" onChange={(event) => setHireForm((current) => ({ ...current, department_id: event.currentTarget.value }))} value={hireForm.department_id}>
                          <option value="">Use vacancy department</option>
                          {lookupsQuery.data?.departments.map((item) => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Branch">
                        <select className="field-select" onChange={(event) => setHireForm((current) => ({ ...current, branch_id: event.currentTarget.value }))} value={hireForm.branch_id}>
                          <option value="">Use vacancy branch</option>
                          {lookupsQuery.data?.branches.map((item) => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Position">
                        <select className="field-select" onChange={(event) => setHireForm((current) => ({ ...current, position_id: event.currentTarget.value }))} value={hireForm.position_id}>
                          <option value="">Use vacancy position</option>
                          {lookupsQuery.data?.positions.map((item) => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Manager">
                        <select className="field-select" onChange={(event) => setHireForm((current) => ({ ...current, manager_id: event.currentTarget.value }))} value={hireForm.manager_id}>
                          <option value="">Use vacancy manager</option>
                          {lookupsQuery.data?.hiring_managers.map((item) => (
                            <option key={item.id} value={item.id}>{item.full_name}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Base Salary">
                        <Input onChange={(event) => setHireForm((current) => ({ ...current, base_salary: event.currentTarget.value }))} type="number" value={hireForm.base_salary} />
                      </Field>
                      <Field label="Contract Number">
                        <Input onChange={(event) => setHireForm((current) => ({ ...current, contract_number: event.currentTarget.value }))} value={hireForm.contract_number} />
                      </Field>
                      <Field label="Contract End Date">
                        <Input onChange={(event) => setHireForm((current) => ({ ...current, contract_end_date: event.currentTarget.value }))} type="date" value={hireForm.contract_end_date} />
                      </Field>
                    </div>
                    <label className="flex items-center gap-3 rounded-[20px] border border-app-border bg-white/72 px-4 py-3 text-sm font-medium">
                      <input checked={hireForm.create_contract} className="h-4 w-4" onChange={(event) => setHireForm((current) => ({ ...current, create_contract: event.currentTarget.checked }))} type="checkbox" />
                      Create active contract automatically when hiring.
                    </label>
                    <Field label="Hiring Notes">
                      <textarea className="field-area" onChange={(event) => setHireForm((current) => ({ ...current, notes: event.currentTarget.value }))} value={hireForm.notes} />
                    </Field>
                    {hireCandidateMutation.isError ? <p className="text-sm text-red-700">{getErrorMessage(hireCandidateMutation.error)}</p> : null}
                    <Button disabled={hireCandidateMutation.isPending || selectedApplication.stage === 'hired'} type="submit">
                      <WalletCards className="h-4 w-4" />
                      {hireCandidateMutation.isPending ? 'Hiring candidate...' : 'Hire Candidate'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
      </section>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Briefcase
  label: string
  value: string
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/8 px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-300">{label}</p>
        <Icon className="h-4 w-4 text-[color:var(--app-highlight)]" />
      </div>
      <p className="mt-3 text-2xl font-bold tracking-[-0.04em] text-white">{value}</p>
    </div>
  )
}

function Field({
  children,
  label,
}: {
  children: ReactNode
  label: string
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  )
}

function DetailPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-app-border bg-white/72 px-4 py-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-app-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold text-app-foreground">{value}</p>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-[24px] border border-dashed border-app-border bg-app-background/45 px-5 py-8 text-center text-sm leading-7 text-app-muted-foreground">
      {text}
    </div>
  )
}

function normalizeApplicationFilters(filters: { stage: string; vacancy_id: string; status: string }): RecruitmentApplicationFilters {
  return {
    stage: filters.stage || undefined,
    vacancy_id: filters.vacancy_id ? Number(filters.vacancy_id) : undefined,
    status: filters.status || undefined,
  }
}

function toNumber(value: string) {
  return Number(value || '0')
}

function toOptionalNumber(value: string) {
  return value ? Number(value) : undefined
}

function humanize(value: string) {
  return value.replace(/_/g, ' ')
}

function todayString() {
  return '2026-07-19'
}

function addDaysString(days: number) {
  const date = new Date(`${todayString()}T00:00:00`)
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

function nextDateTimeString(days: number, hour: number) {
  const date = new Date(`${todayString()}T00:00:00`)
  date.setDate(date.getDate() + days)
  date.setHours(hour, 0, 0, 0)
  return date.toISOString().slice(0, 16)
}

function toDateTimeInputValue(value?: string | null) {
  if (!value) {
    return ''
  }

  return value.slice(0, 16)
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return 'N/A'
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatCurrency(value: number, currency = 'IDR') {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value)
}

function openExternal(url: string) {
  if (!url) {
    return
  }

  window.open(url, '_blank', 'noopener,noreferrer')
}
