import type {
  Equipment,
  PickupPoint,
  Order,
  Festival,
  StaffStats,
  StockTransfer,
  StageSchedule,
  Locker,
  SecurityCheckPoint,
  LockerOpenRecord,
  LockerFaultRecord,
  CompanionAuthorization,
} from '../types';

export const festivalData: Festival = {
  name: '夏日星空音乐节',
  date: '2026-06-17',
  startTime: '2026-06-17T14:00:00',
  endTime: '2026-06-17T23:00:00',
  weather: '晴',
  temperature: 28,
};

export const equipments: Equipment[] = [
  {
    id: 'tent-1',
    name: '双人露营帐篷',
    category: 'tent',
    description: '防风防雨双人帐篷，含地垫和睡袋，适合两人露营使用',
    deposit: 300,
    rentalFee: 80,
    image: '🏕️',
    stock: 45,
    totalStock: 100,
    specs: ['双人容量', '防风防雨', '含睡袋', '快速搭建'],
  },
  {
    id: 'tent-2',
    name: '四人家庭帐篷',
    category: 'tent',
    description: '宽敞四人家庭帐篷，独立隔间，适合家庭或朋友聚会',
    deposit: 500,
    rentalFee: 150,
    image: '⛺',
    stock: 12,
    totalStock: 30,
    specs: ['四人容量', '独立隔间', '双层设计', '含防潮垫'],
  },
  {
    id: 'power-1',
    name: '20000mAh充电宝',
    category: 'powerBank',
    description: '大容量充电宝，支持快充，可充手机5-6次',
    deposit: 200,
    rentalFee: 30,
    image: '🔋',
    stock: 128,
    totalStock: 200,
    specs: ['20000mAh', '22.5W快充', 'Type-C接口', '可带上飞机'],
  },
  {
    id: 'power-2',
    name: '10000mAh迷你充电宝',
    category: 'powerBank',
    description: '轻薄便携充电宝，随身携带无负担',
    deposit: 100,
    rentalFee: 20,
    image: '⚡',
    stock: 86,
    totalStock: 150,
    specs: ['10000mAh', '轻薄便携', '双向快充', '迷你尺寸'],
  },
  {
    id: 'rain-1',
    name: '成人一次性雨衣',
    category: 'raincoat',
    description: '加厚透明雨衣，轻便易携，防止突降大雨',
    deposit: 0,
    rentalFee: 10,
    image: '🧥',
    stock: 500,
    totalStock: 1000,
    specs: ['加厚材质', '透明可视', '带帽设计', '一次性使用'],
  },
  {
    id: 'rain-2',
    name: '儿童卡通雨衣',
    category: 'raincoat',
    description: '可爱卡通图案儿童雨衣，带书包位设计',
    deposit: 50,
    rentalFee: 15,
    image: '🦄',
    stock: 156,
    totalStock: 200,
    specs: ['儿童尺寸', '卡通图案', '书包位', '可重复使用'],
  },
  {
    id: 'chair-1',
    name: '便携折叠椅',
    category: 'chair',
    description: '轻便折叠椅，承重150kg，配有收纳袋',
    deposit: 100,
    rentalFee: 25,
    image: '🪑',
    stock: 78,
    totalStock: 150,
    specs: ['承重150kg', '便携折叠', '带收纳袋', '牛津布面料'],
  },
  {
    id: 'chair-2',
    name: '豪华月亮椅',
    category: 'chair',
    description: '舒适月亮椅设计，包裹感强，久坐不累',
    deposit: 200,
    rentalFee: 45,
    image: '💺',
    stock: 23,
    totalStock: 50,
    specs: ['月亮椅造型', '加厚填充', '人体工学', '带侧袋'],
  },
  {
    id: 'locker-s',
    name: '小号储物柜',
    category: 'locker',
    description: '小型储物柜，适合存放背包、随身物品',
    deposit: 50,
    rentalFee: 20,
    image: '🔐',
    stock: 200,
    totalStock: 300,
    specs: ['30*40*50cm', '电子锁', '24小时监控', '随时存取'],
  },
  {
    id: 'locker-l',
    name: '大号储物柜',
    category: 'locker',
    description: '大型储物柜，可存放行李箱、帐篷等大件物品',
    deposit: 100,
    rentalFee: 40,
    image: '🗄️',
    stock: 85,
    totalStock: 100,
    specs: ['60*80*100cm', '电子密码锁', '24小时监控', '超大容量'],
  },
];

