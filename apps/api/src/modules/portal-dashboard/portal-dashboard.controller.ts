import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  bookingStatuses,
  invoiceStatuses,
  paymentStatuses,
  portalDashboardPeriods,
  supportTicketStatuses,
} from '@nova/shared-types';

@ApiTags('Portal Dashboard')
@Controller({
  path: 'portal-dashboard',
  version: '1',
})
export class PortalDashboardController {
  @Get()
  getDashboard() {
    return {
      periods: portalDashboardPeriods,
      summary: {
        bookings: {
          activeStatuses: bookingStatuses.filter((status) =>
            ['CONFIRMED', 'PARTIALLY_PAID', 'PAID', 'CHECKED_IN', 'IN_PROGRESS'].includes(status),
          ),
        },
        invoices: {
          openStatuses: invoiceStatuses.filter((status) =>
            ['ISSUED', 'PARTIALLY_PAID', 'OVERDUE'].includes(status),
          ),
        },
        payments: {
          visibleStatuses: paymentStatuses,
        },
        support: {
          trackedStatuses: supportTicketStatuses,
        },
      },
      cards: [
        {
          id: 'bookings',
          label: 'Upcoming Bookings',
          route: '/portal/bookings',
          insight: 'Lihat reservasi aktif, jadwal check-in, dan perubahan yang menunggu respon.',
        },
        {
          id: 'orders',
          label: 'Orders In Progress',
          route: '/portal/orders',
          insight: 'Pantau order yang sedang dipenuhi, dikirim, atau menunggu invoice.',
        },
        {
          id: 'payments',
          label: 'Payments And Balances',
          route: '/portal/payments',
          insight:
            'Tinjau tagihan terbuka, pembayaran terbaru, dan metode pembayaran yang tersedia.',
        },
        {
          id: 'support',
          label: 'Support And Notifications',
          route: '/portal/support',
          insight: 'Ikuti ticket, notifikasi terbaru, dan milestone yang butuh perhatian customer.',
        },
      ],
    };
  }
}
