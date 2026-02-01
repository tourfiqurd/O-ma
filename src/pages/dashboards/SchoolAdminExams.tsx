import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader, Section, ContentCard } from '@/components/dashboard/PageHeader';
import { LayoutDashboard, GraduationCap, Users, BookOpen, FileText, BarChart3, Settings, Plus, Loader2, Trash2, Calendar, Eye, Pencil, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataTable } from '@/components/dashboard/DataTable';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/lib/firebase';
import { ref, push, set, onValue, query, orderByChild, equalTo, remove, update } from 'firebase/database';

const navItems = [
  { title: 'Dashboard', href: '/school-admin', icon: LayoutDashboard },
  { title: 'Academic Setup', href: '/school-admin/academic', icon: GraduationCap },
  { title: 'Users', href: '/school-admin/users', icon: Users },
  { title: 'Exams', href: '/school-admin/exams', icon: BookOpen },
  { title: 'Results', href: '/school-admin/results', icon: FileText },
  { title: 'Reports', href: '/school-admin/reports', icon: BarChart3 },
  { title: 'Settings', href: '/school-admin/settings', icon: Settings },
];

export default function SchoolAdminExams() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [exams, setExams] = useState<any[]>([]);
  const [subAssignments, setSubAssignments] = useState<any[]>([]);
  const [subjectMarks, setSubjectMarks] = useState<Record<string, Record<string, { mcq: string, written: string }>>>({});
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingExam, setViewingExam] = useState<any | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    selectedConfigs: [] as string[]
  });

  useEffect(() => {
    if (user?.schoolId) {
      const examsQuery = query(ref(database, 'exams'), orderByChild('schoolId'), equalTo(user.schoolId));
      const unsubscribe = onValue(examsQuery, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const loadedExams = Object.entries(data).map(([key, value]: [string, any]) => ({
            id: key,
            ...value,
          }));
          // Sort by startDate descending
          loadedExams.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
          setExams(loadedExams);
        } else {
          setExams([]);
        }
      });
      return () => unsubscribe();
    }
  }, [user?.schoolId]);

  useEffect(() => {
    if (user?.schoolId) {
      const subAssignQuery = query(ref(database, 'sub_assign'), orderByChild('schoolId'), equalTo(user.schoolId));
      const unsubscribe = onValue(subAssignQuery, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setSubAssignments(Object.entries(data).map(([k, v]: [string, any]) => ({ id: k, ...v })));
        } else {
          setSubAssignments([]);
        }
      });
      return () => unsubscribe();
    }
  }, [user?.schoolId]);

  const handleConfigToggle = (configId: string) => {
    setFormData(prev => {
      const current = prev.selectedConfigs;
      return current.includes(configId)
        ? { ...prev, selectedConfigs: current.filter(id => id !== configId) } // Deselect
        : { ...prev, selectedConfigs: [...current, configId] }; // Select
    });

    // Initialize marks if selecting
    if (!formData.selectedConfigs.includes(configId)) {
      const config = subAssignments.find(c => c.id === configId);
      if (config && config.subjects) {
        setSubjectMarks(prev => ({
          ...prev,
          [configId]: config.subjects.reduce((acc: any, sub: any) => {
            acc[sub.subjectId] = { mcq: sub.mcqMarks || '0', written: sub.writtenMarks || '0' };
            return acc;
          }, {})
        }));
      }
    }
  };

  const handleMarkChange = (e: React.ChangeEvent<HTMLInputElement>, configId: string, subjectId: string, field: 'mcq' | 'written') => {
    e.stopPropagation();
    const value = e.target.value;
    setSubjectMarks(prev => ({
      ...prev,
      [configId]: {
        ...prev[configId],
        [subjectId]: {
          ...prev[configId]?.[subjectId],
          [field]: value
        }
      }
    }));
  };

  const handleRemoveSubject = (e: React.MouseEvent, configId: string, subjectId: string) => {
    e.stopPropagation();
    setSubjectMarks(prev => {
      const newConfigMarks = { ...prev[configId] };
      delete newConfigMarks[subjectId];
      return { ...prev, [configId]: newConfigMarks };
    });
  };

  const handleRestoreSubject = (e: React.MouseEvent, configId: string, subjectId: string, defaultMcq: string, defaultWritten: string) => {
    e.stopPropagation();
    setSubjectMarks(prev => ({
      ...prev,
      [configId]: {
        ...prev[configId],
        [subjectId]: { mcq: defaultMcq, written: defaultWritten }
      }
    }));
  };

  const resetForm = () => {
    setFormData({ 
      name: '', 
      startDate: '', 
      endDate: '',
      selectedConfigs: []
    });
    setSubjectMarks({});
    setEditingId(null);
    setIsAdding(false);
  };

  const handleEdit = (exam: any) => {
    setFormData({
      name: exam.name,
      startDate: exam.startDate,
      endDate: exam.endDate,
      selectedConfigs: exam.includedConfigs || []
    });
    setSubjectMarks(exam.configMarks || {});
    setEditingId(exam.id);
    setIsAdding(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.schoolId) return;

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      toast({ title: "Error", description: "End date cannot be before start date.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const examData = {
        name: formData.name,
        startDate: formData.startDate,
        endDate: formData.endDate,
        includedConfigs: formData.selectedConfigs,
        configMarks: subjectMarks,
        schoolId: user.schoolId,
        updatedAt: new Date().toISOString()
      };

      if (editingId) {
        await update(ref(database, `exams/${editingId}`), examData);
        toast({ title: "Success", description: "Exam updated successfully." });
      } else {
        await set(push(ref(database, 'exams')), {
          ...examData,
          createdAt: new Date().toISOString()
        });
        toast({ title: "Success", description: "Exam scheduled successfully." });
      }
      
      resetForm();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        await remove(ref(database, `exams/${id}`));
        toast({ title: "Success", description: "Exam deleted." });
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Exam Name',
      cell: (row: any) => <div className="font-medium">{row.name}</div>
    },
    {
      key: 'dates',
      header: 'Schedule',
      cell: (row: any) => (
        <div className="text-sm flex items-center gap-2">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          {new Date(row.startDate).toLocaleDateString()} - {new Date(row.endDate).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (row: any) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setViewingExam(row)} className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleEdit(row)} className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-50">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDelete(row.id)} className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <DashboardLayout navItems={navItems} title="Exams">
      <PageHeader title="Examination Management" description="Create and manage exam schedules." />
      
      <Section title="Exams" headerAction={
        <Button onClick={isAdding ? resetForm : () => setIsAdding(true)} variant={isAdding ? "outline" : "default"}>
          {isAdding ? 'Cancel' : <><Plus className="h-4 w-4 mr-2" /> Schedule Exam</>}
        </Button>
      }>
        {isAdding ? (
          <ContentCard>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="examName">Exam Name</Label>
                  <Input 
                    id="examName" 
                    placeholder="e.g., Mid-Term 2024" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input 
                    id="startDate" 
                    type="date" 
                    value={formData.startDate} 
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input 
                    id="endDate" 
                    type="date" 
                    value={formData.endDate} 
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})} 
                    required 
                  />
                </div>

                <div className="col-span-full space-y-2">
                  <Label>Include Classes & Subjects</Label>
                  <div className="grid gap-4 p-4 border rounded-md bg-muted/20 max-h-[600px] overflow-y-auto">
                    {subAssignments.length > 0 ? subAssignments.map(config => (
                      <div key={config.id} className={`flex flex-col space-y-3 bg-background border p-3 rounded cursor-pointer hover:border-primary ${formData.selectedConfigs.includes(config.id) ? 'border-primary ring-1 ring-primary' : ''}`} onClick={() => handleConfigToggle(config.id)}>
                        <div className="flex items-start space-x-3">
                          <input 
                            type="checkbox" 
                            checked={formData.selectedConfigs.includes(config.id)} 
                            readOnly 
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" 
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{config.className} - Section {config.sectionName}</p>
                          </div>
                        </div>
                        
                        {formData.selectedConfigs.includes(config.id) && (
                          <div className="pl-7 space-y-2" onClick={(e) => e.stopPropagation()}>
                            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground mb-1">
                              <div className="col-span-4">Subject</div>
                              <div className="col-span-3">MCQ Marks</div>
                              <div className="col-span-3">Written Marks</div>
                              <div className="col-span-2 text-right">Action</div>
                            </div>
                            {config.subjects && config.subjects.map((s: any, i: number) => {
                              const isIncluded = subjectMarks[config.id]?.[s.subjectId];
                              return (
                                <div key={i} className={`grid grid-cols-12 gap-2 items-center ${!isIncluded ? 'opacity-50' : ''}`}>
                                  <div className="col-span-4 text-sm flex items-center gap-2">
                                    {s.subjectName}
                                    {!isIncluded && <span className="text-[10px] text-destructive font-medium">(Excluded)</span>}
                                  </div>
                                  {isIncluded ? (
                                    <>
                                      <div className="col-span-3">
                                        <Input type="number" className="h-7 text-xs" placeholder="MCQ" value={subjectMarks[config.id]?.[s.subjectId]?.mcq || ''} onChange={(e) => handleMarkChange(e, config.id, s.subjectId, 'mcq')} />
                                      </div>
                                      <div className="col-span-3">
                                        <Input type="number" className="h-7 text-xs" placeholder="Written" value={subjectMarks[config.id]?.[s.subjectId]?.written || ''} onChange={(e) => handleMarkChange(e, config.id, s.subjectId, 'written')} />
                                      </div>
                                      <div className="col-span-2 text-right">
                                        <Button 
                                          type="button" 
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-6 w-6 text-destructive hover:bg-destructive/10"
                                          onClick={(e) => handleRemoveSubject(e, config.id, s.subjectId)}
                                          title="Exclude Subject"
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="col-span-8 text-right">
                                      <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-6 text-xs text-primary hover:text-primary/80"
                                        onClick={(e) => handleRestoreSubject(e, config.id, s.subjectId, s.mcqMarks || '0', s.writtenMarks || '0')}
                                      >
                                        <RotateCcw className="h-3 w-3 mr-1" /> Restore
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )) : <p className="text-sm text-muted-foreground">No class configurations found. Please set up subjects in Academic Setup.</p>}
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingId ? 'Updating...' : 'Scheduling...'}
                    </>
                  ) : (
                    editingId ? 'Update Exam' : 'Schedule Exam'
                  )}
                </Button>
              </div>
            </form>
          </ContentCard>
        ) : (
          <ContentCard noPadding={exams.length > 0}>
            {exams.length > 0 ? (
              <DataTable data={exams} columns={columns} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No exams scheduled. Select "Schedule Exam" to create a new exam.</p>
              </div>
            )}
          </ContentCard>
        )}
      </Section>

      {/* View Exam Modal */}
      {viewingExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-card border rounded-lg shadow-lg max-h-[90vh] flex flex-col">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{viewingExam.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {new Date(viewingExam.startDate).toLocaleDateString()} - {new Date(viewingExam.endDate).toLocaleDateString()}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setViewingExam(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6 overflow-y-auto">
              <h3 className="font-medium mb-4">Included Classes & Subjects</h3>
              <div className="space-y-4">
                {viewingExam.includedConfigs && viewingExam.includedConfigs.map((configId: string) => {
                  const config = subAssignments.find(c => c.id === configId);
                  if (!config) return null;
                  const marks = viewingExam.configMarks?.[configId] || {};
                  
                  return (
                    <div key={configId} className="border rounded-lg p-4 bg-muted/20">
                      <h4 className="font-medium text-sm mb-2">{config.className} - Section {config.sectionName}</h4>
                      <div className="grid gap-2">
                        {config.subjects.map((s: any) => {
                          const subjectMarks = marks[s.subjectId];
                          if (!subjectMarks) return null; // Skip excluded subjects
                          return (
                            <div key={s.subjectId} className="flex justify-between text-sm border-b border-border/50 pb-1 last:border-0 last:pb-0">
                              <span>{s.subjectName}</span>
                              <span className="text-muted-foreground">MCQ: {subjectMarks.mcq} | Written: {subjectMarks.written}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="p-4 border-t flex justify-end">
              <Button onClick={() => setViewingExam(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}