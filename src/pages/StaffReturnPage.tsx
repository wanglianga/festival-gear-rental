import { useState } from 'react';
import { ArrowLeft, Camera, Check, X, AlertTriangle, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ScanFrame } from '../components/business/ScanFrame';
import { BottomSheet } from '../components/common/BottomSheet';
import { useOrderStore } from '../store/useOrderStore';
import { formatCurrency, formatTime } from '../utils/format';
import { cn } from '../lib/utils';
import type { DamageLevel } from '../types';

export const StaffReturnPage = () => {
  const navigate = useNavigate();
  const { orders, returnOrder } = useOrderStore();

  const [step, setStep] = useState<'scan' | 'check' | 'confirm'>('scan');
  const [currentOrder, setCurrentOrder] = useState<typeof orders[0] | null>(null);
  const [damageLevel, setDamageLevel] = useState<DamageLevel>('none');
  const [damageDesc, setDamageDesc] = useState('');
  const [damageFee, setDamageFee] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const damageOptions: { level: DamageLevel; label: string; desc: string; fee: number; color: string }[] = [
    { level: 'none', label: '完好', desc: '物品完好无损', fee: 0, color: 'neon-green' },
    { level: 'minor', label: '轻微损坏', desc: '小污渍、轻微磨损', fee: 20, color: 'neon-yellow' },
    { level: 'moderate', label: '中度损坏', desc: '部件损坏、明显磨损', fee: 100, color: 'neon-orange' },
    { level: 'severe', label: '严重损坏', desc: '无法使用、丢失', fee: 300, color: 'red-500' },
  ];

  const handleScan = (orderId: string) => {
    const order = orders.find((o) => o.orderNo === orderId || o.pickupCode === orderId || o.id === orderId);
    if (order && (order.status === 'using' || order.status === 'picked')) {
      setCurrentOrder(order);
      setStep('check');
    }
  };

  const handleDamageSelect = (option: typeof damageOptions[0]) => {
    setDamageLevel(option.level);
    setDamageFee(option.fee);
  };

  const handleConfirm = () => {
    if (currentOrder) {
      returnOrder(currentOrder.id, damageFee, damageDesc);
      setStep('confirm');
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setStep('scan');
        setCurrentOrder(null);
        setDamageLevel('none');
        setDamageDesc('');
        setDamageFee(0);
      }, 2500);
    }
  };

  return (
    <div className="min-h-screen bg-festival-dark pb-24">
      <div className="sticky top-0 z-30 bg-festival-dark/95 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center px-4 py-4">
          {step !== 'scan' && (
            <button
              onClick={() => setStep('scan')}
              className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
          )}
          <h1 className="text-xl font-bold text-white ml-2">
            {step === 'scan' && '验收归还'}
            {step === 'check' && '物品检查'}
            {step === 'confirm' && '归还确认'}
          </h1>
        </div>

        {step !== 'scan' && (
          <div className="flex items-center justify-center gap-2 pb-4">
            {['scan', 'check', 'confirm'].map((s, idx) => (
              <div key={s} className="flex items-center">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                    step === s
                      ? 'bg-gradient-to-r from-neon-pink to-neon-purple text-white'
                      : idx < ['scan', 'check', 'confirm'].indexOf(step)
                      ? 'bg-neon-green text-black'
                      : 'bg-white/10 text-gray-400'
                  )}
                >
                  {idx < ['scan', 'check', 'confirm'].indexOf(step) ? (
                    <Check size={16} />
                  ) : (
                    idx + 1
                  )}
                </div>
                {idx < 2 && (
                  <div
                    className={cn(
                      'w-12 h-1 mx-1 rounded-full',
                      idx < ['scan', 'check', 'confirm'].indexOf(step)
                        ? 'bg-neon-green'
                        : 'bg-white/10'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {step === 'scan' && (
        <div className="flex flex-col items-center justify-center py-8 px-4">
          <div className="w-full max-w-md">
            <ScanFrame
              size="full"
              title="扫描归还码"
              subtitle="扫描用户的订单二维码进行归还"
            />

            <div className="mt-8 text-center">
              <p className="text-gray-400 mb-4">或选择待归还订单</p>
              <div className="space-y-3">
                {orders.filter(o => o.status === 'using' || o.status === 'picked').slice(0, 3).map((order) => (
                  <Card
                    key={order.id}
                    padding="md"
                    className="cursor-pointer hover:border-neon-purple/50 transition-colors"
                    onClick={() => handleScan(order.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">
                          {order.type === 'rent' ? order.equipmentName : `储物柜 ${order.lockerNo}`}
                        </p>
                        <p className="text-gray-400 text-sm">{order.orderNo}</p>
                      </div>
                      <span className="text-neon-green text-sm">待归还</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 'check' && currentOrder && (
        <div className="p-4">
          <Card padding="lg" className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-pink/20 to-neon-purple/20 flex items-center justify-center">
                <span className="text-4xl">
                  {currentOrder.type === 'rent' ? '📦' : '🔐'}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg">
                  {currentOrder.type === 'rent' ? currentOrder.equipmentName : `储物柜 ${currentOrder.lockerNo}`}
                </h3>
                <p className="text-gray-400 text-sm">{currentOrder.orderNo}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">数量</p>
                <p className="text-white font-medium">{currentOrder.quantity} 件</p>
              </div>
              <div>
                <p className="text-gray-400">押金</p>
                <p className="text-white font-medium">{formatCurrency(currentOrder.deposit)}</p>
              </div>
              <div>
                <p className="text-gray-400">取件时间</p>
                <p className="text-white font-medium">{formatTime(currentOrder.pickedAt || currentOrder.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-400">取件点</p>
                <p className="text-white font-medium text-sm truncate">{currentOrder.pickupPointName}</p>
              </div>
            </div>
          </Card>

          <h3 className="text-lg font-bold text-white mb-4">物品状态</h3>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {damageOptions.map((option) => (
              <button
                key={option.level}
                onClick={() => handleDamageSelect(option)}
                className={cn(
                  'p-4 rounded-2xl border-2 text-left transition-all',
                  damageLevel === option.level
                    ? `border-${option.color} bg-${option.color}/10`
                    : 'border-white/10 bg-white/5 hover:border-white/30'
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  {option.level === 'none' ? (
                    <Check size={18} className={cn(`text-${option.color}`)} />
                  ) : (
                    <AlertTriangle size={18} className={cn(`text-${option.color}`)} />
                  )}
                  <span className={cn('font-bold', `text-${option.color}`)}>
                    {option.label}
                  </span>
                </div>
                <p className="text-gray-400 text-xs">{option.desc}</p>
                <p className={cn('text-sm font-bold mt-2', `text-${option.color}`)}>
                  {option.fee > 0 ? `扣费 ${formatCurrency(option.fee)}` : '免费'}
                </p>
              </button>
            ))}
          </div>

          <div className="mb-6">
            <h4 className="text-white font-medium mb-3">损坏描述 (可选)</h4>
            <textarea
              value={damageDesc}
              onChange={(e) => setDamageDesc(e.target.value)}
              placeholder="请描述损坏情况..."
              className="w-full h-24 bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-neon-purple/50"
            />
          </div>

          <div className="mb-6">
            <h4 className="text-white font-medium mb-3">拍照记录 (可选)</h4>
            <div className="flex gap-3">
              <button className="w-20 h-20 rounded-2xl bg-white/5 border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-gray-500 hover:border-white/40 hover:text-gray-300 transition-colors">
                <Camera size={24} />
                <span className="text-xs mt-1">添加照片</span>
              </button>
            </div>
          </div>

          {damageFee > 0 && (
            <Card padding="md" className="mb-6 bg-neon-orange/10 border-neon-orange/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <DollarSign className="text-neon-orange" size={24} />
                  <span className="text-white">损坏赔偿费用</span>
                </div>
                <span className="text-neon-orange text-2xl font-bold">
                  {formatCurrency(damageFee)}
                </span>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                将从押金中扣除，剩余押金原路退回
              </p>
            </Card>
          )}

          <Button fullWidth size="xl" onClick={handleConfirm}>
            确认归还
          </Button>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-festival-dark rounded-3xl p-8 text-center animate-bounce">
            <div className="w-20 h-20 rounded-full bg-neon-green/20 flex items-center justify-center mx-auto mb-4">
              <Check size={48} className="text-neon-green" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">归还成功</h3>
            <p className="text-gray-400">
              {damageFee > 0
                ? `已扣除损坏费 ${formatCurrency(damageFee)}`
                : '押金将原路退回'
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
