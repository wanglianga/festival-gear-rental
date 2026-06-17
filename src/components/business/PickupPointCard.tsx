import { Card } from '../common/Card';
import { MapPin, Users, Clock, Package } from 'lucide-react';
import type { PickupPoint } from '../../types';
import { getQueueColor, getPointTypeText, formatCurrency } from '../../utils/format';
import { cn } from '../../lib/utils';

interface PickupPointCardProps {
  point: PickupPoint;
  selected?: boolean;
  onClick?: () => void;
}

export const PickupPointCard = ({ point, selected, onClick }: PickupPointCardProps) => {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all',
        selected
          ? 'border-neon-pink shadow-neon-pink scale-[1.02]'
          : 'hover:border-white/30'
      )}
      padding="md"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-bold text-white text-lg">{point.name}</h4>
          <span className="text-xs text-neon-purple bg-neon-purple/20 px-2 py-0.5 rounded-full">
            {getPointTypeText(point.type)}
          </span>
        </div>
        <div className="text-right">
          <p className="text-neon-green font-bold text-lg">{point.distance}m</p>
          <p className="text-xs text-gray-400">步行约 {Math.ceil(point.distance / 80)} 分钟</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Users size={16} className={getQueueColor(point.queueLength)} />
          <span className="text-sm text-gray-300">
            排队 <span className={cn('font-bold', getQueueColor(point.queueLength))}>{point.queueLength}</span> 人
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-neon-yellow" />
          <span className="text-sm text-gray-300">
            等待约 <span className="font-bold text-neon-yellow">{point.waitTime}</span> 分钟
          </span>
        </div>
      </div>

      {point.availableLockers > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <Package size={16} className="text-neon-blue" />
          <span className="text-gray-300">
            可用储物柜: <span className="font-bold text-neon-blue">{point.availableLockers}</span> 个
          </span>
        </div>
      )}
    </Card>
  );
};
