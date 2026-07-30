import { notFound } from 'next/navigation';

import { MobileDetailPage } from '@/features/mobile/mobile-detail-page';
import { getMobileCapabilityItem } from '@/features/mobile/mobile-capability-catalog';

export default async function MobileCapabilityPage({
  params,
}: {
  params: Promise<{ capabilitySlug: string }>;
}) {
  const { capabilitySlug } = await params;
  const capability = getMobileCapabilityItem(capabilitySlug);

  if (!capability) {
    notFound();
  }

  return <MobileDetailPage capability={capability} />;
}
