import { useState } from 'react';
import { ArrowLeft, Keyboard, QrCode, Check, Package, MapPin, Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ScanFrame } from '../components/business/ScanFrame';
import { BottomSheet } from '../components/common/BottomSheet';
import { useOrderStore } from '../store/useOrderStore';
import { formatCurrency, formatTime, getStatusText } from '../utils/format';

export const StaffScanPage = () => {
  const navigate = useNavigate();
  const { getOrderById, pickupOrder, orders } = useOrderStore();

  const [manualInput, setManualInput] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [scannedOrder, setScannedOrder] = useState<typeof orders[0] | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleScan = (orderId: string) => {
    const order = orders.find((o) => o.orderNo === orderId || o.pickupCode === orderId || o.id === orderId);
    if (order) {
      setScannedOrder(order);
      setShowConfirm(true);
    }
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      handleScan(manualInput.trim());
      setManualInput('');
      setShowManual(false);
    }
  };

  const handleConfirmPickup = () => {
    if (scannedOrder) {
      pickupOrder(scannedOrder.id);
      setShowConfirm(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setScannedOrder(null);
      }, 2000);
    }
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
          <h1 className="text-xl font-bold text-white ml-2">扫码发放</h1>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-8 px-4">
        <div className="w-full max-w-md">
          <ScanFrame
            size="full"
            title="扫描取件码"
            subtitle="将用户的取件二维码对准扫描框"
          />

          <div className="mt-8 flex flex-col items-center gap-4">
            <Button
              variant="secondary"
              size="lg"
              className="w-full max-w-xs"
              onClick={() => setShowManual(true)}
            >
              <Keyboard className="mr-2" size={20} />
              手动输入取件码
            </Button>

            <button
              onClick={() => handleScan('order-3')}
              className="text-gray-400 text-sm hover:text-white transition-colors"
            >
              模拟扫描 (演示用：扫码演示
            </button>
          </div>
        </div>
      </div>

      <BottomSheet
        isOpen={showManual}
        onClose={() => setShowManual(false)}
        title="手动输入取件码"
        maxHeight="50vh"
      >
        <div className="space-y-4">
          <div className="bg-black/30 rounded-2xl p-4">
            <label className="text-sm text-gray-400 mb-2 block">输入取件码或订单号</label>
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="请输入取件码..."
              className="w-full bg-transparent text-2xl font-mono text-white text-center py-4 focus:outline-none"
              autoFocus
            />
          </div>
          <Button fullWidth
            onClick={handleManualSubmit}
            disabled={!manualInput.trim()}
          >
            确认查询
          </Button>
        </div>
      </BottomSheet>

      <BottomSheet
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="确认发放"
        maxHeight="70vh"
      >
        {scannedOrder && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-neon-green/10 to-transparent rounded-2xl p-4 border border-neon-green/30">
              <div className="flex items-center gap-2 mb-2">
            <QrCode className="text-neon-green" size={20} />
            <span className="text-neon-green font-medium">订单信息</span>
              </div>
              <p className="text-white font-mono text-lg">{scannedOrder.orderNo}</p>
            </div>

            <Card padding="md" className="bg-white/5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-pink/20 to-neon-purple/20 flex items-center justify-center">
                  <span className="text-3xl">
                    {scannedOrder.type === 'rent' ? '📦' : '🔐'}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-bold text-lg">
                    {scannedOrder.type === 'rent' ? scannedOrder.equipmentName : `储物柜 ${scannedOrder.lockerNo}`}
                  </h4>
                  <p className="text-gray-400 text-sm">数量: {scannedOrder.quantity} 件</p>
                </div>
              </div>
            </Card>

            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <MapPin size={18} className="mr-3 text-gray-400" />
                <span className="text-gray-400">取件点: </span>
                <span className="text-white ml-1">{scannedOrder.pickupPointName}</span>
              </div>
              <div className="flex items-center text-sm">
                <Clock size={18} className="mr-3 text-gray-400" />
                <span className="text-gray-400">下单时间: </span>
                <span className="text-white ml-1">{formatTime(scannedOrder.createdAt)}</span>
              </div>
              <div className="flex items-center text-sm">
                <Package size={18} className="mr-3 text-gray-400" />
                <span className="text-gray-400">押金: </span>
                <span className="text-white ml-1">{formatCurrency(scannedOrder.deposit)}</span>
              </div>
            </div>

            {scannedOrder.status === 'pending' ? (
              <div className="bg-neon-green/10 rounded-xl p-4 border border-neon-green/30">
                <div className="flex items-center gap-2">
                  <AlertCircle className="text-neon-green" size={20} />
                  <span className="text-neon-green font-medium">状态: {getStatusText(scannedOrder.status)}</span>
                </div>
                <p className="text-gray-400 text-sm mt-1">
                  请核对物品完好后点击确认发放
                </p>
              </div>
            ) : (
              <div className="bg-neon-yellow/10 rounded-xl p-4 border border-neon-yellow/30">
                <div className="flex items-center gap-2">
                  <AlertCircle className="text-neon-yellow" size={20} />
                  <span className="text-neon-yellow font-medium">注意</span>
                </div>
                <p className="text-gray-400 text-sm mt-1">
                  该订单状态为: {getStatusText(scannedOrder.status)}
                </p>
              </div>
            )}

            <Button
              fullWidth
              variant={scannedOrder.status === 'pending' ? 'primary' : 'secondary'}
              onClick={handleConfirmPickup}
              disabled={scannedOrder.status !== 'pending'}
            >
              {scannedOrder.status === 'pending' ? '确认发放' : '已发放'}
            </Button>
          </div>
        )}
      </BottomSheet>

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-festival-dark rounded-3xl p-8 text-center animate-bounce">
            <div className="w-20 h-20 rounded-full bg-neon-green/20 flex items-center justify-center mx-auto mb-4">
              <Check size={48} className="text-neon-green" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">发放成功</h3>
            <p className="text-gray-400">装备已成功发放</p>
          </div>
        </div>
      )}
    </div>
  );
};
