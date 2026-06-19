import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Locker, LockerOpenRecord, LockerFaultRecord, CompanionAuthorization, TimeConflictResult } from '../types';
import { lockers, lockerOpenRecords, initialLockerFaults, initialCompanionAuthorizations, generateOpenRecordId, generateFaultId, generateAuthorizationId } from '../data/mockData';

interface LockerState {
  lockers: Locker[];
  openRecords: LockerOpenRecord[];
  faultRecords: LockerFaultRecord[];
  companionAuthorizations: CompanionAuthorization[];
  
  getLockersByPoint: (pointId: string) => Locker[];
  getLockersByPointAndArea: (pointId: string, area: string) => Locker[];
  getLockerById: (id: string) => Locker | undefined;
  getLockerByNo: (lockerNo: string) => Locker | undefined;
  getAvailableLockers: (pointId: string, size?: 's' | 'l') => Locker[];
  getAreasByPoint: (pointId: string) => string[];
  
  updateLockerStatus: (lockerId: string, status: Locker['status']) => void;
  openLocker: (lockerId: string, userId: string, orderId?: string) => Promise<boolean>;
  createOpenRecord: (record: Omit<LockerOpenRecord, 'id'>) => void;
  reportFault: (fault: Omit<LockerFaultRecord, 'id' | 'reportTime' | 'status'>) => void;
  updateFaultStatus: (faultId: string, status: LockerFaultRecord['status'], handledBy?: string, resolution?: string) => void;
  getFaultsByPoint: (pointId: string) => LockerFaultRecord[];
  getPendingFaults: () => LockerFaultRecord[];
  getOpenRecordsByLocker: (lockerId: string) => LockerOpenRecord[];
  
  createCompanionAuthorization: (auth: Omit<CompanionAuthorization, 'id' | 'createdAt' | 'isUsed' | 'pickupCode'>) => CompanionAuthorization;
  getAuthorizationsByOrder: (orderId: string) => CompanionAuthorization[];
  useAuthorization: (authId: string) => void;
}

export const useLockerStore = create<LockerState>()(
  persist(
    (set, get) => ({
      lockers,
      openRecords: lockerOpenRecords,
      faultRecords: initialLockerFaults,
      companionAuthorizations: initialCompanionAuthorizations,

      getLockersByPoint: (pointId) => get().lockers.filter((l) => l.pointId === pointId),
      
      getLockersByPointAndArea: (pointId, area) =>
        get().lockers.filter((l) => l.pointId === pointId && l.area === area),
      
      getLockerById: (id) => get().lockers.find((l) => l.id === id),
      
      getLockerByNo: (lockerNo) => get().lockers.find((l) => l.lockerNo === lockerNo),
      
      getAvailableLockers: (pointId, size) =>
        get().lockers.filter(
          (l) => l.pointId === pointId && l.status === 'free' && (!size || l.size === size)
        ),
      
      getAreasByPoint: (pointId) => {
        const areas = new Set(get().lockers.filter((l) => l.pointId === pointId).map((l) => l.area));
        return Array.from(areas).sort();
      },
      
      updateLockerStatus: (lockerId, status) => {
        set((state) => ({
          lockers: state.lockers.map((l) =>
            l.id === lockerId ? { ...l, status } : l
          ),
        }));
      },
      
      openLocker: async (lockerId, userId, orderId) => {
        const locker = get().getLockerById(lockerId);
        if (!locker) return false;
        if (locker.status === 'broken' || locker.status === 'manual_locked') return false;
        
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        const success = Math.random() > 0.1;
        
        set((state) => {
          const newRecord: LockerOpenRecord = {
            id: generateOpenRecordId(),
            lockerId,
            lockerNo: locker.lockerNo,
            pointId: locker.pointId,
            orderId,
            userId,
            operationType: 'open',
            operatedAt: new Date().toISOString(),
            success,
            failureReason: success ? undefined : '柜门未弹开，请重试或联系工作人员',
          };
          
          const newLockers = state.lockers.map((l) =>
            l.id === lockerId
              ? {
                  ...l,
                  status: success ? 'occupied' as const : l.status,
                  occupiedAt: success ? new Date().toISOString() : l.occupiedAt,
                  orderId: success ? orderId : l.orderId,
                }
              : l
          );
          
          let newFaults = state.faultRecords;
          if (!success) {
            const fault: LockerFaultRecord = {
              id: generateFaultId(),
              lockerId,
              lockerNo: locker.lockerNo,
              pointId: locker.pointId,
              pointName: locker.pointName,
              type: 'open_fail',
              status: 'pending',
              description: '柜门未弹开，用户扫码后无法打开',
              reportTime: new Date().toISOString(),
              reportSource: 'system',
              orderId,
              userId,
              openRecordId: newRecord.id,
            };
            newFaults = [fault, ...state.faultRecords];
          }
          
          return {
            openRecords: [newRecord, ...state.openRecords],
            lockers: newLockers,
            faultRecords: newFaults,
          };
        });
        
        return success;
      },
      
      createOpenRecord: (record) => {
        const newRecord: LockerOpenRecord = {
          ...record,
          id: generateOpenRecordId(),
        };
        set((state) => ({
          openRecords: [newRecord, ...state.openRecords],
        }));
      },
      
      reportFault: (fault) => {
        const newFault: LockerFaultRecord = {
          ...fault,
          id: generateFaultId(),
          reportTime: new Date().toISOString(),
          status: 'pending',
        };
        set((state) => ({
          faultRecords: [newFault, ...state.faultRecords],
          lockers: state.lockers.map((l) =>
            l.id === fault.lockerId ? { ...l, status: 'broken' as const } : l
          ),
        }));
      },
      
      updateFaultStatus: (faultId, status, handledBy, resolution) => {
        set((state) => ({
          faultRecords: state.faultRecords.map((f) =>
            f.id === faultId
              ? {
                  ...f,
                  status,
                  handledBy: handledBy || f.handledBy,
                  handledAt: new Date().toISOString(),
                  resolution: resolution || f.resolution,
                }
              : f
          ),
        }));
      },
      
      getFaultsByPoint: (pointId) =>
        get().faultRecords.filter((f) => f.pointId === pointId && f.status !== 'resolved'),
      
      getPendingFaults: () =>
        get().faultRecords.filter((f) => f.status === 'pending'),
      
      getOpenRecordsByLocker: (lockerId) =>
        get().openRecords.filter((r) => r.lockerId === lockerId),
      
      createCompanionAuthorization: (auth) => {
        const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
        let pickupCode = '';
        for (let i = 0; i < 5; i++) {
          pickupCode += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        const newAuth: CompanionAuthorization = {
          ...auth,
          id: generateAuthorizationId(),
          createdAt: new Date().toISOString(),
          isUsed: false,
          pickupCode,
        };
        
        set((state) => ({
          companionAuthorizations: [newAuth, ...state.companionAuthorizations],
        }));
        
        return newAuth;
      },
      
      getAuthorizationsByOrder: (orderId) =>
        get().companionAuthorizations.filter((a) => a.orderId === orderId),
      
      useAuthorization: (authId) => {
        set((state) => ({
          companionAuthorizations: state.companionAuthorizations.map((a) =>
            a.id === authId ? { ...a, isUsed: true } : a
          ),
        }));
      },
    }),
    {
      name: 'festival-locker-storage',
    }
  )
);
