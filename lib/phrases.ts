// lib/phrases.ts

export interface Phrase {
  text: string;
  category: string;
  tip?: string;
}

export const FLUENCY_PHRASES: Phrase[] = [
  { text: "What do you think about this?", category: "opinion" },
  { text: "I totally agree with you.", category: "opinion" },
  { text: "That makes a lot of sense.", category: "opinion" },
  { text: "I see what you mean.", category: "understanding" },
  { text: "Could you say that again?", category: "clarification" },
  { text: "I was wondering if you could help me.", category: "request" },
  { text: "That's actually a great point.", category: "reaction" },
  { text: "I hadn't thought of it that way.", category: "reaction" },
  { text: "It depends on the situation.", category: "nuance" },
  { text: "To be honest, I'm not sure.", category: "honesty" },
  { text: "Can you walk me through that?", category: "clarification" },
  { text: "Let me get back to you on that.", category: "delay" },
  { text: "I'm really into this idea.", category: "enthusiasm" },
  { text: "We should definitely try that.", category: "suggestion" },
  { text: "How long have you been doing this?", category: "question" },
  { text: "I've been working on my English a lot lately.", category: "personal" },
  { text: "What's your take on this situation?", category: "opinion" },
  { text: "That's pretty much what I was thinking.", category: "agreement" },
  { text: "I'm getting better at this every day.", category: "progress" },
  { text: "Can we go over that one more time?", category: "clarification" },
  { text: "I really appreciate your patience.", category: "gratitude" },
  { text: "Let me think about that for a second.", category: "filler" },
  { text: "That's a tough one.", category: "reaction" },
  { text: "I've never really thought about it before.", category: "reflection" },
  { text: "What do you usually do in that case?", category: "question" },
];

export const ANTI_BLOCK_PHRASES: Phrase[] = [
  { text: "Let me think...", tip: "Buy time without going silent" },
  { text: "That's a good question.", tip: "Classic filler — buys you 2 seconds" },
  { text: "How do I put this...", tip: "Shows you're thinking, not stuck" },
  { text: "I mean...", tip: "Natural transition while you think" },
  { text: "Actually, you know what?", tip: "Redirect + buy time" },
  { text: "It's kind of like...", tip: "Start a comparison to gain traction" },
  { text: "I was just thinking about this...", tip: "Engage while gathering thoughts" },
  { text: "Off the top of my head...", tip: "Sets low-stakes expectation" },
  { text: "Something I've noticed is...", tip: "Opens personal observation" },
  { text: "So basically what I'm trying to say is...", tip: "Restart clearly" },
  { text: "Bear with me here...", tip: "Ask for patience naturally" },
  { text: "The thing is...", tip: "Signals you have a point coming" },
  { text: "What I find interesting is...", tip: "Redirect to something you know" },
  { text: "From my experience...", tip: "Anchor to personal knowledge" },
  { text: "If I had to guess...", tip: "Makes uncertainty okay" },
];

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
];

export function getRandomPhrase(phrases: Phrase[]): Phrase {
  return phrases[Math.floor(Math.random() * phrases.length)];
}

export function getRandomTopic(): string {
  return TOPICS_60S[Math.floor(Math.random() * TOPICS_60S.length)];
}
