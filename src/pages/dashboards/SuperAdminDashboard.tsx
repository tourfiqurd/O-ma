import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard, StatCardGrid } from '@/components/dashboard/StatCard';
import { PageHeader, Section, ContentCard } from '@/components/dashboard/PageHeader';
import { DataTable } from '@/components/dashboard/DataTable';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { Button } from '@/components/ui/button';
import { NavItem } from '@/types';
import { mockSchools, mockSuperAdminStats } from '@/data/mockData';
import { 
  LayoutDashboard, 
  Building2, 
  CreditCard, 
  Settings,
  School,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/super-admin', icon: LayoutDashboard },
  { title: 'Schools', href: '/super-admin/schools', icon: Building2 },
  { title: 'Subscriptions', href: '/super-admin/subscriptions', icon: CreditCard },
  { title: 'Settings', href: '/super-admin/settings', icon: Settings },
];

export default function SuperAdminDashboard() {
  const stats = mockSuperAdminStats;
  const pendingSchools = mockSchools.filter(s => s.status === 'pending');

  const schoolColumns = [
    {
      key: 'name',
      header: 'School',
      cell: (school: typeof mockSchools[0]) => (
        <div>
          <p className="font-medium">{school.name}</p>
          <p className="text-xs text-muted-foreground">{school.registrationNumber}</p>
        </div>
      ),
    },
    {
      key: 'admin',
      header: 'Admin',
      cell: (school: typeof mockSchools[0]) => school.adminName,
    },
    {
      key: 'board',
      header: 'Board',
      cell: (school: typeof mockSchools[0]) => school.board,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (school: typeof mockSchools[0]) => <StatusBadge status={school.status} />,
    },
    {
      key: 'subscription',
      header: 'Plan',
      cell: (school: typeof mockSchools[0]) => (
        <span className="capitalize">{school.subscription}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (school: typeof mockSchools[0]) => (
        <div className="flex items-center gap-2">
          {school.status === 'pending' ? (
            <>
              <Button size="sm" variant="outline" className="h-7 text-xs hover:bg-primary/10 hover:text-primary">
                <CheckCircle className="h-3 w-3 mr-1" />
                Approve
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-xs hover:bg-destructive/10 hover:text-destructive">
                <XCircle className="h-3 w-3 mr-1" />
                Reject
              </Button>
            </>
          ) : (
            <Button size="sm" variant="outline" className="h-7 text-xs">
              View
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout navItems={navItems} title="Super Admin">
      <div className="space-y-8">
        <PageHeader 
          title="Platform Overview" 
          description="Monitor and manage all schools on the platform"
        />

        {/* Stats Grid */}
        <StatCardGrid columns={4}>
          <StatCard
            title="Total Schools"
            value={stats.totalSchools}
            icon={School}
            trend={{ value: stats.monthlyGrowth, isPositive: true }}
          />
          <StatCard
            title="Active Schools"
            value={stats.activeSchools}
            icon={Building2}
            subtitle={`${Math.round((stats.activeSchools / stats.totalSchools) * 100)}% of total`}
          />
          <StatCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            icon={Clock}
            iconColor="text-warning"
          />
          <StatCard
            title="Platform Usage"
            value={`${stats.platformUsage}%`}
            icon={TrendingUp}
            subtitle="Avg. daily active users"
          />
        </StatCardGrid>

        {/* Pending Approvals */}
        {pendingSchools.length > 0 && (
          <Section title="Pending School Approvals" headerAction={
            <Button variant="outline" size="sm">View All</Button>
          }>
            <ContentCard noPadding>
              <DataTable 
                data={pendingSchools}
                columns={schoolColumns}
              />
            </ContentCard>
          </Section>
        )}

        {/* All Schools */}
        <Section title="All Schools" headerAction={
          <Button variant="outline" size="sm">Export</Button>
        }>
          <ContentCard noPadding>
            <DataTable 
              data={mockSchools}
              columns={schoolColumns}
            />
          </ContentCard>
        </Section>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-2 gap-6">
          <Section title="Subscription Distribution">
            <ContentCard>
              <div className="space-y-4">
                {[
                  { plan: 'Premium', count: 15, percentage: 33 },
                  { plan: 'Basic', count: 20, percentage: 45 },
                  { plan: 'Free', count: 10, percentage: 22 },
                ].map((item) => (
                  <div key={item.plan} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{item.plan}</span>
                      <span className="text-muted-foreground">{item.count} schools</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ContentCard>
          </Section>

          <Section title="Recent Activity">
            <ContentCard>
              <div className="space-y-4">
                {[
                  { action: 'New school registered', school: 'Valley High School', time: '2 hours ago' },
                  { action: 'Subscription upgraded', school: 'Sunrise Academy', time: '5 hours ago' },
                  { action: 'Results published', school: 'Greenwood International', time: '1 day ago' },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.action}</p>
                      <p className="text-xs text-muted-foreground">{item.school}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </div>
                ))}
              </div>
            </ContentCard>
          </Section>
        </div>
      </div>
    </DashboardLayout>
  );
}
