# Viral Hook AI 🎯

> AI-powered viral hook, caption & strategy generator for TikTok, Instagram Reels, and YouTube Shorts.

Upload a video storyboard → get algorithmically-optimized hooks, captions, hashtags, and posting strategies — powered by Google Gemini AI.

---

## ✨ Features

- 🎬 **Storyboard Analysis** — Upload frames from your video for deep AI analysis
- 🪝 **Hook Generator** — Get 5–12 word on-screen text hooks with psychological triggers
- 📱 **Multi-Platform Captions** — Tailored captions for TikTok, Instagram Reels & YouTube Shorts
- 📊 **Viral Score Engine** — Rates your content on hook strength, shareability, emotional impact
- 🔑 **Bring Your Own Key** — Use your own Gemini API key securely in-browser
- 💬 **Iterative Refinement** — Chat with the AI to refine results

---

## 🚀 Deploy to Netlify

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/amishardev/viral-hook-ai-)

### Manual Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/amishardev/viral-hook-ai-.git
   cd viral-hook-ai-
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy `.env.example` to `.env` and fill in your Gemini API key:
   ```bash
   cp .env.example .env
   ```
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run locally**
   ```bash
   npm run dev
   ```

5. **Deploy to Netlify**

   - Push to GitHub
   - Connect your repo at [app.netlify.com](https://app.netlify.com)
   - Set the **Build command**: `npm run build:client`
   - Set the **Publish directory**: `dist`
   - Add your `GEMINI_API_KEY` as an environment variable in Netlify → Site Settings → Environment Variables

---

## 🔑 Getting a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **Create API Key**
3. Copy the key and add it to your Netlify environment variables

> You can also enter your API key directly in the app's Settings panel — it stays in your browser and is never stored on any server.

---

## 🏗️ Tech Stack

| Layer      | Technology                |
|------------|---------------------------|
| Frontend   | React 19 + Vite + TailwindCSS v4 |
| AI         | Google Gemini 2.0 Flash (Vision) |
| Hosting    | Netlify (Static + Functions) |
| Language   | TypeScript                |

---

## 📁 Project Structure

```
├── src/                    # React frontend source
│   ├── App.tsx             # Main application
│   ├── components/         # UI components
│   └── types.ts            # TypeScript types
├── netlify/
│   └── functions/
│       └── analyze.ts      # Serverless API function
├── netlify.toml            # Netlify build & routing config
├── vite.config.ts          # Vite configuration
└── .env.example            # Environment variable template
```

---

## 📄 License

MIT
