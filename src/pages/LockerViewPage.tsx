import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Lock, Unlock, AlertTriangle, Clock, User, Wrench,
  CheckCircle, HelpCircle, Phone, RefreshCw, X, ShieldCheck
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { BottomSheet } from '../components/common/BottomSheet';
import { useLockerStore } from '../store/useLockerStore';
import { useEquipmentStore } from '../store/useEquipmentStore';
import { cn } from '../lib/utils';
import { formatTime } from '../utils/format';
import type { LockerStatus, LockerFaultRecord } from '../types';

const statusConfig: Record<LockerStatus, {
  label: string;
  bgColor: string;
  borderColor: string;
  iconColor: string;
  textColor: string;
}> = {
  free: {
    label: '空闲',
    bgColor: 'bg-neon-green/10',
    borderColor: 'border-neon-green/50',
    iconColor: 'text-neon-green',
    textColor: 'text-neon-green',
  },
  occupied: {
    label: '占用',
    bgColor: 'bg-neon-blue/10',
    borderColor: 'border-neon-blue/50',
    iconColor: 'text-neon-blue',
    textColor: 'text-neon-blue',
  },
  broken: {
    label: '故障',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/50',
    iconColor: 'text-red-500',
    textColor: 'text-red-500',
  },
  reserved: {
    label: '预留',
    bgColor: 'bg-neon-purple/10',
    borderColor: 'border-neon-purple/50',
    iconColor: 'text-neon-purple',
    textColor: 'text-neon-purple',
  },
  timeout_soon: {
    label: '即将超时',
    bgColor: 'bg-neon-yellow/10',
    borderColor: 'border-neon-yellow/50',
    iconColor: 'text-neon-yellow',
    textColor: 'text-neon-yellow',
  },
  manual_locked: {
    label: '人工锁定',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/50',
    iconColor: 'text-gray-400',
    textColor: 'text-gray-400',
  },
};

