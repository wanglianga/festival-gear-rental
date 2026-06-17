export const formatCurrency = (amount: number): string => {
  return `¥${amount.toFixed(0)}`;
};

export const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
};

export const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatCountdown = (targetDate: string): { hours: number; minutes: number; seconds: number; isOverdue: boolean } => {
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const diff = target - now;

  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, isOverdue: true };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds, isOverdue: false };
};

export const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: '待取件',
    picked: '已取件',
    using: '使用中',
    returning: '归还中',
    completed: '已完成',
    overdue: '已逾期',
  };
  return statusMap[status] || status;
};

export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    pending: 'text-neon-yellow',
    picked: 'text-neon-blue',
    using: 'text-neon-green',
    returning: 'text-neon-orange',
    completed: 'text-gray-400',
    overdue: 'text-red-500',
  };
  return colorMap[status] || 'text-gray-400';
};

export const getStockStatus = (stock: number, total: number): { text: string; color: string; level: 'high' | 'medium' | 'low' | 'empty' } => {
  const ratio = stock / total;
  if (stock === 0) return { text: '已售罄', color: 'text-red-500', level: 'empty' };
  if (ratio <= 0.2) return { text: '库存紧张', color: 'text-neon-orange', level: 'low' };
  if (ratio <= 0.5) return { text: '库存有限', color: 'text-neon-yellow', level: 'medium' };
  return { text: '库存充足', color: 'text-neon-green', level: 'high' };
};

export const getQueueColor = (length: number): string => {
  if (length === 0) return 'text-neon-green';
  if (length <= 5) return 'text-neon-yellow';
  if (length <= 10) return 'text-neon-orange';
  return 'text-red-500';
};

export const getPointTypeText = (type: string): string => {
  const typeMap: Record<string, string> = {
    stage: '舞台区',
    camping: '营地区',
    exit: '出口处',
    general: '综合服务',
  };
  return typeMap[type] || type;
};

export const getCategoryName = (category: string): string => {
  const categoryMap: Record<string, string> = {
    tent: '帐篷',
    powerBank: '充电宝',
    raincoat: '雨衣',
    chair: '折叠椅',
    locker: '储物柜',
  };
  return categoryMap[category] || category;
};
