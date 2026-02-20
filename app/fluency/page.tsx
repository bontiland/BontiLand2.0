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
        <Link href="/" className="text-2xl btn-press">
          {"←"}
        </Link>
        <div className="flex-1">
          <h2 className="font-display font-bold text-lg">Fluency Mode</h2>
          <div className="h-1.5 bg-mist rounded-full mt-1 overflow-hidden">
            <div
              className="h-full bg-sage rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <span className="font-mono text-sm opacity-50">
          {phrasesCompleted}/{TARGET}
        </span>
      </div>

      <div className="text-center">
        <span className="font-mono text-xs opacity-30">
          {Math.floor(sessionSeconds / 60)}:
          {String(sessionSeconds % 60).padStart(2, "0")}
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        {/* Aquí va todo tu bloque de stages (ready, listen, etc.) */}
        {/* Asegúrate de que todos los {stage === "..." && (...)} estén cerrados */}
      </div>
    </main>
  );
}
