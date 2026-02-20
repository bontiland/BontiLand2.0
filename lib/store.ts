// lib/store.ts
// All data is stored in localStorage — no server needed

export interface DayRecord {
  date: string; // "YYYY-MM-DD"
  phrasesCompleted: number;
  secondsTalking: number;
  modesUsed: string[];
}

export interface UserData {
  streak: number;
  lastActiveDate: string;
  totalPhrases: number;
  totalSeconds: number;
  level: number;
  xp: number;
  history: DayRecord[];
}

const KEY = "bontiland_v2";

export function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

export function getDefaultData(): UserData {
  return {
    streak: 0,
    lastActiveDate: "",
    totalPhrases: 0,
    totalSeconds: 0,
    level: 1,
    xp: 0,
    history: [],
  };
}

export function loadData(): UserData {
  if (typeof window === "undefined") return getDefaultData();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return getDefaultData();
    return JSON.parse(raw) as UserData;
  } catch {
    return getDefaultData();
  }
}

export function saveData(data: UserData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function getTodayRecord(data: UserData): DayRecord | undefined {
  return data.history.find((r) => r.date === getToday());
}

export function updateStreak(data: UserData): UserData {
  const today = getToday();
  if (data.lastActiveDate === today) return data;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().split("T")[0];

  const newStreak =
    data.lastActiveDate === yStr ? data.streak + 1 : 1;

  return { ...data, streak: newStreak, lastActiveDate: today };
}

export function recordSession(
  data: UserData,
  phrases: number,
  seconds: number,
  mode: string
): UserData {
  const today = getToday();
  let updated = updateStreak(data);

  const existing = updated.history.find((r) => r.date === today);
  if (existing) {
    existing.phrasesCompleted += phrases;
    existing.secondsTalking += seconds;
    if (!existing.modesUsed.includes(mode)) existing.modesUsed.push(mode);
  } else {
    updated.history = [
      ...updated.history,
      { date: today, phrasesCompleted: phrases, secondsTalking: seconds, modesUsed: [mode] },
    ];
  }

  updated.totalPhrases += phrases;
  updated.totalSeconds += seconds;

  // XP: 10 per phrase, 1 per second
  updated.xp += phrases * 10 + seconds;
  updated.level = Math.floor(updated.xp / 500) + 1;

  return updated;
}

export function getLevelTitle(level: number): string {
  const titles = [
    "", "Beginner", "Explorer", "Connector", "Communicator",
    "Fluent", "Confident", "Advanced", "Expert", "Master", "Legend",
  ];
  return titles[Math.min(level, titles.length - 1)] || "Legend";
}
