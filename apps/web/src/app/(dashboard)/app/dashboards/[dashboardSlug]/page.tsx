import { notFound } from 'next/navigation';

import { DashboardDetailPage } from '@/features/dashboards/dashboard-detail-page';
import { getDashboardCatalogItem } from '@/features/dashboards/dashboard-catalog';

export default async function DashboardRoutePage({
  params,
}: {
  params: Promise<{ dashboardSlug: string }>;
}) {
  const { dashboardSlug } = await params;
  const dashboard = getDashboardCatalogItem(dashboardSlug);

  if (!dashboard) {
    notFound();
  }

  return <DashboardDetailPage dashboard={dashboard} />;
}
