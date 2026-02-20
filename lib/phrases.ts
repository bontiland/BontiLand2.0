// lib/phrases.ts — BontiLand 2.0 upgraded phrase library

export interface Phrase {
  text: string;
  category: string;
  tip?: string;
  spanish?: string; // only shown AFTER speaking, never before
}

export interface ReactionPrompt {
  question: string;
  starters: string[];
  category: string;
}

export interface PhraseBlock {
  id: string;
  type: "subject" | "verb" | "complement";
  text: string;
}

// ─── FLUENCY PHRASES (100+) ──────────────────────────────────────────────────
export const FLUENCY_PHRASES: Phrase[] = [
  // Opinion & Reaction
  { text: "What do you think about this?", category: "opinion", spanish: "¿Qué piensas sobre esto?" },
  { text: "I totally agree with you.", category: "opinion", spanish: "Estoy totalmente de acuerdo contigo." },
  { text: "That makes a lot of sense.", category: "opinion", spanish: "Eso tiene mucho sentido." },
  { text: "That's actually a great point.", category: "reaction", spanish: "En realidad es un buen punto." },
  { text: "I hadn't thought of it that way.", category: "reaction", spanish: "No lo había pensado así." },
  { text: "Honestly, I'm not convinced.", category: "opinion", spanish: "Honestamente, no estoy convencido." },
  { text: "That's exactly what I was thinking.", category: "agreement", spanish: "Eso es exactamente lo que pensaba." },
  { text: "I can see both sides of this.", category: "nuance", spanish: "Puedo ver ambos lados de esto." },
  { text: "Fair enough, I get your point.", category: "agreement", spanish: "Está bien, entiendo tu punto." },
  { text: "I'm not sure I follow you.", category: "clarification", spanish: "No estoy seguro de seguirte." },
  { text: "Could you be more specific?", category: "clarification", spanish: "¿Podrías ser más específico?" },
  { text: "That changes everything.", category: "reaction", spanish: "Eso cambia todo." },
  { text: "I wouldn't go that far.", category: "nuance", spanish: "Yo no iría tan lejos." },
  { text: "You have a point there.", category: "agreement", spanish: "Tienes razón en eso." },
  { text: "I strongly disagree with that.", category: "opinion", spanish: "Estoy muy en desacuerdo con eso." },

  // Clarification & Understanding
  { text: "I see what you mean.", category: "understanding", spanish: "Veo lo que quieres decir." },
  { text: "Could you say that again?", category: "clarification", spanish: "¿Podrías repetir eso?" },
  { text: "Can you walk me through that?", category: "clarification", spanish: "¿Puedes explicarme eso paso a paso?" },
  { text: "Can we go over that one more time?", category: "clarification", spanish: "¿Podemos repasar eso una vez más?" },
  { text: "What exactly do you mean by that?", category: "clarification", spanish: "¿Qué quieres decir exactamente con eso?" },
  { text: "So what you're saying is...", category: "understanding", spanish: "Entonces lo que dices es..." },
  { text: "Let me make sure I understand.", category: "understanding", spanish: "Déjame asegurarme de entender." },
  { text: "Am I understanding you correctly?", category: "clarification", spanish: "¿Te entiendo correctamente?" },
  { text: "Just to clarify...", category: "clarification", spanish: "Solo para aclarar..." },
  { text: "Can you give me an example?", category: "clarification", spanish: "¿Puedes darme un ejemplo?" },

  // Requests & Suggestions
  { text: "I was wondering if you could help me.", category: "request", spanish: "Me preguntaba si podrías ayudarme." },
  { text: "We should definitely try that.", category: "suggestion", spanish: "Definitivamente deberíamos intentar eso." },
  { text: "Let me get back to you on that.", category: "delay", spanish: "Te respondo sobre eso más tarde." },
  { text: "Would it be possible to...?", category: "request", spanish: "¿Sería posible...?" },
  { text: "Could you do me a favor?", category: "request", spanish: "¿Podrías hacerme un favor?" },
  { text: "What if we tried a different approach?", category: "suggestion", spanish: "¿Y si intentamos un enfoque diferente?" },
  { text: "I suggest we take a step back.", category: "suggestion", spanish: "Sugiero que demos un paso atrás." },
  { text: "Have you considered trying...?", category: "suggestion", spanish: "¿Has considerado intentar...?" },
  { text: "It might be worth looking into.", category: "suggestion", spanish: "Podría valer la pena investigarlo." },
  { text: "Let's figure this out together.", category: "collaboration", spanish: "Resolvámos esto juntos." },

  // Personal & Connection
  { text: "How long have you been doing this?", category: "question", spanish: "¿Cuánto tiempo llevas haciendo esto?" },
  { text: "I've been working on my English a lot lately.", category: "personal", spanish: "He estado trabajando mucho en mi inglés últimamente." },
  { text: "I'm really into this idea.", category: "enthusiasm", spanish: "Estoy muy entusiasmado con esta idea." },
  { text: "I really appreciate your patience.", category: "gratitude", spanish: "Realmente aprecio tu paciencia." },
  { text: "I'm getting better at this every day.", category: "progress", spanish: "Cada día mejoro en esto." },
  { text: "That's something I care a lot about.", category: "personal", spanish: "Eso es algo que me importa mucho." },
  { text: "I've been dealing with something similar.", category: "empathy", spanish: "He estado lidiando con algo similar." },
  { text: "What's your background in this?", category: "question", spanish: "¿Cuál es tu experiencia en esto?" },
  { text: "Tell me more about that.", category: "interest", spanish: "Cuéntame más sobre eso." },
  { text: "That's really interesting to me.", category: "interest", spanish: "Eso me parece realmente interesante." },

  // Everyday
  { text: "It depends on the situation.", category: "nuance", spanish: "Depende de la situación." },
  { text: "To be honest, I'm not sure.", category: "honesty", spanish: "Para ser honesto, no estoy seguro." },
  { text: "Let me think about that for a second.", category: "filler", spanish: "Déjame pensar en eso un momento." },
  { text: "That's a tough one.", category: "reaction", spanish: "Esa es difícil." },
  { text: "I've never really thought about it before.", category: "reflection", spanish: "Nunca había pensado realmente en eso antes." },
  { text: "What do you usually do in that case?", category: "question", spanish: "¿Qué sueles hacer en ese caso?" },
  { text: "What's your take on this situation?", category: "opinion", spanish: "¿Cuál es tu perspectiva sobre esta situación?" },
  { text: "That's pretty much what I was thinking.", category: "agreement", spanish: "Eso es básicamente lo que pensaba." },
  { text: "Not necessarily, it depends.", category: "nuance", spanish: "No necesariamente, depende." },
  { text: "Now that you mention it...", category: "reflection", spanish: "Ahora que lo mencionas..." },

  // Work & Professional
  { text: "I'll look into that right away.", category: "work", spanish: "Lo revisaré de inmediato." },
  { text: "Can we schedule a time to talk?", category: "work", spanish: "¿Podemos programar un momento para hablar?" },
  { text: "I need a bit more time on this.", category: "work", spanish: "Necesito un poco más de tiempo para esto." },
  { text: "Let's align on the next steps.", category: "work", spanish: "Alineémonos sobre los próximos pasos." },
  { text: "I'll keep you posted on that.", category: "work", spanish: "Te mantendré informado sobre eso." },
  { text: "What's the deadline for this?", category: "work", spanish: "¿Cuál es la fecha límite para esto?" },
  { text: "I want to make sure we're on the same page.", category: "work", spanish: "Quiero asegurarme de que estemos alineados." },
  { text: "Let me double-check that for you.", category: "work", spanish: "Déjame verificar eso para ti." },
  { text: "I'm currently working on something else.", category: "work", spanish: "Actualmente estoy trabajando en otra cosa." },
  { text: "That's outside my area of expertise.", category: "work", spanish: "Eso está fuera de mi área de experiencia." },

  // Storytelling
  { text: "So there I was, and suddenly...", category: "story", spanish: "Entonces yo estaba ahí, y de repente..." },
  { text: "The funny thing is...", category: "story", spanish: "Lo gracioso es..." },
  { text: "Long story short...", category: "story", spanish: "En resumen..." },
  { text: "You're not going to believe this.", category: "story", spanish: "No lo vas a creer." },
  { text: "It all started when...", category: "story", spanish: "Todo empezó cuando..." },
  { text: "And then out of nowhere...", category: "story", spanish: "Y entonces de la nada..." },
  { text: "The best part of the story is...", category: "story", spanish: "La mejor parte de la historia es..." },
  { text: "I'll never forget the moment when...", category: "story", spanish: "Nunca olvidaré el momento en que..." },
  { text: "It turned out to be completely different.", category: "story", spanish: "Resultó ser completamente diferente." },
  { text: "And that's when everything changed.", category: "story", spanish: "Y fue entonces cuando todo cambió." },

  // Emotions
  { text: "I'm really excited about this.", category: "emotion", spanish: "Estoy muy emocionado con esto." },
  { text: "That kind of frustrated me.", category: "emotion", spanish: "Eso me frustró un poco." },
  { text: "I feel a bit overwhelmed right now.", category: "emotion", spanish: "Me siento un poco abrumado ahora mismo." },
  { text: "I was surprised by how well it went.", category: "emotion", spanish: "Me sorprendió lo bien que fue." },
  { text: "I'm pretty confident about this.", category: "emotion", spanish: "Estoy bastante seguro sobre esto." },
  { text: "That makes me a little nervous.", category: "emotion", spanish: "Eso me pone un poco nervioso." },
  { text: "I feel much better about it now.", category: "emotion", spanish: "Ahora me siento mucho mejor al respecto." },
  { text: "I was honestly a bit disappointed.", category: "emotion", spanish: "Honestamente estaba un poco decepcionado." },
  { text: "I'm genuinely happy for you.", category: "emotion", spanish: "Estoy genuinamente feliz por ti." },
  { text: "That hit me harder than I expected.", category: "emotion", spanish: "Eso me afectó más de lo que esperaba." },

  // Advanced/Natural
  { text: "It's not as simple as it sounds.", category: "nuance", spanish: "No es tan simple como suena." },
  { text: "There's more to it than that.", category: "nuance", spanish: "Hay más en eso de lo que parece." },
  { text: "I'm still wrapping my head around it.", category: "reflection", spanish: "Todavía estoy asimilándolo." },
  { text: "That's kind of a gray area.", category: "nuance", spanish: "Eso es un área gris." },
  { text: "I need to sleep on that.", category: "delay", spanish: "Necesito pensarlo con calma." },
  { text: "Let's not jump to conclusions.", category: "nuance", spanish: "No saquemos conclusiones apresuradas." },
  { text: "I could be wrong, but...", category: "honesty", spanish: "Podría estar equivocado, pero..." },
  { text: "Take it with a grain of salt.", category: "nuance", spanish: "Tómalo con cautela." },
  { text: "It's easier said than done.", category: "nuance", spanish: "Es más fácil decirlo que hacerlo." },
  { text: "At the end of the day...", category: "conclusion", spanish: "Al final del día..." },
];

