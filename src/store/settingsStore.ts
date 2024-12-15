import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface HVACZoneRules {
  baseZones: number;
  sizeThresholds: {
    medium: number;  // First threshold (e.g., 2500)
    large: number;   // Second threshold (e.g., 4000)
  };
  maxZones: number;
  bathroomThreshold: number;
}

interface Settings {
  logoUrl?: string;
  primaryColor?: string;
  // ... other settings
}

interface SettingsStore {
  hvacZoneRules: HVACZoneRules;
  updateHVACZoneRules: (rules: Partial<HVACZoneRules>) => void;
  settings: Settings;
  updateSettings: (settings: Settings) => Promise<void>;
}

const defaultHVACRules: HVACZoneRules = {
  baseZones: 1,
  sizeThresholds: {
    medium: 2500,
    large: 4000
  },
  maxZones: 4,
  bathroomThreshold: 2.5
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      hvacZoneRules: defaultHVACRules,
      settings: { primaryColor: '#3B82F6' },
      updateHVACZoneRules: (rules) =>
        set((state) => ({
          hvacZoneRules: {
            ...state.hvacZoneRules,
            ...rules
          }
        })),
      updateSettings: async (newSettings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...newSettings
          }
        }))
    }),
    {
      name: 'settings-storage'
    }
  )
);