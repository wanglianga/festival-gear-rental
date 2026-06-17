import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sun, SunDim, Info, MapPin, Clock, Share2, HelpCircle } from 'lucide-react';
import { PickupVoucher } from '../components/business/PickupVoucher';
import { BottomSheet } from '../components/common/BottomSheet';
import { BrightModeToggle } from '../components/common/BrightModeToggle';
import { useOrderStore } from '../store/useOrderStore';
import { formatTime } from '../utils/format';

export const VoucherPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { getOrderById } = useOrderStore();
  const [showHelp, setShowHelp] = useState(false);
  const [brightnessBoost, setBrightnessBoost] = useState(false);

  const order = getOrderById(orderId || '');

  useEffect(() => {
    if (brightnessBoost) {
      document.documentElement.classList.add('brightness-boost');
    } else {
      document.documentElement.classList.remove('brightness-boost');
    }
    return () => {
      document.documentElement.classList.remove('brightness-boost');
    };
  }, [brightnessBoost]);

  if (!order) {
    return (
      <div className="min-h-screen bg-festival-dark flex items-center justify-center">
        <p className="text-white">订单不存在</p>
      </div>
    );
  }

  const isPending = order.status === 'pending';
  const isUsing = order.status === 'using' || order.status === 'picked';

  return (
    <div className="min-h-screen bg-gradient-to-b from-festival-dark via-festival-purple to-festival-dark">
      <div className="sticky top-0 z-30 bg-festival-dark/80 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-white ml-2">
              {isPending ? '取件凭证' : '使用凭证'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBrightnessBoost(!brightnessBoost)}
              className={`p-3 rounded-full transition-all ${
                brightnessBoost
                  ? 'bg-neon-yellow text-yellow-900 shadow-neon-yellow'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title="屏幕增亮"
            >
              {brightnessBoost ? <Sun size={22} /> : <SunDim size={22} />}
            </button>
            <BrightModeToggle />
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 pb-8">
        <div className="sticky top-16 z-20">
          <PickupVoucher order={order} />
        </div>

        <div className="mt-6 space-y-4">
          <div className="bg-white/5 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-neon-purple/20 rounded-xl">
                <Info className="text-neon-purple" size={20} />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium mb-1">
                  {isPending ? '到店扫码取件' : '归还时出示此码'}
                </p>
                <p className="text-gray-400 text-sm">
                  {isPending
                    ? '请在取还点向工作人员出示此二维码或取件码'
                    : '请在归还时向工作人员出示此凭证进行验收'}
                </p>
              </div>
            </div>
          </div>

          {isPending && (
            <div className="bg-gradient-to-r from-neon-green/10 to-neon-blue/10 rounded-2xl p-4 border border-neon-green/20">
              <div className="flex items-start gap-3">
                <MapPin className="text-neon-green mt-0.5" size={20} />
                <div>
                  <p className="text-white font-medium mb-1">取件地点</p>
                  <p className="text-neon-green font-bold">{order.pickupPointName}</p>
                  <p className="text-gray-400 text-sm mt-1">
                    请前往该取还点扫码领取您的装备
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="text-neon-yellow" size={20} />
              <span className="text-white font-medium">时间信息</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">下单时间</span>
                <span className="text-white">{formatTime(order.createdAt)}</span>
              </div>
              {order.pickedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-400">取件时间</span>
                  <span className="text-white">{formatTime(order.pickedAt)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">归还截止</span>
                <span className="text-neon-yellow font-medium">{formatTime(order.dueAt)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {}}
              className="flex flex-col items-center justify-center gap-2 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors"
            >
              <Share2 size={22} className="text-gray-300" />
              <span className="text-sm text-gray-300">分享凭证</span>
            </button>
            <button
              onClick={() => setShowHelp(true)}
              className="flex flex-col items-center justify-center gap-2 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors"
            >
              <HelpCircle size={22} className="text-gray-300" />
              <span className="text-sm text-gray-300">使用帮助</span>
            </button>
          </div>

          {isUsing && (
            <button
              onClick={() => navigate('/map')}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-neon-pink to-neon-purple text-white font-bold text-lg shadow-neon-pink active:scale-[0.98] transition-transform"
            >
              查找附近归还点
            </button>
          )}
        </div>
      </div>

      <BottomSheet
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        title="使用帮助"
        maxHeight="70vh"
      >
        <div className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-bold text-white">如何取件？</h4>
            <ol className="space-y-2 text-gray-300 text-sm">
              <li>1. 前往您选择的取还点</li>
              <li>2. 向工作人员出示此页面的二维码或取件码</li>
              <li>3. 工作人员扫码确认后，您即可领取装备</li>
              <li>4. 请检查装备是否完好无损</li>
            </ol>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white">如何归还？</h4>
            <ol className="space-y-2 text-gray-300 text-sm">
              <li>1. 前往任意取还点</li>
              <li>2. 向工作人员出示此凭证</li>
              <li>3. 工作人员验收装备状态</li>
              <li>4. 验收完成后，押金将原路退回</li>
            </ol>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white">储物柜怎么用？</h4>
            <ol className="space-y-2 text-gray-300 text-sm">
              <li>1. 找到对应柜号的储物柜</li>
              <li>2. 扫描柜上的二维码或输入取件码</li>
              <li>3. 柜门自动打开，存入或取出物品</li>
              <li>4. 关好柜门，确认已锁定</li>
            </ol>
          </div>

          <div className="p-4 bg-neon-yellow/10 rounded-xl border border-neon-yellow/20">
            <p className="text-neon-yellow text-sm">
              💡 提示：强光下点击顶部太阳图标可开启屏幕增亮模式，让二维码更容易被扫描
            </p>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};
