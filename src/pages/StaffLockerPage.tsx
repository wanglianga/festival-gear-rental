import { useState } from 'react';
import { ArrowLeft, Lock, Unlock, AlertTriangle, Check, Search, RefreshCw, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useAppStore } from '../store/useAppStore';
import { useEquipmentStore } from '../store/useEquipmentStore';
import { formatCurrency, getPointTypeText } from '../utils/format';
import { cn } from '../lib/utils';

interface LockerFault {
  id: string;
  lockerNo: string;
  pointId: string;
  pointName: string;
  type: 'open_fail' | 'close_fail' | 'key_lost' | 'other';
  status: 'pending' | 'processing' | 'resolved';
  description: string;
  createdAt: string;
}

const mockFaults: LockerFault[] = [
  {
    id: 'fault-1',
    lockerNo: 'A区-012号',
    pointId: 'point-1',
    pointName: '主舞台取还点',
    type: 'open_fail',
    status: 'pending',
    description: '用户反馈柜门打不开',
    createdAt: '2026-06-17T14:30:00',
  },
  {
    id: 'fault-2',
    lockerNo: 'B区-056号',
    pointId: 'point-2',
    pointName: '营地区服务站',
    type: 'key_lost',
    status: 'processing',
    description: '钥匙丢失，需要换锁',
    createdAt: '2026-06-17T13:15:00',
  },
];

const lockerNumbers = [
  'A区-001号', 'A区-002号', 'A区-003号', 'A区-004号', 'A区-005号',
  'A区-006号', 'A区-007号', 'A区-008号', 'A区-009号', 'A区-010号',
  'B区-101号', 'B区-102号', 'B区-103号', 'B区-104号', 'B区-105号',
];

