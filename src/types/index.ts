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

export interface StageSchedule {
  id: string;
  stageName: string;
  artist: string;
  startTime: string;
  endTime: string;
  date: string;
  isFavorite: boolean;
}

export type LockerStatus = 'free' | 'occupied' | 'broken' | 'reserved' | 'timeout_soon' | 'manual_locked';

export interface Locker {
  id: string;
  lockerNo: string;
  pointId: string;
  pointName: string;
  area: string;
  size: 's' | 'l';
  status: LockerStatus;
  orderId?: string;
  occupiedAt?: string;
  dueAt?: string;
  reservedUntil?: string;
  manualLockReason?: string;
}

export interface SecurityCheckPoint {
  id: string;
  name: string;
  pointId: string;
  distance: number;
  waitTime: number;
  queueLength: number;
}

export type ConflictLevel = 'safe' | 'warning' | 'danger';

export interface ConflictSuggestion {
  type: 'change_point' | 'earlier_pickup' | 'authorize_companion';
  title: string;
  description: string;
  actionText: string;
}

export interface TimeConflictResult {
  level: ConflictLevel;
  title: string;
  description: string;
  arrivalTime?: string;
  bufferMinutes: number;
  suggestions: ConflictSuggestion[];
}

export interface LockerOpenRecord {
  id: string;
  lockerId: string;
  lockerNo: string;
  pointId: string;
  orderId?: string;
  userId: string;
  operationType: 'open' | 'close' | 'manual_open';
  operatedAt: string;
  success: boolean;
  failureReason?: string;
}

export interface LockerFaultRecord {
  id: string;
  lockerId: string;
  lockerNo: string;
  pointId: string;
  pointName: string;
  type: 'open_fail' | 'close_fail' | 'damage' | 'lock_fail' | 'other';
  status: 'pending' | 'processing' | 'resolved';
  description: string;
  reportTime: string;
  reportSource: 'user' | 'staff' | 'system';
  orderId?: string;
  userId?: string;
  openRecordId?: string;
  handledBy?: string;
  handledAt?: string;
  resolution?: string;
}

export interface CompanionAuthorization {
  id: string;
  orderId: string;
  authorizerId: string;
  authorizerName: string;
  authorizedName: string;
  authorizedPhone: string;
  pickupCode: string;
  expiresAt: string;
  createdAt: string;
  isUsed: boolean;
}
