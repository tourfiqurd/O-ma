import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusType = 
  | 'pending' | 'active' | 'suspended' 
  | 'upcoming' | 'ongoing' | 'completed' | 'published'
  | 'draft' | 'submitted' | 'approved'
  | 'pass' | 'fail';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
  pending: { label: 'Pending', variant: 'secondary', className: 'bg-warning/10 text-warning border-warning/30' },
  active: { label: 'Active', variant: 'default', className: 'bg-primary/10 text-primary border-primary/30' },
  suspended: { label: 'Suspended', variant: 'destructive', className: 'bg-destructive/10 text-destructive border-destructive/30' },
  upcoming: { label: 'Upcoming', variant: 'secondary', className: 'bg-info/10 text-info border-info/30' },
  ongoing: { label: 'Ongoing', variant: 'default', className: 'bg-warning/10 text-warning border-warning/30' },
  completed: { label: 'Completed', variant: 'secondary', className: 'bg-muted text-muted-foreground border-muted' },
  published: { label: 'Published', variant: 'default', className: 'bg-primary/10 text-primary border-primary/30' },
  draft: { label: 'Draft', variant: 'outline', className: 'bg-muted/50 text-muted-foreground border-border' },
  submitted: { label: 'Submitted', variant: 'secondary', className: 'bg-info/10 text-info border-info/30' },
  approved: { label: 'Approved', variant: 'default', className: 'bg-primary/10 text-primary border-primary/30' },
  pass: { label: 'Pass', variant: 'default', className: 'bg-primary/10 text-primary border-primary/30' },
  fail: { label: 'Fail', variant: 'destructive', className: 'bg-destructive/10 text-destructive border-destructive/30' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge 
      variant="outline"
      className={cn("font-medium", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}

// Grade badge with color coding
interface GradeBadgeProps {
  grade: string;
  className?: string;
}

const gradeColors: Record<string, string> = {
  'A+': 'bg-primary/20 text-primary border-primary/40',
  'A': 'bg-primary/15 text-primary border-primary/30',
  'B+': 'bg-chart-3/20 text-chart-3 border-chart-3/40',
  'B': 'bg-chart-3/15 text-chart-3 border-chart-3/30',
  'C+': 'bg-warning/20 text-warning border-warning/40',
  'C': 'bg-warning/15 text-warning border-warning/30',
  'D': 'bg-orange-500/20 text-orange-400 border-orange-500/40',
  'F': 'bg-destructive/20 text-destructive border-destructive/40',
};

export function GradeBadge({ grade, className }: GradeBadgeProps) {
  const colorClass = gradeColors[grade] || 'bg-muted text-muted-foreground border-border';
  
  return (
    <Badge 
      variant="outline"
      className={cn("font-bold text-sm px-3", colorClass, className)}
    >
      {grade}
    </Badge>
  );
}