export const pickupPoints: PickupPoint[] = [
  {
    id: 'point-1',
    name: '主舞台取还点',
    type: 'stage',
    location: { x: 50, y: 30 },
    distance: 120,
    queueLength: 8,
    waitTime: 5,
    equipmentStock: {
      'tent-1': 15,
      'tent-2': 5,
      'power-1': 40,
      'power-2': 30,
      'rain-1': 150,
      'rain-2': 50,
      'chair-1': 25,
      'chair-2': 8,
    },
    lockerCount: 100,
    availableLockers: 32,
    staff: ['张三', '李四'],
  },
  {
    id: 'point-2',
    name: '营地区服务站',
    type: 'camping',
    location: { x: 20, y: 70 },
    distance: 350,
    queueLength: 3,
    waitTime: 2,
    equipmentStock: {
      'tent-1': 20,
      'tent-2': 5,
      'power-1': 35,
      'power-2': 25,
      'rain-1': 120,
      'rain-2': 40,
      'chair-1': 30,
      'chair-2': 8,
    },
    lockerCount: 80,
    availableLockers: 45,
    staff: ['王五', '赵六'],
  },
  {
    id: 'point-3',
    name: '出口处服务点',
    type: 'exit',
    location: { x: 85, y: 80 },
    distance: 500,
    queueLength: 1,
    waitTime: 1,
    equipmentStock: {
      'tent-1': 10,
      'tent-2': 2,
      'power-1': 53,
      'power-2': 31,
      'rain-1': 230,
      'rain-2': 66,
      'chair-1': 23,
      'chair-2': 7,
    },
    lockerCount: 120,
    availableLockers: 68,
    staff: ['钱七'],
  },
  {
    id: 'point-4',
    name: '美食广场旁',
    type: 'general',
    location: { x: 70, y: 50 },
    distance: 280,
    queueLength: 5,
    waitTime: 3,
    equipmentStock: {
      'tent-1': 0,
      'tent-2': 0,
      'power-1': 0,
      'power-2': 0,
      'rain-1': 0,
      'rain-2': 0,
      'chair-1': 0,
      'chair-2': 0,
    },
    lockerCount: 0,
    availableLockers: 0,
    staff: ['孙八', '周九'],
  },
];

export const initialOrders: Order[] = [
  {
    id: 'order-1',
    orderNo: 'MF202606170001',
    type: 'rent',
    userId: 'user-1',
    equipmentId: 'power-1',
    equipmentName: '20000mAh充电宝',
    quantity: 1,
    pickupPointId: 'point-1',
    pickupPointName: '主舞台取还点',
    deposit: 200,
    rentalFee: 30,
    status: 'using',
    qrCode: 'MF202606170001PICKUP',
    pickupCode: 'A3847',
    createdAt: '2026-06-17T10:30:00',
    pickedAt: '2026-06-17T10:45:00',
    dueAt: '2026-06-17T22:00:00',
  },
  {
    id: 'order-2',
    orderNo: 'MF202606170002',
    type: 'store',
    userId: 'user-1',
    pickupPointId: 'point-2',
    pickupPointName: '营地区服务站',
    lockerNo: 'B区-128号',
    quantity: 1,
    deposit: 50,
    rentalFee: 20,
    status: 'using',
    qrCode: 'MF202606170002LOCKER',
    pickupCode: 'L7623',
    createdAt: '2026-06-17T09:00:00',
    pickedAt: '2026-06-17T09:15:00',
    dueAt: '2026-06-17T23:30:00',
  },
  {
    id: 'order-3',
    orderNo: 'MF202606170003',
    type: 'rent',
    userId: 'user-1',
    equipmentId: 'chair-1',
    equipmentName: '便携折叠椅',
    quantity: 2,
    pickupPointId: 'point-1',
    pickupPointName: '主舞台取还点',
    deposit: 200,
    rentalFee: 50,
    status: 'pending',
    qrCode: 'MF202606170003PICKUP',
    pickupCode: 'C9251',
    createdAt: '2026-06-17T13:20:00',
    dueAt: '2026-06-17T22:00:00',
  },
];

