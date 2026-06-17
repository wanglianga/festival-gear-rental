import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, MapPin, Clock, Plus, Minus, Check } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { BottomSheet } from '../components/common/BottomSheet';
import { PickupPointCard } from '../components/business/PickupPointCard';
import { useEquipmentStore } from '../store/useEquipmentStore';
import { useOrderStore } from '../store/useOrderStore';
import { formatCurrency, getStockStatus } from '../utils/format';

export const RentConfirmPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getEquipmentById, pickupPoints } = useEquipmentStore();
  const { createOrder } = useOrderStore();

  const [quantity, setQuantity] = useState(1);
  const [selectedPoint, setSelectedPoint] = useState('point-1');
  const [showPointSelect, setShowPointSelect] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const equipment = getEquipmentById(id || '');
  const selectedPointData = pickupPoints.find((p) => p.id === selectedPoint);

  if (!equipment) {
    return (
      <div className="min-h-screen bg-festival-dark flex items-center justify-center">
        <p className="text-white">装备不存在</p>
      </div>
    );
  }

  const stockAtPoint = selectedPointData?.equipmentStock[equipment.id] || 0;
  const stockStatus = getStockStatus(stockAtPoint, equipment.totalStock / 3);
  const totalDeposit = equipment.deposit * quantity;
  const totalFee = equipment.rentalFee * quantity;
  const totalAmount = totalDeposit + totalFee;

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= Math.min(stockAtPoint, 10)) {
      setQuantity(newQuantity);
    }
  };

  const handleConfirm = async () => {
    setIsConfirming(true);
    setTimeout(() => {
      const order = createOrder({
        type: equipment.category === 'locker' ? 'store' : 'rent',
        userId: 'user-1',
        equipmentId: equipment.id,
        equipmentName: equipment.name,
        quantity,
        pickupPointId: selectedPoint,
        pickupPointName: selectedPointData?.name || '',
        deposit: totalDeposit,
        rentalFee: totalFee,
        status: 'pending',
        dueAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      });
      setIsConfirming(false);
      navigate(`/voucher/${order.id}`);
    }, 1500);
  };

  const dueTime = new Date();
  dueTime.setHours(22, 0, 0, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-festival-dark to-festival-purple pb-32">
      <div className="sticky top-0 z-30 bg-festival-dark/95 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-white ml-2">确认订单</h1>
        </div>
      </div>

      <div className="p-4">
        <Card padding="lg" className="mb-4">
          <div className="flex gap-4">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-neon-pink/20 to-neon-purple/20 flex items-center justify-center flex-shrink-0">
              <span className="text-5xl">{equipment.image}</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-1">{equipment.name}</h2>
              <p className="text-gray-400 text-sm mb-2 line-clamp-2">{equipment.description}</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-neon-pink">{formatCurrency(equipment.rentalFee)}</span>
                <span className="text-gray-400 text-sm">/ 次</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-sm text-gray-400 mb-2">规格参数</p>
            <div className="flex flex-wrap gap-2">
              {equipment.specs.map((spec, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-white/10 rounded-full text-sm text-gray-300"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>
        </Card>

        <Card padding="lg" className="mb-4">
          <h3 className="text-lg font-bold text-white mb-4">数量选择</h3>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">当前点位库存</span>
            <span className={`font-medium ${stockStatus.color}`}>
              {stockAtPoint} 件 · {stockStatus.text}
            </span>
          </div>
          <div className="flex items-center justify-between mt-4">
            <span className="text-white font-medium">租借数量</span>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
              >
                <Minus size={20} />
              </button>
              <span className="text-2xl font-bold text-white w-12 text-center">
                {quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= Math.min(stockAtPoint, 10)}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-neon-pink to-neon-purple flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed shadow-neon-pink transition-all"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3 text-right">最多可租 10 件</p>
        </Card>

        <Card padding="lg" className="mb-4">
          <h3 className="text-lg font-bold text-white mb-4">取件点位</h3>
          <div
            className="cursor-pointer hover:bg-white/5 rounded-2xl -m-1 p-1"
            onClick={() => setShowPointSelect(true)}
          >
            {selectedPointData && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-neon-purple/20 rounded-xl">
                    <MapPin className="text-neon-purple" size={22} />
                  </div>
                  <div>
                    <p className="text-white font-medium">{selectedPointData.name}</p>
                    <p className="text-sm text-gray-400">
                      距离 {selectedPointData.distance}m · 排队 {selectedPointData.queueLength} 人
                    </p>
                  </div>
                </div>
                <ArrowLeft size={20} className="text-gray-400 rotate-180" />
              </div>
            )}
          </div>
        </Card>

        <Card padding="lg" className="mb-4">
          <h3 className="text-lg font-bold text-white mb-4">费用明细</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">租金 ({quantity}件)</span>
              <span className="text-white">{formatCurrency(totalFee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">押金</span>
              <span className="text-white">{formatCurrency(totalDeposit)}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <ShieldCheck size={16} className="text-neon-green" />
              <span>归还后押金将原路退回</span>
            </div>
            <div className="pt-3 mt-3 border-t border-white/10">
              <div className="flex justify-between items-baseline">
                <span className="text-gray-400">合计支付</span>
                <span className="text-3xl font-bold text-neon-pink">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card padding="lg" className="mb-4">
          <div className="flex items-start gap-3">
            <Clock className="text-neon-yellow flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-white font-medium mb-1">归还时间</p>
              <p className="text-gray-400 text-sm">
                请于当日 22:00 前归还至任意取还点，逾期将按每小时 {formatCurrency(Math.ceil(equipment.rentalFee * 0.2))} 收取超时费用
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-festival-dark via-festival-dark/95 to-transparent pt-12 pb-safe">
        <div className="max-w-lg mx-auto">
          <Button fullWidth size="xl" loading={isConfirming} onClick={handleConfirm}>
            {isConfirming ? '生成订单中...' : `确认支付 ${formatCurrency(totalAmount)}`}
          </Button>
          <p className="text-center text-xs text-gray-500 mt-2">
            点击确认即表示同意《租借服务协议》
          </p>
        </div>
      </div>

      <BottomSheet
        isOpen={showPointSelect}
        onClose={() => setShowPointSelect(false)}
        title="选择取还点"
        maxHeight="70vh"
      >
        <div className="space-y-3">
          {pickupPoints
            .filter((p) => (p.equipmentStock[equipment.id] || 0) > 0)
            .map((point) => (
              <div key={point.id} className="relative">
                <PickupPointCard
                  point={point}
                  selected={selectedPoint === point.id}
                  onClick={() => {
                    setSelectedPoint(point.id);
                    setShowPointSelect(false);
                  }}
                />
                {selectedPoint === point.id && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-neon-green flex items-center justify-center">
                    <Check size={16} className="text-black" />
                  </div>
                )}
              </div>
            ))}
        </div>
      </BottomSheet>
    </div>
  );
};
