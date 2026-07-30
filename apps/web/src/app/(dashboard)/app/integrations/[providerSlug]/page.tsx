import { notFound } from 'next/navigation';

import { IntegrationDetailPage } from '@/features/integrations/integration-detail-page';
import { getIntegrationProviderItem } from '@/features/integrations/integration-provider-catalog';

export default async function IntegrationProviderPage({
  params,
}: {
  params: Promise<{ providerSlug: string }>;
}) {
  const { providerSlug } = await params;
  const provider = getIntegrationProviderItem(providerSlug);

  if (!provider) {
    notFound();
  }

  return <IntegrationDetailPage provider={provider} />;
}
