"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { FLUENCY_PHRASES, getRandomPhrase } from "@/lib/phrases";
import { speak, stopSpeaking, startListening, type RecognitionStatus } from "@/lib/speech";
import { loadData, saveData, recordSession } from "@/lib/store";

type Stage = "ready" | "listen" | "speak" | "result" | "done";

export default function FluencyMode() {
  const [stage, setStage] = useState<Stage>("ready");
  const [phrase, setPhrase] = useState(getRandomPhrase(FLUENCY_PHRASES));
  const [phrasesCompleted, setPhrasesCompleted] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [recStatus, setRecStatus] = useState<RecognitionStatus>("idle");
  const [stopRec, setStopRec] = useState<(() => void) | null>(null);
  const [sessionStart] = useState(Date.now());
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const TARGET = 8;

  // Tick session timer
  useEffect(() => {
    if (stage === "done") return;
    const t = setInterval(() => setSessionSeconds(Math.floor((Date.now() - sessionStart) / 1000)), 1000);
    return () => clearInterval(t);
  }, [sessionStart, stage]);

  const handleListen = useCallback(() => {
    setStage("listen");
    speak(phrase.text, () => {
      setTimeout(() => setStage("speak"), 400);
    });
  }, [phrase]);

  const handleSpeak = useCallback(() => {
    const stop = startListening(
      (res) => {
        setTranscript(res.transcript);
        setStage("result");
      },
      (status) => {
        setRecStatus(status);
        if (status === "unsupported" || status === "error") {
          setTranscript("");
          setStage("result");
        }
      }
    );
    if (stop) setStopRec(() => stop);
  }, []);

  useEffect(() => {
    if (stage === "speak") handleSpeak();
  }, [stage, handleSpeak]);

  const handleNext = useCallback(() => {
    stopSpeaking();
    if (stopRec) { stopRec(); setStopRec(null); }
    const newCount = phrasesCompleted + 1;
    setPhrasesCompleted(newCount);
    if (newCount >= TARGET) {
      // Save session
      const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
      const data = loadData();
      saveData(recordSession(data, newCount, elapsed, "fluency"));
      setStage("done");
    } else {
      setPhrase(getRandomPhrase(FLUENCY_PHRASES));
      setTranscript("");
      setRecStatus("idle");
      setStage("listen");
    }
  }, [phrasesCompleted, stopRec, sessionStart]);

  // Auto-advance after listening is set up
  useEffect(() => {
    if (stage === "listen") {
      // nothing extra needed — speak() triggers next stage via callback
    }
  }, [stage]);

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

      {/* Timer */}
      <div className="text-center">
        <span className="font-mono text-xs opacity-30">
          {Math.floor(sessionSeconds / 60)}:{String(sessionSeconds % 60).padStart(2, "0")} elapsed
        </span>
      </div>

      {/* Main card */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8">

        {stage === "ready" && (
          <div className="text-center flex flex-col gap-6 animate-fade-in">
            <div className="text-6xl">🗣️</div>
            <div>
              <h3 className="font-display text-2xl font-bold">Listen. Repeat. Go.</h3>
              <p className="opacity-50 text-sm mt-2">You'll hear a phrase, then repeat it out loud.<br/>No translations. Just speaking.</p>
            </div>
            <button
              onClick={handleListen}
              className="btn-press bg-sage text-white font-display font-bold text-xl rounded-2xl px-10 py-5 shadow-lg"
            >
              Start Training 🎯
            </button>
          </div>
        )}

        {stage === "listen" && (
          <div className="text-center flex flex-col items-center gap-6 animate-fade-in w-full">
            <div className="relative">
              <div className="w-20 h-20 bg-sage/20 rounded-full flex items-center justify-center">
                <div className="w-12 h-12 bg-sage rounded-full ripple-ring absolute" />
                <span className="text-3xl z-10">🔊</span>
              </div>
            </div>
            <div className="bg-ink text-paper rounded-3xl p-6 w-full">
              <p className="font-mono text-xs uppercase tracking-widest opacity-40 mb-3">Listen carefully</p>
              <p className="font-display text-2xl font-bold leading-snug">&ldquo;{phrase.text}&rdquo;</p>
              <p className="text-xs opacity-40 mt-3 font-mono">{phrase.category}</p>
            </div>
          </div>
        )}

        {stage === "speak" && (
          <div className="text-center flex flex-col items-center gap-6 animate-fade-in w-full">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 bg-coral/20 rounded-full ripple-ring" />
              <div className="absolute inset-2 bg-coral/20 rounded-full ripple-ring" style={{ animationDelay: "0.4s" }} />
              <span className="text-4xl z-10">🎤</span>
            </div>

            <div className="bg-ink text-paper rounded-3xl p-6 w-full">
              <p className="font-mono text-xs uppercase tracking-widest opacity-40 mb-3">Now say it</p>
              <p className="font-display text-2xl font-bold leading-snug">&ldquo;{phrase.text}&rdquo;</p>
            </div>

            <p className="font-mono text-sm opacity-50">
              {recStatus === "listening" ? "🔴 Listening..." : "Starting..."}
            </p>

            <button
              onClick={() => { if (stopRec) stopRec(); setStage("result"); }}
              className="btn-press border-2 border-ink/20 rounded-xl px-6 py-3 text-sm font-mono opacity-60"
            >
              Skip mic → type manually
            </button>
          </div>
        )}

        {stage === "result" && (
          <div className="flex flex-col items-center gap-6 w-full animate-fade-in">
            <div className="text-5xl">
              {transcript ? "✅" : "👍"}
            </div>
            <div className="bg-white rounded-3xl p-5 w-full border border-mist shadow-sm">
              <p className="font-mono text-xs uppercase tracking-widest opacity-40 mb-2">Phrase</p>
              <p className="font-display text-xl font-bold text-ink">&ldquo;{phrase.text}&rdquo;</p>
              {transcript && (
                <>
                  <div className="border-t border-mist my-3" />
                  <p className="font-mono text-xs uppercase tracking-widest opacity-40 mb-1">You said</p>
                  <p className="text-ink/70 italic">&ldquo;{transcript}&rdquo;</p>
                </>
              )}
            </div>
            <p className="text-xs opacity-40 text-center">
              Don't judge yourself. Just keep going. 💪
            </p>
            <button
              onClick={handleNext}
              className="btn-press bg-sage text-white font-display font-bold text-xl rounded-2xl px-10 py-5 w-full shadow-lg"
            >
              {phrasesCompleted + 1 >= TARGET ? "Finish Session 🎉" : "Next Phrase →"}
            </button>
          </div>
        )}

        {stage === "done" && (
          <div className="flex flex-col items-center gap-6 text-center animate-bounce-soft">
            <div className="text-7xl">🏆</div>
            <div>
              <h3 className="font-display text-3xl font-bold text-ink">Session Complete!</h3>
              <p className="opacity-50 mt-2">{TARGET} phrases · {Math.floor(sessionSeconds / 60)}m {sessionSeconds % 60}s</p>
            </div>
            <div className="bg-gold/20 rounded-2xl p-5 w-full">
              <p className="font-display text-2xl font-bold text-gold">+{TARGET * 10 + sessionSeconds} XP</p>
              <p className="text-sm opacity-60">earned this session</p>
            </div>
            <Link href="/" className="btn-press bg-ink text-paper font-display font-bold text-lg rounded-2xl px-10 py-4 w-full text-center">
              Back to Dashboard
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
