"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ANTI_BLOCK_PHRASES, getRandomPhrase, getRandomTopic } from "@/lib/phrases";
import { speak } from "@/lib/speech";
import { loadData, saveData, recordSession } from "@/lib/store";

type Tab = "fillers" | "speak60";
type SpeakStage = "ready" | "topic" | "speaking" | "done";

function FillerCard({ text, tip, onClick }: { text: string; tip?: string; onClick: () => void }) {
  const [tapped, setTapped] = useState(false);
  const handle = () => {
    setTapped(true);
    speak(text);
    onClick();
    setTimeout(() => setTapped(false), 1200);
  };
  return (
    <button
      onClick={handle}
      className={`btn-press w-full text-left rounded-2xl p-4 border-2 transition-all ${
        tapped ? "border-sage bg-sage/10" : "border-mist bg-white hover:border-sage/40"
      } shadow-sm`}
    >
      <p className="font-display font-bold text-lg text-ink">&ldquo;{text}&rdquo;</p>
      {tip && <p className="text-xs opacity-50 mt-1 font-mono">{tip}</p>}
      <p className="text-xs text-sage mt-2 font-mono">{tapped ? "▶ Playing..." : "Tap to hear & practice"}</p>
    </button>
  );
}

function Speak60() {
  const [stage, setStage] = useState<SpeakStage>("ready");
  const [topic, setTopic] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [sessionStart] = useState(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startSession = () => {
    const t = getRandomTopic();
    setTopic(t);
    setStage("topic");
    speak(t, () => {
      setTimeout(() => {
        setStage("speaking");
        let remaining = 60;
        timerRef.current = setInterval(() => {
          remaining--;
          setTimeLeft(remaining);
          if (remaining <= 0) {
            clearInterval(timerRef.current!);
            setStage("done");
            // save session
            const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
            const data = loadData();
            saveData(recordSession(data, 1, elapsed, "antiblock"));
          }
        }, 1000);
      }, 500);
    });
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const pct = (timeLeft / 60) * 100;
  const circ = 2 * Math.PI * 52;
  const offset = circ * (1 - pct / 100);

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {stage === "ready" && (
        <div className="text-center flex flex-col gap-5 animate-fade-in">
          <div className="text-6xl">⏱️</div>
          <div>
            <h3 className="font-display text-xl font-bold">60-Second Talk</h3>
            <p className="opacity-50 text-sm mt-2">You'll get a topic. Speak for 60 seconds straight.<br/>Don't stop. Don't translate. Just go.</p>
          </div>
          <button
            onClick={startSession}
            className="btn-press bg-coral text-white font-display font-bold text-xl rounded-2xl px-10 py-5 shadow-lg"
          >
            Give Me a Topic 🎲
          </button>
        </div>
      )}

      {stage === "topic" && (
        <div className="text-center flex flex-col gap-4 animate-fade-in w-full">
          <p className="font-mono text-xs uppercase tracking-widest opacity-40">Your topic</p>
          <div className="bg-ink text-paper rounded-3xl p-6">
            <p className="font-display text-xl font-bold">{topic}</p>
          </div>
          <p className="opacity-50 text-sm">Listen... then start speaking!</p>
        </div>
      )}

      {stage === "speaking" && (
        <div className="flex flex-col items-center gap-6 animate-fade-in w-full">
          <div className="bg-coral/10 rounded-3xl p-4 w-full">
            <p className="font-mono text-xs opacity-50 mb-2">Topic:</p>
            <p className="font-display font-bold text-ink">{topic}</p>
          </div>

          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg width="136" height="136" className="absolute">
              <circle cx="68" cy="68" r="52" fill="none" stroke="#e8e4dc" strokeWidth="8" />
              <circle
                cx="68" cy="68" r="52" fill="none"
                stroke={timeLeft <= 10 ? "#e07a5f" : "#7fb069"}
                strokeWidth="8"
                strokeDasharray={circ}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="progress-ring__circle"
              />
            </svg>
            <div className="text-center z-10">
              <p className={`font-display font-bold text-4xl ${timeLeft <= 10 ? "text-coral" : "text-sage"}`}>
                {timeLeft}
              </p>
              <p className="text-xs opacity-40 font-mono">seconds</p>
            </div>
          </div>

          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 bg-coral/20 rounded-full ripple-ring" />
            <span className="text-3xl z-10">🎤</span>
          </div>

          <p className="text-center opacity-50 text-sm font-mono">
            Keep talking! Don't stop. Use fillers if needed.
          </p>
        </div>
      )}

      {stage === "done" && (
        <div className="text-center flex flex-col gap-5 animate-bounce-soft">
          <div className="text-6xl">🎉</div>
          <h3 className="font-display text-2xl font-bold">You did it!</h3>
          <p className="opacity-50 text-sm">60 seconds without stopping.<br/>That's how fluency is built.</p>
          <div className="bg-coral/10 rounded-2xl p-4">
            <p className="font-display text-xl font-bold text-coral">+70 XP</p>
          </div>
          <button
            onClick={() => { setStage("ready"); setTimeLeft(60); }}
            className="btn-press bg-coral text-white font-display font-bold text-lg rounded-2xl px-8 py-4"
          >
            Go Again 🔄
          </button>
          <Link href="/" className="btn-press border-2 border-ink/10 rounded-xl px-6 py-3 text-sm font-mono">
            Dashboard
          </Link>
        </div>
      )}
    </div>
  );
}

export default function AntiBlock() {
  const [tab, setTab] = useState<Tab>("fillers");
  const [tappedCount, setTappedCount] = useState(0);

  return (
    <main className="min-h-dvh bg-paper flex flex-col max-w-md mx-auto px-4 py-6 gap-4 page-enter">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/" className="text-2xl btn-press">←</Link>
        <div>
          <h2 className="font-display font-bold text-lg">Anti-Block Mode</h2>
          <p className="text-xs opacity-40 font-mono">Break the silence. Keep talking.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-mist rounded-2xl p-1">
        {(["fillers", "speak60"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-xl font-display font-bold text-sm transition-all ${
              tab === t ? "bg-white shadow-sm text-ink" : "text-ink/40"
            }`}
          >
            {t === "fillers" ? "🧩 Fillers" : "⏱️ 60s Talk"}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1">
        {tab === "fillers" && (
          <div className="flex flex-col gap-3 animate-fade-in">
            <p className="text-xs font-mono opacity-40 uppercase tracking-widest">
              Tap any phrase to hear it. Practice it out loud.
            </p>
            {ANTI_BLOCK_PHRASES.map((p, i) => (
              <FillerCard
                key={i}
                text={p.text}
                tip={p.tip}
                onClick={() => setTappedCount((c) => c + 1)}
              />
            ))}
            {tappedCount > 0 && (
              <p className="text-center text-xs text-sage font-mono mt-2">
                Practiced {tappedCount} filler{tappedCount > 1 ? "s" : ""} ✓
              </p>
            )}
          </div>
        )}

        {tab === "speak60" && <Speak60 />}
      </div>
    </main>
  );
}
