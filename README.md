# 🗣️ BontiLand 2.0

> **Daily English fluency trainer.** Designed for someone with ADHD who wants to speak English without translating, without freezing, and without overthinking.

---

## 🎯 What BontiLand does for you

| Mode | What you do | Time |
|------|-------------|------|
| 🗣️ Fluency Mode | Hear a phrase → Say it out loud → Repeat | ~10 min |
| 🧱 Anti-Block | Practice filler phrases → 60s non-stop talk | ~5 min |
| ⏱️ Focus Timer | Speak continuously for 5–15 min on a topic | 5–15 min |

**Every session earns XP.** Every day you use it builds your streak 🔥

---

## 🖥️ Demo features

- ✅ Dashboard with streak, XP, level system
- ✅ Text-to-speech (you hear the phrase)
- ✅ Speech recognition (app hears you say it back)
- ✅ 25 fluency phrases + 15 anti-block fillers + 15 random topics
- ✅ Progress saved automatically (no account needed)
- ✅ Works on mobile and desktop
- ✅ Dark Focus mode during timer sessions

---

## 🚀 STEP BY STEP: How to run this on your computer

### STEP 1 — Install Node.js

1. Go to: **https://nodejs.org**
2. Click the big green **"LTS"** download button
3. Run the installer — just click Next, Next, Finish
4. To verify it worked: open **Terminal** (Mac) or **Command Prompt** (Windows) and type:
   ```
   node --version
   ```
   You should see something like `v20.11.0`

---

### STEP 2 — Download this project

**Option A: With Git (recommended)**
```bash
git clone https://github.com/YOUR_USERNAME/bontiland.git
cd bontiland
```

**Option B: Without Git**
1. Download the ZIP file of this repository
2. Unzip it
3. Open Terminal/Command Prompt
4. Type `cd ` (with a space), then drag the folder into the terminal → press Enter

---

### STEP 3 — Install the project dependencies

In the terminal, inside the project folder, type:
```bash
npm install
```
Wait ~1 minute. You'll see lots of text — that's normal.

---

### STEP 4 — Run it locally

```bash
npm run dev
```

Then open your browser and go to:
**http://localhost:3000**

🎉 BontiLand is running on your computer!

To stop it: press `Ctrl + C` in the terminal.

---

### STEP 5 — Upload to GitHub

1. Create a free account at **https://github.com**
2. Create a new repository named `bontiland`
3. In your terminal (inside the project folder):

```bash
git init
git add .
git commit -m "Initial commit: BontiLand 2.0"
git remote add origin https://github.com/YOUR_USERNAME/bontiland.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

---

### STEP 6 — Deploy to Vercel (free, live on the internet)

1. Go to **https://vercel.com** and sign up with your GitHub account
2. Click **"New Project"**
3. Select your `bontiland` repository
4. Click **"Deploy"**
5. Wait ~2 minutes

✅ Your app is now live at a URL like: `https://bontiland.vercel.app`

Every time you push changes to GitHub, Vercel automatically updates the live site.

---

## 📁 Project structure

```
bontiland/
├── app/
│   ├── page.tsx          ← Dashboard (home screen)
│   ├── fluency/
│   │   └── page.tsx      ← Fluency Mode
│   ├── anti-block/
│   │   └── page.tsx      ← Anti-Block Mode
│   ├── focus/
│   │   └── page.tsx      ← Focus Timer Mode
│   ├── layout.tsx        ← App wrapper (fonts, metadata)
│   └── globals.css       ← All styles
├── lib/
│   ├── store.ts          ← Data storage (localStorage)
│   ├── phrases.ts        ← All English phrases & topics
│   └── speech.ts         ← Text-to-speech & microphone
├── public/
│   └── manifest.json     ← PWA config
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 🎮 How to use BontiLand

### Daily habit (10 minutes)
1. Open BontiLand
2. Hit **"Fluency Mode"** — do 8 phrases
3. Do one **Anti-Block** 60-second topic
4. Check your streak 🔥

### When you're in a hurry (5 minutes)
1. Just do Fluency Mode
2. Even 4 phrases is better than zero

### When you want a challenge
1. Go to **Focus Mode**
2. Pick 15 minutes
3. Speak the whole time without stopping

---

## 📊 XP & Level System

| Action | XP |
|--------|----|
| Each fluency phrase | +10 XP |
| Each second talking | +1 XP |
| Full 60s anti-block | +70 XP |
| 5-min focus session | +300 XP |

**Levels:** Every 500 XP = new level. Level names: Beginner → Explorer → Communicator → Fluent → Confident → Expert → Master → Legend

---

## 🌐 Browser compatibility

| Browser | Speech Recognition | Text-to-Speech |
|---------|--------------------|----------------|
| Chrome ✅ | ✅ Works great | ✅ Works great |
| Safari (iOS) 🟡 | Limited | ✅ Works |
| Firefox ❌ | Not supported | ✅ Works |
| Edge ✅ | ✅ Works | ✅ Works |

**Recommendation: Use Chrome for the best experience.**

If speech recognition doesn't work, you can still use BontiLand — just tap "Skip mic" and manually confirm you said the phrase.

---

## 🔮 Future Improvements

- [ ] AI feedback on pronunciation
- [ ] Custom phrase collections (add your own)
- [ ] Conversation partner simulation (Claude API)
- [ ] Weekly reports with progress charts
- [ ] Offline mode (PWA with service worker)
- [ ] Spaced repetition for weakest phrases
- [ ] Video recording option to watch yourself
- [ ] Difficulty levels (beginner → advanced phrases)
- [ ] Community phrase packs

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Storage:** localStorage (no backend needed)
- **Speech:** Web Speech API (native browser)
- **Deploy:** Vercel
- **Fonts:** Syne + DM Sans (Google Fonts)

---

## GitHub Repository Info

**Suggested name:** `bontiland`
**Description:** Daily English fluency trainer for ADHD learners. Speak, don't translate.
**Topics/Tags:** `english-learning`, `fluency`, `adhd`, `nextjs`, `web-speech-api`, `language-learning`, `pwa`

---

*Built for personal use. Speak every day. Think in English. 🇺🇸*
