import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { TrendingUp, Users, GraduationCap, BookOpen, FileText, School } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock Data
const trendData = [
  { month: 'Jan', avg: 75 },
  { month: 'Feb', avg: 78 },
  { month: 'Mar', avg: 82 },
  { month: 'Apr', avg: 80 },
  { month: 'May', avg: 85 },
  { month: 'Jun', avg: 88 },
];

const passFailData = [
  { name: 'Pass', value: 850 },
  { name: 'Fail', value: 150 },
];

const COLORS = ['#10B981', '#EF4444']; // Emerald-500, Red-500

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: string;
  description?: string;
}

const StatCard = ({ title, value, icon: Icon, trend, description }: StatCardProps) => (
  <div className="rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all hover:bg-card hover:shadow-lg hover:shadow-primary/5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <h3 className="mt-2 text-2xl font-bold text-foreground">{value}</h3>
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Icon className="h-6 w-6 text-primary" />
      </div>
    </div>
    {(trend || description) && (
      <div className="mt-4 flex items-center gap-2 text-xs">
        {trend && (
          <span className="flex items-center font-medium text-green-500">
            <TrendingUp className="mr-1 h-3 w-3" />
            {trend}
          </span>
        )}
        {description && <span className="text-muted-foreground">{description}</span>}
      </div>
    )}
  </div>
);

export function SchoolAdminDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">School Admin Dashboard</h2>
        <p className="text-muted-foreground">Overview of school performance and statistics.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Students" value="1,234" icon={Users} trend="+12%" description="vs last month" />
        <StatCard title="Total Teachers" value="48" icon={GraduationCap} trend="+2" description="new this month" />
        <StatCard title="Total Classes" value="32" icon={School} />
        <StatCard title="Exams Created" value="15" icon={FileText} trend="+5" description="active exams" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Chart */}
        <div className="col-span-4 rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground">Performance Trends</h3>
            <p className="text-sm text-muted-foreground">Average score over time</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="month" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#10B981' }}
                />
                <Area type="monotone" dataKey="avg" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorAvg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="col-span-3 rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground">Pass vs Fail</h3>
            <p className="text-sm text-muted-foreground">Current academic year distribution</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={passFailData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {passFailData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Reports Section */}
      <div className="rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground">Reports</h3>
          <p className="text-sm text-muted-foreground">Generate and download detailed reports.</p>
        </div>
        <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border/50 bg-card/20">
          <p className="text-muted-foreground">Reporting features coming soon.</p>
        </div>
      </div>
    </div>
  );
}