import { User, Settings, CreditCard, HelpCircle, LogOut, ChevronRight, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { BrightModeToggle } from '../components/common/BrightModeToggle';
import { useAppStore } from '../store/useAppStore';
import { useOrderStore } from '../store/useOrderStore';
import { formatCurrency } from '../utils/format';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { setUserRole } = useAppStore();
  const { getActiveOrders } = useOrderStore();

  const activeOrders = getActiveOrders();
  const totalDeposit = activeOrders.reduce((sum, o) => sum + o.deposit, 0);

  const menuItems = [
    { icon: CreditCard, label: '我的钱包', desc: '押金余额 ' + formatCurrency(totalDeposit), chevron: true },
    { icon: HelpCircle, label: '帮助中心', desc: '常见问题解答', chevron: true },
    { icon: Settings, label: '设置', desc: '消息通知、隐私设置', chevron: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-festival-dark to-festival-purple pb-24">
      <div className="relative px-4 pt-8 pb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-pink/20 via-neon-purple/20 to-neon-blue/20" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-neon-pink/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">个人中心</h1>
            <BrightModeToggle />
          </div>

          <Card variant="glow" padding="lg" className="mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-pink to-neon-purple flex items-center justify-center">
                <User size={32} className="text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">音乐节观众</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-neon-yellow/20 text-neon-yellow text-xs rounded-full flex items-center gap-1">
                    <Crown size={12} />
                    普通会员
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{activeOrders.length}</p>
                <p className="text-xs text-gray-400 mt-1">进行中</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-neon-pink">{formatCurrency(totalDeposit)}</p>
                <p className="text-xs text-gray-400 mt-1">押金中</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-neon-green">0</p>
                <p className="text-xs text-gray-400 mt-1">积分</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="px-4 space-y-3">
        {menuItems.map((item, idx) => (
          <Card key={idx} padding="md" className="cursor-pointer hover:border-white/20 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-white/10 rounded-xl">
                <item.icon size={22} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">{item.label}</p>
                {item.desc && (
                  <p className="text-gray-400 text-sm mt-0.5">{item.desc}</p>
                )}
              </div>
              {item.chevron && (
                <ChevronRight size={20} className="text-gray-500" />
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="px-4 mt-6">
        <Button
          variant="outline"
          fullWidth
          onClick={() => {
            setUserRole('staff');
            navigate('/staff');
          }}
        >
          切换为工作人员模式
        </Button>
      </div>

      <div className="px-4 mt-4">
        <button
          className="w-full flex items-center justify-center gap-2 py-3.5 text-red-400 hover:text-red-300 transition-colors"
          onClick={() => {}}
        >
          <LogOut size={20} />
          <span>退出登录</span>
        </button>
      </div>

      <div className="text-center py-8">
        <p className="text-gray-600 text-xs">版本 v1.0.0</p>
        <p className="text-gray-700 text-xs mt-1">夏日星空音乐节 © 2026</p>
      </div>
    </div>
  );
};