// ─── ANTI-BLOCK FILLERS ───────────────────────────────────────────────────────
export const ANTI_BLOCK_PHRASES: Phrase[] = [
  { text: "Let me think...", category: "filler", tip: "Compra tiempo sin quedarte en silencio" },
  { text: "That's a good question.", category: "filler", tip: "Clásico filler — te da 2 segundos" },
  { text: "How do I put this...", category: "filler", tip: "Muestra que estás pensando, no bloqueado" },
  { text: "I mean...", category: "filler", tip: "Transición natural mientras piensas" },
  { text: "Actually, you know what?", category: "filler", tip: "Redirigir + ganar tiempo" },
  { text: "It's kind of like...", category: "filler", tip: "Empieza una comparación para ganar impulso" },
  { text: "I was just thinking about this...", category: "filler", tip: "Engancha mientras reúnes pensamientos" },
  { text: "Off the top of my head...", category: "filler", tip: "Baja la presión de expectativas" },
  { text: "Something I've noticed is...", category: "filler", tip: "Abre una observación personal" },
  { text: "So basically what I'm trying to say is...", category: "filler", tip: "Reinicia con claridad" },
  { text: "Bear with me here...", category: "filler", tip: "Pide paciencia de forma natural" },
  { text: "The thing is...", category: "filler", tip: "Señala que viene un punto" },
  { text: "What I find interesting is...", category: "filler", tip: "Redirige a algo que conoces" },
  { text: "From my experience...", category: "filler", tip: "Ancla en conocimiento personal" },
  { text: "If I had to guess...", category: "filler", tip: "Hace que la incertidumbre esté bien" },
  { text: "Now that you mention it...", category: "filler", tip: "Conecta ideas naturalmente" },
  { text: "I'm glad you brought that up.", category: "filler", tip: "Gana tiempo y muestra interés" },
  { text: "That reminds me of something.", category: "filler", tip: "Pivota a territorio conocido" },
  { text: "Interesting point — let me respond to that.", category: "filler", tip: "Compra 3 segundos con elegancia" },
  { text: "I was actually just thinking about this.", category: "filler", tip: "Establece credibilidad mientras piensas" },
];

