import { create } from 'zustand';
import { DEFAULT_TARGETS } from '../constants/followTargets';

const defaultIds = DEFAULT_TARGETS.filter((target) => target.defaultSelected).map((target) => target.id);

export type AppState = {
  selectedTargetIds: string[];
  customKeywords: string[];
  alertTime: string;
  timezone: string;
  urgentAlerts: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  alertTone: string;
  pauseAllAlerts: boolean;
  notificationsEnabled: boolean;
  setSelectedTargetIds: (ids: string[]) => void;
  toggleTarget: (id: string) => void;
  setCustomKeywords: (keywords: string[]) => void;
  setAlertTime: (time: string) => void;
  setTimezone: (timezone: string) => void;
  setUrgentAlerts: (enabled: boolean) => void;
  setQuietHoursStart: (time: string) => void;
  setQuietHoursEnd: (time: string) => void;
  setAlertTone: (tone: string) => void;
  setPauseAllAlerts: (paused: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  hydratePreferences: (prefs: Partial<AppState>) => void;
};

export const useAppStore = create<AppState>((set) => ({
  selectedTargetIds: defaultIds,
  customKeywords: [],
  alertTime: '08:00',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  urgentAlerts: false,
  quietHoursStart: '21:00',
  quietHoursEnd: '07:00',
  alertTone: 'default',
  pauseAllAlerts: false,
  notificationsEnabled: false,
  setSelectedTargetIds: (ids) => set({ selectedTargetIds: ids }),
  toggleTarget: (id) =>
    set((state) => ({
      selectedTargetIds: state.selectedTargetIds.includes(id)
        ? state.selectedTargetIds.filter((value) => value !== id)
        : [...state.selectedTargetIds, id]
    })),
  setCustomKeywords: (keywords) => set({ customKeywords: keywords }),
  setAlertTime: (alertTime) => set({ alertTime }),
  setTimezone: (timezone) => set({ timezone }),
  setUrgentAlerts: (urgentAlerts) => set({ urgentAlerts }),
  setQuietHoursStart: (quietHoursStart) => set({ quietHoursStart }),
  setQuietHoursEnd: (quietHoursEnd) => set({ quietHoursEnd }),
  setAlertTone: (alertTone) => set({ alertTone }),
  setPauseAllAlerts: (pauseAllAlerts) => set({ pauseAllAlerts }),
  setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
  hydratePreferences: (prefs) => set(prefs)
}));
