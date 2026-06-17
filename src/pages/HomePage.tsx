import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, CloudSun, Clock, Music, MapPin, Bell } from 'lucide-react';
import { EquipmentCard } from '../components/business/EquipmentCard';
import { BrightModeToggle } from '../components/common/BrightModeToggle';
import { Button } from '../components/common/Button';
import { useEquipmentStore } from '../store/useEquipmentStore';
import { festivalData } from '../data/mockData';
import { formatCountdown } from '../utils/format';

const categories = [
  { key: 'all', label: '全部', icon: '🎪' },
  { key: 'tent', label: '帐篷', icon: '⛺' },
  { key: 'powerBank', label: '充电宝', icon: '🔋' },
  { key: 'raincoat', label: '雨衣', icon: '🧥' },
  { key: 'chair', label: '折叠椅', icon: '🪑' },
  { key: 'locker', label: '储物柜', icon: '🔐' },
];

export const HomePage = () => {
  const navigate = useNavigate();
  const { equipments } = useEquipmentStore();
  const [activeCategory, setActiveCategory] = useState('all');
  const [countdown, setCountdown] = useState(formatCountdown(festivalData.startTime));

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(formatCountdown(festivalData.startTime));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredEquipments = activeCategory === 'all'
    ? equipments
    : equipments.filter((e) => e.category === activeCategory);

  const pad = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="min-h-screen bg-gradient-to-b from-festival-dark via-festival-purple to-festival-dark pb-24">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-pink/10 via-neon-purple/10 to-neon-blue/10" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-neon-pink/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-neon-purple/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative px-4 pt-6 pb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white font-display">
                {festivalData.name}
              </h1>
              <p className="text-gray-400 text-sm">{festivalData.date}</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors relative">
                <Bell size={22} />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
              </button>
              <BrightModeToggle />
            </div>
          </div>

          <div className="bg-gradient-to-r from-neon-pink/20 to-neon-purple/20 rounded-3xl p-5 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <Music className="text-neon-pink" size={20} />
              <span className="text-white font-medium">演出倒计时</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                {!countdown.isOverdue ? (
                  <div className="flex items-center gap-2">
                    {['hours', 'minutes', 'seconds'].map((unit, idx) => (
                      <div key={unit} className="flex items-center">
                        <div className="bg-black/30 rounded-xl px-3 py-2 min-w-14 text-center">
                          <span className="text-3xl font-bold text-white font-mono">
                            {pad(countdown[unit as keyof typeof countdown] as number)}
                          </span>
                        </div>
                        {idx < 2 && <span className="text-white/60 text-2xl mx-1">:</span>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-neon-green text-xl font-bold">演出进行中</p>
                )}
              </div>
              <div className="flex items-center gap-2 bg-black/20 rounded-xl px-3 py-2">
                {festivalData.weather === '晴' ? (
                  <Sun className="text-neon-yellow" size={24} />
                ) : (
                  <CloudSun className="text-neon-yellow" size={24} />
                )}
                <div>
                  <p className="text-white font-bold">{festivalData.temperature}°C</p>
                  <p className="text-xs text-gray-400">{festivalData.weather}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">装备租借</h2>
          <button
            onClick={() => navigate('/map')}
            className="flex items-center gap-1 text-neon-purple text-sm font-medium hover:text-neon-pink transition-colors"
          >
            <MapPin size={16} />
            查看取还点
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl whitespace-nowrap transition-all ${
                activeCategory === cat.key
                  ? 'bg-gradient-to-r from-neon-pink to-neon-purple text-white shadow-neon-pink'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <span className="text-lg">{cat.icon}</span>
              <span className="font-medium">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredEquipments.map((equipment) => (
            <EquipmentCard key={equipment.id} equipment={equipment} />
          ))}
        </div>
      </div>

      <div className="px-4 mb-6">
        <div className="bg-gradient-to-r from-neon-yellow/10 to-neon-orange/10 rounded-3xl p-5 border border-neon-yellow/20">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-neon-yellow/20 rounded-2xl">
              <Clock className="text-neon-yellow" size={28} />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg mb-1">归还提醒</h3>
              <p className="text-gray-300 text-sm mb-3">
                所有装备请在当日 22:00 前归还，逾期将产生额外费用
              </p>
              <Button variant="outline" size="sm" onClick={() => navigate('/orders')}>
                查看我的订单
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
