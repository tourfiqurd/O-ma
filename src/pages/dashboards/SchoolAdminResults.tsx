import { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader, Section, ContentCard } from '@/components/dashboard/PageHeader';
import { LayoutDashboard, GraduationCap, Users, BookOpen, FileText, BarChart3, Settings, Calculator, Printer, Save, AlertCircle, Eye, X, Share, ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/lib/firebase';
import { ref, query, orderByChild, equalTo, onValue, get, update } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';
import { GradeBadge, StatusBadge } from '@/components/dashboard/StatusBadge';

const navItems = [
  { title: 'Dashboard', href: '/school-admin', icon: LayoutDashboard },
  { title: 'Academic Setup', href: '/school-admin/academic', icon: GraduationCap },
  { title: 'Users', href: '/school-admin/users', icon: Users },
  { title: 'Exams', href: '/school-admin/exams', icon: BookOpen },
  { title: 'Results', href: '/school-admin/results', icon: FileText },
  { title: 'Reports', href: '/school-admin/reports', icon: BarChart3 },
  { title: 'Settings', href: '/school-admin/settings', icon: Settings },
];

interface ExamWeight {
  examId: string;
  weight: number; // Percentage (0-100)
}

interface ProcessedResult {
  studentId: string;
  studentName: string;
  rollNumber: string;
  fatherName: string;
  motherName: string;
  className: string;
  sectionName: string;
  sectionId: string;
  totalMarks: number;
  meritPosition: number;
  subjectResults: Record<string, {
    mcq: number;
    written: number;
    total: number;
    grade: string;
    gpa: number;
    isFailed: boolean;
    isFourth: boolean;
    examBreakdown?: Record<string, { mcq: number; written: number; weight: number }>;
  }>;
  finalGPA: number;
  finalGrade: string;
  isFailed: boolean;
  failedSubjects: string[];
}

export default function SchoolAdminResults() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Selection State
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [isSectionDropdownOpen, setIsSectionDropdownOpen] = useState(false);
  
  // Data State
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]); // From sub_assign
  
  // Configuration State
  const [resultMode, setResultMode] = useState<'single' | 'combined'>('single');
  const [selectedExams, setSelectedExams] = useState<ExamWeight[]>([]);
  const [passMarks, setPassMarks] = useState({ mcq: 33, written: 33 }); // Default 33%
  
  // Output State
  const [results, setResults] = useState<ProcessedResult[]>([]);
  const [calculated, setCalculated] = useState(false);
  const [showMarks, setShowMarks] = useState(false);
  const [selectedStudentResult, setSelectedStudentResult] = useState<ProcessedResult | null>(null);
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);

  // Fetch Initial Data
  useEffect(() => {
    if (user?.schoolId) {
      const classesQuery = query(ref(database, 'classes'), orderByChild('schoolId'), equalTo(user.schoolId));
      onValue(classesQuery, (snapshot) => {
        const data = snapshot.val();
        setClasses(data ? Object.entries(data).map(([k, v]: [string, any]) => ({ id: k, ...v })) : []);
      });

      const examsQuery = query(ref(database, 'exams'), orderByChild('schoolId'), equalTo(user.schoolId));
      onValue(examsQuery, (snapshot) => {
        const data = snapshot.val();
        setExams(data ? Object.entries(data).map(([k, v]: [string, any]) => ({ id: k, ...v })) : []);
      });

      const logoRef = ref(database, `school_registrations/${user.schoolId}/logo`);
      onValue(logoRef, (snapshot) => {
        setSchoolLogo(snapshot.val());
      });
    }
  }, [user?.schoolId]);

  // Fetch Sections when Class Selected
  useEffect(() => {
    if (user?.schoolId && selectedClass) {
      const sectionsQuery = query(ref(database, 'sections'), orderByChild('schoolId'), equalTo(user.schoolId));
      onValue(sectionsQuery, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setSections(Object.entries(data)
            .map(([k, v]: [string, any]) => ({ id: k, ...v }))
            .filter((s: any) => s.classId === selectedClass)
          );
        } else {
          setSections([]);
        }
      });
    }
  }, [user?.schoolId, selectedClass]);

  // Fetch Subjects and Students when Sections Selected
  useEffect(() => {
    if (user?.schoolId && selectedClass && selectedSections.length > 0) {
      // Fetch Subjects Configuration
      const subAssignQuery = query(ref(database, 'sub_assign'), orderByChild('schoolId'), equalTo(user.schoolId));
      onValue(subAssignQuery, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          // Aggregate subjects from all selected sections
          const allSubjectsMap = new Map();
          selectedSections.forEach(secId => {
            const config = Object.values(data).find((c: any) => c.classId === selectedClass && c.sectionId === secId) as any;
            if (config?.subjects) {
              config.subjects.forEach((s: any) => allSubjectsMap.set(s.subjectId, s));
            }
          });
          setSubjects(Array.from(allSubjectsMap.values()));
        } else {
          setSubjects([]);
        }
      });

      // Fetch Students
      const studentsQuery = query(ref(database, 'users'), orderByChild('schoolId'), equalTo(user.schoolId));
      onValue(studentsQuery, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setStudents(Object.entries(data)
            .map(([k, v]: [string, any]) => ({ id: k, ...v }))
            .filter((u: any) => u.role === 'student' && u.classId === selectedClass && selectedSections.includes(u.sectionId))
          );
        } else {
          setStudents([]);
        }
      });
    }
  }, [user?.schoolId, selectedClass, selectedSections]);

  const toggleSection = (sectionId: string) => {
    setSelectedSections(prev => {
      if (prev.includes(sectionId)) {
        return prev.filter(id => id !== sectionId);
      } else {
        return [...prev, sectionId];
      }
    });
  };

  const handleExamSelection = (examId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedExams(prev => [...prev, { examId, weight: resultMode === 'single' ? 100 : 0 }]);
    } else {
      setSelectedExams(prev => prev.filter(e => e.examId !== examId));
    }
  };

  const handleWeightChange = (examId: string, weight: string) => {
    const val = parseFloat(weight) || 0;
    setSelectedExams(prev => prev.map(e => e.examId === examId ? { ...e, weight: val } : e));
  };

  const getGradePoint = (marks: number, maxMarks: number) => {
    const percentage = (marks / maxMarks) * 100;
    if (percentage >= 80) return { grade: 'A+', gpa: 5.00 };
    if (percentage >= 70) return { grade: 'A', gpa: 4.00 };
    if (percentage >= 60) return { grade: 'A-', gpa: 3.50 };
    if (percentage >= 50) return { grade: 'B', gpa: 3.00 };
    if (percentage >= 40) return { grade: 'C', gpa: 2.00 };
    if (percentage >= 33) return { grade: 'D', gpa: 1.00 };
    return { grade: 'F', gpa: 0.00 };
  };

  const calculateResults = async () => {
    if (selectedExams.length === 0) {
      toast({ title: "Error", description: "Please select at least one exam.", variant: "destructive" });
      return;
    }
    if (resultMode === 'combined') {
      const totalWeight = selectedExams.reduce((sum, e) => sum + e.weight, 0);
      if (Math.abs(totalWeight - 100) > 0.1) {
        toast({ title: "Error", description: `Total weight must be 100%. Current: ${totalWeight}%`, variant: "destructive" });
        return;
      }
    }

    setLoading(true);
    const processedResults: ProcessedResult[] = [];

    try {
      // Fetch all marks for selected exams
      const allMarks: Record<string, any> = {}; // examId -> subjectId -> studentId -> marks
      
      const currentClass = classes.find(c => c.id === selectedClass);

      for (const { examId } of selectedExams) {
        allMarks[examId] = {};
        for (const sectionId of selectedSections) {
          const marksRef = ref(database, `marks/${user?.schoolId}/${examId}/${selectedClass}/${sectionId}`);
          const snapshot = await get(marksRef);
          if (snapshot.exists()) {
            const sectionMarks = snapshot.val();
            // Merge section marks into allMarks for this exam
            Object.entries(sectionMarks).forEach(([subId, studentsMarks]: [string, any]) => {
              if (!allMarks[examId][subId]) allMarks[examId][subId] = {};
              Object.assign(allMarks[examId][subId], studentsMarks);
            });
          }
        }
      }

      for (const student of students) {
        const studentSection = sections.find(s => s.id === student.sectionId);
        const studentResult: ProcessedResult = {
          studentId: student.id,
          studentName: student.Name,
          rollNumber: student.rollNumber || '-',
          fatherName: student.fatherName || '-',
          motherName: student.motherName || '-',
          className: currentClass?.name || '-',
          sectionName: studentSection?.name || '-',
          sectionId: student.sectionId,
          totalMarks: 0,
          meritPosition: 0,
          subjectResults: {},
          finalGPA: 0,
          finalGrade: 'F',
          isFailed: false,
          failedSubjects: []
        };

        let totalGPA = 0;
        let mandatorySubjectCount = 0;
        let fourthSubjectBonus = 0;

        for (const subject of subjects) {
          let weightedMCQ = 0;
          let weightedWritten = 0;
          let maxMCQ = parseFloat(subject.mcqMarks || '0');
          let maxWritten = parseFloat(subject.writtenMarks || '0');

          const examBreakdown: Record<string, { mcq: number; written: number; weight: number }> = {};

          // Calculate weighted marks
          selectedExams.forEach(({ examId, weight }) => {
            const subjectMarks = allMarks[examId]?.[subject.subjectId]?.[student.id] || { mcq: '0', written: '0' };
            const mcq = parseFloat(subjectMarks.mcq || '0');
            const written = parseFloat(subjectMarks.written || '0');
            
            examBreakdown[examId] = { mcq, written, weight };

            weightedMCQ += mcq * (weight / 100);
            weightedWritten += written * (weight / 100);
          });

          // Pass Logic
          const mcqPassMark = (maxMCQ * passMarks.mcq) / 100;
          const writtenPassMark = (maxWritten * passMarks.written) / 100;
          
          const isMCQFailed = maxMCQ > 0 && weightedMCQ < mcqPassMark;
          const isWrittenFailed = maxWritten > 0 && weightedWritten < writtenPassMark;
          const isSubjectFailed = isMCQFailed || isWrittenFailed;

          const totalObtained = weightedMCQ + weightedWritten;
          const totalMax = maxMCQ + maxWritten;
          
          studentResult.totalMarks += totalObtained;

          // Determine if this is the 4th subject for this specific student
          const isFourthSubject = student.fourthSubjectId 
            ? student.fourthSubjectId === subject.subjectId 
            : subject.isFourth;

          const { grade, gpa } = isSubjectFailed 
            ? { grade: 'F', gpa: 0.00 } 
            : getGradePoint(totalObtained, totalMax);

          studentResult.subjectResults[subject.subjectId] = {
            mcq: weightedMCQ,
            written: weightedWritten,
            total: totalObtained,
            grade,
            gpa,
            isFailed: isSubjectFailed,
            isFourth: isFourthSubject,
            examBreakdown
          };

          if (isFourthSubject) {
            if (gpa > 2.00) {
              fourthSubjectBonus = gpa - 2.00;
            }
          } else {
            mandatorySubjectCount++;
            totalGPA += gpa;
            if (isSubjectFailed) {
              studentResult.isFailed = true;
              studentResult.failedSubjects.push(subject.subjectName);
            }
          }
        }

        // Final Calculation
        if (studentResult.isFailed) {
          studentResult.finalGPA = 0.00;
          studentResult.finalGrade = 'F';
        } else {
          const totalGPWithBonus = totalGPA + fourthSubjectBonus;
          const calculatedGPA = mandatorySubjectCount > 0 ? (totalGPWithBonus / mandatorySubjectCount) : 0;
          studentResult.finalGPA = parseFloat(Math.min(5.00, calculatedGPA).toFixed(2));
          
          // Map final GPA back to Grade
          if (studentResult.finalGPA >= 5.00) studentResult.finalGrade = 'A+';
          else if (studentResult.finalGPA >= 4.00) studentResult.finalGrade = 'A';
          else if (studentResult.finalGPA >= 3.50) studentResult.finalGrade = 'A-';
          else if (studentResult.finalGPA >= 3.00) studentResult.finalGrade = 'B';
          else if (studentResult.finalGPA >= 2.00) studentResult.finalGrade = 'C';
          else if (studentResult.finalGPA >= 1.00) studentResult.finalGrade = 'D';
          else studentResult.finalGrade = 'F';
        }

        processedResults.push(studentResult);
      }

      // Sort by GPA desc, then Total Marks desc for Merit
      processedResults.sort((a, b) => {
        if (b.finalGPA !== a.finalGPA) return b.finalGPA - a.finalGPA;
        return b.totalMarks - a.totalMarks;
      });

      processedResults.forEach((res, index) => {
        res.meritPosition = index + 1;
      });

      setResults(processedResults);
      setCalculated(true);
      toast({ title: "Success", description: "Results calculated successfully." });
    } catch (error: any) {
      console.error(error);
      toast({ title: "Error", description: "Failed to calculate results.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!calculated || results.length === 0) return;
    
    if (!window.confirm("Are you sure you want to publish these results? They will be visible to students immediately.")) {
      return;
    }

    setLoading(true);
    try {
      const updates: Record<string, any> = {};
      const timestamp = new Date().toISOString();
      
      let examName = "";
      let resultKey = "";
      
      if (resultMode === 'single' && selectedExams.length === 1) {
        const exam = exams.find(e => e.id === selectedExams[0].examId);
        examName = exam ? exam.name : "Exam Result";
        resultKey = selectedExams[0].examId;
      } else {
        examName = "Combined Result";
        resultKey = `combined_${Date.now()}`;
      }

      results.forEach(result => {
        const studentSubjects = subjects.map(sub => {
          const subRes = result.subjectResults[sub.subjectId];
          const maxMCQ = parseFloat(sub.mcqMarks || '0');
          const maxWritten = parseFloat(sub.writtenMarks || '0');
          const maxMarks = maxMCQ + maxWritten;
          
          return {
            subjectId: sub.subjectId,
            subjectName: sub.subjectName,
            marksObtained: subRes ? subRes.total : 0,
            maxMarks: maxMarks,
            grade: subRes ? subRes.grade : 'F',
            mcq: subRes ? subRes.mcq : 0,
            written: subRes ? subRes.written : 0,
            gpa: subRes ? subRes.gpa : 0,
            isFourth: subRes ? subRes.isFourth : false
          };
        });

        const totalMaxMarks = studentSubjects.reduce((acc, s) => acc + s.maxMarks, 0);
        const percentage = totalMaxMarks > 0 ? (result.totalMarks / totalMaxMarks) * 100 : 0;

        const resultData = {
          id: resultKey,
          examId: resultMode === 'single' ? selectedExams[0].examId : null,
          examName: examName,
          class: result.className,
          classId: selectedClass,
          section: result.sectionName, // Use student's specific section
          sectionId: result.sectionId, // Use student's specific section ID
          publishedAt: timestamp,
          percentage: percentage,
          totalMarks: result.totalMarks,
          totalMaxMarks: totalMaxMarks,
          grade: result.finalGrade,
          gpa: result.finalGPA,
          subjects: studentSubjects,
          studentName: result.studentName,
          rollNumber: result.rollNumber,
          fatherName: result.fatherName,
          motherName: result.motherName,
          meritPosition: result.meritPosition
        };

        updates[`/student_results/${result.studentId}/${resultKey}`] = resultData;
      });

      await update(ref(database), updates);
      toast({ title: "Success", description: "Results published successfully." });
    } catch (error: any) {
      console.error(error);
      toast({ title: "Error", description: "Failed to publish results.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout navItems={navItems} title="Results" logo={schoolLogo}>
      <PageHeader title="Result Management" description="Process and publish student results." />
      
      <div className="space-y-6">
        {/* Configuration Section */}
        <Section title="1. Configuration & Selection">
          <ContentCard>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="space-y-2">
                <Label>Class</Label>
                <Select value={selectedClass} onValueChange={(val) => { setSelectedClass(val); setSelectedSections([]); }}>
                  <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
                  <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sections</Label>
                <div className="relative">
                  <div 
                    className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${!selectedClass ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => selectedClass && setIsSectionDropdownOpen(!isSectionDropdownOpen)}
                  >
                    <span className={selectedSections.length === 0 ? "text-muted-foreground" : ""}>
                      {selectedSections.length === 0 
                        ? "Select Sections" 
                        : `${selectedSections.length} section${selectedSections.length > 1 ? 's' : ''} selected`}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </div>
                  {isSectionDropdownOpen && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-popover text-popover-foreground border rounded-md shadow-md z-50 max-h-60 overflow-auto p-1">
                      {sections.length > 0 ? sections.map(s => (
                        <div key={s.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer" onClick={() => toggleSection(s.id)}>
                          <div className={`flex h-4 w-4 items-center justify-center rounded border ${selectedSections.includes(s.id) ? 'bg-primary border-primary text-primary-foreground' : 'border-primary opacity-50'}`}>
                            {selectedSections.includes(s.id) && <Check className="h-3 w-3" />}
                          </div>
                          <span>{s.name}</span>
                        </div>
                      )) : <div className="px-2 py-1.5 text-sm text-muted-foreground">No sections found</div>}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Result Mode</Label>
                <Select value={resultMode} onValueChange={(v: any) => { setResultMode(v); setSelectedExams([]); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single Exam</SelectItem>
                    <SelectItem value="combined">Combined (Weighted)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <Label>Select Exams & Weights</Label>
              <div className="grid gap-3">
                {exams.map(exam => (
                  <div key={exam.id} className="flex items-center gap-4 p-3 border rounded-lg bg-muted/20">
                    <input 
                      type="checkbox" 
                      className="h-4 w-4"
                      checked={selectedExams.some(e => e.examId === exam.id)}
                      onChange={(e) => handleExamSelection(exam.id, e.target.checked)}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{exam.name}</p>
                      <p className="text-xs text-muted-foreground">{new Date(exam.startDate).toLocaleDateString()}</p>
                    </div>
                    {resultMode === 'combined' && selectedExams.some(e => e.examId === exam.id) && (
                      <div className="flex items-center gap-2">
                        <Input 
                          type="number" 
                          className="w-20 h-8" 
                          placeholder="%" 
                          value={selectedExams.find(e => e.examId === exam.id)?.weight || ''}
                          onChange={(e) => handleWeightChange(exam.id, e.target.value)}
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-6 border-t pt-4">
              <div className="space-y-2">
                <Label>MCQ Pass Mark (%)</Label>
                <Input type="number" value={passMarks.mcq} onChange={(e) => setPassMarks({...passMarks, mcq: parseFloat(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label>Written Pass Mark (%)</Label>
                <Input type="number" value={passMarks.written} onChange={(e) => setPassMarks({...passMarks, written: parseFloat(e.target.value)})} />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={calculateResults} disabled={loading || !selectedClass || selectedSections.length === 0}>
                {loading ? <span className="animate-spin mr-2">⏳</span> : <Calculator className="mr-2 h-4 w-4" />}
                Calculate Results
              </Button>
            </div>
          </ContentCard>
        </Section>

        {/* Results Display */}
        {calculated && (
          <Section title="2. Result Sheet" headerAction={
            <div className="flex items-center gap-2">
              <div className="flex items-center space-x-2 bg-muted/50 px-3 py-1.5 rounded-md border">
                <input 
                  type="checkbox" 
                  id="showMarks" 
                  checked={showMarks} 
                  onChange={(e) => setShowMarks(e.target.checked)} 
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="showMarks" className="text-sm cursor-pointer font-normal">Show Marks</Label>
              </div>
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-2" /> Print Sheet
              </Button>
              <Button size="sm" onClick={handlePublish} disabled={loading}>
                <Share className="h-4 w-4 mr-2" /> Publish Result
              </Button>
            </div>
          }>
            <ContentCard noPadding>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-3 text-left font-medium sticky left-0 bg-muted">Student</th>
                      {subjects.map(sub => (
                        <th key={sub.subjectId} className="p-3 text-center font-medium border-l">
                          {sub.subjectName}
                          <div className="text-[10px] font-normal text-muted-foreground">
                            {sub.isFourth ? '(4th)' : '(Main)'}
                          </div>
                        </th>
                      ))}
                      <th className="p-3 text-center font-medium border-l bg-primary/5">Final Result</th>
                      <th className="p-3 text-center font-medium border-l">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {results.map(result => (
                      <tr key={result.studentId} className="hover:bg-muted/50">
                        <td className="p-3 sticky left-0 bg-background">
                          <div className="font-medium">{result.studentName}</div>
                          <div className="text-xs text-muted-foreground">Roll: {result.rollNumber}</div>
                        </td>
                        {subjects.map(sub => {
                          const subRes = result.subjectResults[sub.subjectId];
                          return (
                            <td key={sub.subjectId} className="p-3 text-center border-l">
                              {subRes ? (
                                <div>
                                  {showMarks ? (
                                    <>
                                      <div className="font-semibold">{subRes.total}</div>
                                      <div className="text-[10px] text-muted-foreground whitespace-nowrap">M:{subRes.mcq} W:{subRes.written}</div>
                                      <div className="text-xs font-medium mt-1">{subRes.grade} ({subRes.gpa.toFixed(2)})</div>
                                    </>
                                  ) : (
                                    <>
                                      <div className="font-semibold">{subRes.grade}</div>
                                      <div className="text-xs text-muted-foreground">GPA: {subRes.gpa.toFixed(2)}</div>
                                    </>
                                  )}
                                  {subRes.isFailed && <div className="text-[10px] text-destructive font-medium">Failed</div>}
                                </div>
                              ) : '-'}
                            </td>
                          );
                        })}
                        <td className="p-3 text-center border-l bg-primary/5">
                          <div className="flex flex-col items-center gap-1">
                            <GradeBadge grade={result.finalGrade} />
                            <div className="font-bold text-lg">{result.finalGPA.toFixed(2)}</div>
                            {result.isFailed && (
                              <div className="text-xs text-destructive flex items-center">
                                <AlertCircle className="h-3 w-3 mr-1" /> Fail
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-center border-l">
                          <Button variant="ghost" size="icon" onClick={() => setSelectedStudentResult(result)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ContentCard>
          </Section>
        )}

        {/* Individual Result Modal */}
        {selectedStudentResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 print:p-0">
            <div className="w-full max-w-3xl bg-card border rounded-lg shadow-lg flex flex-col max-h-[90vh] print:max-h-none print:border-0 print:shadow-none">
              <div className="p-6 border-b flex items-center justify-between print:hidden">
                <div>
                  <h2 className="text-xl font-semibold">Individual Result</h2>
                  <p className="text-sm text-muted-foreground">{selectedStudentResult.className} - {selectedStudentResult.sectionName}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => window.print()}>
                    <Printer className="h-4 w-4 mr-2" /> Print
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedStudentResult(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="p-8 overflow-y-auto print:overflow-visible">
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
                  <h1 className="text-2xl font-bold uppercase tracking-wide mb-2">Academic Transcript</h1>
                  <div className="text-muted-foreground">
                    {exams.filter(e => selectedExams.some(se => se.examId === e.id)).map(e => e.name).join(' & ')}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8 p-4 bg-transparent rounded-lg border relative z-10">
                  <div>
                    <p className="text-sm text-muted-foreground">Student Name</p>
                    <p className="font-semibold">{selectedStudentResult.studentName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Roll Number</p>
                    <p className="font-semibold">{selectedStudentResult.rollNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Merit Position</p>
                    <p className="font-semibold">#{selectedStudentResult.meritPosition}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Father's Name</p>
                    <p className="font-semibold">{selectedStudentResult.fatherName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mother's Name</p>
                    <p className="font-semibold">{selectedStudentResult.motherName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Class & Section</p>
                    <p className="font-semibold">{selectedStudentResult.className} - {selectedStudentResult.sectionName}</p>
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden mb-8 relative z-10 bg-transparent">
                  <table className="w-full text-sm">
                    <thead className="bg-transparent">
                      <tr>
                        <th className="p-3 text-left" rowSpan={resultMode === 'combined' ? 2 : 1}>Subject</th>
                        {resultMode === 'combined' ? (
                          selectedExams.map(se => {
                            const examName = exams.find(e => e.id === se.examId)?.name || 'Exam';
                            return (
                              <th key={se.examId} className="p-3 text-center border-l" colSpan={2}>
                                {examName} <br/>
                                <span className="text-[10px] font-normal text-muted-foreground">({se.weight}%)</span>
                              </th>
                            );
                          })
                        ) : (
                          <>
                            <th className="p-3 text-center">MCQ</th>
                            <th className="p-3 text-center">Written</th>
                          </>
                        )}
                        <th className="p-3 text-center border-l" rowSpan={resultMode === 'combined' ? 2 : 1}>Total</th>
                        <th className="p-3 text-center" rowSpan={resultMode === 'combined' ? 2 : 1}>Grade</th>
                        <th className="p-3 text-center" rowSpan={resultMode === 'combined' ? 2 : 1}>GPA</th>
                      </tr>
                      {resultMode === 'combined' && (
                        <tr>
                          {selectedExams.map(se => (
                            <>
                              <th key={`${se.examId}-mcq`} className="p-1 text-center text-xs text-muted-foreground border-l border-t bg-muted/10">MCQ</th>
                              <th key={`${se.examId}-written`} className="p-1 text-center text-xs text-muted-foreground border-t bg-muted/10">Written</th>
                            </>
                          ))}
                        </tr>
                      )}
                    </thead>
                    <tbody className="divide-y">
                      {subjects.map(sub => {
                        const res = selectedStudentResult.subjectResults[sub.subjectId];
                        return (
                          <tr key={sub.subjectId}>
                            <td className="p-3 font-medium">
                              {sub.subjectName}
                              {res?.isFourth && <span className="ml-2 text-xs text-muted-foreground">(4th Subject)</span>}
                            </td>
                            {resultMode === 'combined' ? (
                              selectedExams.map(se => {
                                const breakdown = res?.examBreakdown?.[se.examId];
                                return (
                                  <>
                                    <td key={`${se.examId}-mcq`} className="p-3 text-center border-l text-xs">
                                      {breakdown ? breakdown.mcq : '-'}
                                    </td>
                                    <td key={`${se.examId}-written`} className="p-3 text-center text-xs">
                                      {breakdown ? breakdown.written : '-'}
                                    </td>
                                  </>
                                );
                              })
                            ) : (
                              <>
                                <td className="p-3 text-center">{res?.mcq !== undefined ? res.mcq : '-'}</td>
                                <td className="p-3 text-center">{res?.written !== undefined ? res.written : '-'}</td>
                              </>
                            )}
                            <td className="p-3 text-center font-medium border-l">{res?.total !== undefined ? Math.round(res.total) : '-'}</td>
                            <td className="p-3 text-center"><GradeBadge grade={res?.grade || '-'} /></td>
                            <td className="p-3 text-center">{res?.gpa.toFixed(2) || '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mb-8 p-4 bg-transparent rounded-lg border text-sm relative z-10">
                  <h3 className="font-semibold mb-2">Calculation Breakdown</h3>
                  
                  {resultMode === 'combined' && (
                    <div className="mb-4 p-3 bg-muted/30 rounded border text-xs">
                      <p className="font-semibold mb-1">Combined Result Calculation:</p>
                      <p>Total Marks = {selectedExams.map(se => {
                        const examName = exams.find(e => e.id === se.examId)?.name || 'Exam';
                        return `(${examName} × ${se.weight}%)`;
                      }).join(' + ')}</p>
                    </div>
                  )}

                  {(() => {
                    const subjects = Object.values(selectedStudentResult.subjectResults);
                    const mandatorySubjects = subjects.filter(s => !s.isFourth);
                    const fourthSubject = subjects.find(s => s.isFourth);
                    
                    const totalMandatoryGPA = mandatorySubjects.reduce((sum, s) => sum + s.gpa, 0);
                    const mandatoryCount = mandatorySubjects.length;
                    
                    let fourthSubjectBonus = 0;
                    if (fourthSubject && fourthSubject.gpa > 2.00) {
                      fourthSubjectBonus = fourthSubject.gpa - 2.00;
                    }

                    const calculatedGPA = mandatoryCount > 0 ? (totalMandatoryGPA + fourthSubjectBonus) / mandatoryCount : 0;

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
                                <p><span className="text-muted-foreground">4th Subject GPA:</span> {fourthSubject.gpa.toFixed(2)}</p>
                                <p><span className="text-muted-foreground">Bonus Points:</span> {fourthSubjectBonus.toFixed(2)} <span className="text-xs text-muted-foreground">({fourthSubject.gpa.toFixed(2)} - 2.00)</span></p>
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
                          {selectedStudentResult.isFailed && (
                            <p className="text-destructive font-medium mt-1">
                              Result is Fail because student failed in: {selectedStudentResult.failedSubjects.join(', ')}
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
                        <span className="text-2xl font-bold">{selectedStudentResult.finalGPA.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-end gap-4">
                        <span className="text-sm text-muted-foreground">Final Grade</span>
                        <GradeBadge grade={selectedStudentResult.finalGrade} className="text-lg px-3 py-1" />
                      </div>
                      {selectedStudentResult.isFailed && (
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
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}