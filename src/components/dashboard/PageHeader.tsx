import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-center md:justify-between", className)}>
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
}

interface SectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  headerAction?: ReactNode;
}

export function Section({ title, description, children, className, headerAction }: SectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      {(title || headerAction) && (
        <div className="flex items-center justify-between">
          <div>
            {title && <h2 className="text-lg font-semibold">{title}</h2>}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          {headerAction}
        </div>
      )}
      {children}
    </section>
  );
}

interface ContentCardProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function ContentCard({ children, className, noPadding }: ContentCardProps) {
  return (
    <div className={cn(
      "rounded-xl border border-border/50 bg-card",
      !noPadding && "p-6",
      className
    )}>
      {children}
    </div>
  );
}
