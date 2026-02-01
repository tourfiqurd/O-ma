import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader, Section, ContentCard } from '@/components/dashboard/PageHeader';
import { LayoutDashboard, GraduationCap, Users, BookOpen, FileText, BarChart3, Settings } from 'lucide-react';

const navItems = [
  { title: 'Dashboard', href: '/school-admin', icon: LayoutDashboard },
  { title: 'Academic Setup', href: '/school-admin/academic', icon: GraduationCap },
  { title: 'Users', href: '/school-admin/users', icon: Users },
  { title: 'Exams', href: '/school-admin/exams', icon: BookOpen },
  { title: 'Results', href: '/school-admin/results', icon: FileText },
  { title: 'Reports', href: '/school-admin/reports', icon: BarChart3 },
  { title: 'Settings', href: '/school-admin/settings', icon: Settings },
];

export default function SchoolAdminSettings() {
  return (
    <DashboardLayout navItems={navItems} title="Settings">
      <PageHeader title="School Settings" description="Configure school details and preferences." />
      <Section title="Configuration">
        <ContentCard>
          <div className="text-center py-8 text-muted-foreground">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Settings configuration coming soon.</p>
          </div>
        </ContentCard>
      </Section>
    </DashboardLayout>
  );
}