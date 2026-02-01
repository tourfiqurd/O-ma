import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader, Section, ContentCard } from '@/components/dashboard/PageHeader';
import { LayoutDashboard, ClipboardEdit, FileText, Users } from 'lucide-react';

const navItems = [
  { title: 'Dashboard', href: '/teacher', icon: LayoutDashboard },
  { title: 'Marks Entry', href: '/teacher/marks', icon: ClipboardEdit },
  { title: 'Results', href: '/teacher/results', icon: FileText },
  { title: 'Students', href: '/teacher/students', icon: Users },
];

export default function TeacherResults() {
  return (
    <DashboardLayout navItems={navItems} title="Results">
      <PageHeader title="Results" description="View class results and performance." />
      <Section title="Results">
        <ContentCard>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Results viewing features coming soon.</p>
          </div>
        </ContentCard>
      </Section>
    </DashboardLayout>
  );
}