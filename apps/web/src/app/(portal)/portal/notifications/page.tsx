import { PortalPlaceholderPage } from '@/features/portal/portal-placeholder-page';

export default function PortalNotificationsPage() {
  return (
    <PortalPlaceholderPage
      eyebrow="Portal / Notifications"
      title="Stay updated on booking, billing, support, and fulfillment events"
      description="Notification center customer portal menyatukan reminder booking, invoice alert, update support ticket, dan milestone fulfillment ke satu inbox yang mudah dipindai."
      highlights={[
        'Unread and read notification states',
        'Email, WhatsApp, SMS, and in-app channels',
        'Route linkage back to transaction detail',
        'Archive and preference-ready foundation',
      ]}
      relatedLinks={[
        { href: '/portal/tracking', label: 'Open tracking timeline' },
        { href: '/portal/tickets', label: 'Open tickets' },
        { href: '/portal/profile', label: 'Open profile settings' },
      ]}
    />
  );
}
