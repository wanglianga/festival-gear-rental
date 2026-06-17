import { useState } from 'react';
import { MapPin, Clock, Users, Package, ArrowLeft, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { BottomSheet } from '../components/common/BottomSheet';
import { PickupPointCard } from '../components/business/PickupPointCard';
import { useEquipmentStore } from '../store/useEquipmentStore';
import { getPointTypeText, getQueueColor } from '../utils/format';
import { cn } from '../lib/utils';

export const MapPage = () => {
  const navigate = useNavigate();
  const { pickupPoints } = useEquipmentStore();
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const selectedPointData = pickupPoints.find((p) => p.id === selectedPoint);

  const handlePointClick = (pointId: string) => {
    setSelectedPoint(pointId);
    setShowDetail(true);
  };

  return (
    <div className="min-h-screen bg-festival-dark pb-24">
      <div className="sticky top-0 z-30 bg-festival-dark/95 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-white ml-2">取还点地图</h1>
        </div>
      </div>

      <div className="relative h-[50vh] min-h-[400px] bg-gradient-to-b from-festival-purple/50 to-festival-dark overflow-hidden">
        <div className="absolute inset-0 p-4">
          <div className="relative w-full h-full bg-gradient-to-br from-festival-purple/30 to-festival-dark/50 rounded-3xl border border-white/10 overflow-hidden">
            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-32 h-24 bg-gradient-to-b from-neon-pink/30 to-transparent rounded-t-full blur-sm">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                <span className="text-3xl">🎤</span>
                <p className="text-xs text-white/70 mt-1">主舞台</p>
              </div>
            </div>

            <div className="absolute bottom-8 left-8 w-20 h-20 bg-gradient-to-br from-neon-green/20 to-transparent rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <span className="text-2xl">🏕️</span>
                <p className="text-xs text-white/70">营地区</p>
              </div>
            </div>

            <div className="absolute bottom-8 right-8 w-20 h-16 bg-gradient-to-br from-neon-yellow/20 to-transparent rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <span className="text-2xl">🚪</span>
                <p className="text-xs text-white/70">出口</p>
              </div>
            </div>

            <div className="absolute top-1/2 right-12 w-16 h-16 bg-gradient-to-br from-neon-purple/20 to-transparent rounded-xl flex items-center justify-center">
              <div className="text-center">
                <span className="text-xl">🍔</span>
                <p className="text-[10px] text-white/70">美食区</p>
              </div>
            </div>

            {pickupPoints.map((point) => (
              <button
                key={point.id}
                onClick={() => handlePointClick(point.id)}
                className={cn(
                  'absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300',
                  selectedPoint === point.id ? 'scale-125 z-10' : 'hover:scale-110'
                )}
                style={{ left: `${point.location.x}%`, top: `${point.location.y}%` }}
              >
                <div className="relative">
                  {selectedPoint === point.id && (
                    <div className="absolute inset-0 bg-neon-pink/30 rounded-full animate-ping" />
                  )}
                  <div className={cn(
                    'relative w-12 h-12 rounded-full flex items-center justify-center shadow-lg',
                    point.queueLength === 0
                      ? 'bg-neon-green text-white shadow-neon-green'
                      : point.queueLength <= 5
                      ? 'bg-neon-yellow text-black shadow-neon-yellow'
                      : point.queueLength <= 10
                      ? 'bg-neon-orange text-white shadow-neon-orange'
                      : 'bg-red-500 text-white'
                  )}>
                    <MapPin size={24} />
                  </div>
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="text-[10px] text-white/80 bg-black/50 px-1.5 py-0.5 rounded">
                      {point.name.slice(0, 4)}
                    </span>
                  </div>
                </div>
              </button>
            ))}

            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-xl p-3">
              <p className="text-xs text-white/70 mb-2">排队状态</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-neon-green" />
                  <span className="text-xs text-white/80">空闲 (0人)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-neon-yellow" />
                  <span className="text-xs text-white/80">较少 (≤5人)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-neon-orange" />
                  <span className="text-xs text-white/80">较多 (≤10人)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-xs text-white/80">拥挤 (10+人)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        <h2 className="text-lg font-bold text-white mb-4">全部取还点 ({pickupPoints.length})</h2>
        <div className="space-y-3">
          {pickupPoints.map((point) => (
            <PickupPointCard
              key={point.id}
              point={point}
              selected={selectedPoint === point.id}
              onClick={() => handlePointClick(point.id)}
            />
          ))}
        </div>
      </div>

      <BottomSheet
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        title={selectedPointData?.name || ''}
        maxHeight="70vh"
      >
        {selectedPointData && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-400">点位类型</p>
                <p className="text-white font-medium">
                  {getPointTypeText(selectedPointData.type)}
                </p>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-400">距离</p>
                <p className="text-neon-green font-bold text-lg">
                  {selectedPointData.distance}m
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Card padding="md" className="bg-white/5">
                <div className="flex items-center gap-3">
                  <Users size={24} className={getQueueColor(selectedPointData.queueLength)} />
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {selectedPointData.queueLength}
                    </p>
                    <p className="text-xs text-gray-400">排队人数</p>
                  </div>
                </div>
              </Card>
              <Card padding="md" className="bg-white/5">
                <div className="flex items-center gap-3">
                  <Clock size={24} className="text-neon-yellow" />
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {selectedPointData.waitTime}
                    </p>
                    <p className="text-xs text-gray-400">预计等待(分钟)</p>
                  </div>
                </div>
              </Card>
            </div>

            <Card padding="md" className="bg-white/5">
              <div className="flex items-center gap-3 mb-3">
                <Package size={20} className="text-neon-blue" />
                <span className="text-white font-medium">储物柜状态</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">可用/总数</span>
                <span className="text-white font-medium">
                  {selectedPointData.availableLockers} / {selectedPointData.lockerCount}
                </span>
              </div>
              <div className="mt-2 h-2 bg-black/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-neon-blue rounded-full transition-all"
                  style={{
                    width: `${(selectedPointData.availableLockers / selectedPointData.lockerCount) * 100}%`,
                  }}
                />
              </div>
            </Card>

            <div className="flex gap-3 pt-2">
              <button
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
                onClick={() => {}}
              >
                <Navigation size={20} />
                导航前往
              </button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
};
