import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader, Section, ContentCard } from '@/components/dashboard/PageHeader';
import { LayoutDashboard, ClipboardEdit, FileText, Users, BookOpen, ChevronRight, Loader2, Save, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/lib/firebase';
import { ref, query, orderByChild, equalTo, onValue, set, get } from 'firebase/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const navItems = [
  { title: 'Dashboard', href: '/teacher', icon: LayoutDashboard },
  { title: 'Marks Entry', href: '/teacher/marks', icon: ClipboardEdit },
  { title: 'Results', href: '/teacher/results', icon: FileText },
  { title: 'Students', href: '/teacher/students', icon: Users },
];

interface Assignment {
  id: string;
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  subjectId: string;
  subjectName: string;
}

interface Student {
  id: string;
  Name: string;
  rollNumber?: string;
}

interface MarksData {
  mcq: string;
  written: string;
}

interface SubjectConfig {
  mcqMarks: string;
  writtenMarks: string;
}

export default function TeacherMarksEntry() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>('');
  
  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<Record<string, MarksData>>({});
  const [maxMarks, setMaxMarks] = useState<SubjectConfig>({ mcqMarks: '0', writtenMarks: '0' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subAssignments, setSubAssignments] = useState<any[]>([]);

  // Fetch assignments and sub_assignments
  useEffect(() => {
    if (user?.id && user?.schoolId) {
      const assignmentsRef = ref(database, 'assign-teacher');
      const q = query(assignmentsRef, orderByChild('teacherId'), equalTo(user.id));
      
      const unsubscribeAssignments = onValue(q, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const loadedAssignments = Object.entries(data).map(([key, val]: [string, any]) => ({
            id: key,
            ...val
          }));
          setAssignments(loadedAssignments);
        } else {
          setAssignments([]);
        }
        setLoading(false);
      });

      const subAssignRef = ref(database, 'sub_assign');
      const subAssignQuery = query(subAssignRef, orderByChild('schoolId'), equalTo(user.schoolId));
      const unsubscribeSubAssign = onValue(subAssignQuery, (snapshot) => {
        const data = snapshot.val();
        if (data) {
           setSubAssignments(Object.entries(data).map(([k, v]: [string, any]) => ({ id: k, ...v })));
        }
      });

      return () => {
        unsubscribeAssignments();
        unsubscribeSubAssign();
      };
    } else {
      setLoading(false);
    }
  }, [user?.id, user?.schoolId]);

  // Fetch exams
  useEffect(() => {
    if (user?.schoolId) {
      const examsQuery = query(ref(database, 'exams'), orderByChild('schoolId'), equalTo(user.schoolId));
      const unsubscribe = onValue(examsQuery, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setExams(Object.entries(data).map(([k, v]: [string, any]) => ({ id: k, ...v })));
        } else {
          setExams([]);
        }
      });
      return () => unsubscribe();
    }
  }, [user?.schoolId]);

  // Update max marks when assignment changes
  useEffect(() => {
    if (selectedAssignment && subAssignments.length > 0) {
      const config = subAssignments.find((sa: any) => 
        String(sa.classId) === String(selectedAssignment.classId) && 
        String(sa.sectionId) === String(selectedAssignment.sectionId)
      );
      
      if (config) {
        // If exam is selected, try to get marks from exam config
        if (selectedExam) {
          const exam = exams.find(e => e.id === selectedExam);
          if (exam && exam.configMarks && exam.configMarks[config.id]) {
            const subjectMarks = exam.configMarks[config.id][selectedAssignment.subjectId];
            if (subjectMarks) {
              setMaxMarks({
                mcqMarks: subjectMarks.mcq || '0',
                writtenMarks: subjectMarks.written || '0'
              });
              return;
            }
          }
        }

        if (config.subjects) {
          const subjectConfig = config.subjects.find((s: any) => String(s.subjectId) === String(selectedAssignment.subjectId));
          if (subjectConfig) {
            setMaxMarks({
              mcqMarks: subjectConfig.mcqMarks || '0',
              writtenMarks: subjectConfig.writtenMarks || '0'
            });
            return;
          }
        }
      }
      
      setMaxMarks({ mcqMarks: '0', writtenMarks: '0' });
    }
  }, [selectedAssignment, subAssignments, selectedExam, exams]);

  // Fetch students and marks when exam and assignment are selected
  useEffect(() => {
    if (selectedAssignment && selectedExam && user?.schoolId) {
      // Fetch Students
      const usersQuery = query(ref(database, 'users'), orderByChild('schoolId'), equalTo(user.schoolId));
      
      const unsubscribeStudents = onValue(usersQuery, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const classStudents = Object.entries(data)
            .map(([k, v]: [string, any]) => ({ id: k, ...v }))
            .filter((u: any) => 
              u.role === 'student' && 
              String(u.classId) === String(selectedAssignment.classId) && 
              String(u.sectionId) === String(selectedAssignment.sectionId)
            );
          setStudents(classStudents);
        } else {
          setStudents([]);
        }
      });

      // Fetch Marks
      const marksRef = ref(database, `marks/${user.schoolId}/${selectedExam}/${selectedAssignment.classId}/${selectedAssignment.sectionId}/${selectedAssignment.subjectId}`);
      const unsubscribeMarks = onValue(marksRef, (snapshot) => {
        const data = snapshot.val();
        setMarks(data || {});
      });

      return () => {
        unsubscribeStudents();
        unsubscribeMarks();
      };
    }
  }, [selectedAssignment, selectedExam, user?.schoolId]);

  const handleMarkChange = (studentId: string, field: 'mcq' | 'written', value: string) => {
    setMarks(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    if (!selectedAssignment || !selectedExam || !user?.schoolId) return;

    setIsSubmitting(true);
    try {
      const marksRef = ref(database, `marks/${user.schoolId}/${selectedExam}/${selectedAssignment.classId}/${selectedAssignment.sectionId}/${selectedAssignment.subjectId}`);
      await set(marksRef, marks);
      toast({ title: "Success", description: "Marks saved successfully." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout navItems={navItems} title="Marks Entry">
      <PageHeader title="Marks Entry" description="Enter and update student marks." />
      
      {!selectedAssignment ? (
        <Section title="My Subjects">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : assignments.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignments.map((assignment) => (
                <Card key={assignment.id} className="hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => setSelectedAssignment(assignment)}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{assignment.className}</h3>
                        <p className="text-muted-foreground">Section {assignment.sectionName}</p>
                      </div>
                      <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Subject:</p>
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                        {assignment.subjectName}
                      </span>
                    </div>

                    <Button className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground" variant="outline">
                      Enter Marks <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <ContentCard>
              <div className="text-center py-8 text-muted-foreground">
                <ClipboardEdit className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No subjects assigned to you yet.</p>
              </div>
            </ContentCard>
          )}
        </Section>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => { setSelectedAssignment(null); setStudents([]); setMarks({}); setSelectedExam(''); }}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Subjects
            </Button>
            <div>
              <h2 className="text-xl font-semibold">{selectedAssignment.className} - {selectedAssignment.sectionName}</h2>
              <p className="text-muted-foreground">{selectedAssignment.subjectName}</p>
            </div>
          </div>

          <ContentCard>
            <div className="flex flex-col md:flex-row gap-4 items-end mb-6">
              <div className="w-full md:w-1/3 space-y-2">
                <Label>Select Exam</Label>
                <Select value={selectedExam} onValueChange={setSelectedExam}>
                  <SelectTrigger><SelectValue placeholder="Select Exam" /></SelectTrigger>
                  <SelectContent>
                    {exams.map(exam => (
                      <SelectItem key={exam.id} value={exam.id}>{exam.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedExam && (
                <div className="flex gap-4 text-sm text-muted-foreground pb-2">
                  <div>Max MCQ: <span className="font-medium text-foreground">{maxMarks.mcqMarks}</span></div>
                  <div>Max Written: <span className="font-medium text-foreground">{maxMarks.writtenMarks}</span></div>
                </div>
              )}
            </div>

            {selectedExam ? (
              <>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-3 text-left font-medium">Roll No</th>
                        <th className="p-3 text-left font-medium">Student Name</th>
                        <th className="p-3 text-left font-medium w-32">MCQ</th>
                        <th className="p-3 text-left font-medium w-32">Written</th>
                        <th className="p-3 text-left font-medium w-24">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {students.length > 0 ? students.map(student => {
                        const studentMarks = marks[student.id] || { mcq: '', written: '' };
                        const total = (parseFloat(studentMarks.mcq || '0') + parseFloat(studentMarks.written || '0'));
                        return (
                          <tr key={student.id} className="hover:bg-muted/50">
                            <td className="p-3">{student.rollNumber || '-'}</td>
                            <td className="p-3 font-medium">{student.Name}</td>
                            <td className="p-3">
                              <Input 
                                type="number" 
                                value={studentMarks.mcq || ''} 
                                onChange={(e) => handleMarkChange(student.id, 'mcq', e.target.value)}
                                className="h-8"
                                placeholder="0"
                                min="0"
                                max={maxMarks.mcqMarks}
                              />
                            </td>
                            <td className="p-3">
                              <Input 
                                type="number" 
                                value={studentMarks.written || ''} 
                                onChange={(e) => handleMarkChange(student.id, 'written', e.target.value)}
                                className="h-8"
                                placeholder="0"
                                min="0"
                                max={maxMarks.writtenMarks}
                              />
                            </td>
                            <td className="p-3 font-bold text-primary">
                              {total || 0}
                            </td>
                          </tr>
                        );
                      }) : (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-muted-foreground">
                            No students found in this class.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end mt-6">
                  <Button onClick={handleSubmit} disabled={isSubmitting || students.length === 0}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Marks
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                Please select an exam to enter marks.
              </div>
            )}
          </ContentCard>
        </div>
      )}
    </DashboardLayout>
  );
}