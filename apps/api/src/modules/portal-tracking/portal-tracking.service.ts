import { Injectable } from '@nestjs/common';
import {
  portalTrackingEntityTypes,
  portalTrackingEventStatuses,
  type PortalTrackingEntityType,
  type PortalTrackingEventStatus,
} from '@nova/shared-types';

type TrackingEvent = {
  id: string;
  entityType: PortalTrackingEntityType;
  entityId: string;
  title: string;
  description: string;
  route: string;
  status: PortalTrackingEventStatus;
  occurredAt: string;
};

const timelineEvents: TrackingEvent[] = [
  {
    id: 'trk-booking-confirmed',
    entityType: 'BOOKING',
    entityId: 'BKG-2026-00024',
    title: 'Booking confirmed',
    description: 'Booking dikonfirmasi dan resource telah dialokasikan.',
    route: '/portal/bookings/BKG-2026-00024',
    status: 'COMPLETED',
    occurredAt: '2026-07-19T09:00:00.000Z',
  },
  {
    id: 'trk-order-approved',
    entityType: 'ORDER',
    entityId: 'SO-2026-01018',
    title: 'Order approved',
    description: 'Order siap dilanjutkan ke fulfillment dan invoicing.',
    route: '/portal/orders/SO-2026-01018',
    status: 'COMPLETED',
    occurredAt: '2026-07-20T11:30:00.000Z',
  },
  {
    id: 'trk-invoice-issued',
    entityType: 'INVOICE',
    entityId: 'INV-2026-00431',
    title: 'Invoice issued',
    description: 'Invoice telah diterbitkan dan tersedia untuk diunduh.',
    route: '/portal/invoices/INV-2026-00431',
    status: 'COMPLETED',
    occurredAt: '2026-07-21T10:15:00.000Z',
  },
  {
    id: 'trk-payment-follow-up',
    entityType: 'PAYMENT',
    entityId: 'PAY-2026-00302',
    title: 'Payment verification in progress',
    description: 'Tim finance sedang memverifikasi bukti pembayaran yang diunggah.',
    route: '/portal/payments/PAY-2026-00302',
    status: 'ACTIVE',
    occurredAt: '2026-07-23T07:45:00.000Z',
  },
  {
    id: 'trk-ticket-awaiting-customer',
    entityType: 'TICKET',
    entityId: 'TCK-2026-0009',
    title: 'Support needs customer response',
    description: 'Ticket menunggu dokumen tambahan dari customer.',
    route: '/portal/tickets/TCK-2026-0009',
    status: 'EXCEPTION',
    occurredAt: '2026-07-23T08:20:00.000Z',
  },
  {
    id: 'trk-shipment-window',
    entityType: 'SHIPMENT',
    entityId: 'SHP-2026-00044',
    title: 'Shipment ETA scheduled',
    description: 'Estimasi pengiriman berikutnya dijadwalkan untuk July 24, 2026.',
    route: '/portal/tracking/SHP-2026-00044',
    status: 'SCHEDULED',
    occurredAt: '2026-07-24T09:00:00.000Z',
  },
];

@Injectable()
export class PortalTrackingService {
  getEntityTypes(): PortalTrackingEntityType[] {
    return [...portalTrackingEntityTypes];
  }

  getEventStatuses(): PortalTrackingEventStatus[] {
    return [...portalTrackingEventStatuses];
  }

  getTimeline(): TrackingEvent[] {
    return [...timelineEvents].sort((left, right) =>
      left.occurredAt.localeCompare(right.occurredAt),
    );
  }

  getExceptionEvents(): TrackingEvent[] {
    return this.getTimeline().filter((event) => event.status === 'EXCEPTION');
  }

  getSummaryCards() {
    return [
      {
        id: 'active-items',
        label: 'Active Tracking Items',
        metric: this.getTimeline().filter((event) => event.status === 'ACTIVE').length,
      },
      {
        id: 'exceptions',
        label: 'Attention Needed',
        metric: this.getExceptionEvents().length,
      },
      {
        id: 'scheduled',
        label: 'Scheduled Milestones',
        metric: this.getTimeline().filter((event) => event.status === 'SCHEDULED').length,
      },
    ];
  }
}
