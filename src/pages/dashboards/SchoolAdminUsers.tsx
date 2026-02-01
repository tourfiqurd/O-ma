import { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader, Section, ContentCard } from '@/components/dashboard/PageHeader';
import { LayoutDashboard, GraduationCap, Users, BookOpen, FileText, BarChart3, Settings, Plus, Loader2, Pencil, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/dashboard/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { database, firebaseConfig } from '@/lib/firebase';
import { ref, set, onValue, query, orderByChild, equalTo, remove, update } from 'firebase/database';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

const navItems = [
  { title: 'Dashboard', href: '/school-admin', icon: LayoutDashboard },
  { title: 'Academic Setup', href: '/school-admin/academic', icon: GraduationCap },
  { title: 'Users', href: '/school-admin/users', icon: Users },
  { title: 'Exams', href: '/school-admin/exams', icon: BookOpen },
  { title: 'Results', href: '/school-admin/results', icon: FileText },
  { title: 'Reports', href: '/school-admin/reports', icon: BarChart3 },
  { title: 'Settings', href: '/school-admin/settings', icon: Settings },
];

export default function SchoolAdminUsers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Teachers State
  const [teachers, setTeachers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  // Students State
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [subAssignments, setSubAssignments] = useState<any[]>([]);
  
  const [studentFormData, setStudentFormData] = useState({
    name: '',
    fatherName: '',
    motherName: '',
    email: '',
    password: '',
    classId: '',
    sectionId: '',
    fourthSubjectId: '',
    rollNumber: ''
  });

  useEffect(() => {
    if (user?.schoolId) {
      const classesQuery = query(ref(database, 'classes'), orderByChild('schoolId'), equalTo(user.schoolId));
      onValue(classesQuery, (snapshot) => setClasses(snapshot.val() ? Object.keys(snapshot.val()).map(key => ({ id: key, ...snapshot.val()[key] })) : []));

      const sectionsQuery = query(ref(database, 'sections'), orderByChild('schoolId'), equalTo(user.schoolId));
      onValue(sectionsQuery, (snapshot) => setSections(snapshot.val() ? Object.keys(snapshot.val()).map(key => ({ id: key, ...snapshot.val()[key] })) : []));

      const subAssignQuery = query(ref(database, 'sub_assign'), orderByChild('schoolId'), equalTo(user.schoolId));
      onValue(subAssignQuery, (snapshot) => setSubAssignments(snapshot.val() ? Object.keys(snapshot.val()).map(key => ({ id: key, ...snapshot.val()[key] })) : []));
    }
  }, [user?.schoolId]);


  useEffect(() => {
    if (user?.schoolId) {
      const usersRef = ref(database, 'users');
      const unsubscribe = onValue(usersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const allUsers = Object.entries(data)
            .map(([key, value]: [string, any]) => ({
              id: key,
              ...value,
            }));
          setTeachers(allUsers.filter((u: any) => u.role === 'teacher' && u.schoolId === user.schoolId));
          setStudents(allUsers.filter((u: any) => u.role === 'student' && u.schoolId === user.schoolId));
        } else {
          setTeachers([]);
          setStudents([]);
        }
      });
      return () => unsubscribe();
    }
  }, [user?.schoolId]);

  const availableFourthSubjects = useMemo(() => {
    if (!studentFormData.classId || !studentFormData.sectionId) return [];
    const assignment = subAssignments.find(
      sa => sa.classId === studentFormData.classId && sa.sectionId === studentFormData.sectionId
    );
    if (!assignment || !assignment.subjects) return [];
    return assignment.subjects.filter((s: any) => s.isFourth);
  }, [subAssignments, studentFormData.classId, studentFormData.sectionId]);

  const handleEditTeacher = (teacher: any) => {
    setFormData({
      name: teacher.Name,
      email: teacher.email,
      password: '' // Password cannot be retrieved
    });
    setEditingId(teacher.id);
    setIsAdding(true);
    setIsAddingStudent(false);
  };

  const handleEditStudent = (student: any) => {
    setStudentFormData({
      name: student.Name,
      fatherName: student.fatherName || '',
      motherName: student.motherName || '',
      email: student.email,
      password: '',
      classId: student.classId || '',
      sectionId: student.sectionId || '',
      fourthSubjectId: student.fourthSubjectId || '',
      rollNumber: student.rollNumber || ''
    });
    setEditingId(student.id);
    setIsAddingStudent(true);
    setIsAdding(false);
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user? This will remove their access.')) {
      try {
        await remove(ref(database, `users/${id}`));
        toast({ title: "Success", description: "User deleted successfully." });
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    }
  };

  const resetTeacherForm = () => {
    setFormData({ name: '', email: '', password: '' });
    setEditingId(null);
    setIsAdding(false);
  };

  const resetStudentForm = () => {
    setStudentFormData({ name: '', fatherName: '', motherName: '', email: '', password: '', classId: '', sectionId: '', fourthSubjectId: '', rollNumber: '' });
    setEditingId(null);
    setIsAddingStudent(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.schoolId) {
      toast({
        title: "Error",
        description: "School ID is missing from your profile.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    if (editingId) {
      try {
        const userRef = ref(database, `users/${editingId}`);
        await update(userRef, { Name: formData.name });
        toast({ title: "Success", description: "Teacher account updated." });
        resetTeacherForm();
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } finally { setIsLoading(false); }
      return;
    }

    // Initialize a secondary app to create the user without logging out the current admin
    const secondaryApp = initializeApp(firebaseConfig, "Secondary");
    const secondaryAuth = getAuth(secondaryApp);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth, 
        formData.email, 
        formData.password
      );
      
      // Store user data in Realtime Database
      const userRef = ref(database, `users/${userCredential.user.uid}`);
      await set(userRef, {
        Name: formData.name,
        email: formData.email,
        role: 'teacher',
        schoolId: user.schoolId
      });

      await signOut(secondaryAuth);
      
      toast({
        title: "Success",
        description: "Teacher account created successfully.",
      });
      
      resetTeacherForm();
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: error.message || "Failed to create teacher account.",
        variant: "destructive",
      });
    } finally {
      await deleteApp(secondaryApp);
      setIsLoading(false);
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.schoolId) return;

    setIsLoading(true);

    if (editingId) {
      try {
        const cls = classes.find(c => c.id === studentFormData.classId);
        const sec = sections.find(s => s.id === studentFormData.sectionId);
        const fourthSub = availableFourthSubjects.find((s: any) => s.subjectId === studentFormData.fourthSubjectId);
        const userRef = ref(database, `users/${editingId}`);
        await update(userRef, {
          Name: studentFormData.name,
          fatherName: studentFormData.fatherName,
          motherName: studentFormData.motherName,
          classId: studentFormData.classId,
          className: cls?.name || '',
          sectionId: studentFormData.sectionId,
          sectionName: sec?.name || '',
          fourthSubjectId: studentFormData.fourthSubjectId || null,
          fourthSubjectName: fourthSub?.subjectName || null,
          rollNumber: studentFormData.rollNumber
        });
        toast({ title: "Success", description: "Student account updated." });
        resetStudentForm();
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } finally { setIsLoading(false); }
      return;
    }

    const secondaryApp = initializeApp(firebaseConfig, "Secondary");
    const secondaryAuth = getAuth(secondaryApp);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth, 
        studentFormData.email, 
        studentFormData.password
      );
      
      const cls = classes.find(c => c.id === studentFormData.classId);
      const sec = sections.find(s => s.id === studentFormData.sectionId);
      const fourthSub = availableFourthSubjects.find((s: any) => s.subjectId === studentFormData.fourthSubjectId);

      const userRef = ref(database, `users/${userCredential.user.uid}`);
      await set(userRef, {
        Name: studentFormData.name,
        fatherName: studentFormData.fatherName,
        motherName: studentFormData.motherName,
        email: studentFormData.email,
        role: 'student',
        schoolId: user.schoolId,
        classId: studentFormData.classId,
        className: cls?.name || '',
        sectionId: studentFormData.sectionId,
        sectionName: sec?.name || '',
        fourthSubjectId: studentFormData.fourthSubjectId || null,
        fourthSubjectName: fourthSub?.subjectName || null,
        rollNumber: studentFormData.rollNumber
      });

      await signOut(secondaryAuth);
      
      toast({ title: "Success", description: "Student account created successfully." });
      resetStudentForm();
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: error.message || "Failed to create student account.",
        variant: "destructive",
      });
    } finally {
      await deleteApp(secondaryApp);
      setIsLoading(false);
    }
  };

  const columns = [
    {
      key: 'Name',
      header: 'Name',
      cell: (row: any) => <div className="font-medium">{row.Name}</div>
    },
    {
      key: 'email',
      header: 'Email',
      cell: (row: any) => row.email
    },
    {
      key: 'role',
      header: 'Role',
      cell: (row: any) => <span className="capitalize">{row.role}</span>
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (row: any) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleEditTeacher(row)}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(row.id)} className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
        </div>
      )
    }
  ];

  const studentColumns = [
    {
      key: 'Name',
      header: 'Name',
      cell: (row: any) => (
        <div>
          <div className="font-medium">{row.Name}</div>
          <div className="text-xs text-muted-foreground">Roll: {row.rollNumber || '-'}</div>
          <div className="text-xs text-muted-foreground">Class: {row.className} - {row.sectionName}</div>
          {row.fourthSubjectName && (
            <div className="text-[10px] text-primary mt-0.5">4th Subject: {row.fourthSubjectName}</div>
          )}
        </div>
      )
    },
    {
      key: 'parents',
      header: 'Parents',
      cell: (row: any) => <div className="text-sm">F: {row.fatherName}<br/>M: {row.motherName}</div>
    },
    {
      key: 'email',
      header: 'Email',
      cell: (row: any) => row.email
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (row: any) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleEditStudent(row)}><Pencil className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(row.id)} className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
        </div>
      )
    }
  ];

  return (
    <DashboardLayout navItems={navItems} title="Users">
      <PageHeader title="User Management" description="Manage teachers, students, and staff accounts." />
      
      <Section title="Teachers" headerAction={
        <Button onClick={isAdding ? resetTeacherForm : () => setIsAdding(true)} variant={isAdding ? "outline" : "default"}>
          {isAdding ? 'Cancel' : <><Plus className="h-4 w-4 mr-2" /> Add Teacher</>}
        </Button>
      }>
        {isAdding ? (
          <ContentCard>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="teacher@school.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    disabled={!!editingId}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password {editingId && '(Leave blank to keep unchanged)'}</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="******"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required={!editingId}
                    minLength={!editingId ? 6 : undefined}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingId ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingId ? 'Update Teacher' : 'Create Teacher Account'
                  )}
                </Button>
              </div>
            </form>
          </ContentCard>
        ) : (
          <ContentCard noPadding={teachers.length > 0}>
            {teachers.length > 0 ? (
              <DataTable data={teachers} columns={columns} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No teachers found. Select "Add Teacher" to create a new teacher account.</p>
              </div>
            )}
          </ContentCard>
        )}
      </Section><br />

      <Section title="Students" headerAction={
        <Button onClick={isAddingStudent ? resetStudentForm : () => setIsAddingStudent(true)} variant={isAddingStudent ? "outline" : "default"}>
          {isAddingStudent ? 'Cancel' : <><Plus className="h-4 w-4 mr-2" /> Add Student</>}
        </Button>
      }>
        {isAddingStudent ? (
          <ContentCard>
            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="studentName">Full Name</Label>
                  <Input id="studentName" value={studentFormData.name} onChange={(e) => setStudentFormData({...studentFormData, name: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rollNumber">Roll Number</Label>
                  <Input id="rollNumber" value={studentFormData.rollNumber} onChange={(e) => setStudentFormData({...studentFormData, rollNumber: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fatherName">Father's Name</Label>
                  <Input id="fatherName" value={studentFormData.fatherName} onChange={(e) => setStudentFormData({...studentFormData, fatherName: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motherName">Mother's Name</Label>
                  <Input id="motherName" value={studentFormData.motherName} onChange={(e) => setStudentFormData({...studentFormData, motherName: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentEmail">Email</Label>
                  <Input id="studentEmail" type="email" value={studentFormData.email} onChange={(e) => setStudentFormData({...studentFormData, email: e.target.value})} required disabled={!!editingId} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentPassword">Password {editingId && '(Leave blank to keep unchanged)'}</Label>
                  <Input id="studentPassword" type="password" value={studentFormData.password} onChange={(e) => setStudentFormData({...studentFormData, password: e.target.value})} required={!editingId} minLength={!editingId ? 6 : undefined} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="classSelect">Class</Label>
                  <Select value={studentFormData.classId} onValueChange={(val) => setStudentFormData({...studentFormData, classId: val, sectionId: '', fourthSubjectId: ''})} required>
                    <SelectTrigger id="classSelect"><SelectValue placeholder="Select Class" /></SelectTrigger>
                    <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sectionSelect">Section</Label>
                  <Select value={studentFormData.sectionId} onValueChange={(val) => setStudentFormData({...studentFormData, sectionId: val, fourthSubjectId: ''})} required disabled={!studentFormData.classId}>
                    <SelectTrigger id="sectionSelect"><SelectValue placeholder="Select Section" /></SelectTrigger>
                    <SelectContent>{sections.filter(s => s.classId === studentFormData.classId).map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                {availableFourthSubjects.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="fourthSubject">4th Subject (Optional)</Label>
                    <Select value={studentFormData.fourthSubjectId} onValueChange={(val) => setStudentFormData({...studentFormData, fourthSubjectId: val})}>
                      <SelectTrigger id="fourthSubject"><SelectValue placeholder="Select 4th Subject" /></SelectTrigger>
                      <SelectContent>
                        {availableFourthSubjects.map((s: any) => (
                          <SelectItem key={s.subjectId} value={s.subjectId}>{s.subjectName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingId ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingId ? 'Update Student' : 'Create Student Account'
                  )}
                </Button>
              </div>
            </form>
          </ContentCard>
        ) : (
          <ContentCard noPadding={students.length > 0}>
            {students.length > 0 ? (
              <DataTable data={students} columns={studentColumns} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No students found. Select "Add Student" to create a new student account.</p>
              </div>
            )}
          </ContentCard>
        )}
      </Section>
    </DashboardLayout>
  );
}