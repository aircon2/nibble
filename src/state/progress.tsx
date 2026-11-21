import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'nibble-progress-v1';

type Progress = { completedDates: string[]; xp: number };
type ProgressContextValue = Progress & {
  ready: boolean;
  completeToday: () => Promise<boolean>;
  resetProgress: () => Promise<void>;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function localDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function currentStreak(dates: string[], today = new Date()): number {
  const completed = new Set(dates);
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (!completed.has(localDateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let count = 0;
  while (completed.has(localDateKey(cursor))) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<Progress>({ completedDates: [], xp: 0 });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!active || !raw) return;
        const saved: unknown = JSON.parse(raw);
        if (typeof saved === 'object' && saved !== null && 'completedDates' in saved && Array.isArray(saved.completedDates)) {
          setProgress({
            completedDates: saved.completedDates.filter((item): item is string => typeof item === 'string'),
            xp: 'xp' in saved && typeof saved.xp === 'number' ? saved.xp : 0,
          });
        }
      })
      .catch(() => {})
      .finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);

  const value = useMemo<ProgressContextValue>(() => ({
    ...progress,
    ready,
    async completeToday() {
      const today = localDateKey();
      if (progress.completedDates.includes(today)) return false;
      const next = { completedDates: [...progress.completedDates, today].sort(), xp: progress.xp + 20 };
      setProgress(next);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return true;
    },
    async resetProgress() {
      const empty = { completedDates: [], xp: 0 };
      setProgress(empty);
      await AsyncStorage.removeItem(STORAGE_KEY);
    },
  }), [progress, ready]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const value = useContext(ProgressContext);
  if (!value) throw new Error('useProgress must be inside ProgressProvider');
  return value;
}
