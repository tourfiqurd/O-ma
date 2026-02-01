import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader, Section, ContentCard } from '@/components/dashboard/PageHeader';
import { LayoutDashboard, Building2, CreditCard, Settings } from 'lucide-react';

const navItems = [
  { title: 'Dashboard', href: '/super-admin', icon: LayoutDashboard },
  { title: 'Schools', href: '/super-admin/schools', icon: Building2 },
  { title: 'Subscriptions', href: '/super-admin/subscriptions', icon: CreditCard },
  { title: 'Settings', href: '/super-admin/settings', icon: Settings },
];

export default function SuperAdminSubscriptions() {
  return (
    <DashboardLayout navItems={navItems} title="Subscriptions">
      <PageHeader title="Subscriptions" description="Manage school subscriptions and billing." />
      <Section title="Subscription Plans">
        <ContentCard>
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Subscription management features coming soon.</p>
          </div>
        </ContentCard>
      </Section>
    </DashboardLayout>
  );
}