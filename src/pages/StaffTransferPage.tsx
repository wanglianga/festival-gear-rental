import { useState } from 'react';
import { ArrowLeft, ArrowLeftRight, Package, MapPin, Plus, Minus, Check, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { BottomSheet } from '../components/common/BottomSheet';
import { useAppStore } from '../store/useAppStore';
import { useEquipmentStore } from '../store/useEquipmentStore';
import { useOrderStore } from '../store/useOrderStore';
import { stockTransfers } from '../data/mockData';
import { getStatusText } from '../utils/format';
import { cn } from '../lib/utils';
import type { StockTransfer } from '../types';

export const StaffTransferPage = () => {
  const navigate = useNavigate();
  const { currentPointId } = useAppStore();
  const { pickupPoints, equipments } = useEquipmentStore();
  const { staffStats } = useOrderStore();

  const [activeTab, setActiveTab] = useState<'list' | 'new'>('list');
  const [transfers, setTransfers] = useState<StockTransfer[]>(stockTransfers);
  const [showNewTransfer, setShowNewTransfer] = useState(false);

  const [fromPoint, setFromPoint] = useState('');
  const [toPoint, setToPoint] = useState(currentPointId);
  const [equipmentId, setEquipmentId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  const pendingTransfers = transfers.filter((t) => t.status === 'pending' || t.status === 'inProgress');
  const completedTransfers = transfers.filter((t) => t.status === 'completed' || t.status === 'cancelled');

  const handleCreateTransfer = () => {
    if (fromPoint && toPoint && equipmentId && quantity > 0) {
      const fromPointData = pickupPoints.find((p) => p.id === fromPoint);
      const toPointData = pickupPoints.find((p) => p.id === toPoint);
      const equipment = equipments.find((e) => e.id === equipmentId);

      const newTransfer: StockTransfer = {
        id: `transfer-${Date.now()}`,
        fromPointId: fromPoint,
        fromPointName: fromPointData?.name || '',
        toPointId: toPoint,
        toPointName: toPointData?.name || '',
        equipmentId,
        equipmentName: equipment?.name || '',
        quantity,
        status: 'pending',
        createdAt: new Date().toISOString(),
        operator: '管理员',
      };

      setTransfers([newTransfer, ...transfers]);
      setShowNewTransfer(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }
  };

  const handleCompleteTransfer = (transferId: string) => {
    setTransfers((prev) =>
      prev.map((t) =>
        t.id === transferId
          ? { ...t, status: 'completed' as const, completedAt: new Date().toISOString() }
          : t
      )
    );
  };

  const availableEquipments = equipments.filter((e) => {
    const fromPointData = pickupPoints.find((p) => p.id === fromPoint);
    const stock = fromPointData?.equipmentStock[e.id] || 0;
    return stock > 0;
  });

  return (
    <div className="min-h-screen bg-festival-dark pb-24">
      <div className="sticky top-0 z-30 bg-festival-dark/95 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-white ml-2">库存调拨</h1>
          </div>
          <button
            onClick={() => setShowNewTransfer(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-neon-pink to-neon-purple text-white font-medium text-sm shadow-neon-pink"
          >
            <Plus size={18} />
            新建调拨
          </button>
        </div>

        <div className="flex gap-2 px-4 pb-4">
          <button
            onClick={() => setActiveTab('list')}
            className={cn(
              'flex-1 py-2.5 rounded-xl font-medium transition-all',
              activeTab === 'list'
                ? 'bg-gradient-to-r from-neon-pink to-neon-purple text-white'
                : 'bg-white/10 text-gray-400 hover:text-white'
            )}
          >
            调拨记录
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card padding="md" className="bg-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-neon-green/20 rounded-xl">
                <Package className="text-neon-green" size={22} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{staffStats.todayPicked}</p>
                <p className="text-xs text-gray-400">今日发放</p>
              </div>
            </div>
          </Card>
          <Card padding="md" className="bg-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-neon-yellow/20 rounded-xl">
                <ArrowLeftRight className="text-neon-yellow" size={22} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{pendingTransfers.length}</p>
                <p className="text-xs text-gray-400">待处理调拨</p>
              </div>
            </div>
          </Card>
          <Card padding="md" className="bg-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-neon-orange/20 rounded-xl">
                <Clock className="text-neon-orange" size={22} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{staffStats.lowStockAlerts}</p>
                <p className="text-xs text-gray-400">库存告警</p>
              </div>
            </div>
          </Card>
          <Card padding="md" className="bg-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-neon-blue/20 rounded-xl">
                <MapPin className="text-neon-blue" size={22} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{pickupPoints.length}</p>
                <p className="text-xs text-gray-400">服务点位</p>
              </div>
            </div>
          </Card>
        </div>

        {pendingTransfers.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-3">待处理调拨</h3>
            <div className="space-y-3">
              {pendingTransfers.map((transfer) => (
                <Card key={transfer.id} padding="md" className="border-neon-yellow/30 bg-neon-yellow/5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="text-neon-yellow" size={18} />
                        <span className="text-white font-bold">{transfer.equipmentName}</span>
                        <span className="text-neon-yellow font-bold">x{transfer.quantity}</span>
                      </div>
                      <p className="text-gray-400 text-sm">{transfer.id}</p>
                    </div>
                    <span className="px-2 py-1 bg-neon-yellow/20 text-neon-yellow text-xs rounded-full">
                      {getStatusText(transfer.status)}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm mb-4">
                    <div className="flex-1">
                      <p className="text-gray-400 text-xs">调出</p>
                      <p className="text-white">{transfer.fromPointName}</p>
                    </div>
                    <ArrowLeftRight className="text-neon-purple flex-shrink-0" size={20} />
                    <div className="flex-1 text-right">
                      <p className="text-gray-400 text-xs">调入</p>
                      <p className="text-white">{transfer.toPointName}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>操作人: {transfer.operator}</span>
                    <span>{transfer.createdAt.slice(11, 16)}</span>
                  </div>

                  {transfer.status === 'pending' && (
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      onClick={() => handleCompleteTransfer(transfer.id)}
                    >
                      <Check className="mr-1.5" size={16} />
                      确认接收
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {completedTransfers.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-white mb-3">历史记录</h3>
            <div className="space-y-3">
              {completedTransfers.map((transfer) => (
                <Card key={transfer.id} padding="md" className="bg-white/5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Package className="text-gray-400" size={18} />
                      <span className="text-white font-medium">{transfer.equipmentName}</span>
                      <span className="text-gray-400">x{transfer.quantity}</span>
                    </div>
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      transfer.status === 'completed'
                        ? 'bg-neon-green/20 text-neon-green'
                        : 'bg-gray-500/20 text-gray-400'
                    )}>
                      {getStatusText(transfer.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{transfer.fromPointName}</span>
                    <ArrowLeftRight size={12} />
                    <span>{transfer.toPointName}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomSheet
        isOpen={showNewTransfer}
        onClose={() => setShowNewTransfer(false)}
        title="新建库存调拨"
        maxHeight="80vh"
      >
        <div className="space-y-5">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">调出点位</label>
            <select
              value={fromPoint}
              onChange={(e) => setFromPoint(e.target.value)}
              className="w-full py-3.5 px-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-neon-purple/50 appearance-none"
            >
              <option value="">请选择调出点位</option>
              {pickupPoints.map((point) => (
                <option key={point.id} value={point.id} className="bg-festival-dark">
                  {point.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">调入点位</label>
            <select
              value={toPoint}
              onChange={(e) => setToPoint(e.target.value)}
              className="w-full py-3.5 px-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-neon-purple/50 appearance-none"
            >
              <option value="">请选择调入点位</option>
              {pickupPoints.map((point) => (
                <option key={point.id} value={point.id} className="bg-festival-dark">
                  {point.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">选择装备</label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {(fromPoint ? availableEquipments : equipments).map((equip) => {
                const pointData = pickupPoints.find((p) => p.id === fromPoint);
                const stock = pointData?.equipmentStock[equip.id] || equip.stock;
                return (
                  <button
                    key={equip.id}
                    onClick={() => setEquipmentId(equip.id)}
                    className={cn(
                      'w-full p-3 rounded-xl border-2 text-left flex items-center gap-3 transition-all',
                      equipmentId === equip.id
                        ? 'border-neon-purple bg-neon-purple/10'
                        : 'border-white/10 bg-white/5 hover:border-white/30'
                    )}
                  >
                    <span className="text-2xl">{equip.image}</span>
                    <div className="flex-1">
                      <p className="text-white font-medium">{equip.name}</p>
                      <p className="text-gray-400 text-sm">库存: {stock}</p>
                    </div>
                    {equipmentId === equip.id && (
                      <Check className="text-neon-purple" size={20} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">调拨数量</label>
            <div className="flex items-center justify-between bg-white/5 rounded-2xl p-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              >
                <Minus size={20} />
              </button>
              <span className="text-2xl font-bold text-white w-20 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-12 rounded-xl bg-gradient-to-r from-neon-pink to-neon-purple flex items-center justify-center text-white shadow-neon-pink"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          <Button
            fullWidth
            size="lg"
            onClick={handleCreateTransfer}
            disabled={!fromPoint || !toPoint || !equipmentId || fromPoint === toPoint}
          >
            创建调拨单
          </Button>
        </div>
      </BottomSheet>

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-festival-dark rounded-3xl p-8 text-center animate-bounce">
            <div className="w-20 h-20 rounded-full bg-neon-green/20 flex items-center justify-center mx-auto mb-4">
              <Check size={48} className="text-neon-green" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">创建成功</h3>
            <p className="text-gray-400">调拨单已创建</p>
          </div>
        </div>
      )}
    </div>
  );
};
