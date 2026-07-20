import { useEffect, useState, type Dispatch, type FormEvent, type ReactNode, type SetStateAction } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  BellRing,
  CheckCheck,
  Mail,
  MessageCircleMore,
  MessageSquareShare,
  Send,
  Smartphone,
  Webhook,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/features/auth/auth-context'
import {
  broadcastNotification,
  getNotificationDeliveries,
  getNotificationsInbox,
  getNotificationsLookups,
  getNotificationsOverview,
  markAllNotificationsRead,
  markNotificationRead,
  updateNotificationChannel,
} from '@/features/notifications/notifications-api'
import { getErrorMessage } from '@/lib/http'
import type {
  NotificationChannelConfig,
} from '@/types/api'

type BadgeVariant = 'neutral' | 'success' | 'warning' | 'danger'

interface BroadcastFormState {
  subject: string
  title: string
  message: string
  action_url: string
  action_label: string
  channels: string[]
  user_ids: number[]
  role_names: string[]
}

interface DeliveryFiltersState {
  channel: string
  status: string
}

interface ChannelConfigDraft {
  label: string
  driver: string
  transport_mode: string
  is_enabled: boolean
  description: string
  default_target: string
  credentials_configured: boolean
  notes: string
}

const statusVariantMap: Record<string, BadgeVariant> = {
  live: 'success',
  delivered: 'success',
  ready: 'warning',
  unread: 'warning',
  disabled: 'neutral',
  read: 'neutral',
  failed: 'danger',
}

const channelIconMap = {
  in_app: BellRing,
  email: Mail,
  push: Smartphone,
  whatsapp: MessageCircleMore,
  slack: MessageSquareShare,
  microsoft_teams: Webhook,
} as const

