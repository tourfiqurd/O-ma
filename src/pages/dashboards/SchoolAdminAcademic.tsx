import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader, Section, ContentCard } from '@/components/dashboard/PageHeader';
import { LayoutDashboard, GraduationCap, Users, BookOpen, FileText, BarChart3, Settings, Plus, Loader2, Trash2, UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/dashboard/DataTable';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/lib/firebase';
import { ref, push, set, onValue, query, orderByChild, equalTo, remove } from 'firebase/database';

const navItems = [
  { title: 'Dashboard', href: '/school-admin', icon: LayoutDashboard },
  { title: 'Academic Setup', href: '/school-admin/academic', icon: GraduationCap },
  { title: 'Users', href: '/school-admin/users', icon: Users },
  { title: 'Exams', href: '/school-admin/exams', icon: BookOpen },
  { title: 'Results', href: '/school-admin/results', icon: FileText },
  { title: 'Reports', href: '/school-admin/reports', icon: BarChart3 },
  { title: 'Settings', href: '/school-admin/settings', icon: Settings },
];

interface Class {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
  classId?: string;
}

interface ClassSection {
  id: string;
  name: string;
  classId: string;
  className: string;
}

interface Assignment {
  id: string;
  teacherId: string;
  teacherName: string;
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  subjectId: string;
  subjectName: string;
}

interface SubAssignment {
  id: string;
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  subjects: {
    subjectId: string;
    subjectName: string;
    isFourth: boolean;
    mcqMarks: string;
    writtenMarks: string;
  }[];
}

export default function SchoolAdminAcademic() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [isAddingClass, setIsAddingClass] = useState(false);
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [isAssigningSubjects, setIsAssigningSubjects] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sections, setSections] = useState<ClassSection[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [subAssignments, setSubAssignments] = useState<SubAssignment[]>([]);

  const [newClassName, setNewClassName] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');

  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionClassId, setNewSectionClassId] = useState('');

  const [assignTeacherId, setAssignTeacherId] = useState('');
  const [assignClassId, setAssignClassId] = useState('');
  const [assignSectionId, setAssignSectionId] = useState('');
  const [assignSubjectId, setAssignSubjectId] = useState('');

  const [assignSubClassId, setAssignSubClassId] = useState('');
  const [assignSubSectionId, setAssignSubSectionId] = useState('');
  const [subjectRows, setSubjectRows] = useState<{id: string, isFourth: boolean, mcqMarks: string, writtenMarks: string}[]>([{id: '', isFourth: false, mcqMarks: '0', writtenMarks: '100'}]);

  useEffect(() => {
    if (!user?.schoolId) return;
    const classesQuery = query(ref(database, 'classes'), orderByChild('schoolId'), equalTo(user.schoolId));
    const unsubscribe = onValue(classesQuery, (snapshot) => {
      const data = snapshot.val();
      const loadedClasses = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      setClasses(loadedClasses);
    });
    return () => unsubscribe();
  }, [user?.schoolId]);

  useEffect(() => {
    if (!user?.schoolId) return;
    const subjectsQuery = query(ref(database, 'subjects'), orderByChild('schoolId'), equalTo(user.schoolId));
    const unsubscribe = onValue(subjectsQuery, (snapshot) => {
      const data = snapshot.val();
      const loadedSubjects = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      setSubjects(loadedSubjects);
    });
    return () => unsubscribe();
  }, [user?.schoolId]);

  useEffect(() => {
    if (!user?.schoolId) return;
    const sectionsQuery = query(ref(database, 'sections'), orderByChild('schoolId'), equalTo(user.schoolId));
    const unsubscribe = onValue(sectionsQuery, (snapshot) => {
      const data = snapshot.val();
      const loaded = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      setSections(loaded);
    });
    return () => unsubscribe();
  }, [user?.schoolId]);

  useEffect(() => {
    if (!user?.schoolId) return;
    const usersRef = ref(database, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const teacherList = Object.entries(data)
          .map(([key, value]: [string, any]) => ({ id: key, ...value }))
          .filter((u: any) => u.role === 'teacher' && u.schoolId === user.schoolId);
        setTeachers(teacherList);
      }
    });
    return () => unsubscribe();
  }, [user?.schoolId]);

  useEffect(() => {
    if (!user?.schoolId) return;
    const assignQuery = query(ref(database, 'assign-teacher'), orderByChild('schoolId'), equalTo(user.schoolId));
    const unsubscribe = onValue(assignQuery, (snapshot) => {
      const data = snapshot.val();
      const loadedAssignments = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      setAssignments(loadedAssignments);
    });
    return () => unsubscribe();
  }, [user?.schoolId]);

  useEffect(() => {
    if (!user?.schoolId) return;
    const subAssignQuery = query(ref(database, 'sub_assign'), orderByChild('schoolId'), equalTo(user.schoolId));
    const unsubscribe = onValue(subAssignQuery, (snapshot) => {
      const data = snapshot.val();
      const loaded = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
      setSubAssignments(loaded);
    });
    return () => unsubscribe();
  }, [user?.schoolId]);

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim() || !user?.schoolId) return;
    setIsLoading(true);
    try {
      await set(push(ref(database, 'classes')), {
        name: newClassName,
        schoolId: user.schoolId,
      });
      toast({ title: "Success", description: "Class added successfully." });
      setNewClassName('');
      setIsAddingClass(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim() || !user?.schoolId) return;
    setIsLoading(true);
    try {
      await set(push(ref(database, 'subjects')), {
        name: newSubjectName,
        schoolId: user.schoolId,
      });
      toast({ title: "Success", description: "Subject added successfully." });
      setNewSubjectName('');
      setIsAddingSubject(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName.trim() || !newSectionClassId || !user?.schoolId) return;
    
    const cls = classes.find(c => c.id === newSectionClassId);
    if (!cls) return;

    setIsLoading(true);
    try {
      await set(push(ref(database, 'sections')), {
        name: newSectionName,
        classId: newSectionClassId,
        className: cls.name,
        schoolId: user.schoolId,
      });
      toast({ title: "Success", description: "Section added successfully." });
      setNewSectionName('');
      setNewSectionClassId('');
      setIsAddingSection(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubjectRow = () => {
    setSubjectRows([...subjectRows, {id: '', isFourth: false, mcqMarks: '0', writtenMarks: '100'}]);
  };

  const handleRemoveSubjectRow = (index: number) => {
    const newRows = [...subjectRows];
    newRows.splice(index, 1);
    setSubjectRows(newRows);
  };

  const handleSubjectRowChange = (index: number, field: 'id' | 'isFourth' | 'mcqMarks' | 'writtenMarks', value: any) => {
    const newRows = [...subjectRows];
    // @ts-ignore
    newRows[index][field] = value;
    setSubjectRows(newRows);
  };

  const handleSubmitSubjectAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignSubClassId || !assignSubSectionId || subjectRows.length === 0 || !user?.schoolId) return;
    
    const cls = classes.find(c => c.id === assignSubClassId);
    const sec = sections.find(s => s.id === assignSubSectionId);
    if (!cls || !sec) return;

    const formattedSubjects = subjectRows.map(row => {
      const sub = subjects.find(s => s.id === row.id);
      return {
        subjectId: row.id,
        subjectName: sub?.name || '',
        isFourth: row.isFourth,
        mcqMarks: row.mcqMarks,
        writtenMarks: row.writtenMarks
      };
    }).filter(s => s.subjectId);

    if (formattedSubjects.length === 0) {
      toast({ title: "Error", description: "Please select at least one subject.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await set(push(ref(database, 'sub_assign')), {
        schoolId: user.schoolId,
        classId: cls.id,
        className: cls.name,
        sectionId: sec.id,
        sectionName: sec.name,
        subjects: formattedSubjects
      });
      toast({ title: "Success", description: "Subjects assigned to class successfully." });
      setIsAssigningSubjects(false);
      setAssignSubClassId('');
      setAssignSubSectionId('');
      setSubjectRows([{id: '', isFourth: false, mcqMarks: '0', writtenMarks: '100'}]);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTeacherId || !assignClassId || !assignSectionId || !assignSubjectId || !user?.schoolId) return;
    
    const teacher = teachers.find(t => t.id === assignTeacherId);
    const cls = classes.find(c => c.id === assignClassId);
    const sec = sections.find(s => s.id === assignSectionId);
    const subject = subjects.find(s => s.id === assignSubjectId);

    if (!teacher || !cls || !sec || !subject) return;

    setIsLoading(true);
    try {
      await set(push(ref(database, 'assign-teacher')), {
        teacherId: teacher.id,
        teacherName: teacher.Name,
        classId: cls.id,
        className: cls.name,
        sectionId: sec.id,
        sectionName: sec.name,
        subjectId: subject.id,
        subjectName: subject.name,
        schoolId: user.schoolId
      });
      toast({ title: "Success", description: "Teacher assigned successfully." });
      setIsAssigning(false);
      setAssignTeacherId('');
      setAssignClassId('');
      setAssignSectionId('');
      setAssignSubjectId('');
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await remove(ref(database, `classes/${id}`));
        toast({ title: "Success", description: "Class deleted successfully." });
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await remove(ref(database, `subjects/${id}`));
        toast({ title: "Success", description: "Subject deleted successfully." });
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      try {
        await remove(ref(database, `sections/${id}`));
        toast({ title: "Success", description: "Section deleted successfully." });
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this assignment?')) {
      try {
        await remove(ref(database, `assign-teacher/${id}`));
        toast({ title: "Success", description: "Assignment removed successfully." });
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    }
  };

  const handleDeleteSubAssignment = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await remove(ref(database, `sub_assign/${id}`));
        toast({ title: "Success", description: "Assignment deleted." });
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    }
  };

  const classColumns = [
    {
      key: 'name',
      header: 'Class Name',
      cell: (row: Class) => row.name,
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (row: Class) => (
        <Button variant="ghost" size="icon" onClick={() => handleDeleteClass(row.id)} className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10">
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const sectionColumns = [
    {
      key: 'className',
      header: 'Class',
      cell: (row: ClassSection) => row.className,
    },
    {
      key: 'name',
      header: 'Section',
      cell: (row: ClassSection) => row.name,
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (row: ClassSection) => (
        <Button variant="ghost" size="icon" onClick={() => handleDeleteSection(row.id)} className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10">
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const subjectColumns = [
    {
      key: 'name',
      header: 'Subject Name',
      cell: (row: Subject) => row.name,
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (row: Subject) => (
        <Button variant="ghost" size="icon" onClick={() => handleDeleteSubject(row.id)} className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10">
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const assignmentColumns = [
    {
      key: 'teacherName',
      header: 'Teacher',
      cell: (row: Assignment) => row.teacherName,
    },
    {
      key: 'className',
      header: 'Class',
      cell: (row: Assignment) => row.className,
    },
    {
      key: 'sectionName',
      header: 'Section',
      cell: (row: Assignment) => row.sectionName,
    },
    {
      key: 'subjectName',
      header: 'Subject',
      cell: (row: Assignment) => row.subjectName,
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (row: Assignment) => (
        <Button variant="ghost" size="icon" onClick={() => handleDeleteAssignment(row.id)} className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10">
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const subAssignColumns = [
    { 
      key: 'classSection', 
      header: 'Class & Section', 
      cell: (row: SubAssignment) => `${row.className} section (${row.sectionName})` 
    },
    { 
      key: 'subjects', 
      header: 'Subjects', 
      cell: (row: SubAssignment) => (
        <div className="flex flex-col gap-1">
          {row.subjects && row.subjects.map((s, i) => (
            <div key={i} className="text-xs">
              <span className="font-medium">{s.subjectName}</span> - Mcq mark - {s.mcqMarks} Written mark - {s.writtenMarks} {s.isFourth && '(4th)'}
            </div>
          ))}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (row: SubAssignment) => (
        <Button variant="ghost" size="icon" onClick={() => handleDeleteSubAssignment(row.id)} className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10">
          <Trash2 className="h-4 w-4" />
        </Button>
      )
    }
  ];

  return (
    <DashboardLayout navItems={navItems} title="Academic Setup">
      <PageHeader title="Academic Setup" description="Manage classes, subjects, and academic years." />
      
      <Section title="Classes" headerAction={
        <Button onClick={() => setIsAddingClass(!isAddingClass)} variant={isAddingClass ? "outline" : "default"}>
          {isAddingClass ? 'Cancel' : <><Plus className="h-4 w-4 mr-2" /> Add Class</>}
        </Button>
      }>
        {isAddingClass && (
          <ContentCard>
            <form onSubmit={handleAddClass} className="flex items-end gap-4">
              <div className="flex-grow space-y-2">
                <Label htmlFor="className">New Class Name</Label>
                <Input id="className" value={newClassName} onChange={(e) => setNewClassName(e.target.value)} placeholder="e.g., Class 10, Grade 5" required />
              </div>
              <Button type="submit" disabled={isLoading}>{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}</Button>
            </form>
          </ContentCard>
        )}
        <ContentCard noPadding={classes.length > 0}>
          <DataTable data={classes} columns={classColumns} emptyMessage="No classes found. Add a new class to get started." />
        </ContentCard>
      </Section><br />

      <Section title="Sections" headerAction={
        <Button onClick={() => setIsAddingSection(!isAddingSection)} variant={isAddingSection ? "outline" : "default"}>
          {isAddingSection ? 'Cancel' : <><Plus className="h-4 w-4 mr-2" /> Add Section</>}
        </Button>
      }>
        {isAddingSection && (
          <ContentCard>
            <form onSubmit={handleAddSection} className="grid md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="sectionClassSelect">Class</Label>
                <Select value={newSectionClassId} onValueChange={setNewSectionClassId} required>
                  <SelectTrigger id="sectionClassSelect"><SelectValue placeholder="Select Class" /></SelectTrigger>
                  <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sectionName">Section Name</Label>
                <Input id="sectionName" value={newSectionName} onChange={(e) => setNewSectionName(e.target.value)} placeholder="e.g., A, B, Rose" required />
              </div>
              <Button type="submit" disabled={isLoading}>{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}</Button>
            </form>
          </ContentCard>
        )}
        <ContentCard noPadding={sections.length > 0}>
          <DataTable data={sections} columns={sectionColumns} emptyMessage="No sections found. Add a new section to get started." />
        </ContentCard>
      </Section><br />

      <Section title="Subjects" headerAction={
        <Button onClick={() => setIsAddingSubject(!isAddingSubject)} variant={isAddingSubject ? "outline" : "default"}>
          {isAddingSubject ? 'Cancel' : <><Plus className="h-4 w-4 mr-2" /> Add Subject</>}
        </Button>
      }>
        {isAddingSubject && (
          <ContentCard>
            <form onSubmit={handleAddSubject} className="flex items-end gap-4">
              <div className="flex-grow space-y-2">
                <Label htmlFor="subjectName">New Subject Name</Label>
                <Input id="subjectName" value={newSubjectName} onChange={(e) => setNewSubjectName(e.target.value)} placeholder="e.g., Mathematics, Physics" required />
              </div>
              <Button type="submit" disabled={isLoading}>{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}</Button>
            </form>
          </ContentCard>
        )}
        <ContentCard noPadding={subjects.length > 0}>
          <DataTable data={subjects} columns={subjectColumns} emptyMessage="No subjects found. Add a new subject to get started." />
        </ContentCard>
      </Section><br />

      <Section title="Subject Assignment" headerAction={
        <Button onClick={() => setIsAssigningSubjects(!isAssigningSubjects)} variant={isAssigningSubjects ? "outline" : "default"}>
          {isAssigningSubjects ? 'Cancel' : <><Plus className="h-4 w-4 mr-2" /> Assign Subjects</>}
        </Button>
      }>
        {isAssigningSubjects && (
          <ContentCard>
            <form onSubmit={handleSubmitSubjectAssignment} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subClassSelect">Class</Label>
                  <Select value={assignSubClassId} onValueChange={setAssignSubClassId} required>
                    <SelectTrigger id="subClassSelect"><SelectValue placeholder="Select Class" /></SelectTrigger>
                    <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subSectionSelect">Section</Label>
                  <Select value={assignSubSectionId} onValueChange={setAssignSubSectionId} required disabled={!assignSubClassId}>
                    <SelectTrigger id="subSectionSelect"><SelectValue placeholder="Select Section" /></SelectTrigger>
                    <SelectContent>{sections.filter(s => s.classId === assignSubClassId).map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Subjects</Label>
                {subjectRows.map((row, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-grow">
                      <Select value={row.id} onValueChange={(val) => handleSubjectRowChange(index, 'id', val)}>
                        <SelectTrigger><SelectValue placeholder="Select Subject" /></SelectTrigger>
                        <SelectContent>{subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="w-24">
                      <Input 
                        type="number" 
                        placeholder="Mcq mark" 
                        value={row.mcqMarks} 
                        onChange={(e) => handleSubjectRowChange(index, 'mcqMarks', e.target.value)} 
                        title="MCQ Marks"
                      />
                    </div>
                    <div className="w-24">
                      <Input 
                        type="number" 
                        placeholder="Written mark" 
                        value={row.writtenMarks} 
                        onChange={(e) => handleSubjectRowChange(index, 'writtenMarks', e.target.value)} 
                        title="Written Marks"
                      />
                    </div>
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <input 
                        type="checkbox" 
                        id={`fourth-${index}`}
                        checked={row.isFourth}
                        onChange={(e) => handleSubjectRowChange(index, 'isFourth', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor={`fourth-${index}`} className="text-sm font-normal cursor-pointer">4th Subject</Label>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveSubjectRow(index)} disabled={subjectRows.length === 1}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={handleAddSubjectRow} className="mt-2"><Plus className="h-3 w-3 mr-2" /> Add Another Subject</Button>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Assignments'}</Button>
            </form>
          </ContentCard>
        )}
        <ContentCard noPadding={subAssignments.length > 0}>
          <DataTable data={subAssignments} columns={subAssignColumns} emptyMessage="No subject assignments found." />
        </ContentCard>
      </Section><br />

      <Section title="Teacher Assignments" headerAction={
        <Button onClick={() => setIsAssigning(!isAssigning)} variant={isAssigning ? "outline" : "default"}>
          {isAssigning ? 'Cancel' : <><UserPlus className="h-4 w-4 mr-2" /> Assign Teacher</>}
        </Button>
      }>
        {isAssigning && (
          <ContentCard>
            <form onSubmit={handleAssignTeacher} className="grid md:grid-cols-5 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="teacherSelect">Teacher</Label>
                <Select value={assignTeacherId} onValueChange={setAssignTeacherId} required>
                  <SelectTrigger id="teacherSelect"><SelectValue placeholder="Select Teacher" /></SelectTrigger>
                  <SelectContent>{teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.Name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignClassSelect">Class</Label>
                <Select value={assignClassId} onValueChange={(val) => { setAssignClassId(val); setAssignSectionId(''); }} required>
                  <SelectTrigger id="assignClassSelect"><SelectValue placeholder="Select Class" /></SelectTrigger>
                  <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignSectionSelect">Section</Label>
                <Select value={assignSectionId} onValueChange={setAssignSectionId} required disabled={!assignClassId}>
                  <SelectTrigger id="assignSectionSelect"><SelectValue placeholder="Select Section" /></SelectTrigger>
                  <SelectContent>{sections.filter(s => s.classId === assignClassId).map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignSubjectSelect">Subject</Label>
                <Select value={assignSubjectId} onValueChange={setAssignSubjectId} required>
                  <SelectTrigger id="assignSubjectSelect"><SelectValue placeholder="Select Subject" /></SelectTrigger>
                  <SelectContent>{subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={isLoading}>{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Assign'}</Button>
            </form>
          </ContentCard>
        )}
        <ContentCard noPadding={assignments.length > 0}>
          <DataTable data={assignments} columns={assignmentColumns} emptyMessage="No assignments found." />
        </ContentCard>
      </Section>
    </DashboardLayout>
  );
}