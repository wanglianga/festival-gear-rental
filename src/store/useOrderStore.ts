import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Order, StockTransfer, StaffStats } from '../types';
import { initialOrders, stockTransfers, staffStats } from '../data/mockData';
import { generateOrderNo, generatePickupCode } from '../data/mockData';

interface OrderState {
  orders: Order[];
  staffStats: StaffStats;
  stockTransfers: StockTransfer[];
  createOrder: (order: Omit<Order, 'id' | 'orderNo' | 'qrCode' | 'pickupCode' | 'createdAt'>) => Order;
  getOrderById: (id: string) => Order | undefined;
  getOrdersByStatus: (status: Order['status']) => Order[];
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  pickupOrder: (orderId: string) => void;
  returnOrder: (orderId: string, damageFee?: number, damageDesc?: string) => void;
  getActiveOrders: () => Order[];
  getCompletedOrders: () => Order[];
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: initialOrders,
      staffStats,
      stockTransfers,
      createOrder: (orderData) => {
        const orderNo = generateOrderNo();
        const newOrder: Order = {
          ...orderData,
          id: `order-${Date.now()}`,
          orderNo,
          qrCode: `${orderNo}PICKUP`,
          pickupCode: generatePickupCode(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          orders: [newOrder, ...state.orders],
        }));
        return newOrder;
      },
      getOrderById: (id) => get().orders.find((o) => o.id === id),
      getOrdersByStatus: (status) =>
        get().orders.filter((o) => o.status === status),
      updateOrderStatus: (orderId, status) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status } : o
          ),
        }));
      },
      pickupOrder: (orderId) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? { ...o, status: 'using', pickedAt: new Date().toISOString() }
              : o
          ),
          staffStats: {
            ...state.staffStats,
            todayPicked: state.staffStats.todayPicked + 1,
          },
        }));
      },
      returnOrder: (orderId, damageFee, damageDesc) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: 'completed',
                  returnedAt: new Date().toISOString(),
                  damageFee,
                  damageDesc,
                }
              : o
          ),
          staffStats: {
            ...state.staffStats,
            todayReturned: state.staffStats.todayReturned + 1,
            pendingReturns: Math.max(0, state.staffStats.pendingReturns - 1),
            damagedItems: state.staffStats.damagedItems + (damageFee ? 1 : 0),
          },
        }));
      },
      getActiveOrders: () =>
        get().orders.filter(
          (o) => o.status === 'pending' || o.status === 'using' || o.status === 'picked'
        ),
      getCompletedOrders: () =>
        get().orders.filter((o) => o.status === 'completed'),
    }),
    {
      name: 'festival-order-storage',
    }
  )
);
