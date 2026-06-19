import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StageSchedule, PickupPoint, SecurityCheckPoint, TimeConflictResult, ConflictSuggestion } from '../types';
import { stageSchedules, securityCheckPoints, pickupPoints } from '../data/mockData';

interface ScheduleState {
  schedules: StageSchedule[];
  securityCheckPoints: SecurityCheckPoint[];
  
  getFavoriteSchedules: () => StageSchedule[];
  getNextUpcomingSchedule: () => StageSchedule | null;
  toggleFavorite: (scheduleId: string) => void;
  
  checkTimeConflict: (
    pickupTime: string,
    pointId: string,
    action: 'pickup' | 'return'
  ) => TimeConflictResult;
  
  getAlternativePoints: (
    currentPointId: string,
    equipmentId: string
  ) => PickupPoint[];
  
  calculateTotalTime: (pointId: string) => number;
}

const WALK_SPEED_METERS_PER_MINUTE = 80;

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set, get) => ({
      schedules: stageSchedules,
      securityCheckPoints,

      getFavoriteSchedules: () => get().schedules.filter((s) => s.isFavorite),
      
      getNextUpcomingSchedule: () => {
        const now = new Date('2026-06-17T16:00:00').getTime();
        const upcoming = get()
          .getFavoriteSchedules()
          .filter((s) => new Date(s.startTime).getTime() > now)
          .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
        return upcoming.length > 0 ? upcoming[0] : null;
      },
      
      toggleFavorite: (scheduleId) => {
        set((state) => ({
          schedules: state.schedules.map((s) =>
            s.id === scheduleId ? { ...s, isFavorite: !s.isFavorite } : s
          ),
        }));
      },
      
      calculateTotalTime: (pointId) => {
        const point = pickupPoints.find((p) => p.id === pointId);
        const secPoint = get().securityCheckPoints.find((s) => s.pointId === pointId);
        
        if (!point) return 0;
        
        const walkTime = Math.ceil(point.distance / WALK_SPEED_METERS_PER_MINUTE);
        const queueTime = point.waitTime;
        const securityTime = secPoint?.waitTime || 0;
        
        return walkTime + queueTime + securityTime;
      },
      
      checkTimeConflict: (pickupTime, pointId, action) => {
        const nextShow = get().getNextUpcomingSchedule();
        const point = pickupPoints.find((p) => p.id === pointId);
        const secPoint = get().securityCheckPoints.find((s) => s.pointId === pointId);
        
        const totalTime = get().calculateTotalTime(pointId);
        const pickupDate = new Date(pickupTime);
        const arrivalTime = new Date(pickupDate.getTime() + totalTime * 60 * 1000);
        
        if (!nextShow || !point) {
          return {
            level: 'safe',
            title: '时间充足',
            description: '暂无临近演出，可按计划领取',
            bufferMinutes: 999,
            suggestions: [],
          };
        }
        
        const showStartTime = new Date(nextShow.startTime);
        const bufferMinutes = Math.ceil((showStartTime.getTime() - arrivalTime.getTime()) / (1000 * 60));
        
        const suggestions: ConflictSuggestion[] = [];
        
        const actionText = action === 'pickup' ? '领取' : '归还';
        
        if (bufferMinutes >= 30) {
          return {
            level: 'safe',
            title: '时间充足',
            description: `预计 ${arrivalTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })} 可完成${actionText}，距离${nextShow.artist}开场还有 ${bufferMinutes} 分钟`,
            arrivalTime: arrivalTime.toISOString(),
            bufferMinutes,
            suggestions: [],
          };
        } else if (bufferMinutes >= 10) {
          suggestions.push({
            type: 'earlier_pickup',
            title: '提前领取',
            description: `建议提前 ${Math.max(30 - bufferMinutes, 10)} 分钟前往，预留更多时间`,
            actionText: '调整时间',
          });
          
          const alternatives = get().getAlternativePoints(pointId, 'all');
          if (alternatives.length > 0) {
            suggestions.push({
              type: 'change_point',
              title: '更换取还点',
              description: `${alternatives[0].name} 距离更近，排队更少`,
              actionText: '查看',
            });
          }
          
          return {
            level: 'warning',
            title: '时间较紧张',
            description: `预计 ${arrivalTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })} 完成${actionText}，距离${nextShow.artist}开场仅剩 ${bufferMinutes} 分钟，请注意时间`,
            arrivalTime: arrivalTime.toISOString(),
            bufferMinutes,
            suggestions,
          };
        } else {
          suggestions.push({
            type: 'earlier_pickup',
            title: '立即前往',
            description: '请立刻出发，奔跑可能还来得及',
            actionText: '导航前往',
          });
          
          const alternatives = get().getAlternativePoints(pointId, 'all');
          if (alternatives.length > 0) {
            suggestions.push({
              type: 'change_point',
              title: '更换取还点',
              description: `${alternatives[0].name} 预计可节省 ${totalTime - get().calculateTotalTime(alternatives[0].id)} 分钟`,
              actionText: '立即切换',
            });
          }
          
          suggestions.push({
            type: 'authorize_companion',
            title: '授权同伴代取',
            description: '生成代取码让朋友帮忙领取，您直接去演出现场',
            actionText: '生成代取码',
          });
          
          const missTime = Math.abs(bufferMinutes);
          return {
            level: 'danger',
            title: `可能错过开场`,
            description: `按照当前时间${actionText}，预计会错过${nextShow.artist}开场约 ${missTime} 分钟，强烈建议更换方式`,
            arrivalTime: arrivalTime.toISOString(),
            bufferMinutes,
            suggestions,
          };
        }
      },
      
      getAlternativePoints: (currentPointId, equipmentId) => {
        const currentPoint = pickupPoints.find((p) => p.id === currentPointId);
        if (!currentPoint) return [];
        
        const currentTotalTime = get().calculateTotalTime(currentPointId);
        
        return pickupPoints
          .filter((p) => p.id !== currentPointId)
          .filter((p) => equipmentId === 'all' || (p.equipmentStock[equipmentId] || 0) > 0)
          .map((p) => ({
            ...p,
            totalTime: get().calculateTotalTime(p.id),
          }))
          .filter((p) => p.totalTime < currentTotalTime)
          .sort((a, b) => a.totalTime - b.totalTime);
      },
    }),
    {
      name: 'festival-schedule-storage',
    }
  )
);
