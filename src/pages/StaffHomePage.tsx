import { useNavigate } from 'react-router-dom';
import {
  Package,
  Scan,
  ClipboardCheck,
  Lock,
  ArrowLeftRight,
  AlertTriangle,
  Bell,
  Settings,
  User,
  Clock,
} from 'lucide-react';
import { StaffDashboardCard } from '../components/business/StaffDashboardCard';
import { Card } from '../components/common/Card';
import { useOrderStore } from '../store/useOrderStore';
import { useAppStore } from '../store/useAppStore';
import { useEquipmentStore } from '../store/useEquipmentStore';
import { festivalData } from '../data/mockData';

export const StaffHomePage = () => {
  const navigate = useNavigate();
  const { staffStats } = useOrderStore();
  const { setUserRole, currentPointId } = useAppStore();
  const { pickupPoints } = useEquipmentStore();

  const currentPoint = pickupPoints.find((p) => p.id === currentPointId);

  const quickActions = [
    {
      label: '扫码发放',
      icon: Scan,
      path: '/staff/scan',
      bgColor: 'bg-neon-green/20',
      textColor: 'text-neon-green',
    },
    {
      label: '验收归还',
      icon: ClipboardCheck,
      path: '/staff/return',
      bgColor: 'bg-neon-blue/20',
      textColor: 'text-neon-blue',
    },
    {
      label: '柜门故障',
      icon: Lock,
      path: '/staff/locker',
      bgColor: 'bg-neon-yellow/20',
      textColor: 'text-neon-yellow',
    },
    {
      label: '库存调拨',
      icon: ArrowLeftRight,
      path: '/staff/transfer',
      bgColor: 'bg-neon-pink/20',
      textColor: 'text-neon-pink',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-festival-dark to-festival-purple pb-24">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/20 to-neon-pink/10" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-neon-purple/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="relative px-4 pt-6 pb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-gray-400 text-sm">{festivalData.name}</p>
              <h1 className="text-2xl font-bold text-white mt-1">工作人员控制台</h1>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors relative">
                <Bell size={22} />
                {staffStats.lockerFaults > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                    {staffStats.lockerFaults}
                  </span>
                )}
              </button>
              <button className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
                <Settings size={22} />
              </button>
            </div>
          </div>

          <Card padding="md" className="bg-white/5 border-white/10 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center">
                <User size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">管理员 · 张三</p>
                <p className="text-gray-400 text-sm">{currentPoint?.name || '未分配点位'}</p>
              </div>
              <button
                onClick={() => {
                  setUserRole('audience');
                  navigate('/');
                }}
                className="text-sm text-neon-purple hover:text-neon-pink transition-colors"
              >
                切换用户
              </button>
            </div>
          </Card>
        </div>
      </div>

      <div className="px-4 mb-6">
        <h2 className="text-lg font-bold text-white mb-4">今日数据</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StaffDashboardCard
            title="今日发放"
            value={staffStats.todayPicked}
            icon={Package}
            variant="success"
            trend="up"
            trendValue="较昨日 +12%"
          />
          <StaffDashboardCard
            title="今日归还"
            value={staffStats.todayReturned}
            icon={ArrowLeftRight}
            variant="default"
            trend="up"
            trendValue="较昨日 +8%"
          />
          <StaffDashboardCard
            title="待归还"
            value={staffStats.pendingReturns}
            icon={Clock}
            variant="warning"
            subtitle="进行中订单"
          />
          <StaffDashboardCard
            title="损坏物品"
            value={staffStats.damagedItems}
            icon={AlertTriangle}
            variant="danger"
            subtitle="今日登记"
          />
          <StaffDashboardCard
            title="柜门故障"
            value={staffStats.lockerFaults}
            icon={Lock}
            variant={staffStats.lockerFaults > 0 ? 'danger' : 'default'}
            subtitle="待处理"
          />
          <StaffDashboardCard
            title="库存告警"
            value={staffStats.lowStockAlerts}
            icon={AlertTriangle}
            variant={staffStats.lowStockAlerts > 0 ? 'warning' : 'default'}
            subtitle="库存紧张品类"
          />
        </div>
      </div>

      <div className="px-4 mb-6">
        <h2 className="text-lg font-bold text-white mb-4">快捷操作</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Card
              key={action.label}
              padding="lg"
              className="cursor-pointer hover:scale-[1.02] hover:border-white/20 transition-all"
              onClick={() => navigate(action.path)}
            >
              <div className={`w-14 h-14 rounded-2xl ${action.bgColor} flex items-center justify-center mb-3`}>
                <action.icon size={28} className={action.textColor} />
              </div>
              <p className="text-white font-medium">{action.label}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="px-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">点位库存概览</h2>
          <button className="text-neon-purple text-sm font-medium hover:text-neon-pink transition-colors">
            查看全部
          </button>
        </div>
        <Card padding="lg" className="bg-white/5">
          <div className="space-y-4">
            {currentPoint ? (
              <>
                <p className="text-gray-400 text-sm mb-2">{currentPoint.name}</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(currentPoint.equipmentStock)
                    .filter(([_, stock]) => stock > 0)
                    .slice(0, 6)
                    .map(([equipId, stock]) => {
                      const total = 50;
                      const ratio = stock / total;
                      return (
                        <div key={equipId} className="p-3 bg-black/20 rounded-xl">
                          <p className="text-white text-sm font-medium truncate">
                            {equipId.includes('tent')
                              ? '帐篷'
                              : equipId.includes('power')
                              ? '充电宝'
                              : equipId.includes('rain')
                              ? '雨衣'
                              : equipId.includes('chair')
                              ? '折叠椅'
                              : equipId}
                          </p>
                          <p className={`text-lg font-bold ${ratio < 0.2 ? 'text-neon-orange' : 'text-neon-green'}`}>
                            {stock}
                          </p>
                          <div className="h-1.5 bg-black/30 rounded-full overflow-hidden mt-1">
                            <div
                              className={`h-full rounded-full ${ratio < 0.2 ? 'bg-neon-orange' : 'bg-neon-green'}`}
                              style={{ width: `${Math.min(100, ratio * 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
                <div className="pt-3 border-t border-white/10">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">储物柜可用</span>
                    <span className="text-neon-blue font-medium">
                      {currentPoint.availableLockers} / {currentPoint.lockerCount}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-gray-400 text-center py-4">暂无点位数据</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
