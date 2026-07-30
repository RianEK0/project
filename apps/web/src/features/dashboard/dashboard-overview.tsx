import { SurfaceCard, StatusBadge } from '@nova/ui';

const metricCards = [
  { label: 'Active members', value: '12', change: '+2 this week' },
  { label: 'Workspaces', value: '2', change: 'Main + Operations' },
  { label: 'Pending invitations', value: '3', change: '2 expire in 48h' },
  { label: 'Custom roles', value: '4', change: 'RBAC ready' },
];

const recentActivity = [
  'owner@novaerp.local created NovaERP Demo Company',
  'manager@novaerp.local was assigned the MANAGER role',
  'viewer@novaerp.local received a new invitation',
  'Organization settings were updated',
];

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((metric) => (
          <SurfaceCard key={metric.label} className="space-y-3">
            <p className="text-sm text-muted">{metric.label}</p>
            <p className="font-display text-4xl font-semibold">
              {metric.value}
            </p>
            <StatusBadge>{metric.change}</StatusBadge>
          </SurfaceCard>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <SurfaceCard className="space-y-5">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.18em] text-muted">Foundation Checklist</p>
            <h2 className="font-display text-2xl font-semibold">
              Sprint 1 execution focus
            </h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              'Auth with secure refresh cookie',
              'Tenant membership context',
              'Organization switcher',
              'Workspace baseline',
              'Role and permission matrix',
              'Audit trail with filters',
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-dashed px-4 py-4 text-sm dark:border-slate-700"
              >
                {item}
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard className="space-y-4">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-muted">Recent activity</p>
            <h2 className="font-display text-2xl font-semibold">
              Audit preview
            </h2>
          </div>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity} className="rounded-2xl border px-4 py-3 text-sm">
                {activity}
              </div>
            ))}
          </div>
        </SurfaceCard>
      </section>
    </div>
  );
}

