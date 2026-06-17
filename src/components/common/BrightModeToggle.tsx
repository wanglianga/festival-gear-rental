import { Sun, Moon } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../lib/utils';

interface BrightModeToggleProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'button';
  className?: string;
}

export const BrightModeToggle = ({
  size = 'md',
  variant = 'icon',
  className,
}: BrightModeToggleProps) => {
  const { brightMode, toggleBrightMode } = useAppStore();

  const sizeClasses = {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4',
  };

  const iconSizes = {
    sm: 18,
    md: 22,
    lg: 28,
  };

  if (variant === 'button') {
    return (
      <button
        onClick={toggleBrightMode}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all',
          brightMode
            ? 'bg-yellow-100 text-yellow-900 border-2 border-yellow-400'
            : 'bg-white/10 text-white border border-white/20 hover:bg-white/20',
          className
        )}
      >
        {brightMode ? <Sun size={iconSizes[size]} /> : <Moon size={iconSizes[size]} />}
        <span>{brightMode ? '强光模式' : '普通模式'}</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleBrightMode}
      className={cn(
        'rounded-full transition-all duration-300',
        sizeClasses[size],
        brightMode
          ? 'bg-yellow-400 text-yellow-900 shadow-lg shadow-yellow-400/50'
          : 'bg-white/10 text-white hover:bg-white/20',
        className
      )}
      aria-label={brightMode ? '关闭强光模式' : '开启强光模式'}
    >
      {brightMode ? <Sun size={iconSizes[size]} /> : <Moon size={iconSizes[size]} />}
    </button>
  );
};
