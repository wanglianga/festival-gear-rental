import { useNavigate } from 'react-router-dom';
import { Tent, Zap, CloudRain, Armchair, Lock } from 'lucide-react';
import { Card } from '../common/Card';
import { ProgressBar } from '../common/ProgressBar';
import { Button } from '../common/Button';
import type { Equipment } from '../../types';
import { formatCurrency, getStockStatus } from '../../utils/format';
import { cn } from '../../lib/utils';

const categoryIcons: Record<string, typeof Tent> = {
  tent: Tent,
  powerBank: Zap,
  raincoat: CloudRain,
  chair: Armchair,
  locker: Lock,
};

interface EquipmentCardProps {
  equipment: Equipment;
  compact?: boolean;
}

export const EquipmentCard = ({ equipment, compact = false }: EquipmentCardProps) => {
  const navigate = useNavigate();
  const Icon = categoryIcons[equipment.category] || Tent;
  const stockStatus = getStockStatus(equipment.stock, equipment.totalStock);
  const isSoldOut = equipment.stock === 0;

  if (compact) {
    return (
      <Card
        className={cn(
          'cursor-pointer hover:scale-[1.02] transition-transform',
          isSoldOut && 'opacity-60'
        )}
        padding="md"
        onClick={() => !isSoldOut && navigate(`/rent/${equipment.id}`)}
      >
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neon-pink/20 to-neon-purple/20 flex items-center justify-center">
            <span className="text-3xl">{equipment.image}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white truncate">{equipment.name}</h3>
            <p className="text-sm text-gray-400">押金 {formatCurrency(equipment.deposit)}</p>
          </div>
          <div className="text-right">
            <p className="text-neon-pink font-bold text-lg">{formatCurrency(equipment.rentalFee)}</p>
            <p className={cn('text-xs', stockStatus.color)}>{stockStatus.text}</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-neon-purple transition-all duration-300">
      <div className="h-32 bg-gradient-to-br from-neon-pink/20 via-neon-purple/20 to-neon-blue/20 flex items-center justify-center relative">
        <span className="text-6xl">{equipment.image}</span>
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-red-500 font-bold text-lg">已售罄</span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            stockStatus.level === 'high' && 'bg-neon-green/20 text-neon-green',
            stockStatus.level === 'medium' && 'bg-neon-yellow/20 text-neon-yellow',
            stockStatus.level === 'low' && 'bg-neon-orange/20 text-neon-orange',
            stockStatus.level === 'empty' && 'bg-red-500/20 text-red-500',
          )}>
            {stockStatus.text}
          </span>
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="text-lg font-bold text-white mb-1">{equipment.name}</h3>
        <p className="text-sm text-gray-400 mb-3 line-clamp-2">{equipment.description}</p>
        
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-bold text-neon-pink">{formatCurrency(equipment.rentalFee)}</span>
          <span className="text-sm text-gray-400">/ 次</span>
        </div>
        
        <div className="text-sm text-gray-400 mb-3">
          押金: <span className="text-white">{formatCurrency(equipment.deposit)}</span>
        </div>
        
        <ProgressBar value={equipment.stock} max={equipment.totalStock} showLabel label="库存" />
        
        <div className="mt-4">
          <Button
            fullWidth
            size="md"
            variant={isSoldOut ? 'secondary' : 'primary'}
            disabled={isSoldOut}
            onClick={() => navigate(`/rent/${equipment.id}`)}
          >
            {isSoldOut ? '暂无库存' : '立即租借'}
          </Button>
        </div>
      </div>
    </Card>
  );
};
