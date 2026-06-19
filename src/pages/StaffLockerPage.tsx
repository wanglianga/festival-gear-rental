import { useState, useEffect } from 'react';
import {
  ArrowLeft, Lock, Unlock, AlertTriangle, Check, Search, RefreshCw, X,
  User, Clock, FileText, Phone, MessageSquare, Wrench, MapPin, Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { BottomSheet } from '../components/common/BottomSheet';
import { useAppStore } from '../store/useAppStore';
import { useEquipmentStore } from '../store/useEquipmentStore';
import { useLockerStore } from '../store/useLockerStore';
import { cn } from '../lib/utils';
import { formatTime } from '../utils/format';
import type { LockerFaultRecord, LockerStatus, LockerOpenRecord } from '../types';

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

const faultTypeText: Record<string, string> = {
  open_fail: '开门故障',
  close_fail: '关门故障',
  damage: '柜面损坏',
  lock_fail: '锁具故障',
  other: '其他问题',
};

const reportSourceText: Record<string, string> = {
  user: '用户上报',
  staff: '工作人员',
  system: '系统检测',
};

const statusText: Record<string, string> = {
  pending: '待处理',
  processing: '处理中',
  resolved: '已解决',
};

export const StaffLockerPage = () => {
  const navigate = useNavigate();
  const { currentPointId } = useAppStore();
  const { pickupPoints } = useEquipmentStore();
  const { 
    getLockersByPoint, 
    getAreasByPoint, 
    getFaultsByPoint, 
    getPendingFaults,
    updateFaultStatus,
    updateLockerStatus,
    getOpenRecordsByLocker,
    openLocker
  } = useLockerStore();
  
  const currentPoint = pickupPoints.find((p) => p.id === currentPointId);
  const allFaults = getFaultsByPoint(currentPointId || 'point-1');
  const pendingFaults = allFaults.filter((f) => f.status === 'pending');
  const processingFaults = allFaults.filter((f) => f.status === 'processing');
  const resolvedFaults = allFaults.filter((f) => f.status === 'resolved');
  
  const lockers = getLockersByPoint(currentPointId || 'point-1');
  const areas = getAreasByPoint(currentPointId || 'point-1');

  const [activeTab, setActiveTab] = useState<'faults' | 'lockers' | 'records'>('faults');
  const [searchLocker, setSearchLocker] = useState('');
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedFault, setSelectedFault] = useState<LockerFaultRecord | null>(null);
  const [showFaultDetail, setShowFaultDetail] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showOpenConfirm, setShowOpenConfirm] = useState(false);
  const [selectedLockerId, setSelectedLockerId] = useState<string | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');
  const [lockerOpenRecords, setLockerOpenRecords] = useState<LockerOpenRecord[]>([]);

  useEffect(() => {
    if (areas.length > 0 && !selectedArea) {
      setSelectedArea(areas[0]);
    }
  }, [areas, selectedArea]);

  const filteredLockers = lockers.filter((l) => {
    const matchesSearch = searchLocker === '' || 
      l.lockerNo.toLowerCase().includes(searchLocker.toLowerCase());
    const matchesArea = !selectedArea || l.area === selectedArea;
    return matchesSearch && matchesArea;
  });

  const selectedLocker = selectedLockerId
    ? lockers.find((l) => l.id === selectedLockerId)
    : null;

  const statusCounts = {
    free: lockers.filter((l) => l.status === 'free').length,
    occupied: lockers.filter((l) => l.status === 'occupied').length,
    broken: lockers.filter((l) => l.status === 'broken').length,
    reserved: lockers.filter((l) => l.status === 'reserved').length,
    timeout_soon: lockers.filter((l) => l.status === 'timeout_soon').length,
    manual_locked: lockers.filter((l) => l.status === 'manual_locked').length,
  };

  const handleViewFaultDetail = (fault: LockerFaultRecord) => {
    setSelectedFault(fault);
    const records = getOpenRecordsByLocker(fault.lockerId);
    setLockerOpenRecords(records);
    setShowFaultDetail(true);
  };

  const handleStartProcessing = (fault: LockerFaultRecord) => {
    updateFaultStatus(fault.id, 'processing', '工作人员', '已派单处理');
  };

  const handleOpenResolveModal = (fault: LockerFaultRecord) => {
    setSelectedFault(fault);
    setShowResolveModal(true);
  };

  const confirmResolve = () => {
    if (selectedFault) {
      updateFaultStatus(
        selectedFault.id, 
        'resolved', 
        '工作人员', 
        resolutionNote || '故障已修复'
      );
      updateLockerStatus(selectedFault.lockerId, 'free');
      setShowResolveModal(false);
      setSelectedFault(null);
      setResolutionNote('');
    }
  };

  const handleRemoteOpen = async () => {
    if (!selectedLocker) return;
    
    setIsOpening(true);
    setShowOpenConfirm(false);
    
    const success = await openLocker(selectedLocker.id, 'staff-1', selectedLocker.orderId);
    
    setIsOpening(false);
    
    if (success) {
      updateLockerStatus(selectedLocker.id, 'free');
    }
  };

  const renderFaultCard = (fault: LockerFaultRecord) => {
    const isPending = fault.status === 'pending';
    const isProcessing = fault.status === 'processing';
    
    return (
      <Card
        key={fault.id}
        padding="md"
        className={cn(
          'mb-3',
          isPending && 'border-red-500/30 bg-red-500/5',
          isProcessing && 'border-neon-yellow/30 bg-neon-yellow/5'
        )}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <Lock
                className={cn(
                  isPending ? 'text-red-500' : 'text-neon-yellow',
                  isProcessing ? 'text-neon-yellow' : ''
                )}
                size={18}
              />
              <span className="text-white font-bold">{fault.lockerNo}</span>
            </div>
            <p className="text-gray-400 text-sm mt-1">{fault.pointName}</p>
          </div>
          <span className={cn(
            'px-2 py-1 text-xs rounded-full',
            isPending ? 'bg-red-500/20 text-red-400' : 'bg-neon-yellow/20 text-neon-yellow'
          )}>
            {statusText[fault.status]}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="px-2 py-0.5 bg-white/10 text-gray-300 text-xs rounded">
            {faultTypeText[fault.type]}
          </span>
          <span className="px-2 py-0.5 bg-white/10 text-gray-300 text-xs rounded">
            {reportSourceText[fault.reportSource]}
          </span>
          <span className="text-gray-500 text-xs">
            {formatTime(fault.reportTime)}
          </span>
        </div>
        
        <p className="text-gray-300 text-sm mb-4">{fault.description}</p>
        
        {fault.userId && (
          <div className="mb-4 p-3 bg-white/5 rounded-xl">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <User size={14} />
              <span>用户ID: {fault.userId}</span>
            </div>
            {fault.orderId && (
              <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                <FileText size={14} />
                <span>订单号: {fault.orderId}</span>
              </div>
            )}
          </div>
        )}
        
        <div className="flex gap-2">
          <button
            onClick={() => handleViewFaultDetail(fault)}
            className="flex-1 py-2 px-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm text-gray-300 flex items-center justify-center gap-1 transition-colors"
          >
            <Eye size={14} />
            详情
          </button>
          
          {isPending && (
            <button
              onClick={() => handleStartProcessing(fault)}
              className="flex-1 py-2 px-3 bg-neon-blue/20 hover:bg-neon-blue/30 rounded-xl text-sm text-neon-blue flex items-center justify-center gap-1 transition-colors"
            >
              <Wrench size={14} />
              开始处理
            </button>
          )}
          
          {isProcessing && (
            <>
              <button
                onClick={() => {
                  setSelectedLockerId(fault.lockerId);
                  setShowOpenConfirm(true);
                }}
                className="flex-1 py-2 px-3 bg-neon-purple/20 hover:bg-neon-purple/30 rounded-xl text-sm text-neon-purple flex items-center justify-center gap-1 transition-colors"
              >
                <Unlock size={14} />
                远程开箱
              </button>
              <button
                onClick={() => handleOpenResolveModal(fault)}
                className="flex-1 py-2 px-3 bg-neon-green/20 hover:bg-neon-green/30 rounded-xl text-sm text-neon-green flex items-center justify-center gap-1 transition-colors"
              >
                <Check size={14} />
                解决
              </button>
            </>
          )}
        </div>
      </Card>
    );
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
              'flex-1 py-2.5 rounded-xl font-medium transition-all text-sm',
              activeTab === 'faults'
                ? 'bg-gradient-to-r from-neon-pink to-neon-purple text-white'
                : 'bg-white/10 text-gray-400 hover:text-white'
            )}
          >
            故障 ({pendingFaults.length + processingFaults.length})
          </button>
          <button
            onClick={() => setActiveTab('lockers')}
            className={cn(
              'flex-1 py-2.5 rounded-xl font-medium transition-all text-sm',
              activeTab === 'lockers'
                ? 'bg-gradient-to-r from-neon-pink to-neon-purple text-white'
                : 'bg-white/10 text-gray-400 hover:text-white'
            )}
          >
            储物柜
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={cn(
              'flex-1 py-2.5 rounded-xl font-medium transition-all text-sm',
              activeTab === 'records'
                ? 'bg-gradient-to-r from-neon-pink to-neon-purple text-white'
                : 'bg-white/10 text-gray-400 hover:text-white'
            )}
          >
            记录 ({resolvedFaults.length})
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
              <div>
                {pendingFaults.map(renderFaultCard)}
              </div>
            </div>
          )}

          {processingFaults.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <RefreshCw className="text-neon-yellow" size={20} />
                处理中 ({processingFaults.length})
              </h3>
              <div>
                {processingFaults.map(renderFaultCard)}
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

      {activeTab === 'lockers' && (
        <div className="p-4">
          <div className="mb-4">
            <div className="relative mb-3">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchLocker}
                onChange={(e) => setSearchLocker(e.target.value)}
                placeholder="搜索柜号..."
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-neon-purple/50"
              />
            </div>

            {areas.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
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

          <div className="grid grid-cols-6 gap-1.5 mb-4">
            {(Object.keys(statusConfig) as LockerStatus[]).map((status) => (
              <div
                key={status}
                className={cn(
                  'rounded-lg p-1.5 text-center',
                  statusConfig[status].bgColor
                )}
              >
                <p className={cn('text-xs font-medium', statusConfig[status].textColor)}>
                  {statusConfig[status].label}
                </p>
                <p className={cn('text-base font-bold', statusConfig[status].textColor)}>
                  {statusCounts[status]}
                </p>
              </div>
            ))}
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

          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
            {filteredLockers.map((locker) => {
              const config = statusConfig[locker.status];
              const isSelected = selectedLockerId === locker.id;
              const hasFault = allFaults.some(
                (f) => f.lockerId === locker.id && f.status !== 'resolved'
              );

              return (
                <button
                  key={locker.id}
                  onClick={() => {
                    setSelectedLockerId(locker.id);
                    setShowOpenConfirm(true);
                  }}
                  className={cn(
                    'relative p-2.5 rounded-xl border-2 transition-all text-center',
                    config.bgColor,
                    config.borderColor,
                    isSelected && 'ring-2 ring-white ring-offset-2 ring-offset-festival-dark scale-105',
                    locker.status !== 'broken' && locker.status !== 'manual_locked' && 'hover:scale-105 cursor-pointer',
                    (locker.status === 'broken' || locker.status === 'manual_locked') && 'opacity-60'
                  )}
                >
                  {locker.status === 'timeout_soon' && (
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-neon-yellow rounded-full animate-pulse" />
                  )}
                  {hasFault && (
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                  
                  <Lock
                    size={16}
                    className={cn(
                      'mx-auto mb-0.5',
                      config.iconColor
                    )}
                  />
                  <p className={cn('text-[10px] font-medium', config.textColor)}>
                    {locker.lockerNo.split('-')[1]}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'records' && (
        <div className="p-4">
          {resolvedFaults.length > 0 ? (
            <div>
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Check className="text-neon-green" size={20} />
                已解决 ({resolvedFaults.length})
              </h3>
              <div className="space-y-3">
                {resolvedFaults.map((fault) => (
                  <Card key={fault.id} padding="md" className="bg-white/5 opacity-75">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <Lock className="text-neon-green" size={16} />
                          <span className="text-white font-medium">{fault.lockerNo}</span>
                        </div>
                        <p className="text-gray-400 text-xs mt-0.5">{fault.pointName}</p>
                      </div>
                      <span className="px-2 py-0.5 bg-neon-green/20 text-neon-green text-xs rounded-full">
                        已解决
                      </span>
                    </div>
                    <p className="text-gray-300 text-xs mb-2">{fault.description}</p>
                    {fault.resolution && (
                      <p className="text-neon-green text-xs">解决方案：{fault.resolution}</p>
                    )}
                    {fault.handledBy && fault.handledAt && (
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10 text-xs text-gray-500">
                        <span>处理人：{fault.handledBy}</span>
                        <span>{formatTime(fault.handledAt)}</span>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 rounded-full bg-gray-500/10 flex items-center justify-center mb-4">
                <FileText size={40} className="text-gray-500" />
              </div>
              <p className="text-white text-lg font-medium">暂无记录</p>
              <p className="text-gray-400 text-sm mt-1">已解决的故障将显示在这里</p>
            </div>
          )}
        </div>
      )}

      <BottomSheet
        isOpen={showFaultDetail && selectedFault !== null}
        onClose={() => setShowFaultDetail(false)}
        title="故障详情"
        maxHeight="80vh"
      >
        {selectedFault && (
          <div className="space-y-4">
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-500/20 rounded-xl">
                    <AlertTriangle className="text-red-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedFault.lockerNo}</h3>
                    <p className="text-gray-400 text-sm">{selectedFault.pointName}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded-full">
                  {statusText[selectedFault.status]}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white/5 rounded-xl">
                <p className="text-gray-400 text-xs mb-1">故障类型</p>
                <p className="text-white font-medium">{faultTypeText[selectedFault.type]}</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl">
                <p className="text-gray-400 text-xs mb-1">上报来源</p>
                <p className="text-white font-medium">{reportSourceText[selectedFault.reportSource]}</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl">
                <p className="text-gray-400 text-xs mb-1">上报时间</p>
                <p className="text-white font-medium">{formatTime(selectedFault.reportTime)}</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl">
                <p className="text-gray-400 text-xs mb-1">故障ID</p>
                <p className="text-white font-medium text-xs">{selectedFault.id}</p>
              </div>
            </div>

            <Card padding="md">
              <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                <MessageSquare size={16} className="text-neon-purple" />
                故障描述
              </h4>
              <p className="text-gray-300 text-sm">{selectedFault.description}</p>
            </Card>

            {selectedFault.userId && (
              <Card padding="md">
                <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                  <User size={16} className="text-neon-blue" />
                  用户信息
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">用户ID</span>
                    <span className="text-white">{selectedFault.userId}</span>
                  </div>
                  {selectedFault.orderId && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">关联订单</span>
                      <span className="text-white">{selectedFault.orderId}</span>
                    </div>
                  )}
                  {selectedFault.openRecordId && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">操作记录</span>
                      <span className="text-white">{selectedFault.openRecordId}</span>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {lockerOpenRecords.length > 0 && (
              <Card padding="md">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Clock size={16} className="text-neon-yellow" />
                  最近开柜记录
                </h4>
                <div className="space-y-2">
                  {lockerOpenRecords.slice(0, 5).map((record) => (
                    <div key={record.id} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                      <div className="flex items-center gap-2">
                        {record.success ? (
                          <Unlock size={14} className="text-neon-green" />
                        ) : (
                          <Lock size={14} className="text-red-500" />
                        )}
                        <span className="text-white text-sm">{formatTime(record.operatedAt)}</span>
                      </div>
                      <span className={cn(
                        'text-xs',
                        record.success ? 'text-neon-green' : 'text-red-400'
                      )}>
                        {record.success ? '成功' : '失败'}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {selectedFault.handledBy && (
              <Card padding="md">
                <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                  <Wrench size={16} className="text-neon-green" />
                  处理信息
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">处理人</span>
                    <span className="text-white">{selectedFault.handledBy}</span>
                  </div>
                  {selectedFault.handledAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">处理时间</span>
                      <span className="text-white">{formatTime(selectedFault.handledAt)}</span>
                    </div>
                  )}
                  {selectedFault.resolution && (
                    <div>
                      <span className="text-gray-400">解决方案：</span>
                      <span className="text-white">{selectedFault.resolution}</span>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {selectedFault.status === 'pending' && (
              <Button
                fullWidth
                variant="primary"
                onClick={() => {
                  handleStartProcessing(selectedFault);
                  setShowFaultDetail(false);
                }}
              >
                <Wrench className="mr-2" size={18} />
                开始处理此故障
              </Button>
            )}
          </div>
        )}
      </BottomSheet>

      <BottomSheet
        isOpen={showOpenConfirm && selectedLocker !== null}
        onClose={() => setShowOpenConfirm(false)}
        title="远程开箱"
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
                {selectedLocker.size === 's' ? '小号柜' : '大号柜'} · {statusConfig[selectedLocker.status].label}
              </p>
              {selectedLocker.orderId && (
                <p className="text-gray-500 text-sm mt-2">
                  订单：{selectedLocker.orderId}
                </p>
              )}
            </div>

            {selectedLocker.status === 'broken' && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-red-400 text-sm flex items-center gap-2">
                  <AlertTriangle size={16} />
                  此柜已标记为故障，远程开箱可能无效
                </p>
              </div>
            )}

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
                onClick={handleRemoteOpen}
              >
                <Unlock className="mr-2" size={18} />
                确认开启
              </Button>
            </div>
          </div>
        )}
      </BottomSheet>

      {showResolveModal && selectedFault && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-festival-dark rounded-t-3xl p-6 animate-slide-up">
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />
            
            <h3 className="text-xl font-bold text-white mb-4">确认解决故障？</h3>
            
            <div className="mb-4">
              <p className="text-gray-400 mb-2">
                {selectedFault.lockerNo} 的故障已处理完成，标记为已解决？
              </p>
              <p className="text-gray-500 text-sm">
                柜门状态将自动更新为"空闲"
              </p>
            </div>

            <div className="mb-6">
              <label className="text-white text-sm font-medium mb-2 block">
                解决方案（可选）
              </label>
              <textarea
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="请描述解决方案..."
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-neon-purple/50 resize-none"
              />
            </div>

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
