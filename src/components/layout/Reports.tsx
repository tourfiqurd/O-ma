import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { FileText, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock Data
const classPerformanceData = [
  { name: 'Class 1', avg: 85 },
  { name: 'Class 2', avg: 78 },
  { name: 'Class 3', avg: 92 },
  { name: 'Class 4', avg: 88 },
  { name: 'Class 5', avg: 76 },
  { name: 'Class 6', avg: 82 },
];

const subjectPassRates = [
  { subject: 'Math', pass: 85, fail: 15 },
  { subject: 'Science', pass: 90, fail: 10 },
  { subject: 'English', pass: 95, fail: 5 },
  { subject: 'History', pass: 88, fail: 12 },
];

export function Reports() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Reports</h2>
          <p className="text-muted-foreground">Detailed analysis and downloadable reports.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
            </Button>
            <Button size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export All
            </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Class Performance Chart */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground">Class Performance Overview</h3>
            </div>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={classPerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                        />
                        <Bar dataKey="avg" fill="#10B981" radius={[4, 4, 0, 0]} name="Average Score" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Subject Pass Rates Chart */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground">Subject Pass Rates</h3>
            </div>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subjectPassRates} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                        <XAxis type="number" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis dataKey="subject" type="category" stroke="#666" fontSize={12} tickLine={false} axisLine={false} width={60} />
                        <Tooltip 
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                        />
                        <Legend />
                        <Bar dataKey="pass" stackId="a" fill="#10B981" radius={[0, 4, 4, 0]} name="Pass %" />
                        <Bar dataKey="fail" stackId="a" fill="#EF4444" radius={[0, 4, 4, 0]} name="Fail %" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* Available Reports List */}
      <div className="rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Available Reports</h3>
        </div>
        <div className="space-y-4">
            {[
                { title: 'Annual Academic Report', date: '2023-2024', size: '2.4 MB' },
                { title: 'Student Attendance Summary', date: 'March 2024', size: '1.1 MB' },
                { title: 'Teacher Performance Review', date: 'Q1 2024', size: '856 KB' },
                { title: 'Exam Results Compilation', date: 'Final Term', size: '3.2 MB' },
            ].map((report, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-border/50 p-4 transition-colors hover:bg-card/80">
                    <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-medium text-foreground">{report.title}</p>
                            <p className="text-sm text-muted-foreground">{report.date} • {report.size}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}