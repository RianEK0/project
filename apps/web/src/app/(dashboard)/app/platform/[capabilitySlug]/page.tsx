import { notFound } from 'next/navigation';

import { PlatformDetailPage } from '@/features/platform/platform-detail-page';
import { getPlatformCapabilityItem } from '@/features/platform/platform-capability-catalog';

export default async function PlatformCapabilityPage({
  params,
}: {
  params: Promise<{ capabilitySlug: string }>;
}) {
  const { capabilitySlug } = await params;
  const capability = getPlatformCapabilityItem(capabilitySlug);

  if (!capability) {
    notFound();
  }

  return <PlatformDetailPage capability={capability} />;
}
