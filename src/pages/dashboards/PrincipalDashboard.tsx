import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard, StatCardGrid } from '@/components/dashboard/StatCard';
import { PageHeader, Section, ContentCard } from '@/components/dashboard/PageHeader';
import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge, GradeBadge } from '@/components/dashboard/StatusBadge';
import { Button } from '@/components/ui/button';
import { NavItem } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { mockPrincipalStats, mockPendingResults, mockAnnouncements } from '@/data/mockData';
import { 
  LayoutDashboard, 
  CheckSquare, 
  BarChart3, 
  MessageSquare,
  TrendingUp,
  Clock,
  Award,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus
} from 'lucide-react';

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/principal', icon: LayoutDashboard },
  { title: 'Result Approval', href: '/principal/approvals', icon: CheckSquare, badge: 3 },
  { title: 'Analytics', href: '/principal/analytics', icon: BarChart3 },
  { title: 'Announcements', href: '/principal/announcements', icon: MessageSquare },
];

export default function PrincipalDashboard() {
  const { user } = useAuth();
  const stats = mockPrincipalStats;
  const [schoolName, setSchoolName] = useState<string>('');

  useEffect(() => {
    const fetchSchoolName = (schoolId: string) => {
      const schoolRef = ref(database, `school_registrations/${schoolId}/schoolName`);
      onValue(schoolRef, (snapshot) => setSchoolName(snapshot.val()));
    };

    if (user?.schoolId) {
      fetchSchoolName(user.schoolId);
    } else if (user?.id) {
      const userRef = ref(database, `users/${user.id}/schoolId`);
      onValue(userRef, (snapshot) => {
        const sid = snapshot.val();
        if (sid) fetchSchoolName(sid);
      });
    }
  }, [user?.schoolId, user?.id]);

  const pendingColumns = [
    {
      key: 'student',
      header: 'Student',
      cell: (result: typeof mockPendingResults[0]) => (
        <div>
          <p className="font-medium">{result.studentName}</p>
          <p className="text-xs text-muted-foreground">Roll No: {result.rollNumber}</p>
        </div>
      ),
    },
    {
      key: 'exam',
      header: 'Exam',
      cell: (result: typeof mockPendingResults[0]) => result.examName,
    },
    {
      key: 'class',
      header: 'Class',
      cell: (result: typeof mockPendingResults[0]) => `${result.class} - ${result.section}`,
    },
    {
      key: 'percentage',
      header: 'Score',
      cell: (result: typeof mockPendingResults[0]) => (
        <div className="flex items-center gap-2">
          <span>{result.percentage.toFixed(1)}%</span>
          <GradeBadge grade={result.grade} />
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (result: typeof mockPendingResults[0]) => <StatusBadge status={result.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: () => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-7 text-xs hover:bg-primary/10 hover:text-primary">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approve
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs hover:bg-destructive/10 hover:text-destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Reject
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout navItems={navItems} title="Principal">
      <div className="space-y-8">
        <PageHeader 
          title="Principal Dashboard"
          description={schoolName || (user as any)?.schoolName || 'Academic oversight and approval'}
        />

        {/* Stats Grid */}
        <StatCardGrid columns={4}>
          <StatCard
            title="Overall Performance"
            value={`${stats.overallPerformance}%`}
            icon={TrendingUp}
            subtitle="School average"
          />
          <StatCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            icon={Clock}
            iconColor="text-warning"
          />
          <StatCard
            title="Pass Rate"
            value={`${stats.passRate}%`}
            icon={Award}
            subtitle="This semester"
          />
          <StatCard
            title="Top Performers"
            value={stats.topPerformers}
            icon={Award}
            iconColor="text-primary"
            subtitle="90%+ scorers"
          />
        </StatCardGrid>

        {/* Pending Approvals */}
        <Section 
          title="Pending Result Approvals" 
          description="Review and approve results submitted by teachers"
          headerAction={
            <Button variant="outline" size="sm">View All</Button>
          }
        >
          <ContentCard noPadding>
            <DataTable 
              data={mockPendingResults}
              columns={pendingColumns}
              emptyMessage="No pending approvals"
            />
          </ContentCard>
        </Section>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Performance Alerts */}
          <Section title="Performance Alerts">
            <ContentCard>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
                  <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Low Performance: Mathematics</p>
                    <p className="text-xs text-muted-foreground">Class 10-B average dropped by 15% this term</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
                  <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Attendance Concern</p>
                    <p className="text-xs text-muted-foreground">5 students with attendance below 75%</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <Award className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Improvement: English</p>
                    <p className="text-xs text-muted-foreground">Class 10-A average improved by 12%</p>
                  </div>
                </div>
              </div>
            </ContentCard>
          </Section>

          {/* Recent Announcements */}
          <Section title="Recent Announcements" headerAction={
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
          }>
            <ContentCard>
              <div className="space-y-4">
                {mockAnnouncements.slice(0, 3).map((announcement) => (
                  <div 
                    key={announcement.id}
                    className="pb-4 border-b border-border last:border-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-medium text-sm">{announcement.title}</p>
                      <span className="text-xs text-muted-foreground">{announcement.createdAt}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{announcement.content}</p>
                    <div className="flex gap-1 mt-2">
                      {announcement.targetRoles.map((role) => (
                        <span 
                          key={role}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ContentCard>
          </Section>
        </div>

        {/* Top Performers */}
        <Section title="Top Performers - Mid-Term Examination">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { rank: 1, name: 'Sarah Johnson', class: '10-A', percentage: 98.5, gpa: 4.0 },
              { rank: 2, name: 'James Wilson', class: '10-A', percentage: 90.2, gpa: 3.9 },
              { rank: 3, name: 'Emma Thompson', class: '10-A', percentage: 89.8, gpa: 3.8 },
            ].map((student) => (
              <ContentCard key={student.rank} className="relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-16 h-16 ${
                  student.rank === 1 ? 'bg-yellow-500/10' : 
                  student.rank === 2 ? 'bg-gray-400/10' : 'bg-orange-400/10'
                } rounded-bl-full`} />
                <div className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  student.rank === 1 ? 'bg-yellow-500/20 text-yellow-500' : 
                  student.rank === 2 ? 'bg-gray-400/20 text-gray-400' : 'bg-orange-400/20 text-orange-400'
                }`}>
                  #{student.rank}
                </div>
                <div className="space-y-2">
                  <p className="font-semibold">{student.name}</p>
                  <p className="text-sm text-muted-foreground">Class {student.class}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary">{student.percentage}%</span>
                    <GradeBadge grade="A+" />
                  </div>
                  <p className="text-xs text-muted-foreground">GPA: {student.gpa}</p>
                </div>
              </ContentCard>
            ))}
          </div>
        </Section>
      </div>
    </DashboardLayout>
  );
}
