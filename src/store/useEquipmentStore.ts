import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Equipment, PickupPoint } from '../types';
import { equipments, pickupPoints } from '../data/mockData';

interface EquipmentState {
  equipments: Equipment[];
  pickupPoints: PickupPoint[];
  getEquipmentById: (id: string) => Equipment | undefined;
  getPickupPointById: (id: string) => PickupPoint | undefined;
  getEquipmentsByCategory: (category: string) => Equipment[];
  updateStock: (equipmentId: string, pointId: string, delta: number) => void;
}

export const useEquipmentStore = create<EquipmentState>()(
  persist(
    (set, get) => ({
      equipments,
      pickupPoints,
      getEquipmentById: (id) => get().equipments.find((e) => e.id === id),
      getPickupPointById: (id) => get().pickupPoints.find((p) => p.id === id),
      getEquipmentsByCategory: (category) =>
        get().equipments.filter((e) => e.category === category),
      updateStock: (equipmentId, pointId, delta) => {
        set((state) => ({
          pickupPoints: state.pickupPoints.map((point) =>
            point.id === pointId
              ? {
                  ...point,
                  equipmentStock: {
                    ...point.equipmentStock,
                    [equipmentId]: Math.max(
                      0,
                      (point.equipmentStock[equipmentId] || 0) + delta
                    ),
                  },
                }
              : point
          ),
        }));
      },
    }),
    {
      name: 'festival-equipment-storage',
    }
  )
);
