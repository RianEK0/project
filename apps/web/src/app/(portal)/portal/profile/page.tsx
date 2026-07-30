import { PortalPlaceholderPage } from '@/features/portal/portal-placeholder-page';

export default function PortalProfilePage() {
  return (
    <PortalPlaceholderPage
      eyebrow="Portal / Profile"
      title="Manage contact profile, billing owner, and communication preferences"
      description="Profile portal menyiapkan area self-service untuk memperbarui kontak utama, billing contact, pengaturan notifikasi, dan preferensi komunikasi lintas booking, invoice, dan support."
      highlights={[
        'Primary and billing contact update',
        'Communication channel preferences',
        'Security and password starter',
        'Portal ownership visibility',
      ]}
      relatedLinks={[
        { href: '/portal/notifications', label: 'Open notifications' },
        { href: '/portal/support', label: 'Open support center' },
        { href: '/portal', label: 'Back to portal dashboard' },
      ]}
    />
  );
}