export const StaffLockerPage = () => {
  const navigate = useNavigate();
  const { currentPointId } = useAppStore();
  const { pickupPoints } = useEquipmentStore();
  const currentPoint = pickupPoints.find((p) => p.id === currentPointId);

  const [activeTab, setActiveTab] = useState<'faults' | 'control'>('faults');
  const [faults, setFaults] = useState<LockerFault[]>(mockFaults);
  const [searchLocker, setSearchLocker] = useState('');
  const [selectedLocker, setSelectedLocker] = useState<string | null>(null);
  const [showOpenSuccess, setShowOpenSuccess] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedFault, setSelectedFault] = useState<LockerFault | null>(null);

  const filteredLockers = lockerNumbers.filter((l) =>
    l.toLowerCase().includes(searchLocker.toLowerCase())
  );

  const pendingFaults = faults.filter((f) => f.status === 'pending');
  const processingFaults = faults.filter((f) => f.status === 'processing');

  const handleRemoteOpen = (lockerNo: string) => {
    setSelectedLocker(lockerNo);
    setShowOpenSuccess(true);
    setTimeout(() => {
      setShowOpenSuccess(false);
    }, 2000);
  };

  const handleResolveFault = (fault: LockerFault) => {
    setSelectedFault(fault);
    setShowResolveModal(true);
  };

  const confirmResolve = () => {
    if (selectedFault) {
      setFaults((prev) =>
        prev.map((f) =>
          f.id === selectedFault.id ? { ...f, status: 'resolved' as const } : f
        )
      );
      setShowResolveModal(false);
      setSelectedFault(null);
    }
  };

  const faultTypeText: Record<string, string> = {
    open_fail: '开门故障',
    close_fail: '关门故障',
    key_lost: '钥匙丢失',
    other: '其他问题',
  };

  const statusText: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    resolved: '已解决',
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
          <h1 className="text-xl font-bold text-white ml-2">柜门管理</h1>
        </div>

        <div className="flex gap-2 px-4 pb-4">
          <button
            onClick={() => setActiveTab('faults')}
            className={cn(
              'flex-1 py-2.5 rounded-xl font-medium transition-all',
              activeTab === 'faults'
                ? 'bg-gradient-to-r from-neon-pink to-neon-purple text-white'
                : 'bg-white/10 text-gray-400 hover:text-white'
            )}
          >
            故障列表 ({pendingFaults.length + processingFaults.length})
          </button>
          <button
            onClick={() => setActiveTab('control')}
            className={cn(
              'flex-1 py-2.5 rounded-xl font-medium transition-all',
              activeTab === 'control'
                ? 'bg-gradient-to-r from-neon-pink to-neon-purple text-white'
                : 'bg-white/10 text-gray-400 hover:text-white'
            )}
          >
            远程控制
          </button>
        </div>
      </div>

      {activeTab === 'faults' && (
        <div className="p-4">
          {pendingFaults.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <AlertTriangle className="text-red-500" size={20} />
                待处理 ({pendingFaults.length})
              </h3>
              <div className="space-y-3">
                {pendingFaults.map((fault) => (
                  <Card key={fault.id} padding="md" className="border-red-500/30 bg-red-500/5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Lock className="text-red-500" size={18} />
                          <span className="text-white font-bold">{fault.lockerNo}</span>
                        </div>
                        <p className="text-gray-400 text-sm mt-1">{fault.pointName}</p>
                      </div>
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                        {statusText[fault.status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm mb-3">
                      <span className="px-2 py-0.5 bg-white/10 text-gray-300 rounded">
                        {faultTypeText[fault.type]}
                      </span>
                      <span className="text-gray-500">{fault.createdAt.slice(11, 16)}</span>
                    </div>
                    <p className="text-gray-300 text-sm mb-4">{fault.description}</p>
                    <div className="flex gap-3">
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        onClick={() => handleRemoteOpen(fault.lockerNo)}
                      >
                        <Unlock className="mr-1.5" size={16} />
                        远程开箱
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        fullWidth
                        onClick={() => handleResolveFault(fault)}
                      >
                        <Check className="mr-1.5" size={16} />
                        标记解决
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {processingFaults.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <RefreshCw className="text-neon-yellow" size={20} />
                处理中 ({processingFaults.length})
              </h3>
              <div className="space-y-3">
                {processingFaults.map((fault) => (
                  <Card key={fault.id} padding="md" className="border-neon-yellow/30 bg-neon-yellow/5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Lock className="text-neon-yellow" size={18} />
                          <span className="text-white font-bold">{fault.lockerNo}</span>
                        </div>
                        <p className="text-gray-400 text-sm mt-1">{fault.pointName}</p>
                      </div>
                      <span className="px-2 py-1 bg-neon-yellow/20 text-neon-yellow text-xs rounded-full">
                        {statusText[fault.status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm mb-3">
                      <span className="px-2 py-0.5 bg-white/10 text-gray-300 rounded">
                        {faultTypeText[fault.type]}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm">{fault.description}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {pendingFaults.length === 0 && processingFaults.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 rounded-full bg-neon-green/10 flex items-center justify-center mb-4">
                <Check size={40} className="text-neon-green" />
              </div>
              <p className="text-white text-lg font-medium">暂无故障</p>
              <p className="text-gray-400 text-sm mt-1">所有柜门运行正常</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'control' && (
        <div className="p-4">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchLocker}
                onChange={(e) => setSearchLocker(e.target.value)}
                placeholder="搜索柜号..."
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-neon-purple/50"
              />
            </div>
          </div>

          <Card padding="md" className="mb-4">
            <p className="text-gray-400 text-sm mb-1">当前点位</p>
            <p className="text-white font-bold text-lg">{currentPoint?.name || '未选择'}</p>
            {currentPoint && (
              <p className="text-neon-blue text-sm mt-1">
                可用储物柜: {currentPoint.availableLockers} / {currentPoint.lockerCount}
              </p>
            )}
          </Card>

          <h3 className="text-lg font-bold text-white mb-3">储物柜列表</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {filteredLockers.map((locker) => {
              const isFault = faults.some(
                (f) => f.lockerNo === locker && f.status !== 'resolved'
              );
              const isSelected = selectedLocker === locker;

              return (
                <button
                  key={locker}
                  onClick={() => setSelectedLocker(isSelected ? null : locker)}
                  className={cn(
                    'p-4 rounded-2xl border-2 transition-all text-center',
                    isFault
                      ? 'border-red-500/50 bg-red-500/10'
                      : isSelected
                      ? 'border-neon-purple bg-neon-purple/20'
                      : 'border-white/10 bg-white/5 hover:border-white/30'
                  )}
                >
                  <Lock
                    size={24}
                    className={cn(
                      'mx-auto mb-2',
                      isFault ? 'text-red-500' : isSelected ? 'text-neon-purple' : 'text-gray-400'
                    )}
                  />
                  <p className={cn(
                    'text-xs font-medium',
                    isFault ? 'text-red-400' : 'text-white'
                  )}>
                    {locker}
                  </p>
                  {isFault && (
                    <p className="text-[10px] text-red-400 mt-1">故障</p>
                  )}
                </button>
              );
            })}
          </div>

          {selectedLocker && (
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-festival-dark via-festival-dark/95 to-transparent pt-12">
              <div className="max-w-lg mx-auto">
                <Button fullWidth size="xl" onClick={() => handleRemoteOpen(selectedLocker)}>
                  <Unlock className="mr-2" size={20} />
                  远程开启 {selectedLocker}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {showOpenSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-festival-dark rounded-3xl p-8 text-center animate-bounce">
            <div className="w-20 h-20 rounded-full bg-neon-green/20 flex items-center justify-center mx-auto mb-4">
              <Unlock size={48} className="text-neon-green" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">开箱成功</h3>
            <p className="text-gray-400">{selectedLocker} 柜门已打开</p>
          </div>
        </div>
      )}

      {showResolveModal && selectedFault && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-festival-dark rounded-t-3xl p-6 animate-slide-up">
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />
            
            <h3 className="text-xl font-bold text-white mb-4">确认解决故障？</h3>
            <p className="text-gray-400 mb-6">
              {selectedFault.lockerNo} 的故障已处理完成，标记为已解决？
            </p>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setShowResolveModal(false)}
              >
                <X className="mr-2" size={18} />
                取消
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={confirmResolve}
              >
                <Check className="mr-2" size={18} />
                确认解决
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
