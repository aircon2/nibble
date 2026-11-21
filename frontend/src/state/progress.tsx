import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { localDateKey } from './progress-utils';

export { currentStreak, localDateKey } from './progress-utils';

const STORAGE_KEY = 'nibble-progress-v1';

type Progress = { completedDates: string[]; completedLessons: string[]; xp: number };
type ProgressContextValue = Progress & {
  ready: boolean;
  syncMode: 'device' | 'cloud';
  syncError: string | null;
  completeLesson: (lessonId: string) => Promise<number>;
  resetProgress: () => Promise<void>;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<Progress>({ completedDates: [], completedLessons: [], xp: 0 });
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
            completedLessons: 'completedLessons' in saved && Array.isArray(saved.completedLessons)
              ? saved.completedLessons.filter((item): item is string => typeof item === 'string') : [],
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
    syncMode: 'device',
    syncError: null,
    async completeLesson(lessonId: string) {
      const firstTime = !progress.completedLessons.includes(lessonId);
      const today = localDateKey();
      const dates = progress.completedDates.includes(today) ? progress.completedDates : [...progress.completedDates, today].sort();
      const next = { completedDates: dates, completedLessons: firstTime ? [...progress.completedLessons, lessonId] : progress.completedLessons, xp: progress.xp + (firstTime ? 20 : 0) };
      setProgress(next);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return firstTime ? 20 : 0;
    },
    async resetProgress() {
      const empty = { completedDates: [], completedLessons: [], xp: 0 };
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
