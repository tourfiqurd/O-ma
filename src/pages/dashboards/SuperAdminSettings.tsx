import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader, Section, ContentCard } from '@/components/dashboard/PageHeader';
import { LayoutDashboard, Building2, CreditCard, Settings } from 'lucide-react';

const navItems = [
  { title: 'Dashboard', href: '/super-admin', icon: LayoutDashboard },
  { title: 'Schools', href: '/super-admin/schools', icon: Building2 },
  { title: 'Subscriptions', href: '/super-admin/subscriptions', icon: CreditCard },
  { title: 'Settings', href: '/super-admin/settings', icon: Settings },
];

export default function SuperAdminSettings() {
  return (
    <DashboardLayout navItems={navItems} title="Settings">
      <PageHeader title="Platform Settings" description="Configure global platform settings." />
      <Section title="General Configuration">
        <ContentCard>
          <div className="text-center py-8 text-muted-foreground">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Platform settings configuration coming soon.</p>
          </div>
        </ContentCard>
      </Section>
    </DashboardLayout>
  );
}