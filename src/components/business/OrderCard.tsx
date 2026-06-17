import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, Package } from 'lucide-react';
import { Card } from '../common/Card';
import { StatusBadge } from '../common/StatusBadge';
import { CountdownTimer } from '../common/CountdownTimer';
import type { Order } from '../../types';
import { formatCurrency, formatTime } from '../../utils/format';

interface OrderCardProps {
  order: Order;
}

export const OrderCard = ({ order }: OrderCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (order.status === 'pending' || order.status === 'using' || order.status === 'picked') {
      navigate(`/voucher/${order.id}`);
    }
  };

  return (
    <Card
      className="cursor-pointer hover:border-neon-purple/50 transition-colors"
      onClick={handleClick}
      padding="md"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">
            {order.type === 'rent' ? '📦' : '🔐'}
          </span>
          <div>
            <h4 className="font-bold text-white">
              {order.type === 'rent' ? order.equipmentName : `储物柜 ${order.lockerNo}`}
            </h4>
            <p className="text-xs text-gray-400">订单号: {order.orderNo}</p>
          </div>
        </div>
        <StatusBadge status={order.status} size="sm" />
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center text-gray-400">
          <MapPin size={14} className="mr-2" />
          <span>{order.pickupPointName}</span>
        </div>
        {order.status !== 'completed' && (
          <div className="flex items-center text-gray-400">
            <Clock size={14} className="mr-2" />
            <span>归还截止: {formatTime(order.dueAt)}</span>
          </div>
        )}
        <div className="flex items-center text-gray-400">
          <Package size={14} className="mr-2" />
          <span>数量: {order.quantity} 件</span>
        </div>
      </div>

      {(order.status === 'using' || order.status === 'pending' || order.status === 'picked') && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <CountdownTimer targetDate={order.dueAt} size="sm" label="剩余时间" />
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
        <div>
          <span className="text-gray-400 text-sm">租金: </span>
          <span className="text-neon-pink font-bold">{formatCurrency(order.rentalFee)}</span>
        </div>
        <div>
          <span className="text-gray-400 text-sm">押金: </span>
          <span className="text-white font-medium">{formatCurrency(order.deposit)}</span>
        </div>
      </div>
    </Card>
  );
};
