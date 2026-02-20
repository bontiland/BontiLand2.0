"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ANTI_BLOCK_PHRASES, PHRASE_BUILDER_SETS, getRandomTopic } from "@/lib/phrases";
import { speak } from "@/lib/speech";
import { loadData, saveData, recordSession } from "@/lib/store";

type Tab = "fillers" | "builder" | "speak60";
type SpeakStage = "ready" | "topic" | "speaking" | "done";

// ─── FILLER CARD ──────────────────────────────────────────────────────────────
function FillerCard({ text, tip, index }: { text: string; tip?: string; index: number }) {
  const [state, setState] = useState<"idle" | "playing" | "done">("idle");

  const handle = () => {
    setState("playing");
    speak(text, () => setState("done"));
  };

  const colors = ["bg-sage", "bg-coral", "bg-sky", "bg-gold"];
  const color = colors[index % colors.length];

  return (
    <button
      onClick={handle}
      className={`btn-press w-full text-left rounded-2xl p-4 border-2 transition-all ${
        state === "playing"
          ? `border-transparent ${color}/20 bg-${color}/5`
          : state === "done"
          ? "border-sage/40 bg-sage/5"
          : "border-mist bg-white hover:border-ink/20"
      } shadow-sm`}
    >
      <div className="flex items-start gap-3">
        <span className="text-lg mt-0.5">{state === "done" ? "✅" : state === "playing" ? "🔊" : "👆"}</span>
        <div className="flex-1">
          <p className="font-display font-bold text-ink">&ldquo;{text}&rdquo;</p>
          {tip && <p className="text-xs opacity-50 mt-1 font-mono">{tip}</p>}
        </div>
      </div>
    </button>
  );
}

