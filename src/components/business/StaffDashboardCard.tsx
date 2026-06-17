import { Card } from '../common/Card';
import { cn } from '../../lib/utils';
import { LucideIcon } from 'lucide-react';

interface StaffDashboardCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  subtitle?: string;
}

export const StaffDashboardCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  variant = 'default',
  subtitle,
}: StaffDashboardCardProps) => {
  const variantClasses = {
    default: 'from-white/10 to-transparent border-white/10',
    success: 'from-neon-green/20 to-transparent border-neon-green/30',
    warning: 'from-neon-yellow/20 to-transparent border-neon-yellow/30',
    danger: 'from-red-500/20 to-transparent border-red-500/30',
  };

  const iconVariantClasses = {
    default: 'text-white/70',
    success: 'text-neon-green',
    warning: 'text-neon-yellow',
    danger: 'text-red-500',
  };

  const trendClasses = {
    up: 'text-neon-green',
    down: 'text-red-500',
    neutral: 'text-gray-400',
  };

  return (
    <Card className={cn(
      'bg-gradient-to-br',
      variantClasses[variant]
    )} padding="lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-4xl font-bold text-white mt-2">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && trendValue && (
            <p className={cn('text-sm mt-2 font-medium', trendClasses[trend])}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
            </p>
          )}
        </div>
        <div className={cn(
          'p-3 rounded-2xl bg-black/20',
          iconVariantClasses[variant]
        )}>
          <Icon size={28} />
        </div>
      </div>
    </Card>
  );
};
