"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadData, getLevelTitle, getTodayRecord, getToday } from "@/lib/store";
import type { UserData, DayRecord } from "@/lib/store";

function ProgressRing({ value, max, size = 88, color = "#7fb069" }: {
  value: number; max: number; size?: number; color?: string;
}) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const offset = circ * (1 - pct);
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e8e4dc" strokeWidth={6} />
      <circle
        className="progress-ring__circle"
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  );
}

function StatCard({ label, value, unit, color }: {
  label: string; value: string | number; unit?: string; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 flex flex-col gap-1 shadow-sm border border-mist">
      <span className="text-xs font-mono uppercase tracking-widest opacity-50">{label}</span>
      <div className="flex items-end gap-1">
        <span className={`text-3xl font-display font-bold ${color}`}>{value}</span>
        {unit && <span className="text-sm opacity-50 mb-1">{unit}</span>}
      </div>
    </div>
  );
}

const MODES = [
  {
    href: "/fluency",
    emoji: "🗣️",
    label: "Fluency Mode",
    desc: "Listen & repeat phrases",
    bg: "bg-sage",
    text: "text-white",
    main: true,
  },
  {
    href: "/anti-block",
    emoji: "🧱",
    label: "Anti-Block",
    desc: "Break mental blocks",
    bg: "bg-coral",
    text: "text-white",
    main: false,
  },
  {
    href: "/focus",
    emoji: "⏱️",
    label: "Focus Timer",
    desc: "Speak non-stop",
    bg: "bg-sky",
    text: "text-white",
    main: false,
  },
];

export default function Dashboard() {
  const [data, setData] = useState<UserData | null>(null);
  const [today, setToday] = useState<DayRecord | undefined>();

  useEffect(() => {
    const d = loadData();
    setData(d);
    setToday(getTodayRecord(d));
  }, []);

  if (!data) return null;

  const xpInLevel = data.xp % 500;
  const todayPhrases = today?.phrasesCompleted ?? 0;
  const todayMin = Math.round((today?.secondsTalking ?? 0) / 60);
  const goalPhrases = 10;

  return (
    <main className="page-enter min-h-dvh bg-paper flex flex-col max-w-md mx-auto px-4 py-8 gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">BontiLand</h1>
          <p className="text-xs opacity-40 font-mono">v2.0 · {getToday()}</p>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-2xl px-3 py-2 shadow-sm border border-mist">
          <span className="text-xl flicker">🔥</span>
          <div>
            <p className="font-display font-bold text-lg leading-none text-coral">{data.streak}</p>
            <p className="text-xs opacity-40">streak</p>
          </div>
        </div>
      </div>

      {/* Level & XP */}
      <div className="bg-ink text-paper rounded-3xl p-5 flex items-center gap-4">
        <div className="relative">
          <ProgressRing value={xpInLevel} max={500} color="#f2cc8f" />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display font-bold text-xl text-gold">{data.level}</span>
          </div>
        </div>
        <div className="flex-1">
          <p className="font-mono text-xs opacity-40 uppercase tracking-widest">Level {data.level}</p>
          <p className="font-display text-xl font-bold text-gold">{getLevelTitle(data.level)}</p>
          <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gold rounded-full transition-all duration-700"
              style={{ width: `${(xpInLevel / 500) * 100}%` }}
            />
          </div>
          <p className="text-xs opacity-40 mt-1">{xpInLevel}/500 XP to next level</p>
        </div>
      </div>

      {/* Today's stats */}
      <div>
        <p className="font-mono text-xs uppercase tracking-widest opacity-40 mb-3">Today</p>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Phrases" value={todayPhrases} unit={`/ ${goalPhrases}`} color="text-sage" />
          <StatCard label="Minutes" value={todayMin} unit="min" color="text-sky" />
          <StatCard label="Total Phrases" value={data.totalPhrases} color="text-coral" />
          <StatCard label="Total XP" value={data.xp} color="text-gold" />
        </div>
      </div>

      {/* Daily goal bar */}
      <div className="bg-white rounded-2xl p-4 border border-mist shadow-sm">
        <div className="flex justify-between text-xs mb-2 font-mono opacity-50">
          <span>Daily goal</span>
          <span>{todayPhrases}/{goalPhrases} phrases</span>
        </div>
        <div className="h-3 bg-mist rounded-full overflow-hidden">
          <div
            className="h-full bg-sage rounded-full transition-all duration-700"
            style={{ width: `${Math.min((todayPhrases / goalPhrases) * 100, 100)}%` }}
          />
        </div>
        {todayPhrases >= goalPhrases && (
          <p className="text-center text-sage font-display font-bold mt-2 animate-bounce-soft">
            🎉 Goal achieved today!
          </p>
        )}
      </div>

      {/* Mode buttons */}
      <div className="flex flex-col gap-3">
        {MODES.map((m) => (
          <Link key={m.href} href={m.href} className="btn-press">
            <div className={`${m.bg} ${m.text} rounded-2xl ${m.main ? "p-6" : "p-4"} flex items-center gap-4 shadow-sm`}>
              <span className={m.main ? "text-4xl" : "text-2xl"}>{m.emoji}</span>
              <div>
                <p className={`font-display font-bold ${m.main ? "text-xl" : "text-base"}`}>{m.label}</p>
                <p className={`opacity-80 ${m.main ? "text-sm" : "text-xs"}`}>{m.desc}</p>
              </div>
              <span className="ml-auto text-2xl opacity-60">→</span>
            </div>
          </Link>
        ))}
      </div>

      <p className="text-center text-xs opacity-30 font-mono pb-4">
        Speak every day. Think in English. 🇺🇸
      </p>
    </main>
  );
}
