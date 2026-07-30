import { notFound } from 'next/navigation';

import { AiDetailPage } from '@/features/ai/ai-detail-page';
import { getAiCapabilityItem } from '@/features/ai/ai-capability-catalog';

export default async function AiCapabilityPage({
  params,
}: {
  params: Promise<{ capabilitySlug: string }>;
}) {
  const { capabilitySlug } = await params;
  const capability = getAiCapabilityItem(capabilitySlug);

  if (!capability) {
    notFound();
  }

  return <AiDetailPage capability={capability} />;
}
