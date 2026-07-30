import { CustomerPortalShell } from '@/components/customer-portal-shell';

export default function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <CustomerPortalShell>{children}</CustomerPortalShell>;
}
