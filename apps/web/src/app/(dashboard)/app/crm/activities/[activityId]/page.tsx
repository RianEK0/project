import { CrmPlaceholderPage } from '@/features/crm/crm-placeholder-page';

type ActivityDetailPageProps = {
  params: Promise<{
    activityId: string;
  }>;
};

export default async function ActivityDetailPage({ params }: ActivityDetailPageProps) {
  const { activityId } = await params;

  return (
    <CrmPlaceholderPage
      eyebrow="Activity Detail"
      title={`Activity ${activityId}`}
      description="Activity detail akan menampilkan jenis aksi, customer context, due date, hasil, dan koneksi ke timeline."
      highlights={['Activity type', 'Due date', 'Outcome', 'Timeline link']}
      relatedLinks={[
        { href: '/app/crm/timeline', label: 'Customer timeline' },
        { href: '/app/crm/tasks', label: 'Sales tasks' },
      ]}
    />
  );
}
