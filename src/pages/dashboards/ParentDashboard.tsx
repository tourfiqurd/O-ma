import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard, StatCardGrid } from '@/components/dashboard/StatCard';
import { PageHeader, Section, ContentCard } from '@/components/dashboard/PageHeader';
import { GradeBadge } from '@/components/dashboard/StatusBadge';
import { Button } from '@/components/ui/button';
import { NavItem } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { mockParentStats, mockResults, mockAnnouncements, mockParents } from '@/data/mockData';
import { 
  LayoutDashboard, 
  FileText, 
  Download, 
  MessageSquare,
  Award,
  TrendingUp,
  Calendar,
  User,
  Bell
} from 'lucide-react';

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/parent', icon: LayoutDashboard },
  { title: 'Child Results', href: '/parent/results', icon: FileText },
  { title: 'Report Cards', href: '/parent/reports', icon: Download },
  { title: 'Announcements', href: '/parent/announcements', icon: MessageSquare },
];

export default function ParentDashboard() {
  const { user } = useAuth();
  const stats = mockParentStats;
  const parentData = mockParents[0];
  const childResult = mockResults[mockResults.length - 1];
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

  return (
    <DashboardLayout navItems={navItems} title="Parent">
      <div className="space-y-8">
        <PageHeader 
          title={`Welcome, ${user?.name || 'Parent'}!`}
          description={schoolName || "Monitor your child's academic progress"}
        />

        {/* Child Info Card */}
        <ContentCard className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{parentData.children[0]?.name || 'Student'}</h3>
              <p className="text-muted-foreground">
                {parentData.children[0]?.class} - Section {parentData.children[0]?.section}
              </p>
              <p className="text-sm text-muted-foreground">{schoolName || parentData.schoolName}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button size="sm" className="glow-primary-sm">
                <Download className="h-4 w-4 mr-2" />
                Report Card
              </Button>
            </div>
          </div>
        </ContentCard>

        {/* Stats Grid */}
        <StatCardGrid columns={4}>
          <StatCard
            title="Latest Grade"
            value={stats.childGrade}
            icon={Award}
            subtitle="Mid-Term Exam"
          />
          <StatCard
            title="Class Rank"
            value={`#${stats.childRank}`}
            icon={TrendingUp}
            subtitle="Out of 35"
          />
          <StatCard
            title="Attendance"
            value={`${stats.attendance}%`}
            icon={Calendar}
          />
          <StatCard
            title="Upcoming Exams"
            value={stats.upcomingExams}
            icon={FileText}
            iconColor="text-warning"
          />
        </StatCardGrid>

        {/* Latest Result */}
        <Section title="Latest Examination Result">
          <ContentCard>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
              <div>
                <h3 className="text-lg font-semibold">{childResult.examName}</h3>
                <p className="text-sm text-muted-foreground">
                  Published on {new Date(childResult.publishedAt || '').toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{childResult.percentage.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Overall Score</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">{childResult.gpa.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">GPA</p>
                </div>
                <div className="text-center">
                  <GradeBadge grade={childResult.grade} className="text-lg" />
                  <p className="text-xs text-muted-foreground mt-1">Grade</p>
                </div>
              </div>
            </div>

            {/* Subject-wise Results */}
            <div className="space-y-3">
              {childResult.subjects.map((subject) => {
                const percentage = (subject.marksObtained / subject.maxMarks) * 100;
                return (
                  <div 
                    key={subject.subjectId}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/30"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium">{subject.subjectName}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">
                            {subject.marksObtained}/{subject.maxMarks}
                          </span>
                          <GradeBadge grade={subject.grade} />
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            percentage >= 80 ? 'bg-primary' :
                            percentage >= 60 ? 'bg-chart-3' :
                            percentage >= 40 ? 'bg-warning' :
                            'bg-destructive'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
              <div>
                <p className="text-sm text-muted-foreground">Total Score</p>
                <p className="text-xl font-bold">{childResult.totalMarks} / {childResult.totalMaxMarks}</p>
              </div>
              <Button className="glow-primary-sm">
                <Download className="h-4 w-4 mr-2" />
                Download Full Report
              </Button>
            </div>
          </ContentCard>
        </Section>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Exam History */}
          <Section title="Examination History">
            <ContentCard>
              <div className="space-y-3">
                {mockResults.map((result, index) => (
                  <div 
                    key={result.id}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      index === 0 ? 'bg-primary/10 border border-primary/30' : 'bg-muted/30 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        index === 0 ? 'bg-primary/20' : 'bg-muted'
                      }`}>
                        <FileText className={`h-5 w-5 ${index === 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <p className="font-medium">{result.examName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(result.publishedAt || '').toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{result.percentage.toFixed(1)}%</p>
                      <GradeBadge grade={result.grade} />
                    </div>
                  </div>
                ))}
              </div>
            </ContentCard>
          </Section>

          {/* Announcements */}
          <Section title="School Announcements">
            <ContentCard>
              <div className="space-y-4">
                {mockAnnouncements
                  .filter(a => a.targetRoles.includes('parent') || a.targetRoles.includes('student'))
                  .slice(0, 3)
                  .map((announcement) => (
                    <div 
                      key={announcement.id}
                      className="pb-4 border-b border-border last:border-0 last:pb-0"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium">{announcement.title}</p>
                        <span className="text-xs text-muted-foreground">{announcement.createdAt}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{announcement.content}</p>
                      <p className="text-xs text-primary mt-2">From: {announcement.createdByName}</p>
                    </div>
                  ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Announcements
              </Button>
            </ContentCard>
          </Section>
        </div>

        {/* Performance Trend */}
        <Section title="Performance Comparison">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Class Average', value: '72%', comparison: '+18%', positive: true },
              { label: 'Best Subject', value: 'Mathematics', subValue: '95%' },
              { label: 'Needs Improvement', value: 'Chemistry', subValue: '84%' },
              { label: 'Rank Change', value: '+2', comparison: 'from last exam', positive: true },
            ].map((item, index) => (
              <ContentCard key={index} className="text-center">
                <p className="text-sm text-muted-foreground mb-1">{item.label}</p>
                <p className="text-xl font-bold">{item.value}</p>
                {item.comparison && (
                  <p className={`text-xs ${item.positive ? 'text-primary' : 'text-destructive'}`}>
                    {item.comparison}
                  </p>
                )}
                {item.subValue && (
                  <p className="text-xs text-muted-foreground">{item.subValue}</p>
                )}
              </ContentCard>
            ))}
          </div>
        </Section>
      </div>
    </DashboardLayout>
  );
}
