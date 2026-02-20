// lib/speech.ts
// Web Speech API wrapper for text-to-speech and speech recognition

export function speak(text: string, onEnd?: () => void): void {
  if (typeof window === "undefined") return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = "en-US";
  utt.rate = 0.9;
  utt.pitch = 1;

  // Prefer a natural-sounding voice
  const voices = synth.getVoices();
  const preferred = voices.find(
    (v) =>
      v.lang === "en-US" &&
      (v.name.includes("Samantha") ||
        v.name.includes("Alex") ||
        v.name.includes("Google") ||
        v.name.includes("Natural"))
  );
  if (preferred) utt.voice = preferred;

  if (onEnd) utt.onend = onEnd;
  synth.speak(utt);
}

export function stopSpeaking(): void {
  if (typeof window === "undefined") return;
  window.speechSynthesis.cancel();
}

export type RecognitionStatus = "idle" | "listening" | "done" | "error" | "unsupported";

export interface RecognitionResult {
  transcript: string;
  confidence: number;
}

export function startListening(
  onResult: (result: RecognitionResult) => void,
  onStatusChange: (status: RecognitionStatus) => void
): (() => void) | null {
  if (typeof window === "undefined") return null;

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onStatusChange("unsupported");
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => onStatusChange("listening");
  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    const confidence = event.results[0][0].confidence;
    onResult({ transcript, confidence });
    onStatusChange("done");
  };
  recognition.onerror = () => onStatusChange("error");
  recognition.onend = () => onStatusChange("idle");

  recognition.start();

  return () => recognition.stop();
}
