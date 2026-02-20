"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { FLUENCY_PHRASES, createShuffledQueue } from "@/lib/phrases";
import type { Phrase } from "@/lib/phrases";
import { speak, stopSpeaking, startListening, stopListening, type RecognitionStatus } from "@/lib/speech";
import { loadData, saveData, recordSession } from "@/lib/store";
import { detectSpanish } from "@/lib/spanishDetector";
import type { SpanishDetectionResult } from "@/lib/spanishDetector";

type Stage = "ready" | "listen" | "memorize" | "speak" | "result" | "done";

// Compare transcript vs target — returns similarity 0-100
function similarity(a: string, b: string): number {
  const normalize = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 100;
  const wordsA = new Set(na.split(" "));
  const wordsB = nb.split(" ");
  const matches = wordsB.filter((w) => wordsA.has(w)).length;
  return Math.round((matches / Math.max(wordsA.size, wordsB.length)) * 100);
}

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 80 ? "bg-sage" : score >= 50 ? "bg-gold" : "bg-coral";
  const label =
    score >= 80 ? "Great! 🔥" : score >= 50 ? "Close! Keep going 💪" : "Try again next time 👍";
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs font-mono mb-1 opacity-60">
        <span>{label}</span>
        <span>{score}%</span>
      </div>
      <div className="h-2 bg-mist rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-700`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export default function FluencyMode() {
  const [stage, setStage] = useState<Stage>("ready");
  const queueRef = useRef<Phrase[]>(createShuffledQueue(FLUENCY_PHRASES));
  const [queueIndex, setQueueIndex] = useState(0);
  const phrase = queueRef.current[queueIndex % queueRef.current.length];

  const [phrasesCompleted, setPhrasesCompleted] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [score, setScore] = useState(0);
  const [spanishResult, setSpanishResult] = useState<SpanishDetectionResult | null>(null);
  const [recStatus, setRecStatus] = useState<RecognitionStatus>("idle");
  
  const sessionStartRef = useRef(Date.now());
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [memorizeCountdown, setMemorizeCountdown] = useState(3);
  const [showHint, setShowHint] = useState(false);
  const TARGET = 10;

  // Session timer
  useEffect(() => {
    if (stage === "done") return;
    const t = setInterval(
      () => setSessionSeconds(Math.floor((Date.now() - sessionStartRef.current) / 1000)),
      1000
    );
    return () => clearInterval(t);
  }, [stage]);

  // Memorize countdown — 3 seconds to look at phrase, then hide
  useEffect(() => {
    if (stage !== "memorize") return;
    setMemorizeCountdown(3);
    const t = setInterval(() => {
      setMemorizeCountdown((c) => {
        if (c <= 1) {
          clearInterval(t);
          setStage("speak");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [stage]);

  // Start listening when speak stage begins
  useEffect(() => {
    if (stage !== "speak") return;
    setShowHint(false);
    startListening(
      (res) => {
        setTranscript(res.transcript);
        const s = similarity(res.transcript, phrase.text);
        setScore(s);
        const spanish = detectSpanish(res.transcript);
        setSpanishResult(spanish.isSpanish ? spanish : null);
        setStage("result");
      },
      (status) => {
        setRecStatus(status);
        if (status === "unsupported" || status === "error") {
          setTranscript("");
          setScore(0);
          setStage("result");
        }
      }
    );
    // Show hint after 6s if no result
    const hintTimer = setTimeout(() => setShowHint(true), 6000);
    return () => {
      clearTimeout(hintTimer);
      stopListening(); // always clean up mic when effect re-runs or unmounts
    };
  }, [stage, phrase.text]);

  const handleStart = () => {
    sessionStartRef.current = Date.now();
    setStage("listen");
    speak(phrase.text, () => setTimeout(() => setStage("memorize"), 300));
  };

  const handleNext = useCallback(() => {
    stopSpeaking();
    stopListening();
    const newCount = phrasesCompleted + 1;
    setPhrasesCompleted(newCount);

    if (newCount >= TARGET) {
      const elapsed = Math.floor((Date.now() - sessionStartRef.current) / 1000);
      const data = loadData();
      saveData(recordSession(data, newCount, elapsed, "fluency"));
      setStage("done");
    } else {
      setQueueIndex((i) => i + 1);
      setTranscript("");
      setScore(0);
      setSpanishResult(null);
      setRecStatus("idle");
      setShowHint(false);
      setStage("listen");
      // speak next phrase automatically
      const next = queueRef.current[(queueIndex + 1) % queueRef.current.length];
      speak(next.text, () => setTimeout(() => setStage("memorize"), 300));
    }
  }, [phrasesCompleted, queueIndex]);

  const handleManualDone = () => {
    stopListening();
    setTranscript("");
    setScore(0);
    setSpanishResult(null);
    setStage("result");
  };

  const progress = (phrasesCompleted / TARGET) * 100;

  return (
    <main className="min-h-dvh bg-paper flex flex-col max-w-md mx-auto px-4 py-6 gap-4 page-enter">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/" className="text-2xl btn-press">←</Link>
        <div className="flex-1">
          <h2 className="font-display font-bold text-lg">Fluency Mode</h2>
          <div className="h-1.5 bg-mist rounded-full mt-1 overflow-hidden">
            <div
              className="h-full bg-sage rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <span className="font-mono text-sm opacity-50">{phrasesCompleted}/{TARGET}</span>
      </div>

      <div className="text-center">
        <span className="font-mono text-xs opacity-30">
          {Math.floor(sessionSeconds / 60)}:{String(sessionSeconds % 60).padStart(2, "0")}
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6">

        {/* READY */}
        {stage === "ready" && (
          <div className="text-center flex flex-col gap-6 animate-fade-in">
            <div className="text-6xl">🧠</div>
            <div>
              <h3 className="font-display text-2xl font-bold">Listen. Remember. Speak.</h3>
              <p className="opacity-50 text-sm mt-2 leading-relaxed">
                You'll hear a phrase.<br/>
                You have <strong>3 seconds</strong> to memorize it.<br/>
                Then it disappears — say it from memory.<br/>
                <span className="text-coral font-mono text-xs">This trains real fluency, not reading.</span>
              </p>
            </div>
            <button
              onClick={handleStart}
              className="btn-press bg-sage text-white font-display font-bold text-xl rounded-2xl px-10 py-5 shadow-lg"
            >
              Start Training 🎯
            </button>
          </div>
        )}

        {/* LISTEN */}
        {stage === "listen" && (
          <div className="text-center flex flex-col items-center gap-6 animate-fade-in w-full">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 bg-sage/20 rounded-full ripple-ring" />
              <span className="text-3xl z-10">🔊</span>
            </div>
            <div className="bg-ink text-paper rounded-3xl p-6 w-full">
              <p className="font-mono text-xs uppercase tracking-widest opacity-40 mb-3">Listen carefully</p>
              <p className="font-display text-2xl font-bold leading-snug">&ldquo;{phrase.text}&rdquo;</p>
              <p className="text-xs opacity-30 mt-3 font-mono">{phrase.category}</p>
            </div>
          </div>
        )}

        {/* MEMORIZE — phrase visible, counting down */}
        {stage === "memorize" && (
          <div className="text-center flex flex-col items-center gap-6 animate-fade-in w-full">
            <div className="bg-ink text-paper rounded-3xl p-6 w-full relative overflow-hidden">
              <p className="font-mono text-xs uppercase tracking-widest opacity-40 mb-3">Memorize it!</p>
              <p className="font-display text-2xl font-bold leading-snug">&ldquo;{phrase.text}&rdquo;</p>
              {/* countdown bar */}
              <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-coral rounded-full transition-all duration-1000"
                  style={{ width: `${(memorizeCountdown / 3) * 100}%` }}
                />
              </div>
              <p className="text-xs text-coral/70 mt-1 font-mono">Disappears in {memorizeCountdown}s...</p>
            </div>
            <p className="text-sm opacity-40 font-mono animate-pulse-slow">Get ready to say it! 🎤</p>
          </div>
        )}

        {/* SPEAK — phrase hidden */}
        {stage === "speak" && (
          <div className="text-center flex flex-col items-center gap-6 animate-fade-in w-full">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <div className="absolute inset-0 bg-coral/20 rounded-full ripple-ring" />
              <div className="absolute inset-3 bg-coral/20 rounded-full ripple-ring" style={{ animationDelay: "0.5s" }} />
              <span className="text-5xl z-10">🎤</span>
            </div>

            {/* Phrase is HIDDEN — only category shown */}
            <div className="bg-ink text-paper rounded-3xl p-6 w-full">
              <p className="font-mono text-xs uppercase tracking-widest opacity-40 mb-3">Now say it from memory</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-8 bg-white/10 rounded-xl flex items-center px-3">
                  <span className="text-white/30 text-sm font-mono">
                    {recStatus === "listening" ? "🔴 Listening..." : "Starting..."}
                  </span>
                </div>
              </div>
              <p className="text-xs opacity-30 mt-3 font-mono">Category: {phrase.category}</p>
            </div>

            {showHint && (
              <div className="bg-gold/20 rounded-2xl p-3 w-full animate-fade-in">
                <p className="text-xs font-mono opacity-60 mb-1">💡 First word hint:</p>
                <p className="font-display font-bold text-ink">
                  &ldquo;{phrase.text.split(" ")[0]}...&rdquo;
                </p>
              </div>
            )}

            <button
              onClick={handleManualDone}
              className="btn-press border-2 border-ink/20 rounded-xl px-6 py-3 text-sm font-mono opacity-50"
            >
              I said it → Continue
            </button>
          </div>
        )}

        {/* RESULT */}
        {stage === "result" && (
          <div className="flex flex-col items-center gap-5 w-full animate-fade-in">
            <div className="bg-white rounded-3xl p-5 w-full border border-mist shadow-sm">
              <p className="font-mono text-xs uppercase tracking-widest opacity-40 mb-2">The phrase</p>
              <p className="font-display text-xl font-bold text-ink">&ldquo;{phrase.text}&rdquo;</p>

              {phrase.spanish && (
                <p className="text-ink/40 text-sm mt-1 font-mono italic">{phrase.spanish}</p>
              )}

              {transcript && (
                <>
                  <div className="border-t border-mist my-3" />
                  <p className="font-mono text-xs uppercase tracking-widest opacity-40 mb-1">You said</p>
                  <p className="text-ink/70 italic">&ldquo;{transcript}&rdquo;</p>
                  <div className="mt-3">
                    <ScoreBar score={score} />
                  </div>
                </>
              )}

              {!transcript && (
                <p className="text-xs opacity-40 mt-3 font-mono">
                  💡 No mic detected — Chrome works best for speech recognition
                </p>
              )}
            </div>

            {/* SPANISH DETECTED CARD */}
            {spanishResult && (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 w-full animate-fade-in">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🇪🇸</span>
                  <p className="font-display font-bold text-amber-800 text-sm">{spanishResult.feedback}</p>
                </div>
                <p className="text-xs text-amber-700 font-mono mb-2">{spanishResult.tip}</p>
                <div className="bg-amber-100 rounded-xl p-3">
                  <p className="text-xs text-amber-800 font-mono opacity-80">
                    💡 Tip: cuando sientas que vas a decir una palabra en español, pausa 1 segundo y busca el equivalente en inglés. Con práctica se vuelve automático.
                  </p>
                </div>
              </div>
            )}

            {spanishResult === null && transcript && score < 50 && (
              <div className="bg-sky/10 border border-sky/30 rounded-2xl p-3 w-full animate-fade-in">
                <p className="text-xs text-sky font-mono">
                  🔄 No te preocupes — lo importante es que hablaste. Inténtalo de nuevo en la próxima ronda.
                </p>
              </div>
            )}

            <p className="text-xs opacity-30 text-center font-mono">
              La traducción al español solo aparece DESPUÉS de hablar. Eso es intencional. 🧠
            </p>

            <p className="text-xs opacity-40 text-center font-mono">
              The Spanish translation only appears AFTER you speak. That's intentional. 🧠
            </p>

            <button
              onClick={handleNext}
              className="btn-press bg-sage text-white font-display font-bold text-xl rounded-2xl px-10 py-5 w-full shadow-lg"
            >
              {phrasesCompleted + 1 >= TARGET ? "Finish Session 🎉" : "Next →"}
            </button>
          </div>
        )}

        {/* DONE */}
        {stage === "done" && (
          <div className="flex flex-col items-center gap-6 text-center animate-bounce-soft">
            <div className="text-7xl">🏆</div>
            <div>
              <h3 className="font-display text-3xl font-bold text-ink">Session Complete!</h3>
              <p className="opacity-50 mt-2">
                {TARGET} phrases · {Math.floor(sessionSeconds / 60)}m {sessionSeconds % 60}s
              </p>
            </div>
            <div className="bg-gold/20 rounded-2xl p-5 w-full">
              <p className="font-display text-2xl font-bold text-gold">
                +{TARGET * 10 + sessionSeconds} XP
              </p>
              <p className="text-sm opacity-60">earned this session</p>
            </div>
            <Link
              href="/"
              className="btn-press bg-ink text-paper font-display font-bold text-lg rounded-2xl px-10 py-4 w-full text-center"
            >
              Back to Dashboard
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