// ─── REACTION PROMPTS (Modo Reacción) ────────────────────────────────────────
export const REACTION_PROMPTS: ReactionPrompt[] = [
  {
    question: "Your friend is 30 minutes late. What do you say when they arrive?",
    starters: ["Hey, I was wondering...", "No worries, but...", "I was starting to think..."],
    category: "social",
  },
  {
    question: "Your boss asks: 'Can you finish this by tomorrow?' — but you can't.",
    starters: ["I appreciate you asking, but...", "I want to be honest with you...", "The thing is..."],
    category: "work",
  },
  {
    question: "Someone asks your opinion on a topic you know nothing about.",
    starters: ["Honestly, I'm not that familiar with...", "Off the top of my head...", "I'd have to look into that..."],
    category: "social",
  },
  {
    question: "You meet someone at a party. They ask 'So what do you do?'",
    starters: ["Well, I'm currently...", "That's actually a fun question...", "So I work in..."],
    category: "social",
  },
  {
    question: "Your coworker made a mistake that affected your work. How do you bring it up?",
    starters: ["Hey, I wanted to talk to you about...", "I noticed something and...", "Can I be honest with you?"],
    category: "work",
  },
  {
    question: "Someone recommends a movie you hated. What do you say?",
    starters: ["Honestly, it wasn't really my thing...", "I can see why people like it, but...", "I tried watching it and..."],
    category: "opinion",
  },
  {
    question: "You're in a meeting and you disagree with the plan. Speak up.",
    starters: ["I hear what you're saying, but...", "Could I offer a different perspective?", "I want to raise a concern..."],
    category: "work",
  },
  {
    question: "Someone asks: 'What's your biggest weakness?'",
    starters: ["That's something I've been working on...", "I'd say I tend to...", "Honestly, I've noticed that..."],
    category: "personal",
  },
  {
    question: "A friend tells you they're moving to another country. React!",
    starters: ["Wait, seriously?", "That's incredible!", "I didn't see that coming..."],
    category: "emotion",
  },
  {
    question: "You ordered the wrong food at a restaurant. How do you tell the waiter?",
    starters: ["Excuse me, I think...", "I'm sorry to bother you, but...", "Could I actually..."],
    category: "everyday",
  },
  {
    question: "Someone asks why you're learning English.",
    starters: ["Well, the main reason is...", "Honestly, it started because...", "I've always wanted to..."],
    category: "personal",
  },
  {
    question: "Your internet goes out during a video call. What do you say when you're back?",
    starters: ["Sorry about that, my...", "I apologize, I had some...", "Can you hear me now?"],
    category: "work",
  },
  {
    question: "Someone asks: 'What do you think about social media?'",
    starters: ["It's kind of a double-edged sword...", "I have mixed feelings about...", "Honestly, I think..."],
    category: "opinion",
  },
  {
    question: "You're asked to describe yourself in 3 words.",
    starters: ["That's tough, but I'd say...", "People usually tell me I'm...", "I think I'm..."],
    category: "personal",
  },
  {
    question: "A friend is going through a hard time. What do you say?",
    starters: ["I'm really sorry to hear that...", "I can't imagine how you feel, but...", "I'm here if you need..."],
    category: "empathy",
  },
  {
    question: "Someone asks: 'Would you rather live in a big city or small town?'",
    starters: ["Honestly, it depends on...", "I've always been more of a...", "There's something appealing about both, but..."],
    category: "opinion",
  },
];

