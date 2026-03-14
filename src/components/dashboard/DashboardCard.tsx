import React from 'react';

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ children, className = '' }) => (
  <div
    className={`bg-white rounded-2xl border border-zafting-text/10 shadow-sm overflow-hidden ${className}`}
  >
    {children}
  </div>
);

interface DashboardCardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const DashboardCardHeader: React.FC<DashboardCardHeaderProps> = ({
  title,
  subtitle,
  action,
}) => (
  <div className="px-6 py-5 border-b border-zafting-text/5 flex items-start justify-between gap-4">
    <div>
      <h2 className="text-lg font-semibold text-zafting-text">{title}</h2>
      {subtitle && <p className="text-sm text-zafting-text/60 mt-0.5">{subtitle}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);
