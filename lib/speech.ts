// lib/speech.ts — fixed for multi-phrase sessions

// ─── TEXT TO SPEECH ───────────────────────────────────────────────────────────

export function speak(text: string, onEnd?: () => void): void {
  if (typeof window === "undefined") return;
  const synth = window.speechSynthesis;

  // Always cancel first — avoids Chrome queue buildup
  synth.cancel();

  // Small delay so cancel() takes effect before new utterance
  setTimeout(() => {
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "en-US";
    utt.rate = 0.88;
    utt.pitch = 1;

    const voices = synth.getVoices();
    const preferred = voices.find(
      (v) =>
        v.lang === "en-US" &&
        (v.name.includes("Samantha") ||
          v.name.includes("Alex") ||
          v.name.includes("Google US") ||
          v.name.includes("Google") ||
          v.name.includes("Natural"))
    );
    if (preferred) utt.voice = preferred;
    if (onEnd) utt.onend = onEnd;
    synth.speak(utt);
  }, 80);
}

export function stopSpeaking(): void {
  if (typeof window === "undefined") return;
  window.speechSynthesis.cancel();
}

// ─── SPEECH RECOGNITION ───────────────────────────────────────────────────────

export type RecognitionStatus = "idle" | "listening" | "done" | "error" | "unsupported";

export interface RecognitionResult {
  transcript: string;
  confidence: number;
}

// Singleton — only ONE recognition instance alive at a time
// This is the core fix: stale instances were locking the mic after phrase 1
let activeRecognition: any = null;

export function stopListening(): void {
  if (activeRecognition) {
    try {
      activeRecognition.onresult = null;
      activeRecognition.onerror = null;
      activeRecognition.onend = null;
      activeRecognition.stop();
    } catch {
      // already stopped — ignore
    }
    activeRecognition = null;
  }
}

export function startListening(
  onResult: (result: RecognitionResult) => void,
  onStatusChange: (status: RecognitionStatus) => void
): () => void {
  // Kill any previous instance before creating new one
  stopListening();

  if (typeof window === "undefined") {
    onStatusChange("unsupported");
    return () => {};
  }

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onStatusChange("unsupported");
    return () => {};
  }

  // Guard: prevents onend from overriding a successful result
  let resultReceived = false;

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.continuous = false;

  recognition.onstart = () => {
    onStatusChange("listening");
  };

  recognition.onresult = (event: any) => {
    resultReceived = true;
    const transcript = event.results[0][0].transcript;
    const confidence = event.results[0][0].confidence ?? 1;
    onResult({ transcript, confidence });
    onStatusChange("done");
    activeRecognition = null;
  };

  recognition.onerror = (event: any) => {
    // "no-speech" is not a real error — just silence
    if (event.error === "no-speech") {
      onStatusChange("idle");
    } else {
      onStatusChange("error");
    }
    activeRecognition = null;
  };

  recognition.onend = () => {
    // Only fire idle if we never got a result
    // Prevents overriding the "done" status from onresult
    if (!resultReceived) {
      onStatusChange("idle");
    }
    activeRecognition = null;
  };

  // Small delay so any previous cancel() is flushed by the browser
  setTimeout(() => {
    try {
      recognition.start();
      activeRecognition = recognition;
    } catch {
      // Recognition already running — retry once
      setTimeout(() => {
        try {
          recognition.start();
          activeRecognition = recognition;
        } catch {
          onStatusChange("error");
        }
      }, 300);
    }
  }, 150);

  return () => {
    resultReceived = true; // prevent idle from firing on manual stop
    stopListening();
  };
}