// ─── PHRASE BUILDER SETS ──────────────────────────────────────────────────────
export const PHRASE_BUILDER_SETS = [
  {
    title: "Share your opinion",
    subjects: ["I think", "In my opinion", "Personally", "From where I stand"],
    verbs: ["it's important to", "we should", "it makes sense to", "it would help to"],
    complements: ["talk about this more", "find a better solution", "take it step by step", "be more flexible"],
  },
  {
    title: "Describe a problem",
    subjects: ["The main issue is", "What bothers me is", "The problem with that is", "What I struggle with is"],
    verbs: ["it keeps", "I keep running into", "things get complicated when", "I find it hard to"],
    complements: ["happening over and over", "the same situation", "there's no clear answer", "making progress"],
  },
  {
    title: "Tell a story",
    subjects: ["So there I was", "It all started when", "You're not going to believe this, but", "The other day"],
    verbs: ["and suddenly", "and out of nowhere", "and then I realized", "and before I knew it"],
    complements: ["everything changed", "I had no idea what to do", "it turned out fine", "I couldn't believe it"],
  },
];

// ─── TOPICS ────────────────────────────────────────────────────────────────────
export const TOPICS_60S: string[] = [
  "Talk about your favorite food and why you love it.",
  "Describe your morning routine step by step.",
  "What would your perfect weekend look like?",
  "Talk about a movie or show you watched recently.",
  "Describe where you live without saying the name.",
  "What's something you've been learning lately?",
  "Talk about a goal you have for this year.",
  "What do you love most about your city?",
  "Describe a person who has inspired you.",
  "What's something that makes you laugh?",
  "Talk about your favorite way to relax.",
  "What's a skill you wish you had?",
  "Describe your ideal working environment.",
  "Talk about something that surprised you recently.",
  "What are three things you're grateful for today?",
  "Describe your relationship with technology.",
  "Talk about a challenge you overcame.",
  "What would you do with one free month?",
  "Describe a skill you're proud of.",
  "What's something most people don't know about you?",
];

// ─── UTILS ────────────────────────────────────────────────────────────────────
export function getRandomPhrase(phrases: Phrase[]): Phrase {
  return phrases[Math.floor(Math.random() * phrases.length)];
}

export function getRandomTopic(): string {
  return TOPICS_60S[Math.floor(Math.random() * TOPICS_60S.length)];
}

export function getRandomReactionPrompt(): ReactionPrompt {
  return REACTION_PROMPTS[Math.floor(Math.random() * REACTION_PROMPTS.length)];
}

export function createShuffledQueue(phrases: Phrase[]): Phrase[] {
  const shuffled = [...phrases];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
