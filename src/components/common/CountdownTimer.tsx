import { useState, useEffect } from 'react';
import { formatCountdown } from '../../utils/format';
import { cn } from '../../lib/utils';

interface CountdownTimerProps {
  targetDate: string;
  variant?: 'default' | 'warning' | 'danger';
  showSeconds?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export const CountdownTimer = ({
  targetDate,
  variant = 'default',
  showSeconds = true,
  size = 'md',
  label,
}: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(formatCountdown(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(formatCountdown(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const { hours, minutes, seconds, isOverdue } = timeLeft;

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  const variantClasses = {
    default: 'text-white',
    warning: 'text-neon-yellow',
    danger: 'text-red-500 animate-pulse',
  };

  const currentVariant = isOverdue ? 'danger' : (hours < 2 ? 'warning' : variant);

  const pad = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="flex flex-col items-center">
      {label && (
        <span className="text-sm text-gray-400 mb-1">{label}</span>
      )}
      <div className={cn(
        'font-mono font-bold',
        sizeClasses[size],
        variantClasses[currentVariant]
      )}>
        <span>{pad(hours)}</span>
        <span className="mx-1">:</span>
        <span>{pad(minutes)}</span>
        {showSeconds && (
          <>
            <span className="mx-1">:</span>
            <span>{pad(seconds)}</span>
          </>
        )}
      </div>
      {isOverdue && (
        <span className="text-xs text-red-500 mt-1">已逾期</span>
      )}
    </div>
  );
};
