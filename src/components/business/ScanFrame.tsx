import { cn } from '../../lib/utils';

interface ScanFrameProps {
  scanning?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'full';
  title?: string;
  subtitle?: string;
}

export const ScanFrame = ({
  scanning = true,
  size = 'lg',
  title = '扫描取件码',
  subtitle = '将二维码放入扫描框内',
}: ScanFrameProps) => {
  const sizeClasses = {
    sm: 'w-48 h-48',
    md: 'w-64 h-64',
    lg: 'w-72 h-72',
    full: 'w-full max-w-sm aspect-square',
  };

  const cornerSize = 'w-8 h-8';
  const borderWidth = 'border-4';

  return (
    <div className="flex flex-col items-center">
      <div className={cn('relative', sizeClasses[size])}>
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-2xl" />
        
        <div className={`absolute top-0 left-0 ${cornerSize} border-t-4 border-l-4 border-neon-green rounded-tl-2xl`} />
        <div className={`absolute top-0 right-0 ${cornerSize} border-t-4 border-r-4 border-neon-green rounded-tr-2xl`} />
        <div className={`absolute bottom-0 left-0 ${cornerSize} border-b-4 border-l-4 border-neon-green rounded-bl-2xl`} />
        <div className={`absolute bottom-0 right-0 ${cornerSize} border-b-4 border-r-4 border-neon-green rounded-br-2xl`} />

        {scanning && (
          <div className="absolute left-2 right-2 top-0 h-0.5 bg-gradient-to-r from-transparent via-neon-green to-transparent animate-scan shadow-neon-green" />
        )}

        <div className="absolute inset-8 border border-neon-green/20 rounded-lg" />
      </div>

      {title && (
        <h3 className="mt-6 text-xl font-bold text-white">{title}</h3>
      )}
      {subtitle && (
        <p className="mt-2 text-gray-400">{subtitle}</p>
      )}
    </div>
  );
};
