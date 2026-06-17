import { cn } from '../../lib/utils';
import { getStatusText, getStatusColor } from '../../utils/format';

interface StatusBadgeProps {
  status: string;
  customText?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'filled' | 'outline';
}

export const StatusBadge = ({
  status,
  customText,
  size = 'md',
  variant = 'filled',
}: StatusBadgeProps) => {
  const text = customText || getStatusText(status);
  const colorClass = getStatusColor(status);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const variantClasses = variant === 'filled'
    ? 'bg-current/20'
    : 'border border-current';

  return (
    <span className={cn(
      'inline-flex items-center font-medium rounded-full',
      colorClass,
      sizeClasses[size],
      variantClasses
    )}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
      {text}
    </span>
  );
};
