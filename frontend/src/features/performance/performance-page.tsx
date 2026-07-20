import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ClipboardCheck,
  Gauge,
  MessageSquare,
  Send,
  Star,
  Target,
  TrendingUp,
  Trophy,
  UsersRound,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/features/auth/auth-context'
import {
  createPerformanceCycle,
  createPerformanceFeedback,
  createPerformanceGoal,
  createPerformanceReview,
  getPerformanceCycles,
  getPerformanceGoals,
  getPerformanceLookups,
  getPerformanceOverview,
  getPerformanceReview,
  getPerformanceReviews,
  submitEmployeePerformanceReview,
  submitManagerPerformanceReview,
  updatePerformanceGoal,
  type PerformanceGoalFilters,
  type PerformanceReviewFilters,
} from '@/features/performance/performance-api'
import { getErrorMessage } from '@/lib/http'

const badgeVariantMap = {
  draft: 'neutral',
  active: 'success',
  closed: 'neutral',
  on_track: 'success',
  at_risk: 'warning',
  completed: 'success',
  cancelled: 'danger',
  employee_submitted: 'warning',
  manager_submitted: 'warning',
  kpi: 'neutral',
  okr: 'warning',
  goal: 'success',
  peer: 'neutral',
  manager: 'warning',
  direct_report: 'warning',
  self: 'neutral',
  stakeholder: 'success',
} as const

