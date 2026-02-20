"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { REACTION_PROMPTS, getRandomReactionPrompt } from "@/lib/phrases";
import type { ReactionPrompt } from "@/lib/phrases";
import { speak } from "@/lib/speech";
import { loadData, saveData, recordSession } from "@/lib/store";

type Stage = "ready" | "question" | "respond" | "result" | "done";

const RESPONSE_TIME = 5; // seconds to start responding
const TARGET = 6;

export default function ReactionMode() {
  const [stage, setStage] = useState<Stage>("ready");
  const [prompt, setPrompt] = useState<ReactionPrompt>(getRandomReactionPrompt());
  const [timeLeft, setTimeLeft] = useState(RESPONSE_TIME);
  const [completed, setCompleted] = useState(0);
  const [usedStarter, setUsedStarter] = useState<string | null>(null);
  const [survived, setSurvived] = useState(0); // how many they didn't freeze on
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionStartRef = useRef(Date.now());

  const nextPrompt = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const newCount = completed + 1;
    setCompleted(newCount);
    if (newCount >= TARGET) {
      const elapsed = Math.floor((Date.now() - sessionStartRef.current) / 1000);
      const data = loadData();
      saveData(recordSession(data, newCount, elapsed, "reaction"));
      setStage("done");
    } else {
      const next = getRandomReactionPrompt();
      setPrompt(next);
      setUsedStarter(null);
      setTimeLeft(RESPONSE_TIME);
      setStage("question");
      speak(next.question);
    }
  }, [completed]);

  const startCountdown = useCallback(() => {
    setStage("respond");
    setTimeLeft(RESPONSE_TIME);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setStage("result");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, []);

  const handleStart = () => {
    sessionStartRef.current = Date.now();
    const first = getRandomReactionPrompt();
    setPrompt(first);
    setStage("question");
    speak(first.question);
  };

  const handleStarted = () => {
    // User clicked "I started talking"
    if (timerRef.current) clearInterval(timerRef.current);
    setSurvived((s) => s + 1);
    setStage("result");
  };

  const handleUsedStarter = (starter: string) => {
    setUsedStarter(starter);
    setSurvived((s) => s + 1);
    if (timerRef.current) clearInterval(timerRef.current);
    setStage("result");
  };

  // After question is read, start countdown
  useEffect(() => {
    if (stage !== "question") return;
    const t = setTimeout(() => startCountdown(), 2500);
    return () => clearTimeout(t);
  }, [stage, prompt, startCountdown]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const pct = (timeLeft / RESPONSE_TIME) * 100;
  const urgent = timeLeft <= 2;

  return (
    <main className="min-h-dvh bg-paper flex flex-col max-w-md mx-auto px-4 py-6 gap-4 page-enter">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/" className="text-2xl btn-press">←</Link>
        <div className="flex-1">
          <h2 className="font-display font-bold text-lg">⚡ Reaction Mode</h2>
          <div className="h-1.5 bg-mist rounded-full mt-1 overflow-hidden">
            <div
              className="h-full bg-coral rounded-full transition-all duration-500"
              style={{ width: `${(completed / TARGET) * 100}%` }}
            />
          </div>
        </div>
        <span className="font-mono text-sm opacity-50">{completed}/{TARGET}</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6">

        {/* READY */}
        {stage === "ready" && (
          <div className="text-center flex flex-col gap-6 animate-fade-in">
            <div className="text-6xl">⚡</div>
            <div>
              <h3 className="font-display text-2xl font-bold">React in 5 seconds</h3>
              <p className="opacity-50 text-sm mt-2 leading-relaxed">
                You'll get a real-life situation.<br/>
                You have <strong>5 seconds</strong> to start talking.<br/>
                Use a starter phrase if you freeze.<br/>
                <span className="text-coral font-mono text-xs">This kills mental blocks.</span>
              </p>
            </div>
            <div className="bg-coral/10 rounded-2xl p-4 text-left">
              <p className="font-mono text-xs opacity-50 mb-2">Example situation:</p>
              <p className="font-display font-bold text-ink text-sm">
                &ldquo;{REACTION_PROMPTS[0].question}&rdquo;
              </p>
              <p className="text-xs opacity-40 mt-2">→ You start with: &ldquo;{REACTION_PROMPTS[0].starters[0]}&rdquo;</p>
            </div>
            <button
              onClick={handleStart}
              className="btn-press bg-coral text-white font-display font-bold text-xl rounded-2xl px-10 py-5 shadow-lg"
            >
              Start Reacting ⚡
            </button>
          </div>
        )}

        {/* QUESTION — reading */}
        {stage === "question" && (
          <div className="text-center flex flex-col items-center gap-6 animate-fade-in w-full">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 bg-coral/20 rounded-full animate-pulse-slow" />
              <span className="text-3xl z-10">🔊</span>
            </div>
            <div className="bg-ink text-paper rounded-3xl p-6 w-full">
              <p className="font-mono text-xs uppercase tracking-widest opacity-40 mb-3">Situation</p>
              <p className="font-display text-xl font-bold leading-snug">{prompt.question}</p>
            </div>
            <p className="text-sm opacity-40 font-mono animate-pulse-slow">Get ready to respond...</p>
          </div>
        )}

        {/* RESPOND — countdown */}
        {stage === "respond" && (
          <div className="flex flex-col items-center gap-5 w-full animate-fade-in">
            {/* Countdown ring */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg width="96" height="96" className="absolute">
                <circle cx="48" cy="48" r="40" fill="none" stroke="#e8e4dc" strokeWidth="6" />
                <circle
                  cx="48" cy="48" r="40" fill="none"
                  stroke={urgent ? "#e07a5f" : "#f2cc8f"}
                  strokeWidth="6"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 * (1 - pct / 100)}
                  strokeLinecap="round"
                  className="progress-ring__circle"
                />
              </svg>
              <span className={`font-display font-bold text-3xl z-10 ${urgent ? "text-coral" : "text-gold"}`}>
                {timeLeft}
              </span>
            </div>

            <div className="bg-ink text-paper rounded-3xl p-5 w-full">
              <p className="font-mono text-xs uppercase tracking-widest opacity-40 mb-2">Respond to this</p>
              <p className="font-display text-lg font-bold leading-snug">{prompt.question}</p>
            </div>

            <button
              onClick={handleStarted}
              className="btn-press bg-sage text-white font-display font-bold text-lg rounded-2xl px-8 py-4 w-full shadow-lg"
            >
              ✅ I started talking!
            </button>

            {/* Starters */}
            <div className="w-full">
              <p className="text-xs font-mono opacity-40 text-center mb-2">
                Blocked? Tap a starter to continue:
              </p>
              <div className="flex flex-col gap-2">
                {prompt.starters.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleUsedStarter(s)}
                    className="btn-press bg-white border-2 border-mist rounded-xl px-4 py-3 text-left font-display font-bold text-sm text-ink shadow-sm hover:border-coral/40 transition-all"
                  >
                    &ldquo;{s}&rdquo;
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RESULT */}
        {stage === "result" && (
          <div className="flex flex-col items-center gap-5 w-full animate-fade-in">
            <div className="text-5xl">{usedStarter ? "🧩" : timeLeft === 0 ? "😅" : "🔥"}</div>

            <div className="bg-white rounded-3xl p-5 w-full border border-mist shadow-sm">
              <p className="font-mono text-xs uppercase tracking-widest opacity-40 mb-2">Situation</p>
              <p className="font-display font-bold text-ink">{prompt.question}</p>

              {usedStarter && (
                <>
                  <div className="border-t border-mist my-3" />
                  <p className="font-mono text-xs opacity-40 mb-1">You used:</p>
                  <p className="text-sage font-bold">&ldquo;{usedStarter}&rdquo;</p>
                  <p className="text-xs opacity-40 mt-1">
                    ✅ Using a starter is a real skill. Natives do this too.
                  </p>
                </>
              )}

              {!usedStarter && timeLeft === 0 && (
                <>
                  <div className="border-t border-mist my-3" />
                  <p className="text-xs opacity-50">
                    Time ran out — that's okay. The goal is to reduce that freeze time every day.
                  </p>
                  <p className="text-xs text-coral font-mono mt-2">
                    Tip: &ldquo;{prompt.starters[0]}&rdquo; — memorize this one.
                  </p>
                </>
              )}

              {!usedStarter && timeLeft > 0 && (
                <>
                  <div className="border-t border-mist my-3" />
                  <p className="text-sage font-bold text-sm">You started talking without freezing! 🔥</p>
                </>
              )}
            </div>

            <button
              onClick={nextPrompt}
              className="btn-press bg-coral text-white font-display font-bold text-xl rounded-2xl px-10 py-5 w-full shadow-lg"
            >
              {completed + 1 >= TARGET ? "See Results 🎉" : "Next Situation →"}
            </button>
          </div>
        )}

        {/* DONE */}
        {stage === "done" && (
          <div className="flex flex-col items-center gap-6 text-center animate-bounce-soft">
            <div className="text-7xl">⚡</div>
            <div>
              <h3 className="font-display text-3xl font-bold text-ink">Reaction Training Done!</h3>
              <p className="opacity-50 mt-2">{TARGET} situations · {survived} clean responses</p>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full">
              <div className="bg-coral/10 rounded-2xl p-4">
                <p className="font-display text-2xl font-bold text-coral">{survived}/{TARGET}</p>
                <p className="text-xs opacity-60">responded</p>
              </div>
              <div className="bg-gold/10 rounded-2xl p-4">
                <p className="font-display text-2xl font-bold text-gold">+{TARGET * 15} XP</p>
                <p className="text-xs opacity-60">earned</p>
              </div>
            </div>
            <p className="text-sm opacity-50">
              Every day this gets faster. That's how fluency is built.
            </p>
            <Link href="/" className="btn-press bg-ink text-paper font-display font-bold text-lg rounded-2xl px-10 py-4 w-full text-center">
              Back to Dashboard
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
