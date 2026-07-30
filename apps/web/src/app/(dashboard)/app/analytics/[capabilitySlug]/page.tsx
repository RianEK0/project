import { notFound } from 'next/navigation';

import { AnalyticsDetailPage } from '@/features/analytics/analytics-detail-page';
import { getAnalyticsCapabilityItem } from '@/features/analytics/analytics-capability-catalog';

export default async function AnalyticsCapabilityPage({
  params,
}: {
  params: Promise<{ capabilitySlug: string }>;
}) {
  const { capabilitySlug } = await params;
  const capability = getAnalyticsCapabilityItem(capabilitySlug);

  if (!capability) {
    notFound();
  }

  return <AnalyticsDetailPage capability={capability} />;
}
