import React from 'react';

interface DashboardPageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const DashboardPageHeader: React.FC<DashboardPageHeaderProps> = ({
  title,
  subtitle,
  action,
}) => (
  <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 className="font-serif text-2xl md:text-3xl font-semibold text-zafting-text tracking-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="font-sans text-zafting-text/60 mt-1 text-sm">{subtitle}</p>
      )}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);
