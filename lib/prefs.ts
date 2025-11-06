import AsyncStorage from '@react-native-async-storage/async-storage';

export type Preferences = {
  gender?: 0 | 1 | null; // null/undefined = any
  ageMin: number;
  ageMax: number;
  distanceKm?: number; // not applied without coordinates
  expandRadius?: boolean;
  languages: string[]; // any of
};

const PREFS_KEY = 'dateapp_prefs_v1';

export const DEFAULT_PREFS: Preferences = {
  gender: 0, // UI default in Filter
  ageMin: 24,
  ageMax: 35,
  distanceKm: 10,
  expandRadius: true,
  languages: [],
};

// Used when you want to show "no filter" (aka show all)
export const CLEAR_PREFS: Preferences = {
  gender: null,
  ageMin: 18,
  ageMax: 80,
  distanceKm: 80,
  expandRadius: true,
  languages: [],
};

export async function getPrefs(): Promise<Preferences> {
  try {
    const raw = await AsyncStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<Preferences>;
    return { ...DEFAULT_PREFS, ...parsed } as Preferences;
  } catch {
    return DEFAULT_PREFS;
  }
}

export async function setPrefs(p: Preferences): Promise<void> {
  await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(p));
}

export async function clearPrefs(): Promise<void> {
  await setPrefs(CLEAR_PREFS);
}
