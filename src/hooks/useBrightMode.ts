import { useAppStore } from '../store/useAppStore';

export const useBrightMode = () => {
  const { brightMode } = useAppStore();
  return brightMode;
};

export const getBrightClass = (darkClass: string, lightClass: string): string => {
  const brightMode = useAppStore.getState().brightMode;
  return brightMode ? lightClass : darkClass;
};
