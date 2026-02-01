import { useState, useEffect } from 'react';
import { database, firebaseConfig } from '@/lib/firebase';
import { ref, onValue, update, set } from 'firebase/database';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader, Section, ContentCard } from '@/components/dashboard/PageHeader';
import { DataTable } from '@/components/dashboard/DataTable';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  LayoutDashboard, 
  Building2, 
  CreditCard, 
  Settings,
  CheckCircle, 
  XCircle,
  Loader2
} from 'lucide-react';

interface SchoolRegistration {
  id: string;
  schoolName: string;
  registrationNumber: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  board: string;
  adminName: string;
  adminEmail: string;
  adminPassword?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

const navItems = [
  { title: 'Dashboard', href: '/super-admin', icon: LayoutDashboard },
  { title: 'Schools', href: '/super-admin/schools', icon: Building2 },
  { title: 'Subscriptions', href: '/super-admin/subscriptions', icon: CreditCard },
  { title: 'Settings', href: '/super-admin/settings', icon: Settings },
];

export default function SuperAdminSchools() {
  const [registrations, setRegistrations] = useState<SchoolRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const schoolsRef = ref(database, 'school_registrations');
    
    const unsubscribe = onValue(schoolsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const schoolsList = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          ...value,
        }));
        // Sort by submittedAt desc
        schoolsList.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        setRegistrations(schoolsList);
      } else {
        setRegistrations([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: 'approved' | 'rejected') => {
    try {
      if (newStatus === 'approved') {
        const school = registrations.find(s => s.id === id);
        
        if (school && school.adminEmail && school.adminPassword) {
          // Initialize a secondary app to create the user without logging out the current admin
          const secondaryApp = initializeApp(firebaseConfig, "Secondary");
          const secondaryAuth = getAuth(secondaryApp);

          try {
            const userCredential = await createUserWithEmailAndPassword(
              secondaryAuth, 
              school.adminEmail, 
              school.adminPassword
            );
            
            // Store user data in Realtime Database
            const userRef = ref(database, `users/${userCredential.user.uid}`);
            await set(userRef, {
              Name: school.adminName,
              email: school.adminEmail,
              schoolId: id,
              role: 'school_admin'
            });

            await signOut(secondaryAuth);
          } finally {
            await deleteApp(secondaryApp);
          }
        }
      }

      const schoolRef = ref(database, `school_registrations/${id}`);
      await update(schoolRef, { status: newStatus });
      
      toast({
        title: `School ${newStatus === 'approved' ? 'Approved' : 'Rejected'}`,
        description: `The school registration has been ${newStatus}.`,
      });
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: error.message || "Failed to update status.",
        variant: "destructive",
      });
    }
  };

  const columns = [
    {
      key: 'schoolName',
      header: 'School',
      cell: (row: SchoolRegistration) => (
        <div>
          <p className="font-medium">{row.schoolName}</p>
          <p className="text-xs text-muted-foreground">{row.registrationNumber}</p>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      cell: (row: SchoolRegistration) => (
        <div className="text-sm">
          <p>{row.city}, {row.state}</p>
          <p className="text-xs text-muted-foreground">{row.address}</p>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      cell: (row: SchoolRegistration) => (
        <div className="text-sm">
          <p>{row.email}</p>
          <p className="text-xs text-muted-foreground">{row.phone}</p>
        </div>
      ),
    },
    {
      key: 'admin',
      header: 'Admin',
      cell: (row: SchoolRegistration) => (
        <div className="text-sm">
          <p>{row.adminName}</p>
          <p className="text-xs text-muted-foreground">{row.adminEmail}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row: SchoolRegistration) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
          ${row.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
            row.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
          {row.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (row: SchoolRegistration) => (
        <div className="flex items-center gap-2">
          {row.status === 'pending' && (
            <>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                onClick={() => handleStatusUpdate(row.id, 'approved')}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                onClick={() => handleStatusUpdate(row.id, 'rejected')}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  const pendingSchools = registrations.filter(s => s.status === 'pending');
  const processedSchools = registrations.filter(s => s.status !== 'pending');

  return (
    <DashboardLayout navItems={navItems} title="Schools">
      <div className="space-y-8">
        <PageHeader 
          title="School Registrations" 
          description="Manage incoming school registration requests and view registered schools."
        />

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Pending Approvals */}
            <Section title={`Pending Approvals (${pendingSchools.length})`}>
              <ContentCard noPadding>
                {pendingSchools.length > 0 ? (
                  <DataTable 
                    data={pendingSchools}
                    columns={columns}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-muted p-3 mb-4">
                      <CheckCircle className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">No pending approvals</h3>
                    <p className="text-muted-foreground">All school registrations have been processed.</p>
                  </div>
                )}
              </ContentCard>
            </Section>

            {/* All Schools */}
            <Section title="Registered Schools History">
              <ContentCard noPadding>
                {processedSchools.length > 0 ? (
                  <DataTable 
                    data={processedSchools}
                    columns={columns}
                  />
                ) : (
                  <div className="py-12 text-center text-muted-foreground">
                    No history available.
                  </div>
                )}
              </ContentCard>
            </Section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}