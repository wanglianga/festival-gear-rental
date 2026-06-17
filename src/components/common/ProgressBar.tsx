import { cn } from '../../lib/utils';

interface ProgressBarProps {
  value: number;
  max: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
}

export const ProgressBar = ({
  value,
  max,
  variant = 'default',
  size = 'md',
  showLabel = false,
  label,
}: ProgressBarProps) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const variantColors = {
    default: 'bg-neon-purple',
    success: 'bg-neon-green',
    warning: 'bg-neon-yellow',
    danger: 'bg-red-500',
  };

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const currentVariant = percentage < 20 ? 'danger' : percentage < 50 ? 'warning' : variant;

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-sm mb-1.5">
          <span className="text-gray-400">{label || '进度'}</span>
          <span className="text-white font-medium">{value}/{max}</span>
        </div>
      )}
      <div className={cn(
        'w-full rounded-full bg-white/10 overflow-hidden',
        sizeClasses[size]
      )}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            variantColors[currentVariant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
