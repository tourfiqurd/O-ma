import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard, StatCardGrid } from '@/components/dashboard/StatCard';
import { PageHeader, Section, ContentCard } from '@/components/dashboard/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NavItem } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { database } from '@/lib/firebase';
import { ref, update, onValue } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';
import { 
  mockSchoolAdminStats, 
} from '@/data/mockData';
import { 
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  BookOpen,
  FileText,
  BarChart3,
  Settings,
  Plus,
  UserPlus,
  Calendar,
  ClipboardList,
  Upload,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/school-admin', icon: LayoutDashboard },
  { title: 'Academic Setup', href: '/school-admin/academic', icon: GraduationCap },
  { title: 'Users', href: '/school-admin/users', icon: Users },
  { title: 'Exams', href: '/school-admin/exams', icon: BookOpen },
  { title: 'Results', href: '/school-admin/results', icon: FileText },
  { title: 'Reports', href: '/school-admin/reports', icon: BarChart3 },
  { title: 'Settings', href: '/school-admin/settings', icon: Settings },
];

export default function SchoolAdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const stats = mockSchoolAdminStats;

  const [logo, setLogo] = useState<string | null>(null);
  const [schoolData, setSchoolData] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (user?.schoolId) {
      const schoolRef = ref(database, `school_registrations/${user.schoolId}`);
      const unsubscribe = onValue(schoolRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setSchoolData(data);
          if (data.logo) setLogo(data.logo);
        }
      });
      return () => unsubscribe();
    }
  }, [user?.schoolId]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'image/png') {
      toast({ title: "Error", description: "Only PNG files are allowed.", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const saveLogo = async () => {
    if (!preview || !user?.schoolId) return;
    setUploading(true);
    try {
      await update(ref(database, `school_registrations/${user.schoolId}`), {
        logo: preview
      });
      toast({ title: "Success", description: "Logo uploaded successfully." });
      setPreview(null);
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to upload logo.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout navItems={navItems} title="School Admin" logo={logo}>
      <div className="space-y-8">
        <PageHeader 
          title={`Welcome back!`}
          description={schoolData?.schoolName || 'Manage your school'}
        >
          <Button className="glow-primary-sm">
            <Plus className="h-4 w-4 mr-2" />
            Quick Actions
          </Button>
        </PageHeader>

        {schoolData && (
          <ContentCard className="bg-muted/10 border-primary/20">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Registration No.</p>
                <p className="font-medium">{schoolData.registrationNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Board</p>
                <p className="font-medium">{schoolData.board}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact</p>
                <p className="font-medium">{schoolData.phone}</p>
                <p className="text-xs text-muted-foreground">{schoolData.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{schoolData.city}, {schoolData.state}</p>
                <p className="text-xs text-muted-foreground truncate" title={schoolData.address}>{schoolData.address}</p>
              </div>
            </div>
          </ContentCard>
        )}

        {/* Stats Grid */}
        <StatCardGrid columns={4}>
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={Users}
            subtitle="Enrolled this year"
          />
          <StatCard
            title="Total Teachers"
            value={stats.totalTeachers}
            icon={UserPlus}
          />
          <StatCard
            title="Active Classes"
            value={stats.totalClasses}
            icon={BookOpen}
          />
          <StatCard
            title="Active Exams"
            value={stats.activeExams}
            icon={ClipboardList}
            iconColor="text-warning"
          />
        </StatCardGrid>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: UserPlus, label: 'Add Student', color: 'bg-primary/10 text-primary' },
            { icon: Users, label: 'Add Teacher', color: 'bg-chart-3/10 text-chart-3' },
            { icon: Calendar, label: 'Create Exam', color: 'bg-warning/10 text-warning' },
            { icon: FileText, label: 'Publish Results', color: 'bg-info/10 text-info' },
          ].map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className="h-auto py-4 flex-col gap-2 hover:bg-accent hover:border-primary/50"
            >
              <div className={`p-2 rounded-lg ${action.color}`}>
                <action.icon className="h-5 w-5" />
              </div>
              <span className="text-sm">{action.label}</span>
            </Button>
          ))}
        </div>

        {/* School Branding Section */}
        <Section title="School Branding">
          <ContentCard>
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="space-y-4 flex-1">
                <div>
                  <h3 className="text-lg font-medium">School Logo</h3>
                  <p className="text-sm text-muted-foreground">Upload a PNG logo for your school (Recommended size: 200x200px)</p>
                </div>
                
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="logo">Logo (PNG)</Label>
                  <Input id="logo" type="file" accept="image/png" onChange={handleLogoUpload} />
                </div>

                {preview && (
                  <div className="flex gap-2">
                    <Button onClick={saveLogo} disabled={uploading}>
                      {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                      Save Logo
                    </Button>
                    <Button variant="outline" onClick={() => setPreview(null)}>Cancel</Button>
                  </div>
                )}
              </div>

              <div className="border rounded-lg p-4 bg-muted/10 flex items-center justify-center w-48 h-48">
                {preview || logo ? (
                  <img src={preview || logo || ''} alt="School Logo" className="max-w-full max-h-full object-contain" />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <span className="text-xs">No Logo</span>
                  </div>
                )}
              </div>
            </div>
          </ContentCard>
        </Section>
      </div>
    </DashboardLayout>
  );
}
