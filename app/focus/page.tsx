"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getRandomTopic } from "@/lib/phrases";
import { speak } from "@/lib/speech";
import { loadData, saveData, recordSession } from "@/lib/store";

type Stage = "setup" | "running" | "done";

const DURATIONS = [
  { label: "5 min", seconds: 300 },
  { label: "10 min", seconds: 600 },
  { label: "15 min", seconds: 900 },
];

export default function FocusMode() {
  const [stage, setStage] = useState<Stage>("setup");
  const [duration, setDuration] = useState(300);
  const [timeLeft, setTimeLeft] = useState(300);
  const [topic, setTopic] = useState(getRandomTopic());
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartRef = useRef<number>(0);

  const start = () => {
    setTimeLeft(duration);
    speak(topic);
    setStage("running");
    sessionStartRef.current = Date.now();
  };

  useEffect(() => {
    if (stage !== "running" || paused) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          const elapsed = Math.floor((Date.now() - sessionStartRef.current) / 1000);
          const data = loadData();
          saveData(recordSession(data, Math.round(elapsed / 60), elapsed, "focus"));
          setStage("done");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [stage, paused]);

  const togglePause = () => setPaused((p) => !p);

  const pct = (timeLeft / duration) * 100;
  const radius = 110;
  const circ = 2 * Math.PI * radius;
  const offset = circ * (1 - pct / 100);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <main
      className={`min-h-dvh flex flex-col max-w-md mx-auto px-4 transition-colors duration-700 ${
        stage === "running" ? "bg-ink" : "bg-paper"
      } page-enter`}
    >
      {/* Header - minimal during session */}
      {stage !== "running" && (
        <div className="flex items-center gap-3 py-6">
          <Link href="/" className="text-2xl btn-press">←</Link>
          <div>
            <h2 className="font-display font-bold text-lg">Focus Mode</h2>
            <p className="text-xs opacity-40 font-mono">No distractions. Just you and English.</p>
          </div>
        </div>
      )}

      {/* Setup */}
      {stage === "setup" && (
        <div className="flex flex-col gap-6 py-4 animate-fade-in">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest opacity-40 mb-3">Session length</p>
            <div className="flex gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d.seconds}
                  onClick={() => setDuration(d.seconds)}
                  className={`btn-press flex-1 py-3 rounded-2xl font-display font-bold text-sm border-2 transition-all ${
                    duration === d.seconds
                      ? "border-sky bg-sky text-white"
                      : "border-mist bg-white text-ink"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-widest opacity-40 mb-3">Your topic</p>
            <div className="bg-ink text-paper rounded-3xl p-5">
              <p className="font-display text-lg font-bold leading-snug">{topic}</p>
            </div>
            <button
              onClick={() => setTopic(getRandomTopic())}
              className="btn-press mt-2 text-xs font-mono opacity-40 hover:opacity-70 transition-opacity"
            >
              🔄 Different topic
            </button>
          </div>

          <div className="bg-sky/10 rounded-2xl p-4">
            <p className="font-mono text-xs opacity-50 mb-2">How it works</p>
            <p className="text-sm opacity-70">
              The screen goes minimal. A timer counts down. You speak about the topic continuously — or practice phrases silently. No pressure, no score. Just time with English.
            </p>
          </div>

          <button
            onClick={start}
            className="btn-press bg-sky text-white font-display font-bold text-xl rounded-2xl px-10 py-5 shadow-lg w-full"
          >
            Start Focus Session ⏱️
          </button>
        </div>
      )}

      {/* Running — ultra minimal */}
      {stage === "running" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-8">
          {/* Ring timer */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            <svg width="264" height="264" className="absolute">
              <circle cx="132" cy="132" r={radius} fill="none" stroke="#ffffff10" strokeWidth="10" />
              <circle
                cx="132" cy="132" r={radius}
                fill="none"
                stroke={timeLeft <= 30 ? "#e07a5f" : "#81b4e0"}
                strokeWidth="10"
                strokeDasharray={circ}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="progress-ring__circle"
              />
            </svg>
            <div className="text-center z-10">
              <p className="font-display font-bold text-6xl text-paper">
                {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
              </p>
              <p className="text-xs font-mono text-paper/30 mt-1">
                {paused ? "PAUSED" : "SPEAKING"}
              </p>
            </div>
          </div>

          {/* Topic reminder (subtle) */}
          <p className="text-paper/30 text-xs font-mono text-center max-w-[200px] leading-relaxed">
            {topic}
          </p>

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={togglePause}
              className="btn-press bg-white/10 text-paper font-display font-bold text-lg rounded-2xl px-8 py-4 backdrop-blur"
            >
              {paused ? "▶ Resume" : "⏸ Pause"}
            </button>
            <Link
              href="/"
              className="btn-press bg-white/5 text-paper/50 font-mono text-sm rounded-2xl px-5 py-4"
            >
              ✕ Exit
            </Link>
          </div>
        </div>
      )}

      {/* Done */}
      {stage === "done" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center animate-bounce-soft">
          <div className="text-7xl">🌟</div>
          <div>
            <h3 className="font-display text-3xl font-bold text-ink">
              {Math.floor(duration / 60)} minutes done!
            </h3>
            <p className="opacity-50 mt-2 text-sm">
              That's real progress. You spoke. You focused.<br/>Every session makes you better.
            </p>
          </div>
          <div className="bg-sky/10 rounded-2xl p-5 w-full">
            <p className="font-display text-xl font-bold text-sky">+{duration} XP</p>
            <p className="text-sm opacity-60">for {Math.floor(duration / 60)} minutes of focus</p>
          </div>
          <button
            onClick={() => { setStage("setup"); setTimeLeft(duration); setPaused(false); }}
            className="btn-press bg-sky text-white font-display font-bold text-lg rounded-2xl px-8 py-4 w-full"
          >
            Go Again 🔄
          </button>
          <Link href="/" className="btn-press border-2 border-ink/10 rounded-xl px-6 py-3 text-sm font-mono w-full text-center">
            Back to Dashboard
          </Link>
        </div>
      )}
    </main>
  );
}