export const staffStats: StaffStats = {
  todayPicked: 156,
  todayReturned: 89,
  pendingReturns: 23,
  damagedItems: 3,
  lockerFaults: 2,
  lowStockAlerts: 5,
};

export const stockTransfers: StockTransfer[] = [
  {
    id: 'transfer-1',
    fromPointId: 'point-3',
    fromPointName: '出口处服务点',
    toPointId: 'point-1',
    toPointName: '主舞台取还点',
    equipmentId: 'tent-1',
    equipmentName: '双人露营帐篷',
    quantity: 10,
    status: 'inProgress',
    createdAt: '2026-06-17T11:00:00',
    operator: '管理员',
  },
  {
    id: 'transfer-2',
    fromPointId: 'point-2',
    fromPointName: '营地区服务站',
    toPointId: 'point-1',
    toPointName: '主舞台取还点',
    equipmentId: 'power-1',
    equipmentName: '20000mAh充电宝',
    quantity: 20,
    status: 'completed',
    createdAt: '2026-06-17T08:30:00',
    completedAt: '2026-06-17T09:15:00',
    operator: '管理员',
  },
];

export const generatePickupCode = (): string => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const generateOrderNo = (): string => {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `MF${dateStr}${random}`;
};

export const stageSchedules: StageSchedule[] = [
  {
    id: 'stage-1',
    stageName: '主舞台',
    artist: '压轴乐队 - 夏日星空',
    startTime: '2026-06-17T20:00:00',
    endTime: '2026-06-17T22:30:00',
    date: '2026-06-17',
    isFavorite: true,
  },
  {
    id: 'stage-2',
    stageName: '主舞台',
    artist: '极光乐队',
    startTime: '2026-06-17T17:30:00',
    endTime: '2026-06-17T19:30:00',
    date: '2026-06-17',
    isFavorite: true,
  },
  {
    id: 'stage-3',
    stageName: '电音舞台',
    artist: 'DJ Nova',
    startTime: '2026-06-17T21:00:00',
    endTime: '2026-06-17T23:00:00',
    date: '2026-06-17',
    isFavorite: false,
  },
  {
    id: 'stage-4',
    stageName: '民谣舞台',
    artist: '林小夏',
    startTime: '2026-06-17T15:00:00',
    endTime: '2026-06-17T16:30:00',
    date: '2026-06-17',
    isFavorite: false,
  },
  {
    id: 'stage-5',
    stageName: '主舞台',
    artist: '开场乐队 - 晨光',
    startTime: '2026-06-17T14:00:00',
    endTime: '2026-06-17T16:00:00',
    date: '2026-06-17',
    isFavorite: true,
  },
];

const generateLockers = (pointId: string, pointName: string, area: string, start: number, count: number, size: 's' | 'l'): Locker[] => {
  const statuses: Locker['status'][] = ['free', 'occupied', 'broken', 'reserved', 'timeout_soon', 'manual_locked'];
  return Array.from({ length: count }, (_, i) => {
    const idx = start + i;
    let status: Locker['status'] = 'free';
    if (idx % 7 === 0) status = 'occupied';
    else if (idx % 11 === 0) status = 'broken';
    else if (idx % 13 === 0) status = 'reserved';
    else if (idx % 17 === 0) status = 'timeout_soon';
    else if (idx % 19 === 0) status = 'manual_locked';
    
    return {
      id: `locker-${pointId}-${idx}`,
      lockerNo: `${area}区-${String(idx).padStart(3, '0')}号`,
      pointId,
      pointName,
      area,
      size,
      status,
      ...(status === 'occupied' || status === 'timeout_soon' ? {
        orderId: `order-${1000 + idx}`,
        occupiedAt: new Date(Date.now() - Math.random() * 4 * 60 * 60 * 1000).toISOString(),
        dueAt: new Date(Date.now() + (status === 'timeout_soon' ? 10 : 60) * 60 * 1000).toISOString(),
      } : {}),
      ...(status === 'reserved' ? {
        reservedUntil: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      } : {}),
      ...(status === 'manual_locked' ? {
        manualLockReason: '维护中',
      } : {}),
    };
  });
};

