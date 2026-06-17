import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxHeight?: string;
  showCloseButton?: boolean;
}

export const BottomSheet = ({
  isOpen,
  onClose,
  title,
  children,
  maxHeight = '60vh',
  showCloseButton = true,
}: BottomSheetProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative w-full bg-festival-dark border-t border-white/10 rounded-t-3xl',
          'animate-slide-up'
        )}
        style={{ maxHeight }}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 rounded-full bg-white/20" />
        </div>
        
        {title && (
          <div className="flex items-center justify-between px-6 pb-4">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            )}
          </div>
        )}
        
        <div className="px-6 pb-6 overflow-y-auto" style={{ maxHeight: 'calc(100% - 60px)' }}>
          {children}
        </div>
      </div>
    </div>
  );
};