export const LockerViewPage = () => {
  const { pointId } = useParams<{ pointId: string }>();
  const navigate = useNavigate();
  const { getLockersByPoint, getAreasByPoint, openLocker, getOpenRecordsByLocker, reportFault } = useLockerStore();
  const { getPickupPointById } = useEquipmentStore();

  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedLockerId, setSelectedLockerId] = useState<string | null>(null);
  const [showOpenConfirm, setShowOpenConfirm] = useState(false);
  const [showOpenResult, setShowOpenResult] = useState<'success' | 'fail' | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [lastOpenRecord, setLastOpenRecord] = useState<{
    lockerNo: string;
    operatedAt: string;
    success: boolean;
    failureReason?: string;
  } | null>(null);
  const [faultDescription, setFaultDescription] = useState('');

  const point = getPickupPointById(pointId || '');
  const lockers = getLockersByPoint(pointId || '');
  const areas = getAreasByPoint(pointId || '');

  useEffect(() => {
    if (areas.length > 0 && !selectedArea) {
      setSelectedArea(areas[0]);
    }
  }, [areas, selectedArea]);

  const filteredLockers = selectedArea
    ? lockers.filter((l) => l.area === selectedArea)
    : lockers;

  const selectedLocker = selectedLockerId
    ? lockers.find((l) => l.id === selectedLockerId)
    : null;

  const handleLockerClick = (lockerId: string) => {
    const locker = lockers.find((l) => l.id === lockerId);
    if (!locker) return;
    
    if (locker.status === 'broken' || locker.status === 'manual_locked') {
      setSelectedLockerId(lockerId);
      return;
    }
    
    setSelectedLockerId(lockerId);
    setShowOpenConfirm(true);
  };

  const handleConfirmOpen = async () => {
    if (!selectedLocker) return;
    
    setIsOpening(true);
    setShowOpenConfirm(false);
    
    const success = await openLocker(selectedLocker.id, 'user-1', selectedLocker.orderId);
    
    setIsOpening(false);
    setShowOpenResult(success ? 'success' : 'fail');
    
    setLastOpenRecord({
      lockerNo: selectedLocker.lockerNo,
      operatedAt: new Date().toISOString(),
      success,
      failureReason: success ? undefined : '柜门未弹开，请重试或联系工作人员',
    });
    
    if (!success) {
      const records = getOpenRecordsByLocker(selectedLocker.id);
      if (records.length > 0) {
        setLastOpenRecord({
          lockerNo: records[0].lockerNo,
          operatedAt: records[0].operatedAt,
          success: records[0].success,
          failureReason: records[0].failureReason,
        });
      }
    }
    
    setTimeout(() => {
      if (success) {
        setShowOpenResult(null);
      }
    }, 3000);
  };

  const handleReportFault = () => {
    if (!selectedLocker || !faultDescription) return;
    
    reportFault({
      lockerId: selectedLocker.id,
      lockerNo: selectedLocker.lockerNo,
      pointId: selectedLocker.pointId,
      pointName: selectedLocker.pointName,
      type: 'open_fail',
      description: faultDescription,
      reportSource: 'user',
      userId: 'user-1',
    });
    
    setShowHelpModal(false);
    setShowOpenResult(null);
    setFaultDescription('');
  };

  const statusCounts = {
    free: lockers.filter((l) => l.status === 'free').length,
    occupied: lockers.filter((l) => l.status === 'occupied').length,
    broken: lockers.filter((l) => l.status === 'broken').length,
    reserved: lockers.filter((l) => l.status === 'reserved').length,
    timeout_soon: lockers.filter((l) => l.status === 'timeout_soon').length,
    manual_locked: lockers.filter((l) => l.status === 'manual_locked').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-festival-dark to-festival-purple pb-8">
      <div className="sticky top-0 z-30 bg-festival-dark/95 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-white ml-2">
            {point?.name || '储物柜'}
          </h1>
        </div>

        <div className="px-4 pb-4">
          <div className="grid grid-cols-6 gap-2">
            {(Object.keys(statusConfig) as LockerStatus[]).map((status) => (
              <div
                key={status}
                className={cn(
                  'rounded-xl p-2 text-center',
                  statusConfig[status].bgColor
                )}
              >
                <Lock
                  size={16}
                  className={cn('mx-auto mb-1', statusConfig[status].iconColor)}
                />
                <p className={cn('text-xs font-medium', statusConfig[status].textColor)}>
                  {statusConfig[status].label}
                </p>
                <p className={cn('text-lg font-bold', statusConfig[status].textColor)}>
                  {statusCounts[status]}
                </p>
              </div>
            ))}
          </div>
        </div>

        {areas.length > 1 && (
          <div className="px-4 pb-4 flex gap-2 overflow-x-auto">
            {areas.map((area) => (
              <button
                key={area}
                onClick={() => setSelectedArea(area)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                  selectedArea === area
                    ? 'bg-gradient-to-r from-neon-pink to-neon-purple text-white'
                    : 'bg-white/10 text-gray-400 hover:text-white'
                )}
              >
                {area}区
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="mb-4">
          <p className="text-gray-400 text-sm mb-2">
            {selectedArea ? `${selectedArea}区` : '全部'} · 共 {filteredLockers.length} 个柜位
          </p>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
          {filteredLockers.map((locker) => {
            const config = statusConfig[locker.status];
            const isSelected = selectedLockerId === locker.id;

            return (
              <button
                key={locker.id}
                onClick={() => handleLockerClick(locker.id)}
                disabled={locker.status === 'broken' || locker.status === 'manual_locked'}
                className={cn(
                  'relative p-3 rounded-2xl border-2 transition-all text-center',
                  config.bgColor,
                  config.borderColor,
                  isSelected && 'ring-2 ring-white ring-offset-2 ring-offset-festival-dark scale-105',
                  locker.status !== 'broken' && locker.status !== 'manual_locked' && 'hover:scale-105 cursor-pointer',
                  (locker.status === 'broken' || locker.status === 'manual_locked') && 'opacity-60 cursor-not-allowed'
                )}
              >
                {locker.status === 'timeout_soon' && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-neon-yellow rounded-full animate-pulse" />
                )}
                {locker.status === 'broken' && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                )}
                
                {locker.status === 'free' ? (
                  <Unlock size={20} className={cn('mx-auto mb-1', config.iconColor)} />
                ) : (
                  <Lock size={20} className={cn('mx-auto mb-1', config.iconColor)} />
                )}
                
                <p className={cn('text-xs font-medium', config.textColor)}>
                  {locker.lockerNo.split('-')[1]}
                </p>
                
                {locker.size === 'l' && (
                  <span className="text-[10px] text-gray-500 mt-0.5 block">大号</span>
                )}
                
                {locker.status === 'manual_locked' && (
                  <span className="text-[10px] text-gray-400 mt-0.5 block">
                    {locker.manualLockReason}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <Card padding="lg" className="mt-6">
          <h3 className="text-white font-bold mb-3">图例说明</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {(Object.keys(statusConfig) as LockerStatus[]).map((status) => (
              <div key={status} className="flex items-center gap-2">
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center',
                  statusConfig[status].bgColor,
                  statusConfig[status].borderColor,
                  'border'
                )}>
                  <Lock size={14} className={statusConfig[status].iconColor} />
                </div>
                <div>
                  <p className={cn('text-xs font-medium', statusConfig[status].textColor)}>
                    {statusConfig[status].label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <BottomSheet
        isOpen={showOpenConfirm && selectedLocker !== null}
        onClose={() => setShowOpenConfirm(false)}
        title="开柜确认"
        maxHeight="50vh"
      >
        {selectedLocker && (
          <div className="space-y-4">
            <div className="text-center py-6">
              <div className={cn(
                'w-24 h-24 rounded-3xl mx-auto mb-4 flex items-center justify-center',
                statusConfig[selectedLocker.status].bgColor,
                statusConfig[selectedLocker.status].borderColor,
                'border-2'
              )}>
                <Unlock
                  size={48}
                  className={statusConfig[selectedLocker.status].iconColor}
                />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">
                {selectedLocker.lockerNo}
              </h3>
              <p className="text-gray-400">
                {selectedLocker.size === 's' ? '小号柜' : '大号柜'}
              </p>
              {selectedLocker.dueAt && (
                <p className="text-neon-yellow text-sm mt-2">
                  截止时间：{formatTime(selectedLocker.dueAt)}
                </p>
              )}
            </div>

            <div className="p-4 bg-white/5 rounded-xl">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <ShieldCheck size={16} className="text-neon-green" />
                <span>请确认物品已全部取出，关好柜门后自动锁定</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setShowOpenConfirm(false)}
              >
                取消
              </Button>
              <Button
                variant="primary"
                fullWidth
                loading={isOpening}
                onClick={handleConfirmOpen}
              >
                <Unlock className="mr-2" size={18} />
                确认开启
              </Button>
            </div>
          </div>
        )}
      </BottomSheet>

      {showOpenResult === 'success' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-festival-dark rounded-3xl p-8 text-center max-w-sm mx-4 animate-bounce">
            <div className="w-20 h-20 rounded-full bg-neon-green/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={48} className="text-neon-green" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">开柜成功</h3>
            <p className="text-gray-400">{lastOpenRecord?.lockerNo} 柜门已打开</p>
            <p className="text-gray-500 text-sm mt-1">
              操作时间：{lastOpenRecord && formatTime(lastOpenRecord.operatedAt)}
            </p>
          </div>
        </div>
      )}

      {showOpenResult === 'fail' && lastOpenRecord && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-festival-dark rounded-t-3xl p-6 animate-slide-up">
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />

            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={48} className="text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">柜门未弹开</h3>
              <p className="text-gray-400">{lastOpenRecord.lockerNo}</p>
            </div>

            <Card padding="md" className="mb-6 bg-red-500/5 border-red-500/30">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">柜号</span>
                  <span className="text-white font-medium">{lastOpenRecord.lockerNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">操作时间</span>
                  <span className="text-white font-medium">{formatTime(lastOpenRecord.operatedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">状态</span>
                  <span className="text-red-400 font-medium">开柜失败</span>
                </div>
                {lastOpenRecord.failureReason && (
                  <div className="pt-2 border-t border-white/10">
                    <p className="text-gray-300 text-sm">{lastOpenRecord.failureReason}</p>
                  </div>
                )}
              </div>
            </Card>

            <div className="space-y-3">
              <Button
                variant="primary"
                fullWidth
                onClick={() => {
                  setShowOpenResult(null);
                  setShowOpenConfirm(true);
                }}
              >
                <RefreshCw className="mr-2" size={18} />
                重试开柜
              </Button>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setShowHelpModal(true)}
              >
                <HelpCircle className="mr-2" size={18} />
                求助工作人员
              </Button>
              <Button
                variant="ghost"
                fullWidth
                onClick={() => setShowOpenResult(null)}
              >
                <X className="mr-2" size={18} />
                稍后再试
              </Button>
            </div>
          </div>
        </div>
      )}

      {showHelpModal && selectedLocker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-festival-dark rounded-t-3xl p-6 animate-slide-up">
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-neon-yellow/20 rounded-xl">
                <Wrench className="text-neon-yellow" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">上报故障</h3>
                <p className="text-gray-400 text-sm">我们将尽快处理</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">
                  故障描述
                </label>
                <textarea
                  value={faultDescription}
                  onChange={(e) => setFaultDescription(e.target.value)}
                  placeholder="请描述遇到的问题..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-neon-purple/50 resize-none"
                />
              </div>

              <div className="p-4 bg-neon-yellow/10 border border-neon-yellow/20 rounded-xl">
                <div className="flex items-start gap-2">
                  <Phone className="text-neon-yellow flex-shrink-0 mt-0.5" size={16} />
                  <div>
                    <p className="text-neon-yellow text-sm font-medium">
                      紧急联系
                    </p>
                    <p className="text-neon-yellow/80 text-xs mt-1">
                      现场工作人员电话：400-888-8888
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setShowHelpModal(false)}
              >
                取消
              </Button>
              <Button
                variant="primary"
                fullWidth
                disabled={!faultDescription}
                onClick={handleReportFault}
              >
                提交故障
              </Button>
            </div>
          </div>
        </div>
      )}

      {isOpening && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-festival-dark rounded-3xl p-8 text-center">
            <div className="w-16 h-16 border-4 border-neon-purple border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white font-medium">正在开启柜门...</p>
          </div>
        </div>
      )}
    </div>
  );
};
