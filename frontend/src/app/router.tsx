import { BellRing, Briefcase, Building2, Boxes, CalendarClock, Clock3, KeyRound, LayoutDashboard, LogOut, ShieldCheck, Target, Users, WalletCards } from 'lucide-react'
import { NavLink, Navigate, Outlet, createBrowserRouter } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/features/auth/auth-context'
import { ForgotPasswordPage } from '@/features/auth/forgot-password-page'
import { LoginPage } from '@/features/auth/login-page'
import { ResetPasswordPage } from '@/features/auth/reset-password-page'

function ProtectedLayout() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate replace to="/login" />
  }

  return <AppShell />
}

function GuestGate() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate replace to="/dashboard" />
  }

  return <Outlet />
}

function AppShell() {
  const { session, signOut } = useAuth()
  const canManageAccessControl = (
    session?.user.permissions.includes('roles.manage')
    || session?.user.permissions.includes('users.manage')
  ) ?? false

  const navigation = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/employees', label: 'Employees', icon: Users, permission: 'employees.view' },
    { to: '/recruitment', label: 'Recruitment', icon: Briefcase, permission: 'recruitment.view' },
    { to: '/performance', label: 'Performance', icon: Target, permission: 'performance.view' },
    { to: '/assets', label: 'IT Assets', icon: Boxes, permission: 'assets.view' },
    { to: '/notifications', label: 'Notifications', icon: BellRing, permission: 'notifications.view' },
    { to: '/organization', label: 'Organization', icon: Building2, permission: 'organization.view' },
    { to: '/leave', label: 'Leave', icon: CalendarClock, permission: 'leave-requests.view' },
    { to: '/attendance', label: 'Attendance', icon: Clock3, permission: 'attendance.view' },
    { to: '/payroll', label: 'Payroll', icon: WalletCards, permission: 'payroll.view' },
    { to: '/audit-logs', label: 'Audit', icon: ShieldCheck, permission: 'audit.view' },
    { to: '/security', label: 'Security', icon: KeyRound },
    ...(canManageAccessControl ? [{ to: '/access-control', label: 'Access', icon: ShieldCheck }] : []),
  ].filter((item) => !('permission' in item) || !item.permission || session?.user.permissions.includes(item.permission))

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1520px] gap-6 px-4 py-5 xl:px-6">
      <aside className="shell-rail hidden w-[304px] shrink-0 flex-col justify-between rounded-[34px] p-5 lg:sticky lg:top-5 lg:flex lg:h-[calc(100vh-2.5rem)]">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-3 text-[color:var(--app-highlight)]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-300">
                  Enterprise HRIS
                </p>
                <p className="mt-1 text-lg font-bold text-white">{session?.user.name}</p>
                <p className="mt-1 text-sm text-slate-300">{session?.user.email}</p>
              </div>
            </div>
            <div className="soft-divider my-5 bg-white/10" />
            <div className="flex flex-wrap gap-2">
              {session?.user.roles.map((role) => (
                <Badge key={role} variant="neutral" className="border-white/8 bg-white/8 text-white">
                  {role}
                </Badge>
              ))}
            </div>

            <Button
              className="mt-5 w-full bg-white text-app-accent hover:bg-[#f6efe5]"
              onClick={signOut}
              type="button"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>

          <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-3">
            <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
              Navigation
            </p>
            <nav className="space-y-1.5">
              {navigation.map(({ to, label, icon: Icon }) => (
                <NavLink
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-3 rounded-[20px] px-4 py-3 text-sm font-semibold transition',
                      isActive
                        ? 'bg-white text-app-accent shadow-[0_18px_34px_-24px_rgba(0,0,0,0.65)]'
                        : 'text-slate-300 hover:bg-white/6 hover:text-white',
                    ].join(' ')
                  }
                  key={to}
                  to={to}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1 space-y-5">
        <header className="panel mesh-card px-6 py-6 md:px-7">
          <div className="flex flex-col gap-5">
            <div className="space-y-3">
              <span className="section-kicker">People Operations Workspace</span>
              <div className="space-y-2">
                <h1 className="max-w-3xl text-3xl font-extrabold tracking-[-0.05em] text-app-foreground md:text-4xl">
                  Selamat datang, {session?.user.name}
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-app-muted-foreground md:text-base">
                  Pantau data karyawan, recruitment, performance, struktur organisasi, approval cuti,
                  audit trail, inventaris IT, dan notification center dari satu ruang kerja yang konsisten,
                  sekarang termasuk attendance, correction flow, dan payroll enterprise.
                </p>
              </div>
            </div>
          </div>
        </header>

        <nav className="panel flex flex-wrap items-center gap-2 px-3 py-3 lg:hidden">
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink
              className={({ isActive }) =>
                [
                  'inline-flex items-center gap-2 rounded-[18px] px-4 py-2.5 text-sm font-semibold transition',
                  isActive
                    ? 'bg-app-accent text-app-accent-foreground shadow-[0_18px_30px_-24px_rgba(19,35,60,0.8)]'
                    : 'bg-white/72 text-app-foreground',
                ].join(' ')
              }
              key={to}
              to={to}
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
          <Button className="ml-auto" size="sm" variant="secondary" onClick={signOut} type="button">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </nav>

        <Outlet />
      </div>
    </div>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <GuestGate />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: 'reset-password',
        element: <ResetPasswordPage />,
      },
    ],
  },
  {
    path: '/',
    element: <ProtectedLayout />,
    children: [
      {
        index: true,
        element: <Navigate replace to="/dashboard" />,
      },
      {
        path: 'dashboard',
        lazy: async () => ({
          Component: (await import('@/features/dashboard/dashboard-page')).DashboardPage,
        }),
      },
      {
        path: 'employees',
        lazy: async () => ({
          Component: (await import('@/features/workforce/employees-page')).EmployeesPage,
        }),
      },
      {
        path: 'recruitment',
        lazy: async () => ({
          Component: (await import('@/features/recruitment/recruitment-page')).RecruitmentPage,
        }),
      },
      {
        path: 'performance',
        lazy: async () => ({
          Component: (await import('@/features/performance/performance-page')).PerformancePage,
        }),
      },
      {
        path: 'assets',
        lazy: async () => ({
          Component: (await import('@/features/assets/assets-page')).AssetsPage,
        }),
      },
      {
        path: 'notifications',
        lazy: async () => ({
          Component: (await import('@/features/notifications/notifications-page')).NotificationsPage,
        }),
      },
      {
        path: 'organization',
        lazy: async () => ({
          Component: (await import('@/features/organization/organization-page')).OrganizationPage,
        }),
      },
      {
        path: 'leave',
        lazy: async () => ({
          Component: (await import('@/features/leave/leave-page')).LeavePage,
        }),
      },
      {
        path: 'attendance',
        lazy: async () => ({
          Component: (await import('@/features/attendance/attendance-page')).AttendancePage,
        }),
      },
      {
        path: 'payroll',
        lazy: async () => ({
          Component: (await import('@/features/payroll/payroll-page')).PayrollPage,
        }),
      },
      {
        path: 'audit-logs',
        lazy: async () => ({
          Component: (await import('@/features/governance/audit-logs-page')).AuditLogsPage,
        }),
      },
      {
        path: 'security',
        lazy: async () => ({
          Component: (await import('@/features/auth/security-page')).SecurityPage,
        }),
      },
      {
        path: 'access-control',
        lazy: async () => ({
          Component: (await import('@/features/access-control/access-control-page')).AccessControlPage,
        }),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate replace to="/dashboard" />,
  },
])
