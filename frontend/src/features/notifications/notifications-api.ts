import { http } from '@/lib/http'
import type {
  ApiEnvelope,
  NotificationChannelConfig,
  NotificationDeliveryLog,
  NotificationLookups,
  NotificationOverview,
  UserNotification,
} from '@/types/api'

export interface NotificationInboxFilters {
  read?: boolean
}

export interface NotificationDeliveryFilters {
  channel?: string
  status?: string
}

export interface BroadcastNotificationPayload {
  subject?: string
  title: string
  message: string
  channels: string[]
  user_ids?: number[]
  role_names?: string[]
  action_url?: string
  action_label?: string
}

export interface UpdateNotificationChannelPayload {
  label?: string
  driver?: string
  transport_mode?: string
  is_enabled?: boolean
  description?: string | null
  config?: Record<string, unknown>
  last_tested_at?: string
}

export interface BroadcastNotificationResult {
  recipients_count: number
  deliveries_count: number
  channels: string[]
  recipients: Array<{
    id: number
    name: string
    email: string
  }>
  delivery_summary: Array<{
    channel: string
    status: string
    count: number
  }>
  deliveries: NotificationDeliveryLog[]
}

export async function getNotificationsOverview() {
  const { data } = await http.get<ApiEnvelope<NotificationOverview>>('/notifications/overview')
  return data.data
}

export async function getNotificationsLookups() {
  const { data } = await http.get<ApiEnvelope<NotificationLookups>>('/notifications/lookups')
  return data.data
}

export async function getNotificationsInbox(filters: NotificationInboxFilters = {}) {
  const { data } = await http.get<ApiEnvelope<UserNotification[]>>('/notifications/inbox', {
    params: filters,
  })

  return data.data
}

export async function markNotificationRead(notificationId: string) {
  const { data } = await http.post<ApiEnvelope<UserNotification>>(`/notifications/inbox/${notificationId}/read`)
  return data.data
}

export async function markAllNotificationsRead() {
  const { data } = await http.post<ApiEnvelope<{ updated_count: number }>>('/notifications/inbox/read-all')
  return data.data
}

export async function getNotificationDeliveries(filters: NotificationDeliveryFilters = {}) {
  const { data } = await http.get<ApiEnvelope<NotificationDeliveryLog[]>>('/notifications/deliveries', {
    params: filters,
  })

  return data.data
}

export async function updateNotificationChannel(channelId: number, payload: UpdateNotificationChannelPayload) {
  const { data } = await http.put<ApiEnvelope<NotificationChannelConfig>>(`/notifications/channels/${channelId}`, payload)
  return data.data
}

export async function broadcastNotification(payload: BroadcastNotificationPayload) {
  const { data } = await http.post<ApiEnvelope<BroadcastNotificationResult>>('/notifications/broadcast', payload)
  return data.data
}
