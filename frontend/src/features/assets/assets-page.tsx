import { useEffect, useState, type ComponentProps, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as QRCode from 'qrcode'
import {
  Boxes,
  KeyRound,
  Laptop,
  Monitor,
  Phone,
  Printer,
  QrCode,
  UserRound,
  Wrench,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/features/auth/auth-context'
import {
  assignAsset,
  createAsset,
  createAssetMaintenance,
  getAsset,
  getAssets,
  getAssetsLookups,
  getAssetsOverview,
  returnAssetAssignment,
  type ItAssetFilters,
} from '@/features/assets/assets-api'
import { getErrorMessage } from '@/lib/http'
import type {
  ItAsset,
  ItAssetAssignment,
  ItAssetLookups,
  ItAssetMaintenance,
} from '@/types/api'

type BadgeVariant = 'neutral' | 'success' | 'warning' | 'danger'

interface AssetFiltersState {
  category: string
  status: string
  employee_id: string
}

interface AssetFormState {
  category: string
  name: string
  brand: string
  model: string
  serial_number: string
  phone_number: string
  license_key: string
  license_expires_at: string
  vendor_name: string
  purchase_date: string
  purchase_cost: string
  currency: string
  branch_id: string
  status: string
  warranty_expires_at: string
  maintenance_due_at: string
  notes: string
}

interface AssignFormState {
  employee_id: string
  assigned_at: string
  expected_return_at: string
  assignment_condition: string
  assignment_notes: string
}

interface ReturnFormState {
  returned_at: string
  return_condition: string
  return_notes: string
}

interface MaintenanceFormState {
  maintenance_type: string
  vendor_name: string
  scheduled_at: string
  status: string
  warranty_claim: boolean
  cost_amount: string
  currency: string
  notes: string
  resolution: string
  next_maintenance_due_at: string
}

const categoryIconMap = {
  laptop: Laptop,
  monitor: Monitor,
  printer: Printer,
  phone: Phone,
  software_license: KeyRound,
} as const

const badgeVariantMap: Record<string, BadgeVariant> = {
  available: 'success',
  assigned: 'warning',
  maintenance: 'danger',
  retired: 'neutral',
  active: 'success',
  expiring: 'warning',
  expired: 'danger',
  none: 'neutral',
  scheduled: 'warning',
  in_progress: 'warning',
  completed: 'success',
  cancelled: 'neutral',
  returned: 'neutral',
  excellent: 'success',
  good: 'success',
  fair: 'warning',
  damaged: 'danger',
}

export function AssetsPage() {
  const { session } = useAuth()
  const queryClient = useQueryClient()
  const canView = session?.user.permissions.includes('assets.view') ?? false
  const canManage = session?.user.permissions.includes('assets.manage') ?? false
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null)
  const [filters, setFilters] = useState<AssetFiltersState>({
    category: '',
    status: '',
    employee_id: '',
  })
  const [assetForm, setAssetForm] = useState<AssetFormState>(() => createAssetForm())
  const [assignForm, setAssignForm] = useState<AssignFormState>(() => createAssignForm())
  const [returnForm, setReturnForm] = useState<ReturnFormState>(() => createReturnForm())
  const [maintenanceForm, setMaintenanceForm] = useState<MaintenanceFormState>(() => createMaintenanceForm())

  const overviewQuery = useQuery({
    queryKey: ['assets', 'overview'],
    queryFn: getAssetsOverview,
    enabled: canView,
  })

  const lookupsQuery = useQuery({
    queryKey: ['assets', 'lookups'],
    queryFn: getAssetsLookups,
    enabled: canView,
  })

  const assetsQuery = useQuery({
    queryKey: ['assets', 'list', filters],
    queryFn: () => getAssets(normalizeAssetFilters(filters)),
    enabled: canView,
  })

  const selectedAssetQuery = useQuery({
    queryKey: ['assets', 'detail', selectedAssetId],
    queryFn: () => getAsset(selectedAssetId as number),
    enabled: canView && selectedAssetId !== null,
  })

  useEffect(() => {
    const lookups = lookupsQuery.data

    if (!lookups) {
      return
    }

    setAssetForm((current) => ({
      ...current,
      branch_id: current.branch_id || (lookups.branches[0] ? String(lookups.branches[0].id) : ''),
      purchase_date: current.purchase_date || lookups.defaults.purchase_date,
    }))
    setAssignForm((current) => ({
      ...current,
      employee_id: current.employee_id || (lookups.employees[0] ? String(lookups.employees[0].id) : ''),
    }))
    setReturnForm((current) => ({
      ...current,
      return_condition: current.return_condition || lookups.defaults.assignment_condition,
    }))
    setMaintenanceForm((current) => ({
      ...current,
      scheduled_at: current.scheduled_at || lookups.defaults.current_date,
      next_maintenance_due_at: current.next_maintenance_due_at || addDays(lookups.defaults.current_date, 30),
    }))
  }, [lookupsQuery.data])

  useEffect(() => {
    const assets = assetsQuery.data ?? []

    if (assets.length === 0) {
      setSelectedAssetId(null)
      return
    }

    if (selectedAssetId === null || !assets.some((asset) => asset.id === selectedAssetId)) {
      setSelectedAssetId(assets[0]?.id ?? null)
    }
  }, [assetsQuery.data, selectedAssetId])

  const selectedAsset = selectedAssetQuery.data ?? (assetsQuery.data ?? []).find((asset) => asset.id === selectedAssetId) ?? null
  const currentAssignment = selectedAsset?.current_assignment ?? null
  const currentBranchName = 'Shared pool'

  const invalidateAssets = () => {
    void queryClient.invalidateQueries({ queryKey: ['assets'] })
    void queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
  }

  const createAssetMutation = useMutation({
    mutationFn: createAsset,
    onSuccess: (asset) => {
      setSelectedAssetId(asset.id)
      setAssetForm(createAssetForm(lookupsQuery.data))
      invalidateAssets()
    },
  })

  const assignAssetMutation = useMutation({
    mutationFn: ({ assetId, payload }: { assetId: number; payload: Parameters<typeof assignAsset>[1] }) =>
      assignAsset(assetId, payload),
    onSuccess: () => {
      setAssignForm(createAssignForm(lookupsQuery.data))
      invalidateAssets()
    },
  })

  const returnAssetMutation = useMutation({
    mutationFn: ({ assignmentId, payload }: { assignmentId: number; payload: Parameters<typeof returnAssetAssignment>[1] }) =>
      returnAssetAssignment(assignmentId, payload),
    onSuccess: () => {
      setReturnForm(createReturnForm(lookupsQuery.data))
      invalidateAssets()
    },
  })

  const createMaintenanceMutation = useMutation({
    mutationFn: ({ assetId, payload }: { assetId: number; payload: Parameters<typeof createAssetMaintenance>[1] }) =>
      createAssetMaintenance(assetId, payload),
    onSuccess: () => {
      setMaintenanceForm(createMaintenanceForm(lookupsQuery.data))
      invalidateAssets()
    },
  })

  if (!canView) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>IT asset workspace tidak tersedia</CardTitle>
          <CardDescription>
            Akun ini belum memiliki permission `assets.view`, jadi inventaris, QR identity, assignment, dan
            maintenance belum bisa dibuka dari dashboard.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const overview = overviewQuery.data
  const lookups = lookupsQuery.data
  const assets = assetsQuery.data ?? []
  const createError = createAssetMutation.error ? getErrorMessage(createAssetMutation.error) : null
  const assignError = assignAssetMutation.error ? getErrorMessage(assignAssetMutation.error) : null
  const returnError = returnAssetMutation.error ? getErrorMessage(returnAssetMutation.error) : null
  const maintenanceError = createMaintenanceMutation.error ? getErrorMessage(createMaintenanceMutation.error) : null

  const handleCreateAsset = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    createAssetMutation.mutate({
      category: assetForm.category,
      name: assetForm.name,
      brand: assetForm.brand || undefined,
      model: assetForm.model || undefined,
      serial_number: assetForm.serial_number || undefined,
      phone_number: assetForm.phone_number || undefined,
      license_key: assetForm.license_key || undefined,
      license_expires_at: assetForm.license_expires_at || undefined,
      vendor_name: assetForm.vendor_name || undefined,
      purchase_date: assetForm.purchase_date || undefined,
      purchase_cost: toNullableNumber(assetForm.purchase_cost),
      currency: assetForm.currency || undefined,
      branch_id: toNullableInteger(assetForm.branch_id),
      status: assetForm.status || undefined,
      warranty_expires_at: assetForm.warranty_expires_at || undefined,
      maintenance_due_at: assetForm.maintenance_due_at || undefined,
      notes: assetForm.notes || undefined,
    })
  }

  const handleAssignAsset = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedAsset) {
      return
    }

    assignAssetMutation.mutate({
      assetId: selectedAsset.id,
      payload: {
        employee_id: Number(assignForm.employee_id),
        assigned_at: assignForm.assigned_at || undefined,
        expected_return_at: assignForm.expected_return_at || undefined,
        assignment_condition: assignForm.assignment_condition || undefined,
        assignment_notes: assignForm.assignment_notes || undefined,
      },
    })
  }

  const handleReturnAsset = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!currentAssignment) {
      return
    }

    returnAssetMutation.mutate({
      assignmentId: currentAssignment.id,
      payload: {
        returned_at: returnForm.returned_at || undefined,
        return_condition: returnForm.return_condition || undefined,
        return_notes: returnForm.return_notes || undefined,
      },
    })
  }

  const handleMaintenance = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedAsset) {
      return
    }

    createMaintenanceMutation.mutate({
      assetId: selectedAsset.id,
      payload: {
        maintenance_type: maintenanceForm.maintenance_type || undefined,
        vendor_name: maintenanceForm.vendor_name || undefined,
        scheduled_at: maintenanceForm.scheduled_at || undefined,
        status: maintenanceForm.status || undefined,
        warranty_claim: maintenanceForm.warranty_claim,
        cost_amount: toNullableNumber(maintenanceForm.cost_amount),
        currency: maintenanceForm.currency || undefined,
        notes: maintenanceForm.notes || undefined,
        resolution: maintenanceForm.resolution || undefined,
        next_maintenance_due_at: maintenanceForm.next_maintenance_due_at || undefined,
      },
    })
  }

  return (
    <div className="space-y-6">
      <Card className="hero-panel">
        <CardHeader className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="border-white/10 bg-white/8 text-white" variant="neutral">
              IT Asset Control
            </Badge>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
              <Boxes className="h-3.5 w-3.5 text-[color:var(--app-highlight)]" />
              QR-linked Inventory
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
            <div className="space-y-4">
              <div className="space-y-3">
                <CardTitle className="max-w-3xl text-4xl font-extrabold tracking-[-0.06em] text-white md:text-5xl">
                  Inventaris aset yang siap ditugaskan, ditarik kembali, dan diaudit.
                </CardTitle>
                <CardDescription className="max-w-2xl text-base leading-8 text-slate-200">
                  Satu workspace untuk laptop, monitor, printer, phone, software license, assignment-return,
                  maintenance, warranty watch, history, dan QR identity yang bisa dibawa ke lapangan.
                </CardDescription>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <HeroMetric
                  label="Active Pool"
                  value={overviewQuery.isLoading ? '...' : String(overview?.stats.available_assets ?? 0)}
                  note="Ready for assignment"
                />
                <HeroMetric
                  label="Assigned"
                  value={overviewQuery.isLoading ? '...' : String(overview?.stats.assigned_assets ?? 0)}
                  note={`${overview?.stats.software_licenses ?? 0} software seats tracked`}
                />
                <HeroMetric
                  label="Coverage Watch"
                  value={overviewQuery.isLoading ? '...' : String(overview?.stats.expiring_coverage ?? 0)}
                  note="Warranty or license due soon"
                />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-[28px] border border-white/10 bg-black/12 px-5 py-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-300">
                  Warranty Watch
                </p>
                <div className="mt-4 space-y-3">
                  {(overview?.warranty_watch ?? []).slice(0, 4).map((asset) => (
                    <article className="rounded-[22px] border border-white/10 bg-white/8 px-4 py-4" key={asset.id}>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white">{asset.name}</p>
                          <p className="text-xs text-slate-300">{asset.asset_code}</p>
                        </div>
                        <Badge className="border-white/10 bg-white/10 text-white" variant="neutral">
                          {categoryLabel(asset.category, lookups)}
                        </Badge>
                      </div>
                      <p className="mt-3 text-sm text-slate-300">
                        Warranty {formatDate(asset.warranty_expires_at)} • License {formatDate(asset.license_expires_at)}
                      </p>
                    </article>
                  ))}

                  {!overviewQuery.isLoading && (overview?.warranty_watch.length ?? 0) === 0 ? (
                    <p className="text-sm text-slate-300">Belum ada aset yang masuk jendela expiry terdekat.</p>
                  ) : null}
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-black/12 px-5 py-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-300">
                  Maintenance Queue
                </p>
                <div className="mt-4 space-y-3">
                  {(overview?.maintenance_queue ?? []).slice(0, 4).map((maintenance) => (
                    <article className="rounded-[22px] border border-white/10 bg-white/8 px-4 py-4" key={maintenance.id}>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white">{maintenance.asset?.name ?? 'Asset'}</p>
                          <p className="text-xs text-slate-300">
                            {maintenance.asset?.asset_code ?? 'No code'} • {labelize(maintenance.maintenance_type)}
                          </p>
                        </div>
                        <Badge className="border-white/10 bg-white/10 text-white" variant="neutral">
                          {labelize(maintenance.status)}
                        </Badge>
                      </div>
                      <p className="mt-3 text-sm text-slate-300">
                        Scheduled {formatDate(maintenance.scheduled_at)} • Vendor {maintenance.vendor_name ?? 'Internal'}
                      </p>
                    </article>
                  ))}

                  {!overviewQuery.isLoading && (overview?.maintenance_queue.length ?? 0) === 0 ? (
                    <p className="text-sm text-slate-300">Tidak ada maintenance aktif yang sedang menunggu tindakan.</p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[24px] border border-white/10 bg-white/8 px-5 py-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-300">Category Mix</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(overview?.category_distribution ?? []).map((item) => (
                <Badge className="border-white/10 bg-white/10 text-white" key={item.category} variant="neutral">
                  {categoryLabel(item.category, lookups)} • {item.count}
                </Badge>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/8 px-5 py-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-300">Status Mix</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(overview?.status_distribution ?? []).map((item) => (
                <Badge className="border-white/10 bg-white/10 text-white" key={item.status} variant="neutral">
                  {labelize(item.status)} • {item.count}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[0.94fr_1.06fr]">
        <div className="space-y-6">
          {canManage ? (
            <Card>
              <CardHeader>
                <div className="section-kicker w-fit">Create Asset</div>
                <CardTitle className="pt-3 text-2xl">Tambahkan aset baru ke registry</CardTitle>
                <CardDescription>
                  Input inventaris inti dulu, lalu assignment, return, dan maintenance akan menempel ke record yang sama.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreateAsset}>
                  <div>
                    <Label htmlFor="asset-category">Category</Label>
                    <select
                      className="field-select mt-2"
                      id="asset-category"
                      onChange={(event) => setAssetForm((current) => ({ ...current, category: event.currentTarget.value }))}
                      value={assetForm.category}
                    >
                      {(lookups?.categories ?? []).map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="asset-status">Status</Label>
                    <select
                      className="field-select mt-2"
                      id="asset-status"
                      onChange={(event) => setAssetForm((current) => ({ ...current, status: event.currentTarget.value }))}
                      value={assetForm.status}
                    >
                      {(lookups?.asset_statuses ?? []).map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <FieldInput
                    label="Asset name"
                    onChange={(value) => setAssetForm((current) => ({ ...current, name: value }))}
                    placeholder="ThinkPad X1 Carbon"
                    required
                    value={assetForm.name}
                  />

                  <div>
                    <Label htmlFor="asset-branch">Branch</Label>
                    <select
                      className="field-select mt-2"
                      id="asset-branch"
                      onChange={(event) => setAssetForm((current) => ({ ...current, branch_id: event.currentTarget.value }))}
                      value={assetForm.branch_id}
                    >
                      {(lookups?.branches ?? []).map((branch) => (
                        <option key={branch.id} value={branch.id}>{branch.name}</option>
                      ))}
                    </select>
                  </div>

                  <FieldInput label="Brand" onChange={(value) => setAssetForm((current) => ({ ...current, brand: value }))} value={assetForm.brand} />
                  <FieldInput label="Model" onChange={(value) => setAssetForm((current) => ({ ...current, model: value }))} value={assetForm.model} />
                  <FieldInput label="Serial number" onChange={(value) => setAssetForm((current) => ({ ...current, serial_number: value }))} value={assetForm.serial_number} />
                  <FieldInput label="Vendor" onChange={(value) => setAssetForm((current) => ({ ...current, vendor_name: value }))} value={assetForm.vendor_name} />

                  {assetForm.category === 'phone' ? (
                    <FieldInput
                      label="Phone number"
                      onChange={(value) => setAssetForm((current) => ({ ...current, phone_number: value }))}
                      value={assetForm.phone_number}
                    />
                  ) : null}

                  {assetForm.category === 'software_license' ? (
                    <>
                      <FieldInput
                        label="License key"
                        onChange={(value) => setAssetForm((current) => ({ ...current, license_key: value }))}
                        value={assetForm.license_key}
                      />
                      <FieldInput
                        label="License expires at"
                        onChange={(value) => setAssetForm((current) => ({ ...current, license_expires_at: value }))}
                        type="date"
                        value={assetForm.license_expires_at}
                      />
                    </>
                  ) : null}

                  <FieldInput
                    label="Purchase date"
                    onChange={(value) => setAssetForm((current) => ({ ...current, purchase_date: value }))}
                    type="date"
                    value={assetForm.purchase_date}
                  />
                  <FieldInput
                    label="Purchase cost"
                    min="0"
                    onChange={(value) => setAssetForm((current) => ({ ...current, purchase_cost: value }))}
                    step="0.01"
                    type="number"
                    value={assetForm.purchase_cost}
                  />
                  <FieldInput label="Currency" onChange={(value) => setAssetForm((current) => ({ ...current, currency: value }))} value={assetForm.currency} />
                  <FieldInput
                    label="Warranty expires at"
                    onChange={(value) => setAssetForm((current) => ({ ...current, warranty_expires_at: value }))}
                    type="date"
                    value={assetForm.warranty_expires_at}
                  />
                  <FieldInput
                    label="Maintenance due at"
                    onChange={(value) => setAssetForm((current) => ({ ...current, maintenance_due_at: value }))}
                    type="date"
                    value={assetForm.maintenance_due_at}
                  />

                  <div className="md:col-span-2">
                    <Label htmlFor="asset-notes">Notes</Label>
                    <textarea
                      className="field-area mt-2"
                      id="asset-notes"
                      onChange={(event) => setAssetForm((current) => ({ ...current, notes: event.currentTarget.value }))}
                      value={assetForm.notes}
                    />
                  </div>

                  {createError ? (
                    <p className="md:col-span-2 text-sm text-app-danger">{createError}</p>
                  ) : null}

                  <div className="md:col-span-2 flex items-center justify-between gap-3">
                    <p className="text-sm text-app-muted-foreground">
                      Asset code dan QR value akan dibuat otomatis saat data disimpan.
                    </p>
                    <Button disabled={createAssetMutation.isPending} type="submit">
                      {createAssetMutation.isPending ? 'Saving asset...' : 'Create Asset'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <div className="section-kicker w-fit">Inventory Board</div>
              <CardTitle className="pt-3 text-2xl">Pilih aset yang ingin ditindaklanjuti</CardTitle>
              <CardDescription>
                Filter cepat untuk kategori, status, dan assignee aktif sebelum membuka detail timeline asset.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <Label htmlFor="filter-category">Category</Label>
                  <select
                    className="field-select mt-2"
                    id="filter-category"
                    onChange={(event) => setFilters((current) => ({ ...current, category: event.currentTarget.value }))}
                    value={filters.category}
                  >
                    <option value="">All categories</option>
                    {(lookups?.categories ?? []).map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="filter-status">Status</Label>
                  <select
                    className="field-select mt-2"
                    id="filter-status"
                    onChange={(event) => setFilters((current) => ({ ...current, status: event.currentTarget.value }))}
                    value={filters.status}
                  >
                    <option value="">All statuses</option>
                    {(lookups?.asset_statuses ?? []).map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="filter-employee">Assignee</Label>
                  <select
                    className="field-select mt-2"
                    id="filter-employee"
                    onChange={(event) => setFilters((current) => ({ ...current, employee_id: event.currentTarget.value }))}
                    value={filters.employee_id}
                  >
                    <option value="">All assignees</option>
                    {(lookups?.employees ?? []).map((employee) => (
                      <option key={employee.id} value={employee.id}>{employee.full_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {assetsQuery.isLoading ? (
                <p className="text-sm text-app-muted-foreground">Loading asset inventory...</p>
              ) : null}

              <div className="space-y-3">
                {assets.map((asset) => {
                  const Icon = categoryIconMap[asset.category as keyof typeof categoryIconMap] ?? Boxes

                  return (
                    <button
                      className={[
                        'data-row flex w-full flex-col gap-4 px-5 py-5 text-left transition',
                        asset.id === selectedAssetId ? 'border-[rgba(185,123,49,0.44)] shadow-[0_30px_70px_-46px_rgba(16,24,40,0.48)]' : '',
                      ].join(' ')}
                      key={asset.id}
                      onClick={() => setSelectedAssetId(asset.id)}
                      type="button"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-3">
                          <div className="rounded-2xl bg-black/5 p-3 text-[color:var(--app-highlight)]">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold">{asset.name}</p>
                            <p className="text-sm text-app-muted-foreground">
                              {asset.asset_code}
                              {' • '}
                              {asset.branch?.name ?? 'No branch'}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={variantForValue(asset.category === 'software_license' ? 'warning' : asset.status)}>
                            {categoryLabel(asset.category, lookups)}
                          </Badge>
                          <Badge variant={variantForValue(asset.status)}>
                            {labelize(asset.status)}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid gap-3 text-sm text-app-muted-foreground md:grid-cols-3">
                        <div>
                          <p className="font-medium text-app-foreground">Assigned to</p>
                          <p>{asset.current_assignment?.employee?.full_name ?? 'Available pool'}</p>
                        </div>
                        <div>
                          <p className="font-medium text-app-foreground">Coverage</p>
                          <p>Warranty {formatDate(asset.warranty_expires_at)} / License {formatDate(asset.license_expires_at)}</p>
                        </div>
                        <div>
                          <p className="font-medium text-app-foreground">Next maintenance</p>
                          <p>{formatDate(asset.maintenance_due_at)}</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              {!assetsQuery.isLoading && assets.length === 0 ? (
                <EmptyState
                  body="Belum ada aset yang cocok dengan filter aktif. Ubah filter atau buat aset pertama dari panel di atas."
                  title="No assets found"
                />
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="section-kicker w-fit">Asset Detail</div>
              <CardTitle className="pt-3 text-2xl">Detail lifecycle asset terpilih</CardTitle>
              <CardDescription>
                QR identity, owner aktif, status coverage, history, dan maintenance trail disajikan dari satu source of truth.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedAssetQuery.isLoading && selectedAssetId !== null ? (
                <p className="text-sm text-app-muted-foreground">Loading asset detail...</p>
              ) : null}

              {!selectedAsset ? (
                <EmptyState
                  body="Pilih salah satu item dari inventory board untuk membuka QR card, assignment status, dan timeline history."
                  title="No asset selected"
                />
              ) : (
                <div className="space-y-5">
                  <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
                    <div className="rounded-[28px] border border-app-border bg-white/72 px-5 py-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-app-muted-foreground">
                            {selectedAsset.asset_code}
                          </p>
                          <h3 className="mt-2 text-2xl font-bold tracking-[-0.04em]">{selectedAsset.name}</h3>
                          <p className="mt-2 text-sm leading-7 text-app-muted-foreground">
                            {selectedAsset.notes ?? 'Tidak ada catatan tambahan untuk aset ini.'}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={variantForValue(selectedAsset.status)}>{labelize(selectedAsset.status)}</Badge>
                          <Badge variant={variantForValue(selectedAsset.warranty_status)}>
                            Warranty {labelize(selectedAsset.warranty_status)}
                          </Badge>
                          <Badge variant={variantForValue(selectedAsset.license_status)}>
                            License {labelize(selectedAsset.license_status)}
                          </Badge>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        <InfoTile label="Brand" value={selectedAsset.brand} />
                        <InfoTile label="Model" value={selectedAsset.model} />
                        <InfoTile label="Serial number" value={selectedAsset.serial_number} />
                        <InfoTile label="Phone number" value={selectedAsset.phone_number} />
                        <InfoTile label="License key" value={selectedAsset.license_key} />
                        <InfoTile label="Vendor" value={selectedAsset.vendor_name} />
                        <InfoTile label="Purchase date" value={formatDate(selectedAsset.purchase_date)} />
                        <InfoTile label="Purchase cost" value={formatCurrency(selectedAsset.purchase_cost, selectedAsset.currency)} />
                        <InfoTile label="Branch" value={selectedAsset.branch?.name ?? null} />
                        <InfoTile label="Warranty expires" value={formatDate(selectedAsset.warranty_expires_at)} />
                        <InfoTile label="License expires" value={formatDate(selectedAsset.license_expires_at)} />
                        <InfoTile label="Maintenance due" value={formatDate(selectedAsset.maintenance_due_at)} />
                      </div>
                    </div>

                    <QrPreviewCard asset={selectedAsset} />
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-[26px] border border-app-border bg-white/72 px-5 py-5">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-black/5 p-3 text-[color:var(--app-highlight)]">
                          <UserRound className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-app-muted-foreground">
                            Current Assignment
                          </p>
                          <p className="mt-1 font-semibold">
                            {currentAssignment?.employee?.full_name ?? 'Not assigned'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2 text-sm text-app-muted-foreground">
                        <p>Department: {currentAssignment?.employee?.department ?? 'No department'}</p>
                        <p>Assigned at: {formatDateTime(currentAssignment?.assigned_at)}</p>
                        <p>Expected return: {formatDate(currentAssignment?.expected_return_at)}</p>
                        <p>Condition: {currentAssignment?.assignment_condition ? labelize(currentAssignment.assignment_condition) : '-'}</p>
                      </div>
                    </div>

                    <div className="rounded-[26px] border border-app-border bg-white/72 px-5 py-5">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-black/5 p-3 text-[color:var(--app-highlight)]">
                          <Wrench className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-app-muted-foreground">
                            Latest Maintenance
                          </p>
                          <p className="mt-1 font-semibold">
                            {selectedAsset.latest_maintenance ? labelize(selectedAsset.latest_maintenance.maintenance_type) : 'No maintenance recorded'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2 text-sm text-app-muted-foreground">
                        <p>Status: {selectedAsset.latest_maintenance ? labelize(selectedAsset.latest_maintenance.status) : '-'}</p>
                        <p>Scheduled at: {formatDate(selectedAsset.latest_maintenance?.scheduled_at)}</p>
                        <p>Vendor: {selectedAsset.latest_maintenance?.vendor_name ?? 'Internal'}</p>
                        <p>Resolution: {selectedAsset.latest_maintenance?.resolution ?? '-'}</p>
                      </div>
                    </div>
                  </div>

                  <details className="data-row px-5 py-5" open>
                    <summary className="cursor-pointer text-lg font-semibold">Unified history</summary>
                    <div className="mt-4 space-y-3">
                      {selectedAsset.history?.length ? selectedAsset.history.map((item, index) => (
                        <article className="rounded-[22px] border border-app-border bg-app-background/48 px-4 py-4" key={`${item.type}-${item.occurred_at ?? index}`}>
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold">{item.title}</p>
                              <p className="mt-1 text-sm text-app-muted-foreground">{item.description ?? 'No detail recorded.'}</p>
                            </div>
                            <div className="text-right">
                              <Badge variant={variantForValue(item.status)}>{labelize(item.status ?? item.type)}</Badge>
                              <p className="mt-2 text-xs text-app-muted-foreground">{formatDateTime(item.occurred_at)}</p>
                            </div>
                          </div>
                        </article>
                      )) : (
                        <p className="text-sm text-app-muted-foreground">Belum ada history yang tercatat untuk aset ini.</p>
                      )}
                    </div>
                  </details>

                  <details className="data-row px-5 py-5">
                    <summary className="cursor-pointer text-lg font-semibold">Assignment history</summary>
                    <div className="mt-4 space-y-3">
                      {selectedAsset.assignment_history.length ? selectedAsset.assignment_history.map((assignment) => (
                        <AssignmentHistoryCard assignment={assignment} key={assignment.id} />
                      )) : (
                        <p className="text-sm text-app-muted-foreground">Belum ada assignment yang tercatat.</p>
                      )}
                    </div>
                  </details>

                  <details className="data-row px-5 py-5">
                    <summary className="cursor-pointer text-lg font-semibold">Maintenance history</summary>
                    <div className="mt-4 space-y-3">
                      {selectedAsset.maintenance_history.length ? selectedAsset.maintenance_history.map((maintenance) => (
                        <MaintenanceHistoryCard key={maintenance.id} maintenance={maintenance} />
                      )) : (
                        <p className="text-sm text-app-muted-foreground">Belum ada maintenance yang tercatat.</p>
                      )}
                    </div>
                  </details>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="section-kicker w-fit">Lifecycle Action</div>
              <CardTitle className="pt-3 text-2xl">Assignment dan return dari satu panel</CardTitle>
              <CardDescription>
                Data assignment aktif otomatis dipakai untuk return, sehingga status asset dan audit log tetap sinkron.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedAsset ? (
                <EmptyState
                  body="Pilih aset dulu untuk melakukan assignment atau return dari panel lifecycle."
                  title="Nothing to action"
                />
              ) : !canManage ? (
                <EmptyState
                  body="Akun ini hanya memiliki akses baca. Gunakan role dengan permission `assets.manage` untuk melakukan assignment atau return."
                  title="Read-only mode"
                />
              ) : currentAssignment ? (
                <form className="grid gap-4 md:grid-cols-2" onSubmit={handleReturnAsset}>
                  <div className="md:col-span-2 rounded-[24px] border border-app-border bg-app-background/55 px-5 py-4">
                    <p className="font-semibold">
                      {selectedAsset.name} sedang aktif dipegang oleh {currentAssignment.employee?.full_name ?? 'employee'}.
                    </p>
                    <p className="mt-2 text-sm text-app-muted-foreground">
                      Assigned {formatDateTime(currentAssignment.assigned_at)} • Condition {labelize(currentAssignment.assignment_condition ?? 'good')}
                    </p>
                  </div>

                  <FieldInput
                    label="Returned at"
                    onChange={(value) => setReturnForm((current) => ({ ...current, returned_at: value }))}
                    type="datetime-local"
                    value={returnForm.returned_at}
                  />

                  <div>
                    <Label htmlFor="return-condition">Return condition</Label>
                    <select
                      className="field-select mt-2"
                      id="return-condition"
                      onChange={(event) => setReturnForm((current) => ({ ...current, return_condition: event.currentTarget.value }))}
                      value={returnForm.return_condition}
                    >
                      {(lookups?.assignment_conditions ?? []).map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="return-notes">Return notes</Label>
                    <textarea
                      className="field-area mt-2"
                      id="return-notes"
                      onChange={(event) => setReturnForm((current) => ({ ...current, return_notes: event.currentTarget.value }))}
                      value={returnForm.return_notes}
                    />
                  </div>

                  {returnError ? (
                    <p className="md:col-span-2 text-sm text-app-danger">{returnError}</p>
                  ) : null}

                  <div className="md:col-span-2 flex justify-end">
                    <Button disabled={returnAssetMutation.isPending} type="submit">
                      {returnAssetMutation.isPending ? 'Returning asset...' : 'Return Asset'}
                    </Button>
                  </div>
                </form>
              ) : selectedAsset.status === 'maintenance' ? (
                <EmptyState
                  body="Asset sedang berada pada status maintenance. Selesaikan atau batalkan maintenance dulu sebelum melakukan assignment baru."
                  title="Assignment temporarily blocked"
                />
              ) : selectedAsset.status === 'retired' ? (
                <EmptyState
                  body="Asset berstatus retired, jadi tidak lagi tersedia untuk assignment baru."
                  title="Retired asset"
                />
              ) : (
                <form className="grid gap-4 md:grid-cols-2" onSubmit={handleAssignAsset}>
                  <div className="md:col-span-2 rounded-[24px] border border-app-border bg-app-background/55 px-5 py-4">
                    <p className="font-semibold">{selectedAsset.name} siap dipindahkan ke assignee berikutnya.</p>
                    <p className="mt-2 text-sm text-app-muted-foreground">
                      {selectedAsset.asset_code} • {selectedAsset.branch?.name ?? currentBranchName} • {categoryLabel(selectedAsset.category, lookups)}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="assign-employee">Employee</Label>
                    <select
                      className="field-select mt-2"
                      id="assign-employee"
                      onChange={(event) => setAssignForm((current) => ({ ...current, employee_id: event.currentTarget.value }))}
                      value={assignForm.employee_id}
                    >
                      {(lookups?.employees ?? []).map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.full_name} • {employee.department ?? 'No department'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <FieldInput
                    label="Assigned at"
                    onChange={(value) => setAssignForm((current) => ({ ...current, assigned_at: value }))}
                    type="datetime-local"
                    value={assignForm.assigned_at}
                  />

                  <FieldInput
                    label="Expected return at"
                    onChange={(value) => setAssignForm((current) => ({ ...current, expected_return_at: value }))}
                    type="date"
                    value={assignForm.expected_return_at}
                  />

                  <div>
                    <Label htmlFor="assignment-condition">Assignment condition</Label>
                    <select
                      className="field-select mt-2"
                      id="assignment-condition"
                      onChange={(event) => setAssignForm((current) => ({ ...current, assignment_condition: event.currentTarget.value }))}
                      value={assignForm.assignment_condition}
                    >
                      {(lookups?.assignment_conditions ?? []).map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="assignment-notes">Assignment notes</Label>
                    <textarea
                      className="field-area mt-2"
                      id="assignment-notes"
                      onChange={(event) => setAssignForm((current) => ({ ...current, assignment_notes: event.currentTarget.value }))}
                      value={assignForm.assignment_notes}
                    />
                  </div>

                  {assignError ? (
                    <p className="md:col-span-2 text-sm text-app-danger">{assignError}</p>
                  ) : null}

                  <div className="md:col-span-2 flex justify-end">
                    <Button disabled={assignAssetMutation.isPending} type="submit">
                      {assignAssetMutation.isPending ? 'Assigning asset...' : 'Assign Asset'}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="section-kicker w-fit">Maintenance</div>
              <CardTitle className="pt-3 text-2xl">Catat maintenance, warranty claim, dan biaya</CardTitle>
              <CardDescription>
                Maintenance baru akan otomatis mendorong status asset ke queue yang relevan dan memperbarui history panel.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedAsset ? (
                <EmptyState
                  body="Pilih aset dulu sebelum membuat log maintenance atau warranty claim."
                  title="No maintenance target"
                />
              ) : !canManage ? (
                <EmptyState
                  body="Akses Anda saat ini read-only. Gunakan akun dengan permission `assets.manage` untuk membuat log maintenance."
                  title="Read-only mode"
                />
              ) : (
                <form className="grid gap-4 md:grid-cols-2" onSubmit={handleMaintenance}>
                  <div>
                    <Label htmlFor="maintenance-type">Maintenance type</Label>
                    <select
                      className="field-select mt-2"
                      id="maintenance-type"
                      onChange={(event) => setMaintenanceForm((current) => ({ ...current, maintenance_type: event.currentTarget.value }))}
                      value={maintenanceForm.maintenance_type}
                    >
                      {(lookups?.maintenance_types ?? []).map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="maintenance-status">Status</Label>
                    <select
                      className="field-select mt-2"
                      id="maintenance-status"
                      onChange={(event) => setMaintenanceForm((current) => ({ ...current, status: event.currentTarget.value }))}
                      value={maintenanceForm.status}
                    >
                      {(lookups?.maintenance_statuses ?? []).map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <FieldInput
                    label="Vendor"
                    onChange={(value) => setMaintenanceForm((current) => ({ ...current, vendor_name: value }))}
                    value={maintenanceForm.vendor_name}
                  />
                  <FieldInput
                    label="Scheduled at"
                    onChange={(value) => setMaintenanceForm((current) => ({ ...current, scheduled_at: value }))}
                    type="date"
                    value={maintenanceForm.scheduled_at}
                  />
                  <FieldInput
                    label="Cost amount"
                    min="0"
                    onChange={(value) => setMaintenanceForm((current) => ({ ...current, cost_amount: value }))}
                    step="0.01"
                    type="number"
                    value={maintenanceForm.cost_amount}
                  />
                  <FieldInput
                    label="Currency"
                    onChange={(value) => setMaintenanceForm((current) => ({ ...current, currency: value }))}
                    value={maintenanceForm.currency}
                  />

                  <FieldInput
                    label="Next maintenance due"
                    onChange={(value) => setMaintenanceForm((current) => ({ ...current, next_maintenance_due_at: value }))}
                    type="date"
                    value={maintenanceForm.next_maintenance_due_at}
                  />

                  <div className="flex items-center gap-3 rounded-[22px] border border-app-border bg-app-background/55 px-4 py-3">
                    <input
                      checked={maintenanceForm.warranty_claim}
                      id="warranty-claim"
                      onChange={(event) => setMaintenanceForm((current) => ({ ...current, warranty_claim: event.currentTarget.checked }))}
                      type="checkbox"
                    />
                    <Label htmlFor="warranty-claim">Warranty claim</Label>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="maintenance-notes">Notes</Label>
                    <textarea
                      className="field-area mt-2"
                      id="maintenance-notes"
                      onChange={(event) => setMaintenanceForm((current) => ({ ...current, notes: event.currentTarget.value }))}
                      value={maintenanceForm.notes}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="maintenance-resolution">Resolution</Label>
                    <textarea
                      className="field-area mt-2"
                      id="maintenance-resolution"
                      onChange={(event) => setMaintenanceForm((current) => ({ ...current, resolution: event.currentTarget.value }))}
                      value={maintenanceForm.resolution}
                    />
                  </div>

                  {maintenanceError ? (
                    <p className="md:col-span-2 text-sm text-app-danger">{maintenanceError}</p>
                  ) : null}

                  <div className="md:col-span-2 flex justify-end">
                    <Button disabled={createMaintenanceMutation.isPending} type="submit">
                      {createMaintenanceMutation.isPending ? 'Saving maintenance...' : 'Log Maintenance'}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

function QrPreviewCard({ asset }: { asset: ItAsset }) {
  const [svg, setSvg] = useState<string>('')

  useEffect(() => {
    let cancelled = false

    void QRCode.toString(asset.qr_code_value, {
      type: 'svg',
      width: 216,
      margin: 1,
      color: {
        dark: '#13233c',
        light: '#0000',
      },
    }).then((value) => {
      if (!cancelled) {
        setSvg(value)
      }
    }).catch(() => {
      if (!cancelled) {
        setSvg('')
      }
    })

    return () => {
      cancelled = true
    }
  }, [asset.qr_code_value])

  return (
    <div className="rounded-[28px] border border-app-border bg-[linear-gradient(180deg,rgba(19,35,60,0.98),rgba(30,49,74,0.95))] px-5 py-5 text-white shadow-[0_28px_56px_-38px_rgba(16,24,40,0.58)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-300">QR Identity</p>
          <p className="mt-2 text-lg font-semibold">{asset.asset_code}</p>
        </div>
        <div className="rounded-2xl bg-white/10 p-3 text-[color:var(--app-highlight)]">
          <QrCode className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 rounded-[28px] bg-white p-4 text-app-foreground">
        {svg ? (
          <div
            aria-label={`QR code for ${asset.asset_code}`}
            className="mx-auto max-w-[220px]"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <div className="flex h-[220px] items-center justify-center rounded-[24px] border border-dashed border-app-border text-sm text-app-muted-foreground">
            QR preview unavailable
          </div>
        )}
      </div>

      <div className="mt-4 space-y-2 text-sm text-slate-300">
        <p>Payload: {asset.qr_code_value}</p>
        <p>Generated for {categoryLabel(asset.category)} • {labelize(asset.status)}</p>
      </div>
    </div>
  )
}

function AssignmentHistoryCard({ assignment }: { assignment: ItAssetAssignment }) {
  return (
    <article className="rounded-[22px] border border-app-border bg-app-background/48 px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold">{assignment.employee?.full_name ?? 'Employee'}</p>
          <p className="mt-1 text-sm text-app-muted-foreground">
            Assigned {formatDateTime(assignment.assigned_at)} • Expected {formatDate(assignment.expected_return_at)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={variantForValue(assignment.assignment_condition)}>{labelize(assignment.assignment_condition ?? 'good')}</Badge>
          <Badge variant={variantForValue(assignment.status)}>{labelize(assignment.status)}</Badge>
        </div>
      </div>

      <div className="mt-3 space-y-2 text-sm text-app-muted-foreground">
        <p>Assignment note: {assignment.assignment_notes ?? '-'}</p>
        <p>Returned at: {formatDateTime(assignment.returned_at)}</p>
        <p>Return note: {assignment.return_notes ?? '-'}</p>
      </div>
    </article>
  )
}

function MaintenanceHistoryCard({ maintenance }: { maintenance: ItAssetMaintenance }) {
  return (
    <article className="rounded-[22px] border border-app-border bg-app-background/48 px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold">{labelize(maintenance.maintenance_type)}</p>
          <p className="mt-1 text-sm text-app-muted-foreground">
            Scheduled {formatDate(maintenance.scheduled_at)} • Vendor {maintenance.vendor_name ?? 'Internal'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={variantForValue(maintenance.status)}>{labelize(maintenance.status)}</Badge>
          {maintenance.warranty_claim ? <Badge variant="warning">Warranty claim</Badge> : null}
        </div>
      </div>

      <div className="mt-3 space-y-2 text-sm text-app-muted-foreground">
        <p>Cost: {formatCurrency(maintenance.cost_amount, maintenance.currency)}</p>
        <p>Notes: {maintenance.notes ?? '-'}</p>
        <p>Resolution: {maintenance.resolution ?? '-'}</p>
      </div>
    </article>
  )
}

function HeroMetric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-[26px] border border-white/10 bg-white/8 px-5 py-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-300">{label}</p>
      <p className="mt-3 text-4xl font-extrabold tracking-[-0.06em] text-white">{value}</p>
      <p className="mt-3 text-sm leading-7 text-slate-300">{note}</p>
    </div>
  )
}

function FieldInput({
  label,
  onChange,
  required = false,
  type = 'text',
  value,
  ...props
}: Omit<ComponentProps<typeof Input>, 'onChange' | 'value'> & {
  label: string
  onChange: (value: string) => void
  value: string
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input
        className="mt-2"
        onChange={(event) => onChange(event.currentTarget.value)}
        required={required}
        type={type}
        value={value}
        {...props}
      />
    </div>
  )
}

function InfoTile({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-[22px] border border-app-border bg-app-background/48 px-4 py-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-app-muted-foreground">{label}</p>
      <p className="mt-2 font-semibold">{value || '-'}</p>
    </div>
  )
}

function EmptyState({ body, title }: { body: string; title: string }) {
  return (
    <div className="rounded-[24px] border border-dashed border-app-border px-6 py-10 text-center">
      <p className="text-lg font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-7 text-app-muted-foreground">{body}</p>
    </div>
  )
}

function createAssetForm(lookups?: ItAssetLookups): AssetFormState {
  return {
    category: lookups?.defaults.category ?? 'laptop',
    name: '',
    brand: '',
    model: '',
    serial_number: '',
    phone_number: '',
    license_key: '',
    license_expires_at: '',
    vendor_name: '',
    purchase_date: lookups?.defaults.purchase_date ?? '',
    purchase_cost: '',
    currency: lookups?.defaults.currency ?? 'IDR',
    branch_id: lookups?.branches[0] ? String(lookups.branches[0].id) : '',
    status: lookups?.defaults.status ?? 'available',
    warranty_expires_at: '',
    maintenance_due_at: '',
    notes: '',
  }
}

function createAssignForm(lookups?: ItAssetLookups): AssignFormState {
  return {
    employee_id: lookups?.employees[0] ? String(lookups.employees[0].id) : '',
    assigned_at: toDateTimeLocal(lookups?.defaults.current_date ?? currentDateString(), '09:00'),
    expected_return_at: addDays(lookups?.defaults.current_date ?? currentDateString(), 90),
    assignment_condition: lookups?.defaults.assignment_condition ?? 'good',
    assignment_notes: '',
  }
}

function createReturnForm(lookups?: ItAssetLookups): ReturnFormState {
  return {
    returned_at: toDateTimeLocal(lookups?.defaults.current_date ?? currentDateString(), '17:00'),
    return_condition: lookups?.defaults.assignment_condition ?? 'good',
    return_notes: '',
  }
}

function createMaintenanceForm(lookups?: ItAssetLookups): MaintenanceFormState {
  const baseDate = lookups?.defaults.current_date ?? currentDateString()

  return {
    maintenance_type: lookups?.defaults.maintenance_type ?? 'preventive',
    vendor_name: '',
    scheduled_at: baseDate,
    status: lookups?.defaults.maintenance_status ?? 'scheduled',
    warranty_claim: false,
    cost_amount: '',
    currency: lookups?.defaults.currency ?? 'IDR',
    notes: '',
    resolution: '',
    next_maintenance_due_at: addDays(baseDate, 30),
  }
}

function normalizeAssetFilters(filters: AssetFiltersState): ItAssetFilters {
  return {
    category: filters.category || undefined,
    status: filters.status || undefined,
    employee_id: filters.employee_id ? Number(filters.employee_id) : undefined,
  }
}

function categoryLabel(value: string, lookups?: ItAssetLookups) {
  return lookups?.categories.find((item) => item.value === value)?.label ?? labelize(value)
}

function variantForValue(value: string | null | undefined): BadgeVariant {
  if (!value) {
    return 'neutral'
  }

  return badgeVariantMap[value] ?? 'neutral'
}

function labelize(value: string) {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatCurrency(value: number | null | undefined, currency = 'IDR') {
  if (value === null || value === undefined) {
    return '-'
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
  }).format(new Date(value))
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function toNullableInteger(value: string) {
  return value ? Number(value) : undefined
}

function toNullableNumber(value: string) {
  return value ? Number(value) : undefined
}

function toDateTimeLocal(dateString: string, time: string) {
  return `${dateString}T${time}`
}

function currentDateString() {
  return dateToIsoString(new Date())
}

function addDays(dateString: string, days: number) {
  const [year, month, day] = dateString.split('-').map((value) => Number(value))
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + days)

  return dateToIsoString(date)
}

function dateToIsoString(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}