export function PerformancePage() {
  const { session } = useAuth()
  const queryClient = useQueryClient()
  const canView = session?.user.permissions.includes('performance.view') ?? false
  const canManage = session?.user.permissions.includes('performance.manage') ?? false
  const canReview = session?.user.permissions.includes('performance.review') ?? false
  const sessionEmployeeId = session?.user.employee?.id ?? null
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null)
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null)
  const [goalFilters, setGoalFilters] = useState({
    cycle_id: '',
    employee_id: '',
    goal_type: '',
    status: '',
  })
  const [reviewFilters, setReviewFilters] = useState({
    cycle_id: '',
    employee_id: '',
    status: '',
  })
  const [cycleForm, setCycleForm] = useState({
    name: '',
    review_type: 'quarterly',
    period_start: quarterStartString(),
    period_end: quarterEndString(),
    status: 'draft',
    description: '',
  })
  const [goalForm, setGoalForm] = useState({
    cycle_id: '',
    employee_id: '',
    manager_id: '',
    title: '',
    goal_type: 'goal',
    category: '',
    description: '',
    target_value: '',
    current_value: '',
    unit: '%',
    weight: '25',
    progress_percent: '',
    status: 'on_track',
    due_date: addDaysString(45),
    notes: '',
  })
  const [reviewForm, setReviewForm] = useState({
    cycle_id: '',
    employee_id: '',
    manager_id: '',
    status: 'draft',
  })
  const [goalUpdateForm, setGoalUpdateForm] = useState({
    current_value: '',
    progress_percent: '',
    status: '',
    notes: '',
  })
  const [employeeReviewForm, setEmployeeReviewForm] = useState({
    employee_review_summary: '',
    employee_review_highlights: '',
    employee_review_challenges: '',
    employee_rating: '',
  })
  const [managerReviewForm, setManagerReviewForm] = useState({
    manager_review_summary: '',
    manager_review_strengths: '',
    manager_review_improvements: '',
    manager_rating: '',
    overall_score: '',
    overall_rating: '',
    calibration_notes: '',
  })
  const [feedbackForm, setFeedbackForm] = useState({
    feedback_type: 'peer',
    relationship: '',
    strengths: '',
    improvements: '',
    comments: '',
    rating: '',
    is_anonymous: false,
  })

  const overviewQuery = useQuery({
    queryKey: ['performance', 'overview'],
    queryFn: getPerformanceOverview,
    enabled: canView,
  })

  const lookupsQuery = useQuery({
    queryKey: ['performance', 'lookups'],
    queryFn: getPerformanceLookups,
    enabled: canView,
  })

  const cyclesQuery = useQuery({
    queryKey: ['performance', 'cycles'],
    queryFn: getPerformanceCycles,
    enabled: canView,
  })

  const goalsQuery = useQuery({
    queryKey: ['performance', 'goals', goalFilters],
    queryFn: () => getPerformanceGoals(normalizeGoalFilters(goalFilters)),
    enabled: canView,
  })

  const reviewsQuery = useQuery({
    queryKey: ['performance', 'reviews', reviewFilters],
    queryFn: () => getPerformanceReviews(normalizeReviewFilters(reviewFilters)),
    enabled: canView,
  })

  const selectedReviewQuery = useQuery({
    queryKey: ['performance', 'reviews', selectedReviewId],
    queryFn: () => getPerformanceReview(selectedReviewId as number),
    enabled: canView && selectedReviewId !== null,
  })

  useEffect(() => {
    const defaults = lookupsQuery.data?.defaults
    const employees = lookupsQuery.data?.employees ?? []

    if (!defaults) {
      return
    }

    setGoalFilters((current) => ({
      ...current,
      cycle_id: current.cycle_id || (defaults.cycle_id ? String(defaults.cycle_id) : ''),
    }))

    setReviewFilters((current) => ({
      ...current,
      cycle_id: current.cycle_id || (defaults.cycle_id ? String(defaults.cycle_id) : ''),
    }))

    setCycleForm((current) => ({
      ...current,
      review_type: current.review_type || defaults.review_type,
    }))

    setGoalForm((current) => ({
      ...current,
      cycle_id: current.cycle_id || (defaults.cycle_id ? String(defaults.cycle_id) : ''),
      employee_id: current.employee_id || (employees[0] ? String(employees[0].id) : ''),
      manager_id: current.manager_id || (employees[0]?.manager ? String(employees[0].manager.id) : ''),
      goal_type: current.goal_type || defaults.goal_type,
      status: current.status || defaults.goal_status,
      due_date: current.due_date || defaults.due_date,
    }))

    setReviewForm((current) => ({
      ...current,
      cycle_id: current.cycle_id || (defaults.cycle_id ? String(defaults.cycle_id) : ''),
      employee_id: current.employee_id || (employees[0] ? String(employees[0].id) : ''),
      manager_id: current.manager_id || (employees[0]?.manager ? String(employees[0].manager.id) : ''),
      status: current.status || defaults.review_status,
    }))

    setFeedbackForm((current) => ({
      ...current,
      feedback_type: current.feedback_type || defaults.feedback_type,
    }))
  }, [lookupsQuery.data])

  useEffect(() => {
    const goals = goalsQuery.data ?? []

    if (goals.length === 0) {
      setSelectedGoalId(null)
      return
    }

    if (selectedGoalId === null || !goals.some((goal) => goal.id === selectedGoalId)) {
      setSelectedGoalId(goals[0]?.id ?? null)
    }
  }, [goalsQuery.data, selectedGoalId])

  useEffect(() => {
    const reviews = reviewsQuery.data ?? []

    if (reviews.length === 0) {
      setSelectedReviewId(null)
      return
    }

    if (selectedReviewId === null || !reviews.some((review) => review.id === selectedReviewId)) {
      setSelectedReviewId(reviews[0]?.id ?? null)
    }
  }, [reviewsQuery.data, selectedReviewId])

  const selectedGoal = (goalsQuery.data ?? []).find((goal) => goal.id === selectedGoalId) ?? null
  const selectedReview = selectedReviewQuery.data ?? null

  useEffect(() => {
    if (!selectedGoal) {
      return
    }

    setGoalUpdateForm({
      current_value: selectedGoal.current_value !== null ? String(selectedGoal.current_value) : '',
      progress_percent: String(selectedGoal.progress_percent),
      status: selectedGoal.status,
      notes: selectedGoal.notes ?? '',
    })
  }, [selectedGoal])

  useEffect(() => {
    if (!selectedReview) {
      return
    }

    setEmployeeReviewForm({
      employee_review_summary: selectedReview.employee_review.summary ?? '',
      employee_review_highlights: selectedReview.employee_review.highlights ?? '',
      employee_review_challenges: selectedReview.employee_review.challenges ?? '',
      employee_rating: selectedReview.employee_review.rating !== null ? String(selectedReview.employee_review.rating) : '',
    })

    setManagerReviewForm({
      manager_review_summary: selectedReview.manager_review.summary ?? '',
      manager_review_strengths: selectedReview.manager_review.strengths ?? '',
      manager_review_improvements: selectedReview.manager_review.improvements ?? '',
      manager_rating: selectedReview.manager_review.rating !== null ? String(selectedReview.manager_review.rating) : '',
      overall_score: selectedReview.overall_score !== null ? String(selectedReview.overall_score) : '',
      overall_rating: selectedReview.overall_rating ?? '',
      calibration_notes: selectedReview.calibration_notes ?? '',
    })
  }, [selectedReview])

  useEffect(() => {
    if (!goalForm.employee_id || goalForm.manager_id) {
      return
    }

    const employee = lookupsQuery.data?.employees.find((item) => item.id === Number(goalForm.employee_id))

    if (employee?.manager) {
      setGoalForm((current) => ({
        ...current,
        manager_id: String(employee.manager?.id ?? ''),
      }))
    }
  }, [goalForm.employee_id, goalForm.manager_id, lookupsQuery.data?.employees])

  useEffect(() => {
    if (!reviewForm.employee_id || reviewForm.manager_id) {
      return
    }

    const employee = lookupsQuery.data?.employees.find((item) => item.id === Number(reviewForm.employee_id))

    if (employee?.manager) {
      setReviewForm((current) => ({
        ...current,
        manager_id: String(employee.manager?.id ?? ''),
      }))
    }
  }, [lookupsQuery.data?.employees, reviewForm.employee_id, reviewForm.manager_id])

  const invalidatePerformance = () => {
    void queryClient.invalidateQueries({ queryKey: ['performance'] })
    void queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
    void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }

  const createCycleMutation = useMutation({
    mutationFn: createPerformanceCycle,
    onSuccess: () => {
      setCycleForm((current) => ({
        ...current,
        name: '',
        description: '',
      }))
      invalidatePerformance()
    },
  })

  const createGoalMutation = useMutation({
    mutationFn: createPerformanceGoal,
    onSuccess: (goal) => {
      setSelectedGoalId(goal.id)
      setGoalForm((current) => ({
        ...current,
        title: '',
        category: '',
        description: '',
        target_value: '',
        current_value: '',
        weight: '25',
        progress_percent: '',
        notes: '',
      }))
      invalidatePerformance()
    },
  })

  const updateGoalMutation = useMutation({
    mutationFn: ({ goalId, payload }: { goalId: number; payload: Parameters<typeof updatePerformanceGoal>[1] }) =>
      updatePerformanceGoal(goalId, payload),
    onSuccess: () => {
      invalidatePerformance()
    },
  })

  const createReviewMutation = useMutation({
    mutationFn: createPerformanceReview,
    onSuccess: (review) => {
      setSelectedReviewId(review.id)
      invalidatePerformance()
    },
  })

  const submitEmployeeReviewMutation = useMutation({
    mutationFn: ({ reviewId, payload }: { reviewId: number; payload: Parameters<typeof submitEmployeePerformanceReview>[1] }) =>
      submitEmployeePerformanceReview(reviewId, payload),
    onSuccess: () => {
      invalidatePerformance()
    },
  })

  const submitManagerReviewMutation = useMutation({
    mutationFn: ({ reviewId, payload }: { reviewId: number; payload: Parameters<typeof submitManagerPerformanceReview>[1] }) =>
      submitManagerPerformanceReview(reviewId, payload),
    onSuccess: () => {
      invalidatePerformance()
    },
  })

  const createFeedbackMutation = useMutation({
    mutationFn: ({ reviewId, payload }: { reviewId: number; payload: Parameters<typeof createPerformanceFeedback>[1] }) =>
      createPerformanceFeedback(reviewId, payload),
    onSuccess: () => {
      setFeedbackForm((current) => ({
        ...current,
        relationship: '',
        strengths: '',
        improvements: '',
        comments: '',
        rating: '',
        is_anonymous: false,
      }))
      invalidatePerformance()
    },
  })

  const canUpdateSelectedGoal = Boolean(
    selectedGoal && (
      canManage
      || (
        canReview
        && sessionEmployeeId !== null
        && (
          selectedGoal.employee?.id === sessionEmployeeId
          || selectedGoal.manager?.id === sessionEmployeeId
        )
      )
    ),
  )

  const canSubmitSelectedEmployeeReview = Boolean(
    selectedReview && (
      canManage
      || (
        canReview
        && sessionEmployeeId !== null
        && selectedReview.employee?.id === sessionEmployeeId
      )
    ),
  )

  const canSubmitSelectedManagerReview = Boolean(
    selectedReview && (
      canManage
      || (
        canReview
        && sessionEmployeeId !== null
        && selectedReview.manager?.id === sessionEmployeeId
      )
    ),
  )

  if (!canView) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance access is unavailable</CardTitle>
          <CardDescription>
            Role ini belum memiliki permission `performance.view`, jadi workspace performance belum bisa dibuka.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const relatedGoals = selectedReview
    ? (goalsQuery.data ?? []).filter((goal) =>
      goal.cycle?.id === selectedReview.cycle?.id
      && goal.employee?.id === selectedReview.employee?.id)
    : []

  const handleCreateCycle = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    createCycleMutation.mutate({
      name: cycleForm.name,
      review_type: cycleForm.review_type,
      period_start: cycleForm.period_start,
      period_end: cycleForm.period_end,
      status: cycleForm.status,
      description: cycleForm.description || undefined,
    })
  }

  const handleCreateGoal = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    createGoalMutation.mutate({
      cycle_id: toNumber(goalForm.cycle_id),
      employee_id: toNumber(goalForm.employee_id),
      manager_id: toOptionalNumber(goalForm.manager_id),
      title: goalForm.title,
      goal_type: goalForm.goal_type,
      category: goalForm.category || undefined,
      description: goalForm.description || undefined,
      target_value: toOptionalNumber(goalForm.target_value),
      current_value: toOptionalNumber(goalForm.current_value),
      unit: goalForm.unit || undefined,
      weight: toOptionalNumber(goalForm.weight),
      progress_percent: toOptionalNumber(goalForm.progress_percent),
      status: goalForm.status,
      due_date: goalForm.due_date || undefined,
      notes: goalForm.notes || undefined,
    })
  }

  const handleUpdateGoal = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedGoal) {
      return
    }

    updateGoalMutation.mutate({
      goalId: selectedGoal.id,
      payload: {
        current_value: toOptionalNumber(goalUpdateForm.current_value),
        progress_percent: toOptionalNumber(goalUpdateForm.progress_percent),
        status: goalUpdateForm.status || undefined,
        notes: goalUpdateForm.notes || undefined,
      },
    })
  }

  const handleCreateReview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    createReviewMutation.mutate({
      cycle_id: toNumber(reviewForm.cycle_id),
      employee_id: toNumber(reviewForm.employee_id),
      manager_id: toOptionalNumber(reviewForm.manager_id),
      status: reviewForm.status,
    })
  }

  const handleSubmitEmployeeReview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedReview) {
      return
    }

    submitEmployeeReviewMutation.mutate({
      reviewId: selectedReview.id,
      payload: {
        employee_review_summary: employeeReviewForm.employee_review_summary,
        employee_review_highlights: employeeReviewForm.employee_review_highlights || undefined,
        employee_review_challenges: employeeReviewForm.employee_review_challenges || undefined,
        employee_rating: toOptionalNumber(employeeReviewForm.employee_rating),
      },
    })
  }

  const handleSubmitManagerReview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedReview) {
      return
    }

    submitManagerReviewMutation.mutate({
      reviewId: selectedReview.id,
      payload: {
        manager_review_summary: managerReviewForm.manager_review_summary,
        manager_review_strengths: managerReviewForm.manager_review_strengths || undefined,
        manager_review_improvements: managerReviewForm.manager_review_improvements || undefined,
        manager_rating: toOptionalNumber(managerReviewForm.manager_rating),
        overall_score: toOptionalNumber(managerReviewForm.overall_score),
        overall_rating: managerReviewForm.overall_rating || undefined,
        calibration_notes: managerReviewForm.calibration_notes || undefined,
      },
    })
  }

  const handleCreateFeedback = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedReview) {
      return
    }

    createFeedbackMutation.mutate({
      reviewId: selectedReview.id,
      payload: {
        feedback_type: feedbackForm.feedback_type,
        relationship: feedbackForm.relationship || undefined,
        strengths: feedbackForm.strengths || undefined,
        improvements: feedbackForm.improvements || undefined,
        comments: feedbackForm.comments || undefined,
        rating: toOptionalNumber(feedbackForm.rating),
        is_anonymous: feedbackForm.is_anonymous,
      },
    })
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
        <Card className="hero-panel">
          <CardHeader className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="border-white/10 bg-white/8 text-white" variant="neutral">
                Performance Workspace
              </Badge>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
                <Target className="h-3.5 w-3.5 text-[color:var(--app-highlight)]" />
                KPI, OKR, Review
              </div>
            </div>
            <div className="space-y-3">
              <CardTitle className="max-w-3xl text-4xl font-extrabold tracking-[-0.06em] text-white md:text-5xl">
                Satukan target kerja, review, dan 360 feedback dalam satu ritme yang lebih jelas.
              </CardTitle>
              <CardDescription className="max-w-3xl text-base leading-8 text-slate-200">
                Modul performance ini merangkum KPI, OKR, goal progress, employee review,
                manager review, 360 feedback, dan performance dashboard tanpa memecah konteks antar tim.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard icon={Gauge} label="Active Cycles" value={String(overviewQuery.data?.stats.active_cycles ?? 0)} />
              <MetricCard icon={Target} label="Visible Goals" value={String(overviewQuery.data?.stats.visible_goals ?? 0)} />
              <MetricCard icon={ClipboardCheck} label="Open Reviews" value={String(overviewQuery.data?.stats.open_reviews ?? 0)} />
              <MetricCard icon={UsersRound} label="Feedback" value={String(overviewQuery.data?.stats.feedback_responses ?? 0)} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] border border-white/10 bg-black/12 px-5 py-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">Average Goal Progress</p>
                <p className="mt-3 text-3xl font-bold text-white">
                  {formatPercent(overviewQuery.data?.stats.average_goal_progress ?? 0)}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  Snapshot performance dashboard ini mengambil baseline pada Minggu, 19 Juli 2026.
                </p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-black/12 px-5 py-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">Average Review Score</p>
                <p className="mt-3 text-3xl font-bold text-white">
                  {formatScore(overviewQuery.data?.stats.average_review_score ?? 0)}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  Score bergerak dari self review, manager review, dan final performance calibration.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">Cycle Snapshot</p>
              {(overviewQuery.data?.cycle_snapshot ?? []).map((cycle) => (
                <article className="rounded-[20px] border border-white/10 bg-white/8 px-4 py-4" key={cycle.id}>
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-white">{cycle.name}</p>
                      <p className="mt-2 text-sm text-slate-300">
                        {cycle.code}
                        {' • '}
                        {formatDate(cycle.period_start)}
                        {' - '}
                        {formatDate(cycle.period_end)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="border-white/8 bg-white/8 text-white" variant={badgeVariantMap[cycle.status as keyof typeof badgeVariantMap] ?? 'neutral'}>
                        {humanize(cycle.status)}
                      </Badge>
                      <Badge className="border-white/8 bg-white/8 text-white" variant="neutral">
                        {cycle.goals_count ?? 0} goals
                      </Badge>
                      <Badge className="border-white/8 bg-white/8 text-white" variant="neutral">
                        {cycle.reviews_count ?? 0} reviews
                      </Badge>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <span className="section-kicker">Review Pulse</span>
            <CardTitle className="pt-3 text-2xl">Distribusi review dan feedback terbaru</CardTitle>
            <CardDescription>
              Lihat status performance review yang masih bergerak, lalu baca 360 feedback yang paling baru masuk.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-3">
              {(overviewQuery.data?.review_distribution ?? []).map((item) => (
                <article className="data-row flex items-center justify-between px-5 py-4" key={item.status}>
                  <div>
                    <p className="font-semibold">{humanize(item.status)}</p>
                    <p className="text-sm text-app-muted-foreground">Review status distribution</p>
                  </div>
                  <Badge variant={badgeVariantMap[item.status as keyof typeof badgeVariantMap] ?? 'neutral'}>
                    {item.count}
                  </Badge>
                </article>
              ))}

              {!overviewQuery.isLoading && (overviewQuery.data?.review_distribution.length ?? 0) === 0 ? (
                <EmptyState text="Belum ada review performance yang terlihat untuk akun ini." />
              ) : null}
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-app-muted-foreground">Recent Feedback</p>
              {(overviewQuery.data?.recent_feedback ?? []).slice(0, 4).map((feedback) => (
                <article className="rounded-[20px] border border-app-border bg-app-background/55 px-4 py-4" key={feedback.id}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{feedback.review?.employee?.full_name ?? 'Reviewee'}</p>
                    <Badge variant={badgeVariantMap[feedback.feedback_type as keyof typeof badgeVariantMap] ?? 'neutral'}>
                      {humanize(feedback.feedback_type)}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-app-muted-foreground">
                    {feedback.review?.cycle?.name ?? 'Performance cycle'}
                    {' • '}
                    {feedback.reviewer?.employee?.full_name ?? feedback.reviewer?.user?.name ?? 'Anonymous reviewer'}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-app-muted-foreground">
                    {feedback.comments ?? feedback.strengths ?? 'No comment provided.'}
                  </p>
                </article>
              ))}

              {!overviewQuery.isLoading && (overviewQuery.data?.recent_feedback.length ?? 0) === 0 ? (
                <EmptyState text="Belum ada feedback terbaru di performance workspace." />
              ) : null}
            </div>
          </CardContent>
        </Card>
      </section>

      {canManage ? (
        <section className="grid gap-6 xl:grid-cols-3">
          <Card>
            <CardHeader>
              <span className="section-kicker">Cycle</span>
              <CardTitle className="pt-3 text-2xl">Buka performance cycle baru</CardTitle>
              <CardDescription>
                Cycle menentukan periode, tipe review, dan ritme evaluasi yang dipakai goal serta review.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleCreateCycle}>
                <Field label="Cycle Name">
                  <Input onChange={(event) => setCycleForm((current) => ({ ...current, name: event.currentTarget.value }))} value={cycleForm.name} />
                </Field>
                <Field label="Review Type">
                  <select className="field-select" onChange={(event) => setCycleForm((current) => ({ ...current, review_type: event.currentTarget.value }))} value={cycleForm.review_type}>
                    {lookupsQuery.data?.review_types.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                </Field>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Period Start">
                    <Input onChange={(event) => setCycleForm((current) => ({ ...current, period_start: event.currentTarget.value }))} type="date" value={cycleForm.period_start} />
                  </Field>
                  <Field label="Period End">
                    <Input onChange={(event) => setCycleForm((current) => ({ ...current, period_end: event.currentTarget.value }))} type="date" value={cycleForm.period_end} />
                  </Field>
                </div>
                <Field label="Status">
                  <select className="field-select" onChange={(event) => setCycleForm((current) => ({ ...current, status: event.currentTarget.value }))} value={cycleForm.status}>
                    {['draft', 'active', 'closed'].map((status) => (
                      <option key={status} value={status}>{humanize(status)}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Description">
                  <textarea className="field-area" onChange={(event) => setCycleForm((current) => ({ ...current, description: event.currentTarget.value }))} value={cycleForm.description} />
                </Field>
                {createCycleMutation.isError ? <p className="text-sm text-red-700">{getErrorMessage(createCycleMutation.error)}</p> : null}
                <Button disabled={createCycleMutation.isPending || cycleForm.name.trim().length < 3} type="submit">
                  <Send className="h-4 w-4" />
                  {createCycleMutation.isPending ? 'Creating cycle...' : 'Create Cycle'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <span className="section-kicker">Goal</span>
              <CardTitle className="pt-3 text-2xl">Tambah KPI, OKR, atau goal</CardTitle>
              <CardDescription>
                Goal disimpan per employee dalam cycle tertentu, lengkap dengan bobot, target, progres, dan due date.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleCreateGoal}>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Cycle">
                    <select className="field-select" onChange={(event) => setGoalForm((current) => ({ ...current, cycle_id: event.currentTarget.value }))} value={goalForm.cycle_id}>
                      <option value="">Select cycle</option>
                      {cyclesQuery.data?.map((cycle) => (
                        <option key={cycle.id} value={cycle.id}>{cycle.name}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Employee">
                    <select className="field-select" onChange={(event) => setGoalForm((current) => ({ ...current, employee_id: event.currentTarget.value, manager_id: '' }))} value={goalForm.employee_id}>
                      <option value="">Select employee</option>
                      {lookupsQuery.data?.employees.map((employee) => (
                        <option key={employee.id} value={employee.id}>{employee.full_name}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Manager">
                    <select className="field-select" onChange={(event) => setGoalForm((current) => ({ ...current, manager_id: event.currentTarget.value }))} value={goalForm.manager_id}>
                      <option value="">Auto from employee</option>
                      {lookupsQuery.data?.employees.map((employee) => (
                        <option key={employee.id} value={employee.id}>{employee.full_name}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Goal Type">
                    <select className="field-select" onChange={(event) => setGoalForm((current) => ({ ...current, goal_type: event.currentTarget.value }))} value={goalForm.goal_type}>
                      {lookupsQuery.data?.goal_types.map((item) => (
                        <option key={item.value} value={item.value}>{item.label}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Field label="Title">
                  <Input onChange={(event) => setGoalForm((current) => ({ ...current, title: event.currentTarget.value }))} value={goalForm.title} />
                </Field>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Category">
                    <Input onChange={(event) => setGoalForm((current) => ({ ...current, category: event.currentTarget.value }))} value={goalForm.category} />
                  </Field>
                  <Field label="Unit">
                    <Input onChange={(event) => setGoalForm((current) => ({ ...current, unit: event.currentTarget.value }))} value={goalForm.unit} />
                  </Field>
                  <Field label="Target Value">
                    <Input onChange={(event) => setGoalForm((current) => ({ ...current, target_value: event.currentTarget.value }))} type="number" value={goalForm.target_value} />
                  </Field>
                  <Field label="Current Value">
                    <Input onChange={(event) => setGoalForm((current) => ({ ...current, current_value: event.currentTarget.value }))} type="number" value={goalForm.current_value} />
                  </Field>
                  <Field label="Weight">
                    <Input onChange={(event) => setGoalForm((current) => ({ ...current, weight: event.currentTarget.value }))} type="number" value={goalForm.weight} />
                  </Field>
                  <Field label="Due Date">
                    <Input onChange={(event) => setGoalForm((current) => ({ ...current, due_date: event.currentTarget.value }))} type="date" value={goalForm.due_date} />
                  </Field>
                </div>
                <Field label="Description">
                  <textarea className="field-area" onChange={(event) => setGoalForm((current) => ({ ...current, description: event.currentTarget.value }))} value={goalForm.description} />
                </Field>
                <Field label="Notes">
                  <textarea className="field-area" onChange={(event) => setGoalForm((current) => ({ ...current, notes: event.currentTarget.value }))} value={goalForm.notes} />
                </Field>
                {createGoalMutation.isError ? <p className="text-sm text-red-700">{getErrorMessage(createGoalMutation.error)}</p> : null}
                <Button disabled={createGoalMutation.isPending || !goalForm.cycle_id || !goalForm.employee_id || goalForm.title.trim().length < 3} type="submit">
                  <Target className="h-4 w-4" />
                  {createGoalMutation.isPending ? 'Creating goal...' : 'Create Goal'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <span className="section-kicker">Review Assignment</span>
              <CardTitle className="pt-3 text-2xl">Buat performance review</CardTitle>
              <CardDescription>
                Review assignment menghubungkan employee, manager, dan cycle sebelum self review atau manager review dimulai.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleCreateReview}>
                <Field label="Cycle">
                  <select className="field-select" onChange={(event) => setReviewForm((current) => ({ ...current, cycle_id: event.currentTarget.value }))} value={reviewForm.cycle_id}>
                    <option value="">Select cycle</option>
                    {cyclesQuery.data?.map((cycle) => (
                      <option key={cycle.id} value={cycle.id}>{cycle.name}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Employee">
                  <select className="field-select" onChange={(event) => setReviewForm((current) => ({ ...current, employee_id: event.currentTarget.value, manager_id: '' }))} value={reviewForm.employee_id}>
                    <option value="">Select employee</option>
                    {lookupsQuery.data?.employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>{employee.full_name}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Manager">
                  <select className="field-select" onChange={(event) => setReviewForm((current) => ({ ...current, manager_id: event.currentTarget.value }))} value={reviewForm.manager_id}>
                    <option value="">Auto from employee</option>
                    {lookupsQuery.data?.employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>{employee.full_name}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Initial Status">
                  <select className="field-select" onChange={(event) => setReviewForm((current) => ({ ...current, status: event.currentTarget.value }))} value={reviewForm.status}>
                    {lookupsQuery.data?.review_statuses.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                </Field>
                {createReviewMutation.isError ? <p className="text-sm text-red-700">{getErrorMessage(createReviewMutation.error)}</p> : null}
                <Button disabled={createReviewMutation.isPending || !reviewForm.cycle_id || !reviewForm.employee_id} type="submit">
                  <ClipboardCheck className="h-4 w-4" />
                  {createReviewMutation.isPending ? 'Creating review...' : 'Create Review'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[0.96fr_1.04fr]">
        <Card>
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="section-kicker">Goal Board</span>
              <CardTitle className="pt-3 text-2xl">KPI, OKR, dan goals yang terlihat</CardTitle>
              <CardDescription>
                Filter goal berdasarkan cycle, employee, type, atau status untuk melihat progres yang sedang berjalan.
              </CardDescription>
            </div>
            <div className="grid w-full gap-3 md:max-w-3xl md:grid-cols-2 xl:grid-cols-4">
              <select className="field-select" onChange={(event) => setGoalFilters((current) => ({ ...current, cycle_id: event.currentTarget.value }))} value={goalFilters.cycle_id}>
                <option value="">All cycles</option>
                {cyclesQuery.data?.map((cycle) => (
                  <option key={cycle.id} value={cycle.id}>{cycle.name}</option>
                ))}
              </select>
              <select className="field-select" onChange={(event) => setGoalFilters((current) => ({ ...current, employee_id: event.currentTarget.value }))} value={goalFilters.employee_id}>
                <option value="">All employees</option>
                {lookupsQuery.data?.employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>{employee.full_name}</option>
                ))}
              </select>
              <select className="field-select" onChange={(event) => setGoalFilters((current) => ({ ...current, goal_type: event.currentTarget.value }))} value={goalFilters.goal_type}>
                <option value="">All types</option>
                {lookupsQuery.data?.goal_types.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
              <select className="field-select" onChange={(event) => setGoalFilters((current) => ({ ...current, status: event.currentTarget.value }))} value={goalFilters.status}>
                <option value="">All statuses</option>
                {lookupsQuery.data?.goal_statuses.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {(goalsQuery.data ?? []).map((goal) => (
              <button
                className={[
                  'data-row w-full px-5 py-4 text-left transition',
                  selectedGoalId === goal.id ? 'border-[rgba(185,123,49,0.32)] bg-app-background/70' : '',
                ].join(' ')}
                key={goal.id}
                onClick={() => setSelectedGoalId(goal.id)}
                type="button"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{goal.title}</p>
                      <Badge variant={badgeVariantMap[goal.goal_type as keyof typeof badgeVariantMap] ?? 'neutral'}>
                        {goal.goal_type.toUpperCase()}
                      </Badge>
                      <Badge variant={badgeVariantMap[goal.status as keyof typeof badgeVariantMap] ?? 'neutral'}>
                        {humanize(goal.status)}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-app-muted-foreground">
                      {goal.employee?.full_name ?? 'Employee'}
                      {' • '}
                      {goal.cycle?.name ?? 'Cycle'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-app-foreground">
                      {formatPercent(goal.progress_percent)}
                    </p>
                    <p className="mt-1 text-xs text-app-muted-foreground">
                      {formatGoalValue(goal)}
                    </p>
                  </div>
                </div>
              </button>
            ))}

            {!goalsQuery.isLoading && (goalsQuery.data?.length ?? 0) === 0 ? (
              <EmptyState text="Belum ada goal performance yang cocok dengan filter ini." />
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="section-kicker">Review Board</span>
              <CardTitle className="pt-3 text-2xl">Performance review yang sedang berjalan</CardTitle>
              <CardDescription>
                Pilih review untuk membuka employee review, manager review, feedback trail, dan detail cycle yang terkait.
              </CardDescription>
            </div>
            <div className="grid w-full gap-3 md:max-w-2xl md:grid-cols-3">
              <select className="field-select" onChange={(event) => setReviewFilters((current) => ({ ...current, cycle_id: event.currentTarget.value }))} value={reviewFilters.cycle_id}>
                <option value="">All cycles</option>
                {cyclesQuery.data?.map((cycle) => (
                  <option key={cycle.id} value={cycle.id}>{cycle.name}</option>
                ))}
              </select>
              <select className="field-select" onChange={(event) => setReviewFilters((current) => ({ ...current, employee_id: event.currentTarget.value }))} value={reviewFilters.employee_id}>
                <option value="">All employees</option>
                {lookupsQuery.data?.employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>{employee.full_name}</option>
                ))}
              </select>
              <select className="field-select" onChange={(event) => setReviewFilters((current) => ({ ...current, status: event.currentTarget.value }))} value={reviewFilters.status}>
                <option value="">All statuses</option>
                {lookupsQuery.data?.review_statuses.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {(reviewsQuery.data ?? []).map((review) => (
              <button
                className={[
                  'data-row w-full px-5 py-4 text-left transition',
                  selectedReviewId === review.id ? 'border-[rgba(185,123,49,0.32)] bg-app-background/70' : '',
                ].join(' ')}
                key={review.id}
                onClick={() => setSelectedReviewId(review.id)}
                type="button"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{review.employee?.full_name ?? 'Employee'}</p>
                      <Badge variant={badgeVariantMap[review.status as keyof typeof badgeVariantMap] ?? 'neutral'}>
                        {humanize(review.status)}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-app-muted-foreground">
                      {review.cycle?.name ?? 'Cycle'}
                      {' • '}
                      {review.manager?.full_name ?? 'No manager'}
                    </p>
                  </div>
                  <div className="text-right text-sm text-app-muted-foreground">
                    <p>{review.feedback_count} feedback</p>
                    <p>{review.overall_score !== null ? `${formatScore(review.overall_score)} score` : 'No final score'}</p>
                  </div>
                </div>
              </button>
            ))}

            {!reviewsQuery.isLoading && (reviewsQuery.data?.length ?? 0) === 0 ? (
              <EmptyState text="Belum ada review performance yang cocok dengan filter ini." />
            ) : null}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <Card>
          <CardHeader>
            <span className="section-kicker">Goal Detail</span>
            <CardTitle className="pt-3 text-2xl">{selectedGoal?.title ?? 'Select a goal'}</CardTitle>
            <CardDescription>
              Detail target, bobot, due date, dan progres terbaru untuk goal yang sedang dipilih.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {selectedGoal ? (
              <>
                <div className="grid gap-3 md:grid-cols-2">
                  <DetailPill label="Employee" value={selectedGoal.employee?.full_name ?? 'N/A'} />
                  <DetailPill label="Cycle" value={selectedGoal.cycle?.name ?? 'N/A'} />
                  <DetailPill label="Progress" value={formatPercent(selectedGoal.progress_percent)} />
                  <DetailPill label="Value" value={formatGoalValue(selectedGoal)} />
                </div>

                <div className="rounded-[24px] border border-app-border bg-app-background/60 px-5 py-5">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={badgeVariantMap[selectedGoal.goal_type as keyof typeof badgeVariantMap] ?? 'neutral'}>
                      {selectedGoal.goal_type.toUpperCase()}
                    </Badge>
                    <Badge variant={badgeVariantMap[selectedGoal.status as keyof typeof badgeVariantMap] ?? 'neutral'}>
                      {humanize(selectedGoal.status)}
                    </Badge>
                    <Badge variant="neutral">Weight {selectedGoal.weight}%</Badge>
                  </div>
                  {selectedGoal.description ? (
                    <p className="mt-4 text-sm leading-7 text-app-muted-foreground">{selectedGoal.description}</p>
                  ) : null}
                  {selectedGoal.notes ? (
                    <p className="mt-3 text-sm leading-7 text-app-muted-foreground">{selectedGoal.notes}</p>
                  ) : null}
                  <p className="mt-4 text-sm text-app-muted-foreground">
                    Due date:
                    {' '}
                    <span className="font-medium text-app-foreground">
                      {selectedGoal.due_date ? formatDate(selectedGoal.due_date) : 'No due date'}
                    </span>
                  </p>
                </div>

                {canUpdateSelectedGoal ? (
                  <form className="space-y-4" onSubmit={handleUpdateGoal}>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Current Value">
                        <Input onChange={(event) => setGoalUpdateForm((current) => ({ ...current, current_value: event.currentTarget.value }))} type="number" value={goalUpdateForm.current_value} />
                      </Field>
                      <Field label="Progress Percent">
                        <Input onChange={(event) => setGoalUpdateForm((current) => ({ ...current, progress_percent: event.currentTarget.value }))} type="number" value={goalUpdateForm.progress_percent} />
                      </Field>
                      <Field label="Status">
                        <select className="field-select" onChange={(event) => setGoalUpdateForm((current) => ({ ...current, status: event.currentTarget.value }))} value={goalUpdateForm.status}>
                          {lookupsQuery.data?.goal_statuses.map((item) => (
                            <option key={item.value} value={item.value}>{item.label}</option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    <Field label="Progress Notes">
                      <textarea className="field-area" onChange={(event) => setGoalUpdateForm((current) => ({ ...current, notes: event.currentTarget.value }))} value={goalUpdateForm.notes} />
                    </Field>
                    {updateGoalMutation.isError ? <p className="text-sm text-red-700">{getErrorMessage(updateGoalMutation.error)}</p> : null}
                    <Button disabled={updateGoalMutation.isPending} type="submit">
                      <TrendingUp className="h-4 w-4" />
                      {updateGoalMutation.isPending ? 'Updating progress...' : 'Update Goal Progress'}
                    </Button>
                  </form>
                ) : null}
              </>
            ) : (
              <EmptyState text="Pilih goal dari board untuk melihat detail dan progresnya." />
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <span className="section-kicker">Review Detail</span>
              <CardTitle className="pt-3 text-2xl">{selectedReview?.employee?.full_name ?? 'Select a review'}</CardTitle>
              <CardDescription>
                Panel ini menyatukan employee review, manager review, goal terkait, dan 360 feedback untuk satu review record.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {selectedReviewQuery.isLoading ? (
                <p className="text-sm text-app-muted-foreground">Loading performance review detail...</p>
              ) : null}

              {selectedReview ? (
                <>
                  <div className="grid gap-3 md:grid-cols-2">
                    <DetailPill label="Cycle" value={selectedReview.cycle?.name ?? 'N/A'} />
                    <DetailPill label="Status" value={humanize(selectedReview.status)} />
                    <DetailPill label="Overall Score" value={selectedReview.overall_score !== null ? formatScore(selectedReview.overall_score) : 'Pending'} />
                    <DetailPill label="Feedback Count" value={String(selectedReview.feedback_count)} />
                  </div>

                  <div className="rounded-[24px] border border-app-border bg-app-background/60 px-5 py-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-semibold">{selectedReview.employee?.full_name ?? 'Employee'}</p>
                        <p className="mt-2 text-sm text-app-muted-foreground">
                          {selectedReview.employee?.job_title ?? 'No job title'}
                          {' • '}
                          {selectedReview.employee?.department ?? 'No department'}
                          {' • '}
                          {selectedReview.manager?.full_name ?? 'No manager'}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={badgeVariantMap[selectedReview.status as keyof typeof badgeVariantMap] ?? 'neutral'}>
                          {humanize(selectedReview.status)}
                        </Badge>
                        {selectedReview.overall_rating ? <Badge variant="success">{selectedReview.overall_rating}</Badge> : null}
                      </div>
                    </div>

                    {selectedReview.employee_review.summary ? (
                      <div className="mt-4 rounded-[20px] bg-white/72 px-4 py-4">
                        <p className="font-semibold">Employee Review</p>
                        <p className="mt-2 text-sm leading-7 text-app-muted-foreground">{selectedReview.employee_review.summary}</p>
                      </div>
                    ) : null}

                    {selectedReview.manager_review.summary ? (
                      <div className="mt-3 rounded-[20px] bg-white/72 px-4 py-4">
                        <p className="font-semibold">Manager Review</p>
                        <p className="mt-2 text-sm leading-7 text-app-muted-foreground">{selectedReview.manager_review.summary}</p>
                      </div>
                    ) : null}

                    {selectedReview.calibration_notes ? (
                      <div className="mt-3 rounded-[20px] bg-white/72 px-4 py-4">
                        <p className="font-semibold">Calibration Notes</p>
                        <p className="mt-2 text-sm leading-7 text-app-muted-foreground">{selectedReview.calibration_notes}</p>
                      </div>
                    ) : null}
                  </div>

                  <div className="rounded-[24px] border border-app-border bg-white/72 px-5 py-5">
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-app-accent" />
                      <p className="font-semibold">Goals related to this review</p>
                    </div>
                    <div className="mt-4 space-y-3">
                      {relatedGoals.map((goal) => (
                        <div className="rounded-[18px] bg-black/4 px-4 py-3" key={goal.id}>
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-medium">{goal.title}</p>
                            <Badge variant={badgeVariantMap[goal.status as keyof typeof badgeVariantMap] ?? 'neutral'}>
                              {formatPercent(goal.progress_percent)}
                            </Badge>
                          </div>
                          <p className="mt-2 text-sm text-app-muted-foreground">
                            {goal.goal_type.toUpperCase()}
                            {' • '}
                            {formatGoalValue(goal)}
                          </p>
                        </div>
                      ))}
                      {relatedGoals.length === 0 ? <EmptyState text="Belum ada goal yang terlihat untuk review ini." /> : null}
                    </div>
                  </div>
                </>
              ) : (
                <EmptyState text="Pilih review dari board untuk membuka detail performance dan feedback-nya." />
              )}
            </CardContent>
          </Card>

          {canSubmitSelectedEmployeeReview && selectedReview ? (
            <Card>
              <CardHeader>
                <span className="section-kicker">Employee Review</span>
                <CardTitle className="pt-3 text-2xl">Submit self review</CardTitle>
                <CardDescription>
                  Employee review menyimpan refleksi hasil kerja, highlight, challenge, dan self-rating.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleSubmitEmployeeReview}>
                  <Field label="Summary">
                    <textarea className="field-area" onChange={(event) => setEmployeeReviewForm((current) => ({ ...current, employee_review_summary: event.currentTarget.value }))} value={employeeReviewForm.employee_review_summary} />
                  </Field>
                  <Field label="Highlights">
                    <textarea className="field-area" onChange={(event) => setEmployeeReviewForm((current) => ({ ...current, employee_review_highlights: event.currentTarget.value }))} value={employeeReviewForm.employee_review_highlights} />
                  </Field>
                  <Field label="Challenges">
                    <textarea className="field-area" onChange={(event) => setEmployeeReviewForm((current) => ({ ...current, employee_review_challenges: event.currentTarget.value }))} value={employeeReviewForm.employee_review_challenges} />
                  </Field>
                  <Field label="Self Rating">
                    <Input onChange={(event) => setEmployeeReviewForm((current) => ({ ...current, employee_rating: event.currentTarget.value }))} step="0.1" type="number" value={employeeReviewForm.employee_rating} />
                  </Field>
                  {submitEmployeeReviewMutation.isError ? <p className="text-sm text-red-700">{getErrorMessage(submitEmployeeReviewMutation.error)}</p> : null}
                  <Button disabled={submitEmployeeReviewMutation.isPending || employeeReviewForm.employee_review_summary.trim().length < 10} type="submit">
                    <Star className="h-4 w-4" />
                    {submitEmployeeReviewMutation.isPending ? 'Submitting self review...' : 'Submit Employee Review'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : null}

          {canSubmitSelectedManagerReview && selectedReview ? (
            <Card>
              <CardHeader>
                <span className="section-kicker">Manager Review</span>
                <CardTitle className="pt-3 text-2xl">Submit manager review</CardTitle>
                <CardDescription>
                  Manager review menangkap evaluasi performa, area penguatan, dan final rating untuk review ini.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleSubmitManagerReview}>
                  <Field label="Summary">
                    <textarea className="field-area" onChange={(event) => setManagerReviewForm((current) => ({ ...current, manager_review_summary: event.currentTarget.value }))} value={managerReviewForm.manager_review_summary} />
                  </Field>
                  <Field label="Strengths">
                    <textarea className="field-area" onChange={(event) => setManagerReviewForm((current) => ({ ...current, manager_review_strengths: event.currentTarget.value }))} value={managerReviewForm.manager_review_strengths} />
                  </Field>
                  <Field label="Improvements">
                    <textarea className="field-area" onChange={(event) => setManagerReviewForm((current) => ({ ...current, manager_review_improvements: event.currentTarget.value }))} value={managerReviewForm.manager_review_improvements} />
                  </Field>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Field label="Manager Rating">
                      <Input onChange={(event) => setManagerReviewForm((current) => ({ ...current, manager_rating: event.currentTarget.value }))} step="0.1" type="number" value={managerReviewForm.manager_rating} />
                    </Field>
                    <Field label="Overall Score">
                      <Input onChange={(event) => setManagerReviewForm((current) => ({ ...current, overall_score: event.currentTarget.value }))} step="0.1" type="number" value={managerReviewForm.overall_score} />
                    </Field>
                    <Field label="Overall Rating">
                      <Input onChange={(event) => setManagerReviewForm((current) => ({ ...current, overall_rating: event.currentTarget.value }))} value={managerReviewForm.overall_rating} />
                    </Field>
                  </div>
                  <Field label="Calibration Notes">
                    <textarea className="field-area" onChange={(event) => setManagerReviewForm((current) => ({ ...current, calibration_notes: event.currentTarget.value }))} value={managerReviewForm.calibration_notes} />
                  </Field>
                  {submitManagerReviewMutation.isError ? <p className="text-sm text-red-700">{getErrorMessage(submitManagerReviewMutation.error)}</p> : null}
                  <Button disabled={submitManagerReviewMutation.isPending || managerReviewForm.manager_review_summary.trim().length < 10} type="submit">
                    <Trophy className="h-4 w-4" />
                    {submitManagerReviewMutation.isPending ? 'Submitting manager review...' : 'Submit Manager Review'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : null}

          {(canReview || canManage) && selectedReview ? (
            <>
              <Card>
                <CardHeader>
                  <span className="section-kicker">360 Feedback</span>
                  <CardTitle className="pt-3 text-2xl">Catat feedback baru</CardTitle>
                  <CardDescription>
                    Tambahkan peer, manager, direct report, self, atau stakeholder feedback ke review yang dipilih.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" onSubmit={handleCreateFeedback}>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Feedback Type">
                        <select className="field-select" onChange={(event) => setFeedbackForm((current) => ({ ...current, feedback_type: event.currentTarget.value }))} value={feedbackForm.feedback_type}>
                          {lookupsQuery.data?.feedback_types.map((item) => (
                            <option key={item.value} value={item.value}>{item.label}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Relationship">
                        <Input onChange={(event) => setFeedbackForm((current) => ({ ...current, relationship: event.currentTarget.value }))} value={feedbackForm.relationship} />
                      </Field>
                      <Field label="Rating">
                        <Input onChange={(event) => setFeedbackForm((current) => ({ ...current, rating: event.currentTarget.value }))} step="0.1" type="number" value={feedbackForm.rating} />
                      </Field>
                    </div>
                    <Field label="Strengths">
                      <textarea className="field-area" onChange={(event) => setFeedbackForm((current) => ({ ...current, strengths: event.currentTarget.value }))} value={feedbackForm.strengths} />
                    </Field>
                    <Field label="Improvements">
                      <textarea className="field-area" onChange={(event) => setFeedbackForm((current) => ({ ...current, improvements: event.currentTarget.value }))} value={feedbackForm.improvements} />
                    </Field>
                    <Field label="Comments">
                      <textarea className="field-area" onChange={(event) => setFeedbackForm((current) => ({ ...current, comments: event.currentTarget.value }))} value={feedbackForm.comments} />
                    </Field>
                    <label className="flex items-center gap-3 rounded-[20px] border border-app-border bg-white/72 px-4 py-3 text-sm font-medium">
                      <input checked={feedbackForm.is_anonymous} className="h-4 w-4" onChange={(event) => setFeedbackForm((current) => ({ ...current, is_anonymous: event.currentTarget.checked }))} type="checkbox" />
                      Simpan feedback sebagai anonymous reviewer.
                    </label>
                    {createFeedbackMutation.isError ? <p className="text-sm text-red-700">{getErrorMessage(createFeedbackMutation.error)}</p> : null}
                    <Button disabled={createFeedbackMutation.isPending} type="submit">
                      <MessageSquare className="h-4 w-4" />
                      {createFeedbackMutation.isPending ? 'Recording feedback...' : 'Record Feedback'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <span className="section-kicker">Feedback Trail</span>
                  <CardTitle className="pt-3 text-2xl">360 feedback untuk review ini</CardTitle>
                  <CardDescription>
                    Semua feedback yang terkait dengan review terpilih akan muncul di sini beserta tipe dan rating-nya.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedReview.feedbacks.map((feedback) => (
                    <article className="data-row px-5 py-4" key={feedback.id}>
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold">
                              {feedback.reviewer?.employee?.full_name ?? feedback.reviewer?.user?.name ?? 'Anonymous reviewer'}
                            </p>
                            <Badge variant={badgeVariantMap[feedback.feedback_type as keyof typeof badgeVariantMap] ?? 'neutral'}>
                              {humanize(feedback.feedback_type)}
                            </Badge>
                            {feedback.rating !== null ? <Badge variant="neutral">{formatScore(feedback.rating)}</Badge> : null}
                          </div>
                          <p className="mt-2 text-sm text-app-muted-foreground">
                            {feedback.relationship ?? 'No relationship note'}
                          </p>
                          <p className="mt-3 text-sm leading-7 text-app-muted-foreground">
                            {feedback.comments ?? feedback.strengths ?? feedback.improvements ?? 'No feedback note.'}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-black/4 px-4 py-3 text-sm text-app-muted-foreground">
                          {formatDateTime(feedback.submitted_at)}
                        </div>
                      </div>
                    </article>
                  ))}

                  {selectedReview.feedbacks.length === 0 ? (
                    <EmptyState text="Belum ada 360 feedback yang tercatat untuk review ini." />
                  ) : null}
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
  icon: typeof Target
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

function normalizeGoalFilters(filters: { cycle_id: string; employee_id: string; goal_type: string; status: string }): PerformanceGoalFilters {
  return {
    cycle_id: filters.cycle_id ? Number(filters.cycle_id) : undefined,
    employee_id: filters.employee_id ? Number(filters.employee_id) : undefined,
    goal_type: filters.goal_type || undefined,
    status: filters.status || undefined,
  }
}

function normalizeReviewFilters(filters: { cycle_id: string; employee_id: string; status: string }): PerformanceReviewFilters {
  return {
    cycle_id: filters.cycle_id ? Number(filters.cycle_id) : undefined,
    employee_id: filters.employee_id ? Number(filters.employee_id) : undefined,
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
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`
}

function formatScore(value: number) {
  return value.toFixed(2)
}

function formatDate(value?: string | null) {
  if (!value) {
    return 'N/A'
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
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

function formatGoalValue(goal: {
  current_value: number | null
  target_value: number | null
  unit: string | null
}) {
  const current = goal.current_value !== null ? goal.current_value : 0
  const target = goal.target_value !== null ? goal.target_value : null
  const unit = goal.unit ? ` ${goal.unit}` : ''

  if (target !== null) {
    return `${current}${unit} / ${target}${unit}`
  }

  return `${current}${unit}`
}

function todayString() {
  return '2026-07-19'
}

function addDaysString(days: number) {
  const date = new Date(`${todayString()}T00:00:00`)
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

function quarterStartString() {
  return '2026-07-01'
}

function quarterEndString() {
  return '2026-09-30'
}