export const lockers: Locker[] = [
  ...generateLockers('point-1', '主舞台取还点', 'A', 1, 50, 's'),
  ...generateLockers('point-1', '主舞台取还点', 'B', 51, 50, 'l'),
  ...generateLockers('point-2', '营地区服务站', 'C', 1, 40, 's'),
  ...generateLockers('point-2', '营地区服务站', 'D', 41, 40, 'l'),
  ...generateLockers('point-3', '出口处服务点', 'E', 1, 60, 's'),
  ...generateLockers('point-3', '出口处服务点', 'F', 61, 60, 'l'),
];

export const securityCheckPoints: SecurityCheckPoint[] = [
  {
    id: 'sec-1',
    name: '主入口安检',
    pointId: 'point-1',
    distance: 80,
    waitTime: 3,
    queueLength: 5,
  },
  {
    id: 'sec-2',
    name: 'VIP入口安检',
    pointId: 'point-1',
    distance: 120,
    waitTime: 1,
    queueLength: 2,
  },
  {
    id: 'sec-3',
    name: '营地入口安检',
    pointId: 'point-2',
    distance: 60,
    waitTime: 2,
    queueLength: 3,
  },
  {
    id: 'sec-4',
    name: '出口安检',
    pointId: 'point-3',
    distance: 40,
    waitTime: 1,
    queueLength: 1,
  },
];

export const lockerOpenRecords: LockerOpenRecord[] = [
  {
    id: 'record-1',
    lockerId: 'locker-point-1-1',
    lockerNo: 'A区-001号',
    pointId: 'point-1',
    orderId: 'order-2',
    userId: 'user-1',
    operationType: 'open',
    operatedAt: '2026-06-17T09:15:00',
    success: true,
  },
  {
    id: 'record-2',
    lockerId: 'locker-point-1-11',
    lockerNo: 'A区-011号',
    pointId: 'point-1',
    userId: 'user-2',
    operationType: 'open',
    operatedAt: '2026-06-17T10:30:00',
    success: false,
    failureReason: '柜门未弹开，机械故障',
  },
];

export const initialLockerFaults: LockerFaultRecord[] = [
  {
    id: 'fault-1',
    lockerId: 'locker-point-1-11',
    lockerNo: 'A区-011号',
    pointId: 'point-1',
    pointName: '主舞台取还点',
    type: 'open_fail',
    status: 'pending',
    description: '用户扫码后柜门未弹开，尝试多次仍无法打开',
    reportTime: '2026-06-17T10:32:00',
    reportSource: 'user',
    orderId: 'order-1011',
    userId: 'user-2',
    openRecordId: 'record-2',
  },
  {
    id: 'fault-2',
    lockerId: 'locker-point-2-55',
    lockerNo: 'D区-055号',
    pointId: 'point-2',
    pointName: '营地区服务站',
    type: 'damage',
    status: 'processing',
    description: '柜门损坏，需要更换锁具',
    reportTime: '2026-06-17T08:15:00',
    reportSource: 'staff',
    handledBy: '王五',
    handledAt: '2026-06-17T08:30:00',
    resolution: '已联系维修人员',
  },
];

export const initialCompanionAuthorizations: CompanionAuthorization[] = [
  {
    id: 'auth-1',
    orderId: 'order-3',
    authorizerId: 'user-1',
    authorizerName: '张先生',
    authorizedName: '李同伴',
    authorizedPhone: '138****8888',
    pickupCode: 'D4521',
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    isUsed: false,
  },
];

export const getNextLockerId = (): string => {
  return `locker-${Date.now()}`;
};

export const generateFaultId = (): string => {
  return `fault-${Date.now()}`;
};

export const generateOpenRecordId = (): string => {
  return `record-${Date.now()}`;
};

export const generateAuthorizationId = (): string => {
  return `auth-${Date.now()}`;
};