export function NotificationsPage() {
  const { session } = useAuth()
  const queryClient = useQueryClient()
  const canView = session?.user.permissions.includes('notifications.view') ?? false
  const canManage = session?.user.permissions.includes('notifications.manage') ?? false
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [deliveryFilters, setDeliveryFilters] = useState<DeliveryFiltersState>({
    channel: '',
    status: '',
  })
  const [broadcastForm, setBroadcastForm] = useState<BroadcastFormState>({
    subject: '',
    title: '',
    message: '',
    action_url: '',
    action_label: '',
    channels: [],
    user_ids: [],
    role_names: [],
  })
  const [channelDrafts, setChannelDrafts] = useState<Record<number, ChannelConfigDraft>>({})

  const overviewQuery = useQuery({
    queryKey: ['notifications', 'overview'],
    queryFn: getNotificationsOverview,
    enabled: canView,
  })

  const lookupsQuery = useQuery({
    queryKey: ['notifications', 'lookups'],
    queryFn: getNotificationsLookups,
    enabled: canView,
  })

  const inboxQuery = useQuery({
    queryKey: ['notifications', 'inbox', readFilter],
    queryFn: () => getNotificationsInbox(
      readFilter === 'all'
        ? {}
        : { read: readFilter === 'read' },
    ),
    enabled: canView,
  })

  const deliveriesQuery = useQuery({
    queryKey: ['notifications', 'deliveries', deliveryFilters],
    queryFn: () => getNotificationDeliveries({
      channel: deliveryFilters.channel || undefined,
      status: deliveryFilters.status || undefined,
    }),
    enabled: canView,
  })

  useEffect(() => {
    const defaults = lookupsQuery.data?.defaults

    if (!defaults) {
      return
    }

    setBroadcastForm((current) => ({
      ...current,
      action_label: current.action_label || defaults.action_label,
      action_url: current.action_url || defaults.action_url,
      channels: current.channels.length > 0 ? current.channels : defaults.channels,
    }))
  }, [lookupsQuery.data])

  useEffect(() => {
    const configs = overviewQuery.data?.channel_health ?? []

    if (configs.length === 0) {
      return
    }

    setChannelDrafts((current) => {
      const next = { ...current }

      for (const config of configs) {
        next[config.id] = next[config.id] ?? buildChannelDraft(config)
      }

      return next
    })
  }, [overviewQuery.data])

  const refreshNotificationQueries = () => {
    void queryClient.invalidateQueries({ queryKey: ['notifications'] })
  }

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: refreshNotificationQueries,
  })

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: refreshNotificationQueries,
  })

  const broadcastMutation = useMutation({
    mutationFn: broadcastNotification,
    onSuccess: () => {
      setBroadcastForm((current) => ({
        ...current,
        subject: '',
        title: '',
        message: '',
        user_ids: [],
        role_names: [],
      }))
      refreshNotificationQueries()
      void queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
    },
  })

  const updateChannelMutation = useMutation({
    mutationFn: ({ channelId, payload }: { channelId: number; payload: Parameters<typeof updateNotificationChannel>[1] }) =>
      updateNotificationChannel(channelId, payload),
    onSuccess: (channel) => {
      setChannelDrafts((current) => ({
        ...current,
        [channel.id]: buildChannelDraft(channel),
      }))
      refreshNotificationQueries()
      void queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
    },
  })

  if (!canView) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification center unavailable</CardTitle>
          <CardDescription>
            Role Anda belum memiliki permission `notifications.view`, jadi inbox dan delivery center belum bisa dibuka.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const overview = overviewQuery.data
  const lookups = lookupsQuery.data
  const inbox = inboxQuery.data ?? []
  const deliveries = deliveriesQuery.data ?? []
  const broadcastError = broadcastMutation.error ? getErrorMessage(broadcastMutation.error) : null

  const handleBroadcastSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    broadcastMutation.mutate({
      subject: broadcastForm.subject || undefined,
      title: broadcastForm.title,
      message: broadcastForm.message,
      action_url: broadcastForm.action_url || undefined,
      action_label: broadcastForm.action_label || undefined,
      channels: broadcastForm.channels,
      user_ids: broadcastForm.user_ids,
      role_names: broadcastForm.role_names,
    })
  }

  const handleChannelSave = (config: NotificationChannelConfig) => {
    const draft = channelDrafts[config.id]

    if (!draft) {
      return
    }

    updateChannelMutation.mutate({
      channelId: config.id,
      payload: {
        label: draft.label,
        driver: draft.driver,
        transport_mode: draft.transport_mode,
        is_enabled: draft.is_enabled,
        description: draft.description || null,
        last_tested_at: new Date().toISOString(),
        config: {
          ...config.config,
          default_target: draft.default_target,
          credentials_configured: draft.credentials_configured,
          notes: draft.notes,
        },
      },
    })
  }

  return (
    <div className="space-y-6">
      <Card className="hero-panel">
        <CardHeader className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="border-white/10 bg-white/8 text-white" variant="neutral">
              Notification Center
            </Badge>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
              <BellRing className="h-3.5 w-3.5 text-[color:var(--app-highlight)]" />
              Email + In App Live
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
            <div className="space-y-4">
              <div className="space-y-3">
                <CardTitle className="max-w-3xl text-4xl font-extrabold tracking-[-0.06em] text-white md:text-5xl">
                  Satu pusat notifikasi untuk inbox personal dan orchestration lintas channel.
                </CardTitle>
                <CardDescription className="max-w-2xl text-base leading-8 text-slate-200">
                  Email dan in-app sudah aktif sekarang, sementara push, WhatsApp, Slack, dan Microsoft Teams
                  sudah tersedia sebagai connector `ready` sehingga penyambungan provider berikutnya tidak perlu
                  bongkar ulang arsitektur.
                </CardDescription>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <HeroMetric
                  label="Unread Inbox"
                  note="Notifications waiting for your attention"
                  value={overviewQuery.isLoading ? '...' : String(overview?.stats.unread_inbox ?? 0)}
                />
                <HeroMetric
                  label="Delivered Today"
                  note="Live deliveries recorded across visible channels"
                  value={overviewQuery.isLoading ? '...' : String(overview?.stats.delivered_today ?? 0)}
                />
                <HeroMetric
                  label="Ready Connectors"
                  note="External channels prepared for provider activation"
                  value={overviewQuery.isLoading ? '...' : String(overview?.stats.ready_connectors ?? 0)}
                />
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <StatusPanel
                items={overview?.channel_health ?? []}
                title="Live Channels"
                filter={(config) => config.transport_mode === 'live'}
              />
              <StatusPanel
                items={overview?.channel_health ?? []}
                title="Ready Connectors"
                filter={(config) => config.transport_mode === 'ready'}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[0.96fr_1.04fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="section-kicker w-fit">Inbox</div>
                <CardTitle className="pt-3 text-2xl">Feed notifikasi personal</CardTitle>
                <CardDescription className="mt-2">
                  Notifikasi sistem yang masuk ke akun Anda, termasuk reminder, broadcast, approval, dan event in-app.
                </CardDescription>
              </div>
              <div className="flex flex-col gap-3 md:items-end">
                <select
                  className="field-select w-full md:w-[180px]"
                  onChange={(event) => setReadFilter(event.currentTarget.value as 'all' | 'unread' | 'read')}
                  value={readFilter}
                >
                  <option value="all">All notifications</option>
                  <option value="unread">Unread only</option>
                  <option value="read">Read only</option>
                </select>
                <Button
                  disabled={markAllReadMutation.isPending || (overview?.stats.unread_inbox ?? 0) === 0}
                  onClick={() => markAllReadMutation.mutate()}
                  size="sm"
                  type="button"
                  variant="secondary"
                >
                  <CheckCheck className="h-4 w-4" />
                  Mark all read
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {inboxQuery.isLoading ? (
                <p className="text-sm text-app-muted-foreground">Loading inbox feed...</p>
              ) : null}

              {inbox.map((notification) => (
                <article className="data-row px-5 py-5" key={notification.id}>
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{notification.title}</p>
                        <Badge variant={notification.is_read ? 'neutral' : 'warning'}>
                          {notification.is_read ? 'Read' : 'Unread'}
                        </Badge>
                        {notification.channels.map((channel) => (
                          <Badge key={`${notification.id}-${channel}`} variant="neutral">
                            {labelize(channel)}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm leading-7 text-app-muted-foreground">{notification.message}</p>
                      <p className="text-sm text-app-muted-foreground">
                        Sender:
                        {' '}
                        <span className="font-medium text-app-foreground">
                          {notification.sender?.name ?? 'System'}
                        </span>
                        {' • '}
                        {formatDateTime(notification.created_at)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {notification.action_url ? (
                        <Button asChild size="sm" variant="secondary">
                          <a href={notification.action_url}>
                            {notification.action_label ?? 'Open'}
                          </a>
                        </Button>
                      ) : null}
                      {!notification.is_read ? (
                        <Button
                          disabled={markReadMutation.isPending}
                          onClick={() => markReadMutation.mutate(notification.id)}
                          size="sm"
                          type="button"
                        >
                          Mark read
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}

              {!inboxQuery.isLoading && inbox.length === 0 ? (
                <EmptyState
                  body="Belum ada notifikasi yang cocok dengan filter aktif. Sistem akan menampilkan broadcast dan event operasional di sini."
                  title="Inbox is quiet"
                />
              ) : null}
            </CardContent>
          </Card>

          {canManage && lookups ? (
            <Card>
              <CardHeader>
                <div className="section-kicker w-fit">Broadcast</div>
                <CardTitle className="pt-3 text-2xl">Kirim notifikasi lintas channel</CardTitle>
                <CardDescription className="mt-2">
                  Pilih channel live atau connector ready, tentukan recipient per user atau role, lalu kirim broadcast dari workspace ini.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-5" onSubmit={handleBroadcastSubmit}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FieldInput
                      label="Title"
                      onChange={(value) => setBroadcastForm((current) => ({ ...current, title: value }))}
                      required
                      value={broadcastForm.title}
                    />
                    <FieldInput
                      label="Subject"
                      onChange={(value) => setBroadcastForm((current) => ({ ...current, subject: value }))}
                      value={broadcastForm.subject}
                    />
                    <FieldInput
                      label="Action URL"
                      onChange={(value) => setBroadcastForm((current) => ({ ...current, action_url: value }))}
                      value={broadcastForm.action_url}
                    />
                    <FieldInput
                      label="Action Label"
                      onChange={(value) => setBroadcastForm((current) => ({ ...current, action_label: value }))}
                      value={broadcastForm.action_label}
                    />
                  </div>

                  <div>
                    <Label htmlFor="broadcast-message">Message</Label>
                    <textarea
                      className="field-area mt-2"
                      id="broadcast-message"
                      onChange={(event) => setBroadcastForm((current) => ({ ...current, message: event.currentTarget.value }))}
                      required
                      value={broadcastForm.message}
                    />
                  </div>

                  <div className="grid gap-4 lg:grid-cols-3">
                    <SelectionCard title="Channels">
                      {(lookups.channels ?? []).map((channel) => (
                        <CheckboxRow
                          checked={broadcastForm.channels.includes(channel.channel)}
                          key={channel.channel}
                          label={`${channel.label} • ${labelize(channel.transport_mode)}`}
                          onChange={() => setBroadcastForm((current) => ({
                            ...current,
                            channels: toggleListValue(current.channels, channel.channel),
                          }))}
                        />
                      ))}
                    </SelectionCard>

                    <SelectionCard title="Roles">
                      {(lookups.roles ?? []).map((role) => (
                        <CheckboxRow
                          checked={broadcastForm.role_names.includes(role.name)}
                          key={role.id}
                          label={role.label}
                          onChange={() => setBroadcastForm((current) => ({
                            ...current,
                            role_names: toggleListValue(current.role_names, role.name),
                          }))}
                        />
                      ))}
                    </SelectionCard>

                    <SelectionCard title="Users">
                      {(lookups.users ?? []).map((user) => (
                        <CheckboxRow
                          checked={broadcastForm.user_ids.includes(user.id)}
                          key={user.id}
                          label={`${user.name} • ${user.employee?.department ?? 'No department'}`}
                          onChange={() => setBroadcastForm((current) => ({
                            ...current,
                            user_ids: toggleListValue(current.user_ids, user.id),
                          }))}
                        />
                      ))}
                    </SelectionCard>
                  </div>

                  {broadcastError ? (
                    <p className="text-sm text-app-danger">{broadcastError}</p>
                  ) : null}

                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-app-muted-foreground">
                      Channel `live` akan tercatat sebagai delivered, sedangkan connector `ready` akan dicatat sebagai handoff-ready.
                    </p>
                    <Button disabled={broadcastMutation.isPending} type="submit">
                      <Send className="h-4 w-4" />
                      {broadcastMutation.isPending ? 'Sending...' : 'Broadcast Notification'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="section-kicker w-fit">Channel Cockpit</div>
              <CardTitle className="pt-3 text-2xl">Status dan konfigurasi channel</CardTitle>
              <CardDescription className="mt-2">
                Email dan in-app berjalan pada mode `live`, sementara push, WhatsApp, Slack, dan Teams dapat dipelihara di mode `ready`.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(overview?.channel_health ?? []).map((config) => {
                const Icon = channelIconMap[config.channel as keyof typeof channelIconMap] ?? BellRing
                const draft = channelDrafts[config.id] ?? buildChannelDraft(config)

                return (
                  <article className="data-row px-5 py-5" key={config.id}>
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="flex items-start gap-3">
                          <div className="rounded-2xl bg-black/5 p-3 text-[color:var(--app-highlight)]">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold">{config.label}</p>
                              <Badge variant={variantForValue(config.status)}>{labelize(config.status)}</Badge>
                              <Badge variant="neutral">{config.driver}</Badge>
                            </div>
                            <p className="mt-2 text-sm leading-7 text-app-muted-foreground">
                              {config.description}
                            </p>
                            <p className="mt-2 text-xs text-app-muted-foreground">
                              Last tested: {formatDateTime(config.last_tested_at)}
                            </p>
                          </div>
                        </div>
                        <div className="rounded-[22px] bg-black/4 px-4 py-3 text-sm text-app-muted-foreground">
                          Updated by {config.updated_by?.name ?? 'System'}
                        </div>
                      </div>

                      {canManage ? (
                        <div className="grid gap-4 md:grid-cols-2">
                          <FieldInput
                            label="Label"
                            onChange={(value) => updateChannelDraft(setChannelDrafts, config.id, { label: value })}
                            value={draft.label}
                          />
                          <FieldInput
                            label="Driver"
                            onChange={(value) => updateChannelDraft(setChannelDrafts, config.id, { driver: value })}
                            value={draft.driver}
                          />

                          <div>
                            <Label htmlFor={`transport-mode-${config.id}`}>Transport mode</Label>
                            <select
                              className="field-select mt-2"
                              id={`transport-mode-${config.id}`}
                              onChange={(event) => updateChannelDraft(setChannelDrafts, config.id, { transport_mode: event.currentTarget.value })}
                              value={draft.transport_mode}
                            >
                              <option value="live">Live</option>
                              <option value="ready">Ready</option>
                            </select>
                          </div>

                          <FieldInput
                            label="Default target"
                            onChange={(value) => updateChannelDraft(setChannelDrafts, config.id, { default_target: value })}
                            value={draft.default_target}
                          />

                          <div className="flex items-center gap-3 rounded-[22px] border border-app-border bg-app-background/55 px-4 py-3">
                            <input
                              checked={draft.is_enabled}
                              id={`enabled-${config.id}`}
                              onChange={(event) => updateChannelDraft(setChannelDrafts, config.id, { is_enabled: event.currentTarget.checked })}
                              type="checkbox"
                            />
                            <Label htmlFor={`enabled-${config.id}`}>Enabled</Label>
                          </div>

                          <div className="flex items-center gap-3 rounded-[22px] border border-app-border bg-app-background/55 px-4 py-3">
                            <input
                              checked={draft.credentials_configured}
                              id={`credentials-${config.id}`}
                              onChange={(event) => updateChannelDraft(setChannelDrafts, config.id, { credentials_configured: event.currentTarget.checked })}
                              type="checkbox"
                            />
                            <Label htmlFor={`credentials-${config.id}`}>Credentials configured</Label>
                          </div>

                          <div className="md:col-span-2">
                            <Label htmlFor={`description-${config.id}`}>Description</Label>
                            <textarea
                              className="field-area mt-2"
                              id={`description-${config.id}`}
                              onChange={(event) => updateChannelDraft(setChannelDrafts, config.id, { description: event.currentTarget.value })}
                              value={draft.description}
                            />
                          </div>

                          <div className="md:col-span-2">
                            <Label htmlFor={`notes-${config.id}`}>Channel notes</Label>
                            <textarea
                              className="field-area mt-2"
                              id={`notes-${config.id}`}
                              onChange={(event) => updateChannelDraft(setChannelDrafts, config.id, { notes: event.currentTarget.value })}
                              value={draft.notes}
                            />
                          </div>

                          <div className="md:col-span-2 flex justify-end">
                            <Button
                              disabled={updateChannelMutation.isPending}
                              onClick={() => handleChannelSave(config)}
                              type="button"
                              variant="secondary"
                            >
                              {updateChannelMutation.isPending ? 'Saving...' : 'Save Channel'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                          <InfoTile label="Mode" value={labelize(config.transport_mode)} />
                          <InfoTile label="Enabled" value={config.is_enabled ? 'Yes' : 'No'} />
                          <InfoTile label="Default target" value={configString(config.config, 'default_target') || '-'} />
                        </div>
                      )}
                    </div>
                  </article>
                )
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="section-kicker w-fit">Delivery Log</div>
                <CardTitle className="pt-3 text-2xl">Riwayat delivery dan connector handoff</CardTitle>
                <CardDescription className="mt-2">
                  Log delivery untuk channel live dan record handoff untuk connector ready yang belum diaktifkan provider-nya.
                </CardDescription>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <select
                  className="field-select"
                  onChange={(event) => setDeliveryFilters((current) => ({ ...current, channel: event.currentTarget.value }))}
                  value={deliveryFilters.channel}
                >
                  <option value="">All channels</option>
                  {(lookups?.channels ?? []).map((channel) => (
                    <option key={channel.channel} value={channel.channel}>{channel.label}</option>
                  ))}
                </select>

                <select
                  className="field-select"
                  onChange={(event) => setDeliveryFilters((current) => ({ ...current, status: event.currentTarget.value }))}
                  value={deliveryFilters.status}
                >
                  <option value="">All statuses</option>
                  {(lookups?.statuses ?? []).map((status) => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {deliveriesQuery.isLoading ? (
                <p className="text-sm text-app-muted-foreground">Loading delivery logs...</p>
              ) : null}

              {deliveries.map((delivery) => (
                <article className="data-row px-5 py-5" key={delivery.id}>
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{delivery.title ?? delivery.subject ?? 'Notification delivery'}</p>
                        <Badge variant={variantForValue(delivery.status)}>{labelize(delivery.status)}</Badge>
                        <Badge variant="neutral">{labelize(delivery.channel)}</Badge>
                        <Badge variant="neutral">{labelize(delivery.transport_mode)}</Badge>
                      </div>
                      <p className="text-sm leading-7 text-app-muted-foreground">{delivery.message ?? 'No message body recorded.'}</p>
                      <p className="text-sm text-app-muted-foreground">
                        Recipient:
                        {' '}
                        <span className="font-medium text-app-foreground">
                          {delivery.recipient_user?.name ?? delivery.recipient ?? 'Unknown recipient'}
                        </span>
                        {' • '}
                        Sender:
                        {' '}
                        {delivery.sender?.name ?? 'System'}
                      </p>
                    </div>

                    <div className="rounded-[22px] bg-black/4 px-4 py-3 text-sm text-app-muted-foreground">
                      {formatDateTime(delivery.sent_at ?? delivery.created_at)}
                    </div>
                  </div>

                  {delivery.payload?.note ? (
                    <div className="mt-3 rounded-[18px] border border-app-border bg-app-background/55 px-4 py-3 text-sm text-app-muted-foreground">
                      {String(delivery.payload.note)}
                    </div>
                  ) : null}
                </article>
              ))}

              {!deliveriesQuery.isLoading && deliveries.length === 0 ? (
                <EmptyState
                  body="Belum ada delivery log yang cocok dengan filter aktif. Kirim broadcast atau ubah filter channel dan status."
                  title="No delivery logs found"
                />
              ) : null}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

function HeroMetric({ label, note, value }: { label: string; note: string; value: string }) {
  return (
    <div className="rounded-[26px] border border-white/10 bg-white/8 px-5 py-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-300">{label}</p>
      <p className="mt-3 text-4xl font-extrabold tracking-[-0.06em] text-white">{value}</p>
      <p className="mt-3 text-sm leading-7 text-slate-300">{note}</p>
    </div>
  )
}

function StatusPanel({
  items,
  title,
  filter,
}: {
  items: NotificationChannelConfig[]
  title: string
  filter: (config: NotificationChannelConfig) => boolean
}) {
  const visibleItems = items.filter(filter)

  return (
    <div className="rounded-[28px] border border-white/10 bg-black/12 px-5 py-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-300">{title}</p>
      <div className="mt-4 space-y-3">
        {visibleItems.map((config) => (
          <article className="rounded-[22px] border border-white/10 bg-white/8 px-4 py-4" key={config.id}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{config.label}</p>
                <p className="text-xs text-slate-300">{config.driver}</p>
              </div>
              <Badge className="border-white/10 bg-white/10 text-white" variant="neutral">
                {labelize(config.status)}
              </Badge>
            </div>
          </article>
        ))}

        {visibleItems.length === 0 ? (
          <p className="text-sm text-slate-300">No channel matched this state.</p>
        ) : null}
      </div>
    </div>
  )
}

function SelectionCard({ children, title }: { children: ReactNode; title: string }) {
  return (
    <div className="rounded-[24px] border border-app-border bg-app-background/48 px-4 py-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-app-muted-foreground">{title}</p>
      <div className="mt-3 space-y-2">{children}</div>
    </div>
  )
}

function CheckboxRow({
  checked,
  label,
  onChange,
}: {
  checked: boolean
  label: string
  onChange: () => void
}) {
  return (
    <label className="flex items-start gap-3 rounded-[18px] border border-app-border bg-white/72 px-3 py-3 text-sm text-app-foreground">
      <input checked={checked} onChange={onChange} type="checkbox" />
      <span>{label}</span>
    </label>
  )
}

function FieldInput({
  label,
  onChange,
  required = false,
  type = 'text',
  value,
}: {
  label: string
  onChange: (value: string) => void
  required?: boolean
  type?: string
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
      />
    </div>
  )
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-app-border bg-app-background/48 px-4 py-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-app-muted-foreground">{label}</p>
      <p className="mt-2 font-semibold">{value}</p>
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

function toggleListValue<T extends string | number>(items: T[], value: T) {
  return items.includes(value)
    ? items.filter((item) => item !== value)
    : [...items, value]
}

function buildChannelDraft(config: NotificationChannelConfig): ChannelConfigDraft {
  return {
    label: config.label,
    driver: config.driver,
    transport_mode: config.transport_mode,
    is_enabled: config.is_enabled,
    description: config.description ?? '',
    default_target: configString(config.config, 'default_target'),
    credentials_configured: configBoolean(config.config, 'credentials_configured'),
    notes: configString(config.config, 'notes'),
  }
}

function updateChannelDraft(
  setDrafts: Dispatch<SetStateAction<Record<number, ChannelConfigDraft>>>,
  channelId: number,
  patch: Partial<ChannelConfigDraft>,
) {
  setDrafts((current) => ({
    ...current,
    [channelId]: {
      ...current[channelId],
      ...patch,
    },
  }))
}

function configString(config: Record<string, unknown> | null, key: string) {
  const value = config?.[key]
  return typeof value === 'string' ? value : ''
}

function configBoolean(config: Record<string, unknown> | null, key: string) {
  return config?.[key] === true
}

function variantForValue(value: string) {
  return statusVariantMap[value] ?? 'neutral'
}

function labelize(value: string) {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
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
