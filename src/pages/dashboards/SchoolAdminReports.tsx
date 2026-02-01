import { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader, Section, ContentCard } from '@/components/dashboard/PageHeader';
import { StatCard, StatCardGrid } from '@/components/dashboard/StatCard';
import { LayoutDashboard, GraduationCap, Users, BookOpen, FileText, BarChart3, Settings, TrendingUp, Award } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/lib/firebase';
import { ref, query, orderByChild, equalTo, onValue, get } from 'firebase/database';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

const navItems = [
  { title: 'Dashboard', href: '/school-admin', icon: LayoutDashboard },
  { title: 'Academic Setup', href: '/school-admin/academic', icon: GraduationCap },
  { title: 'Users', href: '/school-admin/users', icon: Users },
  { title: 'Exams', href: '/school-admin/exams', icon: BookOpen },
  { title: 'Results', href: '/school-admin/results', icon: FileText },
  { title: 'Reports', href: '/school-admin/reports', icon: BarChart3 },
  { title: 'Settings', href: '/school-admin/settings', icon: Settings },
];

const COLORS = ['#10B981', '#EF4444', '#F59E0B', '#3B82F6'];

export default function SchoolAdminReports() {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [allResults, setAllResults] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.schoolId) return;

    const studentsQuery = query(ref(database, 'users'), orderByChild('schoolId'), equalTo(user.schoolId));
    
    const unsubscribe = onValue(studentsQuery, async (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const studentIds = Object.keys(data).filter(key => data[key].role === 'student');
        setStudents(Object.values(data).filter((u: any) => u.role === 'student'));
        
        // Fetch results for all students
        const resultsPromises = studentIds.map(id => get(ref(database, `student_results/${id}`)));
        const resultsSnapshots = await Promise.all(resultsPromises);
        
        const results: any[] = [];
        resultsSnapshots.forEach(snap => {
          if (snap.exists()) {
            Object.values(snap.val()).forEach(r => results.push(r));
          }
        });
        setAllResults(results);
      } else {
        setStudents([]);
        setAllResults([]);
      }
    });

    return () => unsubscribe();
  }, [user?.schoolId]);

  // Calculations
  const stats = useMemo(() => {
    if (!allResults.length) return {
      avgGPA: 0,
      passRate: 0,
      totalExams: 0,
      trendData: [],
      passFailData: [],
      subjectData: []
    };

    // 1. Average GPA
    const totalGPA = allResults.reduce((sum, r) => sum + (r.gpa || 0), 0);
    const avgGPA = totalGPA / allResults.length;

    // 2. Pass Rate
    const passedCount = allResults.filter(r => !r.grade?.includes('F') && r.grade !== 'F').length;
    const passRate = (passedCount / allResults.length) * 100;

    // 3. Trend Data (Group by Exam Name)
    const examGroups: Record<string, { totalGPA: number; count: number; date: string }> = {};
    allResults.forEach(r => {
      if (!examGroups[r.examName]) {
        examGroups[r.examName] = { totalGPA: 0, count: 0, date: r.publishedAt };
      }
      examGroups[r.examName].totalGPA += r.gpa || 0;
      examGroups[r.examName].count += 1;
    });

    const trendData = Object.entries(examGroups).map(([name, data]) => ({
      name,
      avgGPA: parseFloat((data.totalGPA / data.count).toFixed(2)),
      date: new Date(data.date).getTime()
    })).sort((a, b) => a.date - b.date);

    // 4. Pass/Fail Distribution
    const passFailData = [
      { name: 'Pass', value: passedCount },
      { name: 'Fail', value: allResults.length - passedCount }
    ];

    // 5. Subject Performance
    const subjectStats: Record<string, { total: number; count: number }> = {};
    allResults.forEach(r => {
      if (r.subjects) {
        r.subjects.forEach((s: any) => {
          if (!subjectStats[s.subjectName]) {
            subjectStats[s.subjectName] = { total: 0, count: 0 };
          }
          subjectStats[s.subjectName].total += s.marksObtained || 0;
          subjectStats[s.subjectName].count += 1;
        });
      }
    });

    const subjectData = Object.entries(subjectStats).map(([name, data]) => ({
      subject: name,
      avgScore: Math.round(data.total / data.count)
    })).sort((a, b) => b.avgScore - a.avgScore).slice(0, 10); // Top 10 subjects

    return {
      avgGPA,
      passRate,
      totalExams: Object.keys(examGroups).length,
      trendData,
      passFailData,
      subjectData
    };
  }, [allResults]);

  return (
    <DashboardLayout navItems={navItems} title="Reports">
      <PageHeader title="Analytics & Reports" description="View school performance and statistics." />
      
      <div className="space-y-8">
        {/* Stats Grid */}
        <StatCardGrid columns={4}>
          <StatCard
            title="Total Students"
            value={students.length}
            icon={Users}
          />
          <StatCard
            title="Average GPA"
            value={stats.avgGPA.toFixed(2)}
            icon={Award}
            subtitle="Across all exams"
          />
          <StatCard
            title="Pass Rate"
            value={`${stats.passRate.toFixed(1)}%`}
            icon={TrendingUp}
            iconColor={stats.passRate >= 50 ? "text-primary" : "text-destructive"}
          />
          <StatCard
            title="Exams Conducted"
            value={stats.totalExams}
            icon={FileText}
          />
        </StatCardGrid>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          {/* Performance Trend Chart */}
          <div className="col-span-4 rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground">Performance Trends</h3>
              <p className="text-sm text-muted-foreground">Average GPA over time</p>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.trendData}>
                  <defs>
                    <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} domain={[0, 5]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#10B981' }}
                  />
                  <Area type="monotone" dataKey="avgGPA" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorGpa)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pass/Fail Pie Chart */}
          <div className="col-span-3 rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground">Pass vs Fail</h3>
              <p className="text-sm text-muted-foreground">Overall distribution</p>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.passFailData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.passFailData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                     contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Subject Performance Bar Chart */}
        <Section title="Subject Performance">
          <ContentCard>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.subjectData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="subject" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                  />
                  <Bar dataKey="avgScore" fill="#10B981" radius={[4, 4, 0, 0]} name="Avg Score" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ContentCard>
        </Section>
      </div>
    </DashboardLayout>
  );
}