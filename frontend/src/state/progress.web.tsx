import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth0 } from '@auth0/auth0-react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { localDateKey } from './progress-utils';

export { currentStreak, localDateKey } from './progress-utils';

type Progress = { completedDates: string[]; completedLessons: string[]; xp: number };
type ProgressContextValue = Progress & {
  ready: boolean;
  syncMode: 'device' | 'cloud';
  syncError: string | null;
  completeLesson: (lessonId: string) => Promise<number>;
  resetProgress: () => Promise<void>;
};

const EMPTY: Progress = { completedDates: [], completedLessons: [], xp: 0 };
const BASE_URL = process.env.EXPO_PUBLIC_PROGRESS_API_URL?.replace(/\/+$/, '');
const AUDIENCE = process.env.EXPO_PUBLIC_AUTH0_AUDIENCE;
const ProgressContext = createContext<ProgressContextValue | null>(null);

function parseProgress(value: unknown): Progress {
  if (typeof value !== 'object' || value === null) throw new Error('Invalid progress response');
  const data = value as Record<string, unknown>;
  if (!Array.isArray(data.completedDates) || !Array.isArray(data.completedLessons) || typeof data.xp !== 'number') throw new Error('Invalid progress response');
  return {
    completedDates: data.completedDates.filter((date): date is string => typeof date === 'string'),
    completedLessons: data.completedLessons.filter((id): id is string => typeof id === 'string'),
    xp: data.xp,
  };
}

async function loadDevice(key: string): Promise<Progress> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return EMPTY;
  try { return parseProgress(JSON.parse(raw)); } catch { return EMPTY; }
}

function saveDevice(key: string, progress: Progress) {
  return AsyncStorage.setItem(key, JSON.stringify(progress));
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user, getAccessTokenSilently } = useAuth0();
  const [progress, setProgress] = useState<Progress>(EMPTY);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [syncMode, setSyncMode] = useState<'device' | 'cloud'>('device');
  const [syncError, setSyncError] = useState<string | null>(null);
  const storageKey = isAuthenticated && user?.sub ? `nibble-progress-v2:${user.sub}` : 'nibble-progress-v1';
  const canSync = Boolean(isAuthenticated && user?.sub && BASE_URL && AUDIENCE);
  const ready = !isLoading && loadedKey === storageKey;

  async function cloudRequest(path: string, method: 'GET' | 'POST' | 'DELETE', body?: object): Promise<unknown> {
    const token = await getAccessTokenSilently({ authorizationParams: { audience: AUDIENCE } });
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!response.ok) throw new Error('Could not reach account progress');
    return response.json();
  }

  useEffect(() => {
    if (isLoading) return;
    let active = true;
    (async () => {
      if (canSync) {
        try {
          const saved = parseProgress(await cloudRequest('/progress', 'GET'));
          if (active) { setProgress(saved); setSyncMode('cloud'); setSyncError(null); setLoadedKey(storageKey); }
          return;
        } catch (error) {
          console.warn('Account progress load failed:', error instanceof Error ? error.message : String(error));
          if (active) setSyncError('Account sync is unavailable. Progress is saved on this device.');
        }
      }
      const saved = await loadDevice(storageKey).catch(() => EMPTY);
      if (active) { setProgress(saved); setSyncMode('device'); setLoadedKey(storageKey); }
    })();
    return () => { active = false; };
  // Rerun only when the account identity or sync configuration changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isAuthenticated, user?.sub, storageKey, canSync]);

  const value = useMemo<ProgressContextValue>(() => ({
    ...(ready ? progress : EMPTY),
    ready,
    syncMode,
    syncError,
    async completeLesson(lessonId: string) {
      if (canSync && syncMode === 'cloud') {
        try {
          const result = await cloudRequest('/practice', 'POST', { lessonId, practiceDate: localDateKey() });
          setProgress(parseProgress(result));
          return typeof result === 'object' && result !== null && 'earned' in result && result.earned === 20 ? 20 : 0;
        } catch {
          setSyncMode('device');
          setSyncError('Account sync is unavailable. Progress is saved on this device.');
        }
      }
      const firstTime = !progress.completedLessons.includes(lessonId);
      const today = localDateKey();
      const next = {
        completedDates: progress.completedDates.includes(today) ? progress.completedDates : [...progress.completedDates, today].sort(),
        completedLessons: firstTime ? [...progress.completedLessons, lessonId] : progress.completedLessons,
        xp: progress.xp + (firstTime ? 20 : 0),
      };
      setProgress(next);
      await saveDevice(storageKey, next);
      return firstTime ? 20 : 0;
    },
    async resetProgress() {
      if (canSync && syncMode === 'cloud') {
        const saved = parseProgress(await cloudRequest('/progress', 'DELETE'));
        setProgress(saved);
        return;
      }
      setProgress(EMPTY);
      await AsyncStorage.removeItem(storageKey);
    },
  // cloudRequest closes over the current Auth0 session, which changes with user identity.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [progress, ready, syncMode, syncError, canSync, storageKey, user?.sub]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const value = useContext(ProgressContext);
  if (!value) throw new Error('useProgress must be inside ProgressProvider');
  return value;
}
