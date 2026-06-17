export type EquipmentCategory = 'tent' | 'powerBank' | 'raincoat' | 'chair' | 'locker';

export interface Equipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  description: string;
  deposit: number;
  rentalFee: number;
  image: string;
  stock: number;
  totalStock: number;
  specs: string[];
}

export type PickupPointType = 'stage' | 'camping' | 'exit' | 'general';

export interface PickupPoint {
  id: string;
  name: string;
  type: PickupPointType;
  location: { x: number; y: number };
  distance: number;
  queueLength: number;
  waitTime: number;
  equipmentStock: Record<string, number>;
  lockerCount: number;
  availableLockers: number;
  staff: string[];
}

export type OrderStatus = 'pending' | 'picked' | 'using' | 'returning' | 'completed' | 'overdue';

export interface Order {
  id: string;
  orderNo: string;
  type: 'rent' | 'store';
  userId: string;
  equipmentId?: string;
  equipmentName?: string;
  quantity: number;
  pickupPointId: string;
  pickupPointName: string;
  lockerNo?: string;
  deposit: number;
  rentalFee: number;
  status: OrderStatus;
  qrCode: string;
  pickupCode: string;
  createdAt: string;
  pickedAt?: string;
  dueAt: string;
  returnedAt?: string;
  damageFee?: number;
  damageDesc?: string;
}

export interface Festival {
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  weather: string;
  temperature: number;
}

export interface StaffStats {
  todayPicked: number;
  todayReturned: number;
  pendingReturns: number;
  damagedItems: number;
  lockerFaults: number;
  lowStockAlerts: number;
}

export type DamageLevel = 'none' | 'minor' | 'moderate' | 'severe';

export interface DamageRecord {
  orderId: string;
  level: DamageLevel;
  description: string;
  fee: number;
  photos: string[];
}

export type TransferStatus = 'pending' | 'inProgress' | 'completed' | 'cancelled';

export interface StockTransfer {
  id: string;
  fromPointId: string;
  fromPointName: string;
  toPointId: string;
  toPointName: string;
  equipmentId: string;
  equipmentName: string;
  quantity: number;
  status: TransferStatus;
  createdAt: string;
  completedAt?: string;
  operator: string;
}
