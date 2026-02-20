"use client";

import { useEffect, useState } from "react";
import { WelcomeTour, useShouldShowTour } from "@/components/WelcomeTour";
import Link from "next/link";
import { loadData, getLevelTitle, getTodayRecord, getToday, saveData, recordSession } from "@/lib/store";
import type { UserData, DayRecord } from "@/lib/store";

function ProgressRing({ value, max, size = 88, color = "#7fb069" }: {
  value: number; max: number; size?: number; color?: string;
}) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(value / max, 1));
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

const MODES = [
  {
    href: "/fluency",
    emoji: "🧠",
    label: "Fluency Mode",
    desc: "Listen → memorize → say it",
    bg: "bg-sage",
    main: true,
    xp: "+10 XP/frase",
  },
  {
    href: "/reaction",
    emoji: "⚡",
    label: "Reaction Mode",
    desc: "Responde situaciones reales en 5s",
    bg: "bg-coral",
    main: true,
    xp: "+15 XP/situación",
  },
  {
    href: "/anti-block",
    emoji: "🧩",
    label: "Anti-Block",
    desc: "Fillers + 60 segundos hablando",
    bg: "bg-sky",
    main: false,
    xp: "+70 XP",
  },
  {
    href: "/focus",
    emoji: "⏱️",
    label: "Focus Timer",
    desc: "Habla sin parar",
    bg: "bg-ink",
    main: false,
    xp: "+1 XP/s",
  },
];

export default function Dashboard() {
  const [data, setData] = useState<UserData | null>(null);
  const [today, setToday] = useState<DayRecord | undefined>();
  const [streakSaved, setStreakSaved] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const shouldShowTour = useShouldShowTour();

  useEffect(() => {
    const d = loadData();
    setData(d);
    setToday(getTodayRecord(d));
  }, []);

  useEffect(() => {
    if (shouldShowTour) setShowTour(true);
  }, [shouldShowTour]);

  if (!data) return null;

  const xpInLevel = data.xp % 500;
  const todayPhrases = today?.phrasesCompleted ?? 0;
  const todayMin = Math.round((today?.secondsTalking ?? 0) / 60);
  const goalPhrases = 10;
  const goalReached = todayPhrases >= goalPhrases;

  // Streak danger: streak > 0 but hasn't trained today
  const streakAtRisk = data.streak > 0 && data.lastActiveDate !== getToday();

  // Emergency streak save: do 1 quick phrase to save streak
  const handleEmergencySave = () => {
    const updated = recordSession(data, 1, 30, "emergency");
    saveData(updated);
    setData(updated);
    setToday(getTodayRecord(updated));
    setStreakSaved(true);
  };

  return (
    <main className="page-enter min-h-dvh bg-paper flex flex-col max-w-md mx-auto px-4 py-8 gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">BontiLand</h1>
          <p className="text-xs opacity-40 font-mono">{getToday()}</p>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-2xl px-3 py-2 shadow-sm border border-mist">
          <span className={`text-xl ${data.streak > 0 ? "flicker" : ""}`}>
            {data.streak > 0 ? "🔥" : "💤"}
          </span>
          <div>
            <p className="font-display font-bold text-lg leading-none text-coral">{data.streak}</p>
            <p className="text-xs opacity-40">day streak</p>
          </div>
        </div>
      </div>

      {/* STREAK DANGER BANNER */}
      {streakAtRisk && !streakSaved && (
        <div className="bg-coral text-white rounded-2xl p-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">⚠️</span>
            <p className="font-display font-bold">¡Tu racha de {data.streak} días está en peligro!</p>
          </div>
          <p className="text-sm opacity-80 mb-3">Entrena hoy para mantenerla.</p>
          <div className="flex gap-2">
            <Link href="/fluency" className="btn-press flex-1 bg-white text-coral font-display font-bold text-sm rounded-xl py-2 text-center">
              Entrenar ahora
            </Link>
            <button
              onClick={handleEmergencySave}
              className="btn-press bg-white/20 text-white font-mono text-xs rounded-xl px-3 py-2"
            >
              Modo emergencia
            </button>
          </div>
        </div>
      )}

      {streakSaved && (
        <div className="bg-sage text-white rounded-2xl p-4 animate-fade-in">
          <p className="font-display font-bold">✅ ¡Racha salvada! Mañana entrena completo. 💪</p>
        </div>
      )}

      {/* Level card */}
      <div className="bg-ink text-paper rounded-3xl p-5 flex items-center gap-4">
        <div className="relative">
          <ProgressRing value={xpInLevel} max={500} color="#f2cc8f" />
          <div className="absolute inset-0 flex items-center justify-center">
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
          <p className="text-xs opacity-30 mt-1 font-mono">{xpInLevel}/500 XP</p>
        </div>
      </div>

      {/* Daily goal */}
      <div className="bg-white rounded-2xl p-4 border border-mist shadow-sm">
        <div className="flex justify-between text-xs mb-2 font-mono opacity-50">
          <span>Meta diaria</span>
          <span>{todayPhrases}/{goalPhrases} frases · {todayMin} min</span>
        </div>
        <div className="h-3 bg-mist rounded-full overflow-hidden">
          <div
            className="h-full bg-sage rounded-full transition-all duration-700"
            style={{ width: `${Math.min((todayPhrases / goalPhrases) * 100, 100)}%` }}
          />
        </div>
        {goalReached && (
          <p className="text-center text-sage font-display font-bold mt-2 text-sm">
            🎉 Meta de hoy completada!
          </p>
        )}
      </div>

      {/* Mode buttons */}
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs uppercase tracking-widest opacity-40">Elige tu entrenamiento</p>

        {/* Main modes — large */}
        <div className="grid grid-cols-2 gap-3">
          {MODES.filter((m) => m.main).map((m) => (
            <Link key={m.href} href={m.href} className="btn-press">
              <div className={`${m.bg} text-white rounded-2xl p-5 flex flex-col gap-2 h-full shadow-sm`}>
                <span className="text-3xl">{m.emoji}</span>
                <p className="font-display font-bold text-base leading-tight">{m.label}</p>
                <p className="text-xs opacity-70 leading-snug">{m.desc}</p>
                <p className="font-mono text-xs opacity-60 mt-auto">{m.xp}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Secondary modes — compact */}
        {MODES.filter((m) => !m.main).map((m) => (
          <Link key={m.href} href={m.href} className="btn-press">
            <div className={`${m.bg} text-white rounded-2xl p-4 flex items-center gap-4 shadow-sm`}>
              <span className="text-2xl">{m.emoji}</span>
              <div className="flex-1">
                <p className="font-display font-bold">{m.label}</p>
                <p className="text-xs opacity-70">{m.desc}</p>
              </div>
              <span className="font-mono text-xs opacity-50">{m.xp}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Stats mini row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Total frases", value: data.totalPhrases, color: "text-sage" },
          { label: "Minutos total", value: Math.round(data.totalSeconds / 60), color: "text-sky" },
          { label: "Total XP", value: data.xp, color: "text-gold" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-3 border border-mist shadow-sm text-center">
            <p className={`font-display font-bold text-xl ${s.color}`}>{s.value}</p>
            <p className="text-xs opacity-40 font-mono leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      {showTour && <WelcomeTour onDone={() => setShowTour(false)} />}

      <p className="text-center text-xs opacity-25 font-mono pb-2">
        Think in English. Speak without translating. 🇺🇸
      </p>
    </main>
  );
}
