"use client";

import { useState, useEffect } from "react";

const TOUR_KEY = "bontiland_tour_done";

const SLIDES = [
  {
    emoji: "👋",
    title: "Bienvenido a BontiLand",
    subtitle: "Tu entrenador diario de inglés",
    body: "BontiLand te ayuda a hablar inglés con fluidez sin bloquearte ni traducir mentalmente del español.",
    highlight: null,
    color: "bg-ink",
    textColor: "text-paper",
  },
  {
    emoji: "🎯",
    title: "¿Cuál es el objetivo?",
    subtitle: null,
    body: "No memorizar vocabulario. No estudiar gramática. El objetivo es que tu cerebro piense directamente en inglés cuando hablas.",
    highlight: "Hablar → pensar en inglés → sin traducir",
    color: "bg-sage",
    textColor: "text-white",
  },
  {
    emoji: "🧠",
    title: "Fluency Mode",
    subtitle: "El modo principal",
    body: "Escuchas una frase en inglés. Tienes 3 segundos para memorizarla. Luego desaparece y la tienes que decir de memoria en voz alta.",
    highlight: "📌 El truco: la frase desaparece para que NO la leas, la recuerdes.",
    color: "bg-ink",
    textColor: "text-paper",
  },
  {
    emoji: "⚡",
    title: "Reaction Mode",
    subtitle: "Entrena velocidad de respuesta",
    body: "Te doy una situación real: tu jefe te pide algo, conoces a alguien en una fiesta, tienes que dar tu opinión. Tienes 5 segundos para empezar a responder.",
    highlight: "Si te bloqueas, hay frases de arranque que puedes usar.",
    color: "bg-coral",
    textColor: "text-white",
  },
  {
    emoji: "🧩",
    title: "Anti-Block Mode",
    subtitle: "Rompe el silencio",
    body: "Aprende frases para ganar tiempo cuando tu cerebro se congela: \"Let me think...\", \"How do I put this...\". También puedes hablar 60 segundos sin parar sobre un tema.",
    highlight: "Los hablantes nativos también usan estas frases. Son normales.",
    color: "bg-sky",
    textColor: "text-white",
  },
  {
    emoji: "🔥",
    title: "La racha diaria",
    subtitle: "Lo más importante",
    body: "5-10 minutos al día es suficiente. La consistencia importa más que la duración. Cada día que entrenas tu racha crece.",
    highlight: "La fluidez se construye en días, no en horas.",
    color: "bg-gold",
    textColor: "text-ink",
  },
  {
    emoji: "🇪🇸",
    title: "¿Hablas en español sin querer?",
    subtitle: "La app lo detecta",
    body: "Si el micrófono detecta que dijiste palabras en español mientras intentabas hablar en inglés, te avisa y te da el equivalente en inglés.",
    highlight: "No es un error — es feedback. Así sabes exactamente dónde entrenar más.",
    color: "bg-ink",
    textColor: "text-paper",
  },
  {
    emoji: "🚀",
    title: "¡Todo listo!",
    subtitle: "Empieza con Fluency Mode",
    body: "Abre el micrófono en Chrome para la mejor experiencia. Habla en voz alta, no en tu cabeza — eso es lo que entrena la fluidez real.",
    highlight: "Recuerda: no importa si no es perfecto. Importa que hables.",
    color: "bg-sage",
    textColor: "text-white",
  },
];

export function WelcomeTour({ onDone }: { onDone: () => void }) {
  const [slide, setSlide] = useState(0);
  const current = SLIDES[slide];
  const isLast = slide === SLIDES.length - 1;

  const next = () => {
    if (isLast) {
      localStorage.setItem(TOUR_KEY, "1");
      onDone();
    } else {
      setSlide((s) => s + 1);
    }
  };

  const skip = () => {
    localStorage.setItem(TOUR_KEY, "1");
    onDone();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 px-4">
      <div className={`${current.color} ${current.textColor} rounded-3xl w-full max-w-sm p-7 flex flex-col gap-5 shadow-2xl animate-slide-up`}>

        {/* Progress dots */}
        <div className="flex gap-1.5 justify-center">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === slide
                  ? "w-6 bg-white"
                  : i < slide
                  ? "w-2 bg-white/50"
                  : "w-2 bg-white/20"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center flex flex-col gap-3">
          <span className="text-6xl">{current.emoji}</span>
          <div>
            <h2 className="font-display text-2xl font-bold">{current.title}</h2>
            {current.subtitle && (
              <p className="opacity-60 text-sm font-mono mt-0.5">{current.subtitle}</p>
            )}
          </div>
          <p className="opacity-80 text-sm leading-relaxed">{current.body}</p>
          {current.highlight && (
            <div className="bg-white/15 rounded-2xl px-4 py-3 mt-1">
              <p className="text-sm font-display font-bold">{current.highlight}</p>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2 mt-2">
          <button
            onClick={next}
            className="btn-press bg-white/20 hover:bg-white/30 font-display font-bold text-lg rounded-2xl py-4 transition-all"
          >
            {isLast ? "¡Empezar a entrenar! 🎯" : "Siguiente →"}
          </button>
          {!isLast && (
            <button
              onClick={skip}
              className="text-xs opacity-40 py-2 font-mono hover:opacity-60 transition-opacity"
            >
              Saltar tutorial
            </button>
          )}
        </div>

        {/* Slide counter */}
        <p className="text-center text-xs opacity-30 font-mono">
          {slide + 1} / {SLIDES.length}
        </p>
      </div>
    </div>
  );
}

export function useShouldShowTour(): boolean {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(TOUR_KEY);
    if (!done) setShow(true);
  }, []);

  return show;
}
