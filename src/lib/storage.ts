'use client';

import type { Scenario, ScheduleEntry, SessionRecord, TraineeProfile } from './types';
import { DEFAULT_PROFILE } from './agencies';

/**
 * Brauzer xotirasi (localStorage). Barcha shaxsiy natijalar faqat qurilmada saqlanadi.
 * Har bir oʻqish/yozish try/catch bilan himoyalangan (Safari private rejimi va h.k.).
 */

const K = {
  profile: 'calmme.profile.v1',
  sessions: 'calmme.sessions.v1',
  custom: 'calmme.customScenarios.v1',
  schedule: 'calmme.schedule.v1',
  demo: 'calmme.demoMode.v1',
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('calmme:storage', { detail: key }));
  } catch {
    /* xotira toʻla yoki bloklangan — jim oʻtkazib yuboramiz */
  }
}

export const loadProfile = (): TraineeProfile => ({ ...DEFAULT_PROFILE, ...read<Partial<TraineeProfile>>(K.profile, {}) });
export const saveProfile = (p: TraineeProfile) => write(K.profile, p);

export const loadSessions = (): SessionRecord[] => read<SessionRecord[]>(K.sessions, []);
export function saveSession(s: SessionRecord) {
  const list = loadSessions().filter((x) => x.id !== s.id);
  list.unshift(s);
  write(K.sessions, list.slice(0, 30));
}
export const getSession = (id: string) => loadSessions().find((s) => s.id === id);

export function saveCustomScenario(s: Scenario) {
  const map = read<Record<string, Scenario>>(K.custom, {});
  map[s.id] = s;
  const ids = Object.keys(map);
  if (ids.length > 20) delete map[ids[0]];
  write(K.custom, map);
}
export const getCustomScenario = (id: string): Scenario | undefined => read<Record<string, Scenario>>(K.custom, {})[id];

export const loadSchedule = (): ScheduleEntry[] => read<ScheduleEntry[]>(K.schedule, []);
export const saveSchedule = (list: ScheduleEntry[]) => write(K.schedule, list);

/** 'auto' — avval server (AI yoki qoidaviy), xatoda lokal; 'on' — faqat lokal (tarmoqsiz sahna rejimi) */
export type DemoMode = 'auto' | 'on';
export const getDemoMode = (): DemoMode => read<DemoMode>(K.demo, 'auto');
export const setDemoMode = (m: DemoMode) => write(K.demo, m);
