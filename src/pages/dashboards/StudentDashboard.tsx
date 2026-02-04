import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard, StatCardGrid } from '@/components/dashboard/StatCard';
import { PageHeader, Section, ContentCard } from '@/components/dashboard/PageHeader';
import { GradeBadge } from '@/components/dashboard/StatusBadge';
import { Button } from '@/components/ui/button';
import { NavItem } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { mockStudentStats, mockAnnouncements } from '@/data/mockData';
import { 
  LayoutDashboard, 
  FileText, 
  Download, 
  User,
  Award,
  TrendingUp,
  BookOpen,
  Calendar,
  Trophy,
  ChevronDown,
  ChevronUp,
  Printer
} from 'lucide-react';

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/student', icon: LayoutDashboard },
  { title: 'My Results', href: '/student/results', icon: FileText },
  { title: 'Report Card', href: '/student/report', icon: Download },
  { title: 'Profile', href: '/student/profile', icon: User },
];

function StudentOverview() {
  const { user } = useAuth();
  const stats = mockStudentStats;
  const [results, setResults] = useState<any[]>([]);
  const [schoolName, setSchoolName] = useState<string>('');

  useEffect(() => {
    if (user?.id) {
      const resultsRef = ref(database, `student_results/${user.id}`);
      const unsubscribe = onValue(resultsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const resultsList = Object.values(data).sort((a: any, b: any) => 
            new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
          );
          setResults(resultsList);
        }
      });
      return () => unsubscribe();
    }
  }, [user?.id]);

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

  const latestResult = results.length > 0 ? results[0] : null;

  return (
    <div className="space-y-8">
        <PageHeader 
          title={`Hello, ${user?.name?.split(' ')[0] || 'Student'}!`}
          description={schoolName || "View your academic performance and results"}
        />

        {/* Stats Grid */}
        <StatCardGrid columns={4}>
          <StatCard
            title="Latest Grade"
            value={stats.latestGrade}
            icon={Award}
            subtitle="Mid-Term Exam"
          />
          <StatCard
            title="Current GPA"
            value={stats.gpa.toFixed(1)}
            icon={TrendingUp}
            subtitle="Out of 4.0"
          />
          <StatCard
            title="Class Rank"
            value={`#${stats.rank}`}
            icon={Trophy}
            subtitle="Out of 35 students"
          />
          <StatCard
            title="Attendance"
            value={`${stats.attendance}%`}
            icon={Calendar}
          />
        </StatCardGrid>

        {/* Latest Result Card */}
        {latestResult ? (
          <Section title="Latest Result">
            <ContentCard className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-semibold">{latestResult.examName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {latestResult.class} - Section {latestResult.section}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-primary">{latestResult.percentage.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">Percentage</p>
                  </div>
                  <GradeBadge grade={latestResult.grade} className="text-lg px-4 py-1" />
                </div>
              </div>

              {/* Subject-wise breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {latestResult.subjects.map((subject: any) => (
                  <div 
                    key={subject.subjectId}
                    className="p-3 rounded-lg bg-background/50 border border-border/50 text-center"
                  >
                    <p className="text-xs text-muted-foreground mb-1">{subject.subjectName}</p>
                    <p className="text-lg font-semibold">{subject.marksObtained}/{subject.maxMarks}</p>
                    <div className="text-[10px] text-muted-foreground my-1">
                      M: {subject.mcq !== undefined ? subject.mcq : '-'} | W: {subject.written !== undefined ? subject.written : '-'}
                    </div>
                    <GradeBadge grade={subject.grade} className="mt-1 text-xs" />
                  </div>
                ))}
              </div>

              <div className="flex justify-end mt-4">
                <Button className="glow-primary-sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download Report Card
                </Button>
              </div>
            </ContentCard>
          </Section>
        ) : (
          <ContentCard>
            <div className="text-center py-8 text-muted-foreground">No results published yet.</div>
          </ContentCard>
        )}

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* All Results */}
          <Section title="Exam History">
            <ContentCard>
              <div className="space-y-3">
                {results.map((result) => (
                  <div 
                    key={result.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
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

          {/* Subject Performance */}
          <Section title="Subject Performance">
            {latestResult ? (
              <ContentCard>
                <div className="space-y-4">
                {latestResult.subjects.map((subject: any) => {
                  const percentage = subject.maxMarks > 0 ? (subject.marksObtained / subject.maxMarks) * 100 : 0;
                  return (
                    <div key={subject.subjectId} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{subject.subjectName}</span>
                        <span className="text-muted-foreground">
                          {subject.marksObtained}/{subject.maxMarks} <span className="text-xs ml-1">(M:{subject.mcq !== undefined ? subject.mcq : '-'} W:{subject.written !== undefined ? subject.written : '-'})</span>
                        </span>
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
                  );
                })}
                </div>
              </ContentCard>
            ) : (
              <ContentCard><div className="text-center py-8 text-muted-foreground">No data available.</div></ContentCard>
            )}
          </Section>
        </div>

        {/* Announcements */}
        <Section title="Recent Announcements">
          <div className="grid md:grid-cols-2 gap-4">
            {mockAnnouncements
              .filter(a => a.targetRoles.includes('student'))
              .slice(0, 2)
              .map((announcement) => (
                <ContentCard key={announcement.id} className="hover:border-primary/30 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{announcement.title}</h4>
                    <span className="text-xs text-muted-foreground">{announcement.createdAt}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{announcement.content}</p>
                  <p className="text-xs text-primary mt-3">By {announcement.createdByName}</p>
                </ContentCard>
              ))}
          </div>
        </Section>

        {/* Performance Summary */}
        {latestResult && (
          <Section title="Performance Summary">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ContentCard className="text-center">
                <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{latestResult.subjects.length}</p>
                <p className="text-sm text-muted-foreground">Subjects</p>
              </ContentCard>
              <ContentCard className="text-center">
                <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">
                  {latestResult.subjects.filter((s: any) => s.maxMarks > 0 && (s.marksObtained / s.maxMarks) >= 0.8).length}
                </p>
                <p className="text-sm text-muted-foreground">A+ Grades</p>
              </ContentCard>
              <ContentCard className="text-center">
                <TrendingUp className="h-8 w-8 text-chart-3 mx-auto mb-2" />
                <p className="text-2xl font-bold">{latestResult.totalMarks}</p>
                <p className="text-sm text-muted-foreground">Total Marks</p>
              </ContentCard>
              <ContentCard className="text-center">
                <Award className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{latestResult.gpa.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">GPA</p>
              </ContentCard>
            </div>
          </Section>
        )}
    </div>
  );
}

function StudentResults() {
  const { user } = useAuth();
  const [results, setResults] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);
  const [schoolData, setSchoolData] = useState<any>(null);
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [liveMarks, setLiveMarks] = useState<Record<string, any>>({});

  useEffect(() => {
    if (user?.id) {
      const resultsRef = ref(database, `student_results/${user.id}`);
      const unsubscribe = onValue(resultsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const resultsList = Object.values(data).sort((a: any, b: any) => 
            new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
          );
          setResults(resultsList);
        }
      });
      return () => unsubscribe();
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.schoolId) {
      const schoolRef = ref(database, `school_registrations/${user.schoolId}`);
      onValue(schoolRef, (snapshot) => {
        const data = snapshot.val();
        setSchoolData(data);
        setSchoolLogo(data?.logo || null);
      });
    }
  }, [user?.schoolId]);

  useEffect(() => {
    if (user?.id) {
      const userRef = ref(database, `users/${user.id}`);
      onValue(userRef, (snapshot) => {
        setStudentProfile(snapshot.val());
      });
    }
  }, [user?.id]);

  useEffect(() => {
    if (expandedId && user?.schoolId && user?.id) {
      const result = results.find(r => r.id === expandedId);
      if (result && result.examId && result.classId && result.sectionId) {
        result.subjects.forEach((sub: any) => {
          const markRef = ref(database, `marks/${user.schoolId}/${result.examId}/${result.classId}/${result.sectionId}/${sub.subjectId}/${user.id}`);
          onValue(markRef, (snapshot) => {
            const val = snapshot.val();
            if (val) {
              setLiveMarks(prev => ({ ...prev, [`${expandedId}_${sub.subjectId}`]: val }));
            }
          });
        });
      }
    }
  }, [expandedId, user?.schoolId, user?.id, results]);

  return (
    <div className="space-y-8">
      <div className="print:hidden">
        <PageHeader title="My Results" description="View your detailed academic results." />
      </div>
      <Section title={<span className="print:hidden">Exam History</span>}>
        <div className="space-y-4">
          {results.length > 0 ? (
            results.map((result) => (
              <ContentCard key={result.id} noPadding className="overflow-hidden print:shadow-none print:border-none print:bg-transparent">
                <div 
                  className="flex items-center justify-between p-6 cursor-pointer hover:bg-muted/50 transition-colors print:hidden"
                  onClick={() => setExpandedId(expandedId === result.id ? null : result.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{result.examName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(result.publishedAt || '').toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden md:block">
                      <p className="text-2xl font-bold text-primary">{result.percentage.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">Overall Score</p>
                    </div>
                    <GradeBadge grade={result.grade} className="text-lg px-3 py-1" />
                    {expandedId === result.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </div>

                {expandedId === result.id && (
                  <div className="p-8 border-t bg-background relative overflow-hidden print:p-0 print:bg-transparent animate-in slide-in-from-top-2 duration-200">
                    {schoolLogo && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
                        <img 
                          src={schoolLogo} 
                          alt="Watermark" 
                          className="w-[500px] h-[500px] object-contain opacity-[0.03] print:opacity-[0.05] grayscale transform -rotate-12" 
                        />
                      </div>
                    )}

                    <div className="text-center mb-8 relative z-10">
                      {schoolLogo && (
                        <img src={schoolLogo} alt="School Logo" className="h-24 mx-auto mb-4 object-contain" />
                      )}
                      {schoolData && <h2 className="text-xl font-bold">{schoolData.schoolName}</h2>}
                      <h1 className="text-2xl font-bold uppercase tracking-wide mb-2">Academic Transcript</h1>
                      {schoolData && (
                        <p className="text-sm text-muted-foreground">{schoolData.address}, {schoolData.city}</p>
                      )}
                      <div className="text-muted-foreground">
                        {result.examName}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8 p-4 bg-transparent rounded-lg border relative z-10">
                      <div>
                        <p className="text-sm text-muted-foreground">Student Name</p>
                        <p className="font-semibold">{result.studentName || studentProfile?.Name || user?.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Roll Number</p>
                        <p className="font-semibold">{result.rollNumber || studentProfile?.rollNumber || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Merit Position</p>
                        <p className="font-semibold">#{result.meritPosition || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Father's Name</p>
                        <p className="font-semibold">{result.fatherName || studentProfile?.fatherName || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Mother's Name</p>
                        <p className="font-semibold">{result.motherName || studentProfile?.motherName || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Class & Section</p>
                        <p className="font-semibold">{result.class} - {result.section}</p>
                      </div>
                    </div>

                    <div className="border rounded-lg overflow-hidden mb-8 relative z-10 bg-transparent">
                      <table className="w-full text-sm">
                        <thead className="bg-transparent">
                          <tr>
                            <th className="p-3 text-left">Subject</th>
                            <th className="p-3 text-center">MCQ</th>
                            <th className="p-3 text-center">Written</th>
                            <th className="p-3 text-center">Total</th>
                            <th className="p-3 text-center">Grade</th>
                            <th className="p-3 text-center">GPA</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {(() => {
                            const subjectGroups = result.subjectGroups || [];
                            const allSubjects = result.subjects || [];
                            const groupedSubjectIds = new Set(subjectGroups.flatMap((g: any) => g.subjectIds));
                            
                            // Filter to get display subjects (Groups + Non-grouped Individuals)
                            // We filter out subjects that are part of a group, because they will be rendered under their group
                            const displaySubjects = allSubjects.filter((s: any) => 
                              s.subjectId.startsWith('group_') || !groupedSubjectIds.has(s.subjectId)
                            );

                            return displaySubjects.map((sub: any) => {
                              const isGroup = sub.subjectId.startsWith('group_');
                              
                              if (isGroup) {
                                const groupId = sub.subjectId.replace('group_', '');
                                const group = subjectGroups.find((g: any) => g.id === groupId);
                                if (!group) return null;

                                const constituentSubjects = group.subjectIds.map((id: string) => 
                                  allSubjects.find((s: any) => s.subjectId === id)
                                ).filter(Boolean);

                                return (
                                  <>
                                    {constituentSubjects.map((conSub: any, index: number) => (
                                      <tr key={conSub.subjectId}>
                                        <td className="p-3">
                                          {index === 0 && <div className="font-medium">{sub.subjectName}</div>}
                                          <div className="pl-4 text-sm text-muted-foreground">{conSub.subjectName}</div>
                                        </td>
                                        <td className="p-3 text-center">{conSub.mcq !== undefined ? conSub.mcq.toFixed(2) : '-'}</td>
                                        <td className="p-3 text-center">{conSub.written !== undefined ? conSub.written.toFixed(2) : '-'}</td>
                                        <td className="p-3 text-center border-l text-muted-foreground">{conSub.marksObtained !== undefined ? Math.round(conSub.marksObtained) : '-'}</td>
                                        <td className="p-3 text-center"></td>
                                        <td className="p-3 text-center"></td>
                                      </tr>
                                    ))}
                                    <tr key={`${sub.subjectId}-total`} className="bg-muted/50 font-semibold">
                                      <td className="p-3 text-right">Subject Total</td>
                                      <td className="p-3 text-center">{sub.mcq !== undefined ? sub.mcq.toFixed(2) : '-'}</td>
                                      <td className="p-3 text-center">{sub.written !== undefined ? sub.written.toFixed(2) : '-'}</td>
                                      <td className="p-3 text-center font-bold border-l">{sub.marksObtained !== undefined ? Math.round(sub.marksObtained) : '-'}</td>
                                      <td className="p-3 text-center"><GradeBadge grade={sub.grade || '-'} /></td>
                                      <td className="p-3 text-center font-bold">{sub.gpa !== undefined ? sub.gpa.toFixed(2) : '-'}</td>
                                    </tr>
                                  </>
                                );
                              } else {
                                return (
                                  <tr key={sub.subjectId}>
                                    <td className="p-3 font-medium">
                                      {sub.subjectName}
                                      {sub.isFourth && <span className="ml-2 text-xs text-muted-foreground">(4th Subject)</span>}
                                    </td>
                                    <td className="p-3 text-center">{sub.mcq !== undefined ? sub.mcq.toFixed(2) : '-'}</td>
                                    <td className="p-3 text-center">{sub.written !== undefined ? sub.written.toFixed(2) : '-'}</td>
                                    <td className="p-3 text-center font-medium border-l">{sub.marksObtained !== undefined ? Math.round(sub.marksObtained) : '-'}</td>
                                    <td className="p-3 text-center"><GradeBadge grade={sub.grade} /></td>
                                    <td className="p-3 text-center">{sub.gpa !== undefined ? sub.gpa.toFixed(2) : '-'}</td>
                                  </tr>
                                );
                              }
                            });
                          })()}
                        </tbody>
                      </table>
                    </div>

                    <div className="mb-8 p-4 bg-transparent rounded-lg border text-sm relative z-10">
                      <h3 className="font-semibold mb-2">Calculation Breakdown</h3>
                      {(() => {
                        const mandatorySubjects = result.subjects.filter((s: any) => !s.isFourth);
                        const fourthSubject = result.subjects.find((s: any) => s.isFourth);
                        
                        const totalMandatoryGPA = mandatorySubjects.reduce((sum: number, s: any) => sum + (s.gpa || 0), 0);
                        const mandatoryCount = mandatorySubjects.length;
                        
                        let fourthSubjectBonus = 0;
                        if (fourthSubject && fourthSubject.gpa > 2.00) {
                          fourthSubjectBonus = fourthSubject.gpa - 2.00;
                        }

                        const calculatedGPA = mandatoryCount > 0 ? (totalMandatoryGPA + fourthSubjectBonus) / mandatoryCount : 0;
                        
                        const failedSubjects = result.subjects.filter((s: any) => s.grade === 'F').map((s: any) => s.subjectName);
                        const isFailed = failedSubjects.length > 0;

                        return (
                          <div className="space-y-1">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p><span className="text-muted-foreground">Total GPA (Mandatory):</span> {totalMandatoryGPA.toFixed(2)}</p>
                                <p><span className="text-muted-foreground">Mandatory Subjects:</span> {mandatoryCount}</p>
                              </div>
                              <div>
                                {fourthSubject && (
                                  <>
                                    <p><span className="text-muted-foreground">4th Subject GPA:</span> {fourthSubject.gpa?.toFixed(2) || '0.00'}</p>
                                    <p><span className="text-muted-foreground">Bonus Points:</span> {fourthSubjectBonus.toFixed(2)} <span className="text-xs text-muted-foreground">({fourthSubject.gpa?.toFixed(2) || '0.00'} - 2.00)</span></p>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="mt-2 pt-2 border-t">
                              <p className="font-medium">
                                Formula: <span className="font-mono text-xs">({totalMandatoryGPA.toFixed(2)} + {fourthSubjectBonus.toFixed(2)}) / {mandatoryCount} = {calculatedGPA.toFixed(2)}</span>
                              </p>
                              {calculatedGPA > 5.00 && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  * GPA capped at 5.00
                                </p>
                              )}
                              {isFailed && (
                                <p className="text-destructive font-medium mt-1">
                                  Result is Fail because student failed in: {failedSubjects.join(', ')}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="flex justify-end relative z-10">
                      <div className="bg-primary/5 p-6 rounded-lg border border-primary/10 min-w-[200px]">
                        <div className="space-y-2 text-right">
                          <div>
                            <span className="text-sm text-muted-foreground mr-4">Final GPA</span>
                            <span className="text-2xl font-bold">{result.gpa.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center justify-end gap-4">
                            <span className="text-sm text-muted-foreground">Final Grade</span>
                            <GradeBadge grade={result.grade} className="text-lg px-3 py-1" />
                          </div>
                          {result.grade === 'F' && (
                            <div className="text-destructive font-medium text-sm mt-2">
                              Result: Failed
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-16 grid grid-cols-3 gap-8 text-center text-sm text-muted-foreground relative z-10">
                      <div className="border-t pt-2">Class Teacher</div>
                      <div className="border-t pt-2">Principal</div>
                      <div className="border-t pt-2">Guardian</div>
                    </div>

                    <div className="flex justify-end mt-8 print:hidden">
                      <Button onClick={() => window.print()} variant="outline">
                        <Printer className="h-4 w-4 mr-2" />
                        Print Result Card
                      </Button>
                    </div>
                  </div>
                )}
              </ContentCard>
            ))
          ) : (
            <ContentCard>
              <div className="text-center py-12 text-muted-foreground">No exam history found.</div>
            </ContentCard>
          )}
        </div>
      </Section>
    </div>
  );
}

function StudentReport() {
  const { user } = useAuth();
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      const resultsRef = ref(database, `student_results/${user.id}`);
      const unsubscribe = onValue(resultsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const resultsList = Object.values(data).sort((a: any, b: any) => 
            new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
          );
          setResults(resultsList);
        }
      });
      return () => unsubscribe();
    }
  }, [user?.id]);

  const latestResult = results.length > 0 ? results[0] : null;

  return (
    <div className="space-y-8">
      <PageHeader title="Report Card" description="Download your academic report cards." />
      <ContentCard>
        {latestResult ? (
          <div className="text-center py-12">
            <Download className="h-16 w-16 mx-auto mb-4 text-primary opacity-50" />
            <h3 className="text-xl font-medium mb-2">Latest Report Card Available</h3>
            <p className="text-muted-foreground mb-6">{latestResult.examName}</p>
            <Button className="glow-primary-sm">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">No report cards available.</div>
        )}
      </ContentCard>
    </div>
  );
}

function StudentProfile() {
  const { user } = useAuth();
  return (
    <div className="space-y-8">
      <PageHeader title="My Profile" description="Manage your personal information." />
      <ContentCard>
        <div className="flex items-center gap-6">
          <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-12 w-12 text-primary" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold">{user?.name}</h3>
            <p className="text-muted-foreground">{user?.email}</p>
            <p className="text-sm text-muted-foreground capitalize mt-1 px-2 py-0.5 bg-muted rounded-full inline-block">{user?.role}</p>
          </div>
        </div>
      </ContentCard>
    </div>
  );
}

export default function StudentDashboard() {
  return (
    <DashboardLayout navItems={navItems} title="Student">
      <Routes>
        <Route index element={<StudentOverview />} />
        <Route path="results" element={<StudentResults />} />
        <Route path="report" element={<StudentReport />} />
        <Route path="profile" element={<StudentProfile />} />
      </Routes>
    </DashboardLayout>
  );
}
