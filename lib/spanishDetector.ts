// lib/spanishDetector.ts
// Detecta si el usuario habló en español, spanglish, o con palabras nativas

// Palabras españolas más comunes que aparecen al hablar en spanglish
const SPANISH_WORDS = new Set([
  // Pronombres
  "yo", "tú", "tu", "él", "ella", "nosotros", "ellos", "ellas", "usted", "ustedes",
  "mi", "mis", "mi", "mí", "me", "te", "se", "nos", "les",
  // Verbos comunes
  "es", "soy", "eres", "somos", "son", "estar", "estoy", "estás", "estamos", "están",
  "tengo", "tienes", "tiene", "tenemos", "tienen", "tener",
  "quiero", "quieres", "quiere", "queremos", "quieren",
  "puedo", "puedes", "puede", "podemos", "pueden",
  "voy", "vas", "va", "vamos", "van", "ir",
  "hacer", "hago", "haces", "hace", "hacemos", "hacen",
  "saber", "sé", "sabes", "sabe", "sabemos", "saben",
  "decir", "digo", "dices", "dice", "decimos", "dicen",
  "ver", "veo", "ves", "vemos", "ven",
  "creo", "crees", "cree", "creemos", "creen", "creer",
  "pienso", "piensas", "piensa", "pensamos", "piensan", "pensar",
  "hablar", "hablo", "hablas", "habla", "hablamos", "hablan",
  "necesito", "necesitas", "necesita", "necesitamos", "necesitan",
  "gracias", "por", "favor",
  // Artículos y conectores
  "el", "la", "los", "las", "un", "una", "unos", "unas",
  "de", "del", "al", "en", "con", "sin", "para", "por", "sobre",
  "que", "qué", "porque", "pero", "sino", "aunque", "cuando",
  "como", "cómo", "donde", "dónde", "quien", "quién",
  "si", "sí", "no", "ya", "también", "tampoco", "muy", "más",
  "este", "esta", "estos", "estas", "ese", "esa", "esos", "esas",
  "todo", "todos", "toda", "todas", "algo", "nada", "alguien", "nadie",
  // Adjetivos comunes
  "bueno", "buena", "malo", "mala", "grande", "pequeño", "pequeña",
  "mucho", "mucha", "muchos", "muchas", "poco", "poca", "pocos", "pocas",
  "nuevo", "nueva", "viejo", "vieja",
  // Sustantivos frecuentes
  "día", "tiempo", "vez", "cosa", "parte", "lugar", "manera",
  "persona", "año", "vida", "mundo", "caso", "ejemplo",
  "trabajo", "casa", "gente",
  // Frases cortas
  "lo que", "lo que", "así que", "o sea", "es decir", "o sea que",
  "igual", "entonces", "pues", "bueno", "claro", "obvio",
]);

// Palabras que suenan igual en inglés y español (falsos positivos a ignorar)
const AMBIGUOUS_WORDS = new Set([
  "a", "me", "no", "si", "el", "en", "de", "se", "un", "al",
  "social", "animal", "general", "natural", "normal", "personal",
  "total", "final", "local", "real", "formal", "digital",
  "hotel", "hospital", "capital", "central", "cultural",
]);

export interface SpanishDetectionResult {
  isSpanish: boolean;
  spanishWords: string[];
  confidence: "high" | "medium" | "low";
  feedback: string;
  tip: string;
}

export function detectSpanish(transcript: string): SpanishDetectionResult {
  if (!transcript) {
    return { isSpanish: false, spanishWords: [], confidence: "low", feedback: "", tip: "" };
  }

  const words = transcript
    .toLowerCase()
    .replace(/[^a-záéíóúüñ\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);

  const spanishFound = words.filter(
    (w) => SPANISH_WORDS.has(w) && !AMBIGUOUS_WORDS.has(w)
  );

  const ratio = spanishFound.length / Math.max(words.length, 1);

  // Determine confidence level
  let confidence: "high" | "medium" | "low" = "low";
  let isSpanish = false;

  if (spanishFound.length >= 3 || ratio >= 0.4) {
    confidence = "high";
    isSpanish = true;
  } else if (spanishFound.length === 2 || ratio >= 0.25) {
    confidence = "medium";
    isSpanish = true;
  } else if (spanishFound.length === 1 && ratio >= 0.15) {
    confidence = "low";
    isSpanish = true;
  }

  if (!isSpanish) {
    return { isSpanish: false, spanishWords: [], confidence: "low", feedback: "", tip: "" };
  }

  // Generate specific feedback based on what was detected
  const feedback = getFeedback(spanishFound, confidence);
  const tip = getTip(spanishFound);

  return { isSpanish, spanishWords: spanishFound, confidence, feedback, tip };
}

function getFeedback(words: string[], confidence: "high" | "medium" | "low"): string {
  if (confidence === "high") {
    return `Detecté español: "${words.slice(0, 3).join('", "')}" 🇪🇸`;
  } else if (confidence === "medium") {
    return `Mezclaste idiomas: "${words.join('", "')}" 🔀`;
  } else {
    return `Palabra en español detectada: "${words[0]}" 👀`;
  }
}

function getTip(words: string[]): string {
  // Map common Spanish words to their English equivalents for instant coaching
  const translations: Record<string, string> = {
    "yo": "→ say \"I\" instead",
    "tú": "→ say \"you\" instead",
    "es": "→ say \"it is\" or \"is\" instead",
    "soy": "→ say \"I am\" instead",
    "tengo": "→ say \"I have\" instead",
    "quiero": "→ say \"I want\" instead",
    "puedo": "→ say \"I can\" instead",
    "voy": "→ say \"I'm going\" instead",
    "creo": "→ say \"I think\" instead",
    "pienso": "→ say \"I think\" instead",
    "porque": "→ say \"because\" instead",
    "pero": "→ say \"but\" instead",
    "cuando": "→ say \"when\" instead",
    "que": "→ say \"that\" instead",
    "como": "→ say \"like\" or \"how\" instead",
    "también": "→ say \"also\" instead",
    "muy": "→ say \"very\" instead",
    "más": "→ say \"more\" instead",
    "todo": "→ say \"everything\" or \"all\" instead",
    "algo": "→ say \"something\" instead",
    "no": "→ try to keep going in English",
    "si": "→ say \"if\" or \"yes\" in English",
    "pues": "→ say \"well...\" instead",
    "bueno": "→ say \"okay\" or \"well\" instead",
    "igual": "→ say \"same\" or \"still\" instead",
    "entonces": "→ say \"so\" or \"then\" instead",
    "claro": "→ say \"of course\" or \"sure\" instead",
    "necesito": "→ say \"I need\" instead",
    "hablar": "→ say \"to speak\" or \"talking\" instead",
    "trabajo": "→ say \"work\" or \"job\" instead",
    "tiempo": "→ say \"time\" or \"weather\" instead",
  };

  for (const word of words) {
    if (translations[word]) {
      return `"${word}" ${translations[word]}`;
    }
  }

  return "Try to think of the English word first, then speak.";
}
