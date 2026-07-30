import { Injectable } from '@nestjs/common';
import { portalNotificationChannels, type PortalNotificationChannel } from '@nova/shared-types';

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  channel: PortalNotificationChannel;
  status: 'UNREAD' | 'READ' | 'ARCHIVED';
  route: string;
  createdAt: string;
};

const sampleNotifications: NotificationItem[] = [
  {
    id: 'notif-booking-reminder',
    title: 'Booking reminder',
    message: 'Booking BKG-2026-00024 akan dimulai pada July 24, 2026.',
    channel: 'IN_APP',
    status: 'UNREAD',
    route: '/portal/bookings/BKG-2026-00024',
    createdAt: '2026-07-23T08:00:00.000Z',
  },
  {
    id: 'notif-invoice-issued',
    title: 'Invoice issued',
    message: 'Invoice INV-2026-00431 telah diterbitkan dan siap diunduh.',
    channel: 'EMAIL',
    status: 'READ',
    route: '/portal/invoices/INV-2026-00431',
    createdAt: '2026-07-22T10:15:00.000Z',
  },
  {
    id: 'notif-ticket-update',
    title: 'Support update',
    message: 'Ticket TCK-2026-0009 sedang menunggu balasan customer.',
    channel: 'WHATSAPP',
    status: 'UNREAD',
    route: '/portal/tickets/TCK-2026-0009',
    createdAt: '2026-07-22T13:40:00.000Z',
  },
];

@Injectable()
export class PortalNotificationCenterService {
  getInbox(): NotificationItem[] {
    return sampleNotifications;
  }

  getSummary() {
    return {
      channels: portalNotificationChannels,
      unreadCount: sampleNotifications.filter((item) => item.status === 'UNREAD').length,
      totalCount: sampleNotifications.length,
    };
  }
}
