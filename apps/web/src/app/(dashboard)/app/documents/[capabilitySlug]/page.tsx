import { notFound } from 'next/navigation';

import { DocumentDetailPage } from '@/features/documents/document-detail-page';
import { getDocumentCapabilityItem } from '@/features/documents/document-capability-catalog';

export default async function DocumentCapabilityPage({
  params,
}: {
  params: Promise<{ capabilitySlug: string }>;
}) {
  const { capabilitySlug } = await params;
  const capability = getDocumentCapabilityItem(capabilitySlug);

  if (!capability) {
    notFound();
  }

  return <DocumentDetailPage capability={capability} />;
}
