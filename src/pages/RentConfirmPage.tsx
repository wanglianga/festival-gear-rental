import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ShieldCheck, MapPin, Clock, Plus, Minus, Check, 
  AlertTriangle, AlertCircle, CheckCircle2, Users, 
  Navigation, RefreshCw, Star, ShieldAlert 
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { BottomSheet } from '../components/common/BottomSheet';
import { PickupPointCard } from '../components/business/PickupPointCard';
import { useEquipmentStore } from '../store/useEquipmentStore';
import { useOrderStore } from '../store/useOrderStore';
import { useScheduleStore } from '../store/useScheduleStore';
import { useLockerStore } from '../store/useLockerStore';
import { formatCurrency, getStockStatus, formatTime } from '../utils/format';
import { cn } from '../lib/utils';
import type { TimeConflictResult, ConflictSuggestion, PickupPoint } from '../types';

export const RentConfirmPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getEquipmentById, pickupPoints } = useEquipmentStore();
  const { createOrder } = useOrderStore();
  const { checkTimeConflict, getFavoriteSchedules, getNextUpcomingSchedule, getAlternativePoints, toggleFavorite } = useScheduleStore();
  const { createCompanionAuthorization } = useLockerStore();

  const [quantity, setQuantity] = useState(1);
  const [selectedPoint, setSelectedPoint] = useState('point-1');
  const [selectedDate, setSelectedDate] = useState('2026-06-17');
  const [selectedTime, setSelectedTime] = useState('17:00');
  const [showPointSelect, setShowPointSelect] = useState(false);
  const [showTimeSelect, setShowTimeSelect] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showScheduleSelect, setShowScheduleSelect] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [conflictResult, setConflictResult] = useState<TimeConflictResult | null>(null);
  const [authorizedName, setAuthorizedName] = useState('');
  const [authorizedPhone, setAuthorizedPhone] = useState('');

  const equipment = getEquipmentById(id || '');
  const selectedPointData = pickupPoints.find((p) => p.id === selectedPoint);
  const favoriteSchedules = getFavoriteSchedules();
  const nextShow = getNextUpcomingSchedule();
  const alternativePoints = getAlternativePoints(selectedPoint, id || 'all');

  useEffect(() => {
    const fullDateTime = `${selectedDate}T${selectedTime}:00`;
    const result = checkTimeConflict(fullDateTime, selectedPoint, 'pickup');
    setConflictResult(result);
  }, [selectedTime, selectedPoint, selectedDate, checkTimeConflict]);

  const timeSlots = [
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00',
  ];

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

  const handleSuggestionClick = (suggestion: ConflictSuggestion) => {
    switch (suggestion.type) {
      case 'earlier_pickup':
        const earlierTime = timeSlots[Math.max(0, timeSlots.indexOf(selectedTime) - 2)];
        setSelectedTime(earlierTime);
        break;
      case 'change_point':
        if (alternativePoints.length > 0) {
          setSelectedPoint(alternativePoints[0].id);
        }
        break;
      case 'authorize_companion':
        setShowAuthModal(true);
        break;
    }
  };

  const handleCreateAuthorization = () => {
    if (!authorizedName || !authorizedPhone) return;
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
    createCompanionAuthorization({
      orderId: order.id,
      authorizerId: 'user-1',
      authorizerName: '张先生',
      authorizedName,
      authorizedPhone,
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    });
    setShowAuthModal(false);
    navigate(`/voucher/${order.id}`);
  };

  const handlePointChange = (pointId: string) => {
    setSelectedPoint(pointId);
    setShowPointSelect(false);
  };

  const dueTime = new Date();
  dueTime.setHours(22, 0, 0, 0);

  const conflictLevelConfig = {
    safe: {
      icon: CheckCircle2,
      bgColor: 'bg-neon-green/10',
      borderColor: 'border-neon-green/30',
      iconColor: 'text-neon-green',
      titleColor: 'text-neon-green',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-neon-yellow/10',
      borderColor: 'border-neon-yellow/30',
      iconColor: 'text-neon-yellow',
      titleColor: 'text-neon-yellow',
    },
    danger: {
      icon: AlertCircle,
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      iconColor: 'text-red-500',
      titleColor: 'text-red-500',
    },
  };

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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">领取时间</h3>
            <button
              onClick={() => setShowScheduleSelect(true)}
              className="text-sm text-neon-purple hover:text-neon-pink transition-colors flex items-center gap-1"
            >
              <Star size={16} />
              关注演出
            </button>
          </div>
          <div
            className="cursor-pointer hover:bg-white/5 rounded-2xl -m-1 p-1"
            onClick={() => setShowTimeSelect(true)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-neon-blue/20 rounded-xl">
                  <Clock className="text-neon-blue" size={22} />
                </div>
                <div>
                  <p className="text-white font-medium">{selectedDate} {selectedTime}</p>
                  <p className="text-sm text-gray-400">
                    预计耗时约 {checkTimeConflict(`${selectedDate}T${selectedTime}:00`, selectedPoint, 'pickup').bufferMinutes > 100 ? '15' : Math.max(5, 15 - checkTimeConflict(`${selectedDate}T${selectedTime}:00`, selectedPoint, 'pickup').bufferMinutes)} 分钟
                  </p>
                </div>
              </div>
              <ArrowLeft size={20} className="text-gray-400 rotate-180" />
            </div>
          </div>
        </Card>

        {conflictResult && conflictResult.level !== 'safe' && (
          <Card
            padding="lg"
            className={cn(
              'mb-4 border-2',
              conflictLevelConfig[conflictResult.level].bgColor,
              conflictLevelConfig[conflictResult.level].borderColor
            )}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className={cn(
                'p-2 rounded-lg flex-shrink-0',
                conflictLevelConfig[conflictResult.level].bgColor
              )}>
                {(() => {
                  const Icon = conflictLevelConfig[conflictResult.level].icon;
                  return <Icon className={conflictLevelConfig[conflictResult.level].iconColor} size={24} />;
                })()}
              </div>
              <div className="flex-1">
                <h4 className={cn(
                  'font-bold text-lg mb-1',
                  conflictLevelConfig[conflictResult.level].titleColor
                )}>
                  {conflictResult.title}
                </h4>
                <p className="text-gray-300 text-sm">{conflictResult.description}</p>
                {nextShow && (
                  <div className="mt-3 p-3 bg-black/30 rounded-xl">
                    <p className="text-white text-sm font-medium mb-1">
                      🎵 下一场关注演出
                    </p>
                    <p className="text-neon-yellow text-sm">
                      {nextShow.artist} - {nextShow.stageName}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      {formatTime(nextShow.startTime)} 开始
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {conflictResult.suggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-white text-sm font-medium">💡 建议方案</p>
                {conflictResult.suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-xl text-left transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-neon-purple/20 rounded-lg flex-shrink-0 mt-0.5">
                        {suggestion.type === 'earlier_pickup' && <RefreshCw size={16} className="text-neon-purple" />}
                        {suggestion.type === 'change_point' && <Navigation size={16} className="text-neon-purple" />}
                        {suggestion.type === 'authorize_companion' && <Users size={16} className="text-neon-purple" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm group-hover:text-neon-purple transition-colors">
                          {suggestion.title}
                        </p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          {suggestion.description}
                        </p>
                      </div>
                      <div className="text-neon-purple text-sm font-medium">
                        {suggestion.actionText} →
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>
        )}

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
                  onClick={() => handlePointChange(point.id)}
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

      <BottomSheet
        isOpen={showTimeSelect}
        onClose={() => setShowTimeSelect(false)}
        title="选择领取时间"
        maxHeight="60vh"
      >
        <div className="mb-4">
          <p className="text-gray-400 text-sm mb-3">请选择您计划领取的时间</p>
          <div className="grid grid-cols-3 gap-3">
            {timeSlots.map((time) => (
              <button
                key={time}
                onClick={() => {
                  setSelectedTime(time);
                  setShowTimeSelect(false);
                }}
                className={cn(
                  'py-3 px-4 rounded-xl text-center font-medium transition-all',
                  selectedTime === time
                    ? 'bg-gradient-to-r from-neon-pink to-neon-purple text-white shadow-lg'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10'
                )}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      </BottomSheet>

      <BottomSheet
        isOpen={showScheduleSelect}
        onClose={() => setShowScheduleSelect(false)}
        title="关注的演出"
        maxHeight="70vh"
      >
        <div className="space-y-3">
          <p className="text-gray-400 text-sm mb-2">
            选择您关注的演出，系统将自动检测时间冲突
          </p>
          {favoriteSchedules.map((schedule) => (
            <Card key={schedule.id} padding="md" className="bg-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleFavorite(schedule.id)}
                    className="p-2 rounded-lg"
                  >
                    <Star
                      size={20}
                      className={schedule.isFavorite ? 'text-neon-yellow fill-neon-yellow' : 'text-gray-500'}
                    />
                  </button>
                  <div>
                    <p className="text-white font-medium">{schedule.artist}</p>
                    <p className="text-gray-400 text-sm">{schedule.stageName}</p>
                    <p className="text-neon-purple text-xs mt-1">
                      {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </BottomSheet>

      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-festival-dark rounded-t-3xl p-6 animate-slide-up">
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />
            
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-neon-purple/20 rounded-xl">
                <Users className="text-neon-purple" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">授权同伴代取</h3>
                <p className="text-gray-400 text-sm">生成代取码，让朋友帮您领取</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">
                  同伴姓名
                </label>
                <input
                  type="text"
                  value={authorizedName}
                  onChange={(e) => setAuthorizedName(e.target.value)}
                  placeholder="请输入同伴姓名"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-neon-purple/50"
                />
              </div>
              <div>
                <label className="text-white text-sm font-medium mb-2 block">
                  联系电话
                </label>
                <input
                  type="tel"
                  value={authorizedPhone}
                  onChange={(e) => setAuthorizedPhone(e.target.value)}
                  placeholder="请输入联系电话"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-neon-purple/50"
                />
              </div>
            </div>

            <div className="p-4 bg-neon-yellow/10 border border-neon-yellow/20 rounded-xl mb-6">
              <div className="flex items-start gap-2">
                <ShieldAlert className="text-neon-yellow flex-shrink-0 mt-0.5" size={18} />
                <p className="text-neon-yellow text-sm">
                  代取码生成后 4 小时内有效，请注意保管。领取时工作人员将核验代取人身份。
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setShowAuthModal(false)}
              >
                取消
              </Button>
              <Button
                variant="primary"
                fullWidth
                disabled={!authorizedName || !authorizedPhone}
                onClick={handleCreateAuthorization}
              >
                生成代取码
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
