import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard, StatCardGrid } from '@/components/dashboard/StatCard';
import { PageHeader, Section, ContentCard } from '@/components/dashboard/PageHeader';
import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NavItem } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { mockTeacherStats, mockStudents, mockSubjects, mockExams } from '@/data/mockData';
import { database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { 
  LayoutDashboard, 
  ClipboardEdit, 
  FileText, 
  Users,
  BookOpen,
  Clock,
  CheckCircle2,
  Send,
  Save
} from 'lucide-react';
import { useState, useEffect } from 'react';

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/teacher', icon: LayoutDashboard },
  { title: 'Marks Entry', href: '/teacher/marks', icon: ClipboardEdit },
  { title: 'Results', href: '/teacher/results', icon: FileText },
  { title: 'Students', href: '/teacher/students', icon: Users },
];

export default function TeacherDashboard() {
  const { user } = useAuth();
  const stats = mockTeacherStats;
  const [selectedExam, setSelectedExam] = useState('exam-003');
  const [selectedClass, setSelectedClass] = useState('Class 10-A');
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

  // Sample marks entry data
  const [marksData, setMarksData] = useState([
    { id: 'student-001', name: 'James Wilson', rollNumber: '2024001', marks: 92, maxMarks: 100 },
    { id: 'student-002', name: 'Emma Thompson', rollNumber: '2024002', marks: 88, maxMarks: 100 },
    { id: 'student-003', name: 'Noah Martinez', rollNumber: '2024003', marks: 76, maxMarks: 100 },
  ]);

  const handleMarksChange = (studentId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setMarksData(prev => prev.map(s => 
      s.id === studentId ? { ...s, marks: Math.min(numValue, s.maxMarks) } : s
    ));
  };

  const getGrade = (marks: number, maxMarks: number) => {
    const percentage = (marks / maxMarks) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    if (percentage >= 35) return 'D';
    return 'F';
  };

  const studentColumns = [
    {
      key: 'student',
      header: 'Student',
      cell: (student: typeof mockStudents[0]) => (
        <div>
          <p className="font-medium">{student.name}</p>
          <p className="text-xs text-muted-foreground">Roll No: {student.rollNumber}</p>
        </div>
      ),
    },
    {
      key: 'class',
      header: 'Class',
      cell: (student: typeof mockStudents[0]) => `${student.class} - ${student.section}`,
    },
    {
      key: 'actions',
      header: '',
      cell: () => (
        <Button size="sm" variant="ghost" className="h-7 text-xs">
          View
        </Button>
      ),
    },
  ];

  return (
    <DashboardLayout navItems={navItems} title="Teacher">
      <div className="space-y-8">
        <PageHeader 
          title={`Hello, ${user?.name?.split(' ')[0] || 'Teacher'}!`}
          description={schoolName ? `${schoolName} - Manage your classes and student marks` : "Manage your classes and student marks"}
        />

        {/* Stats Grid */}
        <StatCardGrid columns={4}>
          <StatCard
            title="Assigned Classes"
            value={stats.assignedClasses}
            icon={BookOpen}
          />
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={Users}
          />
          <StatCard
            title="Pending Entries"
            value={stats.pendingEntries}
            icon={Clock}
            iconColor="text-warning"
          />
          <StatCard
            title="Submitted"
            value={stats.submittedMarks}
            icon={CheckCircle2}
            iconColor="text-primary"
          />
        </StatCardGrid>

        {/* Quick Marks Entry */}
        <Section 
          title="Quick Marks Entry"
          description="Enter marks for the ongoing examination"
        >
          <ContentCard>
            <div className="space-y-4">
              {/* Exam & Class Selection */}
              <div className="flex flex-wrap gap-4 pb-4 border-b border-border">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Exam</p>
                  <p className="font-medium">Second Unit Test</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Subject</p>
                  <p className="font-medium">Mathematics</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Class</p>
                  <p className="font-medium">Class 10 - A</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Max Marks</p>
                  <p className="font-medium">100</p>
                </div>
              </div>

              {/* Marks Entry Table */}
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-3 text-sm font-semibold">Roll No</th>
                      <th className="text-left p-3 text-sm font-semibold">Student Name</th>
                      <th className="text-left p-3 text-sm font-semibold">Marks</th>
                      <th className="text-left p-3 text-sm font-semibold">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marksData.map((student) => (
                      <tr key={student.id} className="border-t border-border hover:bg-muted/30">
                        <td className="p-3 text-sm">{student.rollNumber}</td>
                        <td className="p-3 text-sm font-medium">{student.name}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={student.marks}
                              onChange={(e) => handleMarksChange(student.id, e.target.value)}
                              className="w-20 h-8 text-center"
                              min={0}
                              max={student.maxMarks}
                            />
                            <span className="text-sm text-muted-foreground">/ {student.maxMarks}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                            getGrade(student.marks, student.maxMarks) === 'A+' ? 'bg-primary/20 text-primary' :
                            getGrade(student.marks, student.maxMarks) === 'A' ? 'bg-primary/15 text-primary' :
                            getGrade(student.marks, student.maxMarks) === 'F' ? 'bg-destructive/20 text-destructive' :
                            'bg-muted text-foreground'
                          }`}>
                            {getGrade(student.marks, student.maxMarks)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline">
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
                <Button className="glow-primary-sm">
                  <Send className="h-4 w-4 mr-2" />
                  Submit for Approval
                </Button>
              </div>
            </div>
          </ContentCard>
        </Section>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* My Subjects */}
          <Section title="My Subjects">
            <ContentCard>
              <div className="space-y-3">
                {mockSubjects.filter(s => s.teacherId === 'teacher-001').map((subject) => (
                  <div 
                    key={subject.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{subject.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Code: {subject.code} | Max: {subject.maxMarks}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost" className="text-xs">
                      Enter Marks
                    </Button>
                  </div>
                ))}
              </div>
            </ContentCard>
          </Section>

          {/* My Students */}
          <Section title="My Students" headerAction={
            <Button size="sm" variant="outline">View All</Button>
          }>
            <ContentCard noPadding>
              <DataTable 
                data={mockStudents.slice(0, 3)}
                columns={studentColumns}
              />
            </ContentCard>
          </Section>
        </div>

        {/* Ongoing Exams */}
        <Section title="Active Examinations">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockExams.filter(e => e.status === 'ongoing' || e.status === 'upcoming').map((exam) => (
              <ContentCard key={exam.id} className="hover:border-primary/50 transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold">{exam.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{exam.type.replace('_', ' ')}</p>
                  </div>
                  <StatusBadge status={exam.status} />
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>{new Date(exam.startDate).toLocaleDateString()} - {new Date(exam.endDate).toLocaleDateString()}</p>
                  <p className="mt-1">Classes: {exam.classes.join(', ')}</p>
                </div>
                <Button size="sm" className="w-full mt-4" variant="outline">
                  Enter Marks
                </Button>
              </ContentCard>
            ))}
          </div>
        </Section>
      </div>
    </DashboardLayout>
  );
}