// ─── PHRASE BUILDER ───────────────────────────────────────────────────────────
function PhraseBuilder() {
  const [setIndex, setSetIndex] = useState(0);
  const current = PHRASE_BUILDER_SETS[setIndex];
  const [subject, setSubject] = useState(current.subjects[0]);
  const [verb, setVerb] = useState(current.verbs[0]);
  const [complement, setComplement] = useState(current.complements[0]);
  const [spoken, setSpoken] = useState(false);
  const [count, setCount] = useState(0);

  const builtPhrase = `${subject} ${verb} ${complement}`;

  const handleSpeak = () => {
    speak(builtPhrase);
    setSpoken(true);
    setCount((c) => c + 1);
  };

  const handleShuffle = () => {
    const s = current.subjects[Math.floor(Math.random() * current.subjects.length)];
    const v = current.verbs[Math.floor(Math.random() * current.verbs.length)];
    const c = current.complements[Math.floor(Math.random() * current.complements.length)];
    setSubject(s);
    setVerb(v);
    setComplement(c);
    setSpoken(false);
  };

  const changeSet = (i: number) => {
    setSetIndex(i);
    const s = PHRASE_BUILDER_SETS[i];
    setSubject(s.subjects[0]);
    setVerb(s.verbs[0]);
    setComplement(s.complements[0]);
    setSpoken(false);
  };

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      <p className="text-xs font-mono opacity-40 uppercase tracking-widest">
        Construye frases en inglés sin traducir
      </p>

      {/* Set selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {PHRASE_BUILDER_SETS.map((s, i) => (
          <button
            key={i}
            onClick={() => changeSet(i)}
            className={`btn-press flex-shrink-0 text-xs font-mono px-3 py-1.5 rounded-xl border-2 transition-all ${
              setIndex === i ? "border-sky bg-sky text-white" : "border-mist bg-white text-ink/60"
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>

      {/* Built phrase display */}
      <div className="bg-ink text-paper rounded-3xl p-5">
        <p className="font-mono text-xs opacity-40 mb-3 uppercase tracking-widest">Your phrase</p>
        <p className="font-display text-xl font-bold leading-snug">&ldquo;{builtPhrase}&rdquo;</p>
      </div>

      {/* Block selectors */}
      <div className="flex flex-col gap-2">
        {[
          { label: "Opening", options: current.subjects, value: subject, set: setSubject },
          { label: "Middle", options: current.verbs, value: verb, set: setVerb },
          { label: "Ending", options: current.complements, value: complement, set: setComplement },
        ].map((block) => (
          <div key={block.label}>
            <p className="font-mono text-xs opacity-40 mb-1">{block.label}</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {block.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => { block.set(opt); setSpoken(false); }}
                  className={`btn-press flex-shrink-0 text-sm px-3 py-2 rounded-xl border-2 transition-all font-mono ${
                    block.value === opt
                      ? "border-sky bg-sky/10 text-ink font-bold"
                      : "border-mist bg-white text-ink/60"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSpeak}
          className="btn-press flex-1 bg-sage text-white font-display font-bold text-lg rounded-2xl py-4 shadow-lg"
        >
          {spoken ? "🔊 Say Again" : "🗣️ Say It Aloud"}
        </button>
        <button
          onClick={handleShuffle}
          className="btn-press bg-mist text-ink font-mono text-sm rounded-2xl px-4 py-4"
        >
          🔀 Shuffle
        </button>
      </div>

      {count > 0 && (
        <p className="text-center text-xs text-sage font-mono">
          Built & said {count} phrase{count > 1 ? "s" : ""} ✓
        </p>
      )}
    </div>
  );
}

// ─── 60S SPEAK ────────────────────────────────────────────────────────────────
function Speak60() {
  const [stage, setStage] = useState<SpeakStage>("ready");
  const [topic, setTopic] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const sessionStartRef = useRef(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startSession = () => {
    const t = getRandomTopic();
    setTopic(t);
    setStage("topic");
    speak(t, () => {
      setTimeout(() => {
        setStage("speaking");
        sessionStartRef.current = Date.now();
        let remaining = 60;
        timerRef.current = setInterval(() => {
          remaining--;
          setTimeLeft(remaining);
          if (remaining <= 0) {
            clearInterval(timerRef.current!);
            const elapsed = Math.floor((Date.now() - sessionStartRef.current) / 1000);
            const data = loadData();
            saveData(recordSession(data, 1, elapsed, "antiblock"));
            setStage("done");
          }
        }, 1000);
      }, 500);
    });
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const circ = 2 * Math.PI * 52;
  const offset = circ * (1 - timeLeft / 60);

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {stage === "ready" && (
        <div className="text-center flex flex-col gap-5 animate-fade-in">
          <div className="text-6xl">⏱️</div>
          <div>
            <h3 className="font-display text-xl font-bold">60-Second Talk</h3>
            <p className="opacity-50 text-sm mt-2 leading-relaxed">
              Te doy un tema. Hablas 60 segundos sin parar.<br />
              No importa si no es perfecto. Solo sigue hablando.
            </p>
          </div>
          <button
            onClick={startSession}
            className="btn-press bg-coral text-white font-display font-bold text-xl rounded-2xl px-10 py-5 shadow-lg"
          >
            Dame un tema 🎲
          </button>
        </div>
      )}

      {stage === "topic" && (
        <div className="text-center flex flex-col gap-4 animate-fade-in w-full">
          <p className="font-mono text-xs uppercase tracking-widest opacity-40">Tu tema</p>
          <div className="bg-ink text-paper rounded-3xl p-6">
            <p className="font-display text-xl font-bold">{topic}</p>
          </div>
          <p className="opacity-50 text-sm">Escucha... ¡y empieza a hablar!</p>
        </div>
      )}

      {stage === "speaking" && (
        <div className="flex flex-col items-center gap-6 animate-fade-in w-full">
          <div className="bg-coral/10 rounded-3xl p-4 w-full">
            <p className="font-mono text-xs opacity-50 mb-2">Tema:</p>
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
              <p className="text-xs opacity-40 font-mono">segundos</p>
            </div>
          </div>

          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 bg-coral/20 rounded-full ripple-ring" />
            <span className="text-3xl z-10">🎤</span>
          </div>

          <p className="text-center opacity-50 text-sm font-mono">
            ¡Sigue hablando! Usa fillers si necesitas tiempo.
          </p>
        </div>
      )}

      {stage === "done" && (
        <div className="text-center flex flex-col gap-5 animate-bounce-soft">
          <div className="text-6xl">🎉</div>
          <h3 className="font-display text-2xl font-bold">¡Lo lograste!</h3>
          <p className="opacity-50 text-sm">60 segundos sin parar. Así se construye la fluidez.</p>
          <div className="bg-coral/10 rounded-2xl p-4">
            <p className="font-display text-xl font-bold text-coral">+70 XP</p>
          </div>
          <button
            onClick={() => { setStage("ready"); setTimeLeft(60); }}
            className="btn-press bg-coral text-white font-display font-bold text-lg rounded-2xl px-8 py-4"
          >
            Repetir 🔄
          </button>
          <Link href="/" className="btn-press border-2 border-ink/10 rounded-xl px-6 py-3 text-sm font-mono">
            Dashboard
          </Link>
        </div>
      )}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function AntiBlock() {
  const [tab, setTab] = useState<Tab>("fillers");

  const tabs: { id: Tab; label: string }[] = [
    { id: "fillers", label: "🧩 Fillers" },
    { id: "builder", label: "🔨 Builder" },
    { id: "speak60", label: "⏱️ 60s" },
  ];

  return (
    <main className="min-h-dvh bg-paper flex flex-col max-w-md mx-auto px-4 py-6 gap-4 page-enter">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-2xl btn-press">←</Link>
        <div>
          <h2 className="font-display font-bold text-lg">Anti-Block</h2>
          <p className="text-xs opacity-40 font-mono">Rompe el silencio. Sigue hablando.</p>
        </div>
      </div>

      <div className="flex bg-mist rounded-2xl p-1 gap-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 rounded-xl font-display font-bold text-xs transition-all ${
              tab === t.id ? "bg-white shadow-sm text-ink" : "text-ink/40"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1">
        {tab === "fillers" && (
          <div className="flex flex-col gap-3 animate-fade-in">
            <p className="text-xs font-mono opacity-40 uppercase tracking-widest">
              Toca para escuchar. Repite en voz alta.
            </p>
            {ANTI_BLOCK_PHRASES.map((p, i) => (
              <FillerCard key={i} text={p.text} tip={p.tip} index={i} />
            ))}
          </div>
        )}
        {tab === "builder" && <PhraseBuilder />}
        {tab === "speak60" && <Speak60 />}
      </div>
    </main>
  );
}
