import { QRCodeDisplay } from '../common/QRCodeDisplay';
import { StatusBadge } from '../common/StatusBadge';
import { CountdownTimer } from '../common/CountdownTimer';
import { MapPin, Clock, Hash, Copy, Check } from 'lucide-react';
import type { Order } from '../../types';
import { useState } from 'react';

interface PickupVoucherProps {
  order: Order;
}

export const PickupVoucher = ({ order }: PickupVoucherProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(order.pickupCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败', err);
    }
  };

  return (
    <div className="bg-gradient-to-b from-festival-purple to-festival-dark rounded-3xl p-6 border border-neon-purple/30">
      <div className="flex items-center justify-between mb-4">
        <StatusBadge status={order.status} size="lg" />
        <span className="text-sm text-gray-400">{order.orderNo}</span>
      </div>

      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white mb-1">
          {order.type === 'rent' ? order.equipmentName : `储物柜 ${order.lockerNo}`}
        </h3>
        <p className="text-gray-400 text-sm">
          数量: {order.quantity} 件
        </p>
      </div>

      <div className="flex justify-center mb-6">
        <QRCodeDisplay value={order.qrCode} size={220} />
      </div>

      <div className="bg-black/30 rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hash className="text-neon-yellow" size={20} />
            <span className="text-gray-400">取件码</span>
          </div>
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1 text-neon-yellow hover:text-yellow-300 transition-colors"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span className="text-sm">{copied ? '已复制' : '复制'}</span>
          </button>
        </div>
        <p className="text-4xl font-mono font-bold text-neon-yellow text-center mt-2 tracking-widest">
          {order.pickupCode}
        </p>
      </div>

      {order.lockerNo && (
        <div className="bg-neon-pink/20 border border-neon-pink/30 rounded-2xl p-4 mb-4">
          <p className="text-gray-400 text-sm text-center">柜号</p>
          <p className="text-2xl font-bold text-neon-pink text-center mt-1">
            {order.lockerNo}
          </p>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center text-gray-300">
          <MapPin size={18} className="mr-3 text-neon-purple" />
          <span>{order.pickupPointName}</span>
        </div>
        <div className="flex items-center text-gray-300">
          <Clock size={18} className="mr-3 text-neon-purple" />
          <span>归还截止</span>
        </div>
      </div>

      <div className="mt-4">
        <CountdownTimer targetDate={order.dueAt} size="lg" />
      </div>
    </div>
  );
};
