import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader, Section, ContentCard } from '@/components/dashboard/PageHeader';
import { LayoutDashboard, ClipboardEdit, FileText, Users } from 'lucide-react';

const navItems = [
  { title: 'Dashboard', href: '/teacher', icon: LayoutDashboard },
  { title: 'Marks Entry', href: '/teacher/marks', icon: ClipboardEdit },
  { title: 'Results', href: '/teacher/results', icon: FileText },
  { title: 'Students', href: '/teacher/students', icon: Users },
];

export default function TeacherStudents() {
  return (
    <DashboardLayout navItems={navItems} title="Students">
      <PageHeader title="My Students" description="View and manage student details." />
      <Section title="Students">
        <ContentCard>
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Student management features coming soon.</p>
          </div>
        </ContentCard>
      </Section>
    </DashboardLayout>
  );
}