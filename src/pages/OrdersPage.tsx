import { useState } from 'react';
import { OrderCard } from '../components/business/OrderCard';
import { Package, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useOrderStore } from '../store/useOrderStore';
import { cn } from '../lib/utils';

const tabs = [
  { key: 'active', label: '进行中', icon: Clock },
  { key: 'completed', label: '已完成', icon: CheckCircle },
];

export const OrdersPage = () => {
  const { getActiveOrders, getCompletedOrders } = useOrderStore();
  const [activeTab, setActiveTab] = useState('active');

  const activeOrders = getActiveOrders();
  const completedOrders = getCompletedOrders();

  const currentOrders = activeTab === 'active' ? activeOrders : completedOrders;

  const overdueCount = activeOrders.filter((o) => {
    return new Date(o.dueAt) < new Date();
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-festival-dark to-festival-purple pb-24">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-white mb-1">我的订单</h1>
        <p className="text-gray-400 text-sm">
          共 {activeOrders.length + completedOrders.length} 笔订单
        </p>
      </div>

      <div className="px-4 mb-4">
        <div className="flex gap-2 bg-white/10 rounded-2xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-all',
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-neon-pink to-neon-purple text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              )}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
              {tab.key === 'active' && overdueCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {overdueCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'active' && overdueCount > 0 && (
        <div className="px-4 mb-4">
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl">
            <AlertTriangle className="text-red-500 flex-shrink-0" size={24} />
            <div>
              <p className="text-red-400 font-medium">有 {overdueCount} 笔订单即将逾期</p>
              <p className="text-red-400/70 text-sm">请尽快归还，避免产生额外费用</p>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 pb-6">
        {currentOrders.length > 0 ? (
          <div className="space-y-4">
            {currentOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Package size={40} className="text-gray-600" />
            </div>
            <p className="text-gray-400 text-lg mb-2">暂无订单</p>
            <p className="text-gray-500 text-sm">
              {activeTab === 'active' ? '快去租借装备吧' : '还没有已完成的订单'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
