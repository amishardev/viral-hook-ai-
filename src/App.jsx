import React, { useState, useEffect, useRef, useCallback } from 'react';

/* ═══════════════════════════════════════════════════════════════
   VIRAL AI — Complete Single-File Application
   AI-Powered Short-Form Video Caption & Strategy Tool
   ═══════════════════════════════════════════════════════════════ */

// ── Constants ──────────────────────────────────────────────────
const STORAGE_KEY = 'viralai_key';
const MAX_VIDEO_DURATION = 180;

function calculateTargetFrames(durationSeconds) {
  if (durationSeconds <= 15) return 12;
  if (durationSeconds <= 30) return 16;
  if (durationSeconds <= 60) return 20;
  if (durationSeconds <= 90) return 25;
  if (durationSeconds <= 120) return 30;
  return 40;
}

function getGridLayout(frameCount) {
  if (frameCount <= 12) return { cols: 4, rows: 3 };
  if (frameCount <= 16) return { cols: 4, rows: 4 };
  if (frameCount <= 20) return { cols: 5, rows: 4 };
  if (frameCount <= 25) return { cols: 5, rows: 5 };
  if (frameCount <= 30) return { cols: 6, rows: 5 };
  return { cols: 8, rows: 5 };
}

// ── Gemini Prompts ─────────────────────────────────────────────
const MASTER_SYSTEM_PROMPT = `You are VIRAL AI — the world's most sophisticated short-form video strategist. You are not a generic caption generator. You are a deep algorithmic analyst who understands exactly how TikTok, Instagram Reels, and YouTube Shorts rank and distribute content.

You have been given a storyboard image: a single image containing multiple frames extracted at equal time intervals from a short-form video. The frames are arranged in a grid from left to right, top to bottom, representing the video's visual narrative from beginning to end. Study this storyboard intensely before generating any output.

YOUR ALGORITHMIC KNOWLEDGE BASE:

UNIVERSAL TRUTH: The recommendation algorithm for all three platforms operates on a SEED AUDIENCE TEST. The first 200-400 users who see a video determine its fate. If they swipe away, the video dies. If they engage, it escalates to millions. This makes the HOOK (first 3 seconds) the single most critical element.

COMPLETION RATE IS KING: Across TikTok, Instagram Reels, and YouTube Shorts, the percentage of the video watched is the master ranking signal. A video watched 100% by 1,000 people beats a video watched 30% by 100,000 people in algorithmic value. Every caption, hook, and description you generate must be engineered to REDUCE SWIPE-AWAYS and MAXIMIZE WATCH-THROUGH.

TIKTOK ALGORITHM INTELLIGENCE:
- Completion rate is the #1 signal (70%+ = viral threshold)
- Saves and DM shares rank above likes
- The "payoff-first" hook format performs 2x better than slow narrative setups
- Tri-layer keyword alignment required: spoken audio + on-screen text + written caption must semantically agree
- 3-5 hashtags maximum — more dilutes the NLP signal and confuses audience matching
- Long-tail keywords outperform generic ones for search discovery
- Optimal caption: 100-150 visible characters, then optional extended context
- TikTok SEO: write captions as if someone would search for this topic on Google

INSTAGRAM REELS ALGORITHM INTELLIGENCE:
- Skip rate (swiping away in first 3 seconds) is the #1 negative signal — fatal if >50% of seed audience skips
- DM shares are the strongest positive signal
- Save rate indicates high-value, reference-worthy content
- The UTIS model now detects if users genuinely enjoyed a video vs. watched out of frustration
- No TikTok watermarks (automatic severe downranking)
- Strong Caption Format: Hook (first 125 visible chars) -> Body -> CTA -> 3-5 hashtags at absolute end
- Instagram captions can be narrative and emotional (up to 2,200 chars)
- Shares to DMs > Saves > Comments > Likes (in order of algorithmic weight)

YOUTUBE SHORTS ALGORITHM INTELLIGENCE:
- VVSA (Viewed vs. Swiped Away): Top performers achieve 75-80% view rate. Below 50% = distribution stopped.
- APV (Average Percentage Viewed): Must exceed 80% for 45-60 second Shorts
- Loop engineering: videos that end where they begin achieve 100%+ retention
- The 30-second checkpoint: retaining viewers past 30 seconds flags the video as "high-satisfaction"
- Title SEO is critical — YouTube Shorts can rank on Google Search first page
- Title formula: [Primary Keyword] + [Emotional Trigger] + [Year/Context]
- Only ~60 characters visible in mobile title — front-load keywords
- Include #Shorts hashtag in description
- Description = SEO metadata: include keywords, internal links, 3-5 hashtags at bottom

HOOK GENERATION RULES (applies to all platforms):
A "hook" is a short text string (5-12 words) designed to be displayed ON SCREEN in the first 2-3 seconds. It is NOT the caption. Hooks must:
1. Create immediate curiosity, shock, or desire
2. NOT give away the ending
3. Be written at a 5th-grade reading level
4. Use pattern interrupt language
5. Be tailored specifically to the video's actual content

ANTI-CRINGE RULES — NEVER GENERATE:
- "Just dropped this", "Who's ready for this?", "Tag a friend", "Dream big", "Follow for more"
- "Double tap if you agree", "Only real ones will understand"
- Generic inspiration quotes disconnected from the video
- Emoji spam (maximum 2 emojis per caption)
- Fake urgency unrelated to content

QUALITY STANDARD: Every caption, hook, and description must sound like it was written by a creator who averages 10 million views per video.

OUTPUT FORMAT: You must respond with a valid JSON object following the exact schema specified in the user prompt. No markdown, no explanations outside the JSON structure.`;

function buildUserContextPrompt(userContext, videoDuration, platformTargets) {
  return `STORYBOARD ANALYSIS REQUEST:

Video Duration: ${videoDuration} seconds
Target Platforms: ${platformTargets.join(', ')}
Creator Context (provided by user): ${userContext || "Not provided — analyze purely from visual storyboard"}

TASK: Study the storyboard image carefully. Identify:
1. The visual genre/category of this content
2. The emotional arc from frame 1 to the final frame
3. Key visual moments that could serve as hook points
4. The pacing style (fast cuts = high energy, slow transitions = cinematic/narrative)
5. Whether faces are present (personality-driven vs. faceless content)
6. Any visible text overlays that reveal the creator's intent
7. Color palette and mood

Then generate the complete analysis in this EXACT JSON format:

{
  "videoIntelligence": {
    "detectedCategory": "string",
    "visualMood": "string",
    "pacingStyle": "string (fast-cut / narrative / cinematic / tutorial / showcase)",
    "emotionalArc": "string",
    "contentStrengths": ["string", "string", "string"],
    "algorithmicRisks": ["string", "string"],
    "estimatedViralPotential": "number (0-100)"
  },
  "viralScores": {
    "hookStrength": "number (0-100)",
    "retentionPotential": "number (0-100)",
    "shareability": "number (0-100)",
    "curiosityFactor": "number (0-100)",
    "emotionalImpact": "number (0-100)",
    "overallViralScore": "number (0-100)",
    "scoreReasoning": "string explaining the scores"
  },
  "hooks": [
    {
      "text": "string (5-12 words, for on-screen display)",
      "psychologicalTrigger": "string",
      "platformBestFor": "string",
      "strengthScore": "number (0-100)",
      "placementAdvice": "string"
    }
  ],
  "tiktok": {
    "captions": [
      {
        "text": "string (100-150 chars max)",
        "hookType": "string",
        "estimatedEngagement": "string (low/medium/high/viral)"
      }
    ],
    "description": "string (full TikTok caption with CTA, 150-300 chars)",
    "hashtags": ["string"],
    "bestPostingTime": "string",
    "seoCaptionAdvice": "string",
    "algorithmTip": "string"
  },
  "instagram": {
    "captions": [
      {
        "text": "string (first 125 chars = hook, then extended body)",
        "hookType": "string",
        "estimatedEngagement": "string"
      }
    ],
    "description": "string (full Instagram caption with story + CTA, up to 300 chars)",
    "hashtags": ["string"],
    "bestPostingTime": "string",
    "saveTriggerAdvice": "string",
    "shareTriggerAdvice": "string",
    "algorithmTip": "string"
  },
  "youtube": {
    "titles": [
      {
        "text": "string (max 60 chars, SEO + emotional trigger)",
        "keywordFocus": "string",
        "estimatedCTR": "string"
      }
    ],
    "description": "string (SEO-optimized description, 150-300 chars)",
    "hashtags": ["#Shorts", "string", "string", "string"],
    "bestPostingTime": "string",
    "seoKeywords": ["string"],
    "loopEngineeringTip": "string",
    "algorithmTip": "string"
  },
  "contentStrategy": {
    "primaryPlatformRecommendation": "string",
    "crossPostingOrder": "string",
    "repurposingIdeas": ["string", "string"],
    "followUpContentIdeas": ["string", "string", "string"],
    "audienceRetentionTip": "string"
  }
}

CRITICAL: Respond with ONLY the JSON object. No preamble, no explanation, no markdown code fences. Pure JSON only.`;
}

// ── Toast Notification Component ───────────────────────────────
function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="vai-toast">
      {message}
    </div>
  );
}

// ── Score Bar Component ────────────────────────────────────────
function ScoreBar({ label, score, delay = 0 }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(score), 100 + delay);
    return () => clearTimeout(t);
  }, [score, delay]);
  const color = score < 40 ? '#ff4444' : score < 70 ? '#ff9900' : '#4ade80';
  return (
    <div className="vai-score-bar">
      <div className="vai-score-bar__header">
        <span className="vai-score-bar__label">{label}</span>
        <span className="vai-score-bar__value" style={{ color }}>{score}/100</span>
      </div>
      <div className="vai-score-bar__track">
        <div
          className="vai-score-bar__fill"
          style={{ width: `${width}%`, background: color, transition: `width 0.8s cubic-bezier(0.22,1,0.36,1) ${delay}ms` }}
        />
      </div>
    </div>
  );
}

// ── Circular Score Ring ────────────────────────────────────────
function ScoreRing({ score, size = 120, strokeWidth = 8, label }) {
  const [animScore, setAnimScore] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnimScore(score), 200);
    return () => clearTimeout(t);
  }, [score]);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animScore / 100) * circumference;
  const color = score < 40 ? '#ff4444' : score < 70 ? '#ff9900' : '#4ade80';
  return (
    <div className="vai-score-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--border)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1)', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
        />
      </svg>
      <div className="vai-score-ring__inner">
        <span className="vai-score-ring__number" style={{ color }}>{animScore}</span>
        {label && <span className="vai-score-ring__label">{label}</span>}
      </div>
    </div>
  );
}

// ── Platform Icon ──────────────────────────────────────────────
function PlatformIcon({ platform, size = 16 }) {
  const icons = {
    tiktok: '♪',
    instagram: '◎',
    youtube: '▶',
  };
  const colors = {
    tiktok: '#ff0050',
    instagram: '#e1306c',
    youtube: '#ff0000',
  };
  return (
    <span style={{ fontSize: size, color: colors[platform] || '#fff', marginRight: 4, fontWeight: 700 }}>
      {icons[platform] || '•'}
    </span>
  );
}

// ── Copy Button ────────────────────────────────────────────────
function CopyBtn({ text, label, onCopied }) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      onCopied('Copied! ✓');
    } catch {
      onCopied('Copy failed');
    }
  };
  return (
    <button className="vai-copy-btn" onClick={handleCopy} title={label || 'Copy'}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
      </svg>
      {label && <span style={{ marginLeft: 4, fontSize: 11 }}>{label}</span>}
    </button>
  );
}

// ── Engagement Badge ───────────────────────────────────────────
function EngagementBadge({ level }) {
  const map = {
    low: { bg: 'rgba(255,68,68,0.15)', color: '#ff4444', text: 'Low' },
    medium: { bg: 'rgba(255,153,0,0.15)', color: '#ff9900', text: 'Medium' },
    high: { bg: 'rgba(74,222,128,0.15)', color: '#4ade80', text: 'High' },
    viral: { bg: 'rgba(255,215,0,0.15)', color: '#ffd700', text: '🔥 Viral' },
  };
  const s = map[level?.toLowerCase()] || map.medium;
  return (
    <span className="vai-badge" style={{ background: s.bg, color: s.color }}>{s.text}</span>
  );
}

// ── Hashtag Pill ───────────────────────────────────────────────
function HashtagPill({ tag, onCopied }) {
  const fullTag = tag.startsWith('#') ? tag : `#${tag}`;
  return (
    <button className="vai-hashtag" onClick={async () => { await navigator.clipboard.writeText(fullTag); onCopied('Copied! ✓'); }}>
      {fullTag}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function App() {
  // ── State ──
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(STORAGE_KEY) || '');
  const [keyInput, setKeyInput] = useState(() => localStorage.getItem(STORAGE_KEY) || '');
  const [showKey, setShowKey] = useState(false);
  const [view, setView] = useState(() => localStorage.getItem(STORAGE_KEY) ? 'main' : 'onboarding');
  const [videoFile, setVideoFile] = useState(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoAspect, setVideoAspect] = useState('portrait');
  const [frames, setFrames] = useState([]);
  const [storyboardBase64, setStoryboardBase64] = useState('');
  const [storyboardUrl, setStoryboardUrl] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [platformTab, setPlatformTab] = useState('tiktok');
  const [analysisData, setAnalysisData] = useState(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState(['tiktok', 'instagram', 'youtube']);
  const [toasts, setToasts] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [generatingStep, setGeneratingStep] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // ── Toast helper ──
  const addToast = useCallback((msg) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg }]);
  }, []);

  // ── Auto-scroll chat ──
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating, processingStep]);

  // ── Generating step animation ──
  useEffect(() => {
    if (!isGenerating) { setGeneratingStep(0); return; }
    const steps = [
      'Studying your visual narrative...',
      'Cross-referencing platform algorithms...',
      'Engineering captions for maximum reach...',
      'Analyzing hook potential...',
      'Optimizing for each platform...',
    ];
    let idx = 0;
    setGeneratingStep(0);
    const iv = setInterval(() => {
      idx = (idx + 1) % steps.length;
      setGeneratingStep(idx);
    }, 1500);
    return () => clearInterval(iv);
  }, [isGenerating]);

  const generatingMessages = [
    'Studying your visual narrative...',
    'Cross-referencing platform algorithms...',
    'Engineering captions for maximum reach...',
    'Analyzing hook potential...',
    'Optimizing for each platform...',
  ];

  // ── Save API key ──
  const saveApiKey = () => {
    if (!keyInput.trim()) return;
    localStorage.setItem(STORAGE_KEY, keyInput.trim());
    setApiKey(keyInput.trim());
    setView('main');
  };

  // ── Toggle platform ──
  const togglePlatform = (p) => {
    setSelectedPlatforms(prev => {
      if (prev.includes(p)) {
        if (prev.length === 1) return prev;
        return prev.filter(x => x !== p);
      }
      return [...prev, p];
    });
  };

  // ── Frame extraction ──
  const extractFrames = useCallback(async (file) => {
    setIsProcessing(true);
    setProcessingStep('📂 Loading video metadata...');
    setMessages(prev => [...prev, { role: 'ai', type: 'processing', content: '🎬 Processing your video...' }]);

    const url = URL.createObjectURL(file);
    setVideoUrl(url);

    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'auto';
      video.muted = true;
      video.playsInline = true;
      video.src = url;

      video.onloadedmetadata = async () => {
        const duration = video.duration;
        if (duration > MAX_VIDEO_DURATION) {
          setIsProcessing(false);
          setMessages(prev => {
            const filtered = prev.filter(m => m.type !== 'processing');
            return [...filtered, { role: 'ai', content: `⚠️ This video is ${Math.round(duration)} seconds long. Please use videos under 3 minutes for best results.` }];
          });
          reject(new Error('Video too long'));
          return;
        }

        setVideoDuration(duration);
        const isPortrait = video.videoHeight > video.videoWidth;
        setVideoAspect(isPortrait ? 'portrait' : 'landscape');

        const targetFrames = calculateTargetFrames(duration);
        const frameW = isPortrait ? 180 : 320;
        const frameH = isPortrait ? 320 : 180;

        const canvas = document.createElement('canvas');
        canvas.width = frameW;
        canvas.height = frameH;
        const ctx = canvas.getContext('2d');

        const extractedFrames = [];

        for (let i = 0; i < targetFrames; i++) {
          const timestamp = (i / targetFrames) * duration;
          setProcessingStep(`📸 Extracting frame ${i + 1} of ${targetFrames}...`);

          try {
            const frameData = await new Promise((res, rej) => {
              video.currentTime = timestamp;
              const onSeeked = () => {
                video.removeEventListener('seeked', onSeeked);
                ctx.drawImage(video, 0, 0, frameW, frameH);
                res(canvas.toDataURL('image/jpeg', 0.85));
              };
              video.addEventListener('seeked', onSeeked);
              setTimeout(() => rej(new Error('Seek timeout')), 5000);
            });
            extractedFrames.push({ data: frameData, timestamp: Math.round(timestamp) });
          } catch (e) {
            console.warn(`Frame ${i} extraction failed`, e);
          }
        }

        setFrames(extractedFrames);
        setProcessingStep('🎨 Composing storyboard...');

        // Build storyboard
        const { cols, rows } = getGridLayout(extractedFrames.length);
        const GAP = 8;
        const LABEL_H = 18;
        const sW = cols * (frameW + GAP) + GAP;
        const sH = rows * (frameH + GAP + LABEL_H) + GAP;
        const sCanvas = document.createElement('canvas');
        sCanvas.width = sW;
        sCanvas.height = sH;
        const sCtx = sCanvas.getContext('2d');
        sCtx.fillStyle = '#0a0a0a';
        sCtx.fillRect(0, 0, sW, sH);

        for (let idx = 0; idx < extractedFrames.length; idx++) {
          const col = idx % cols;
          const row = Math.floor(idx / cols);
          const x = GAP + col * (frameW + GAP);
          const y = GAP + row * (frameH + GAP + LABEL_H);

          const img = new Image();
          await new Promise((res) => { img.onload = res; img.src = extractedFrames[idx].data; });

          // rounded corners via clipping
          sCtx.save();
          const r = 4;
          sCtx.beginPath();
          sCtx.moveTo(x + r, y);
          sCtx.lineTo(x + frameW - r, y);
          sCtx.quadraticCurveTo(x + frameW, y, x + frameW, y + r);
          sCtx.lineTo(x + frameW, y + frameH - r);
          sCtx.quadraticCurveTo(x + frameW, y + frameH, x + frameW - r, y + frameH);
          sCtx.lineTo(x + r, y + frameH);
          sCtx.quadraticCurveTo(x, y + frameH, x, y + frameH - r);
          sCtx.lineTo(x, y + r);
          sCtx.quadraticCurveTo(x, y, x + r, y);
          sCtx.closePath();
          sCtx.clip();
          sCtx.drawImage(img, x, y, frameW, frameH);
          sCtx.restore();

          // timestamp label
          sCtx.fillStyle = '#888';
          sCtx.font = '11px "DM Mono", monospace';
          sCtx.textAlign = 'center';
          sCtx.fillText(`${extractedFrames[idx].timestamp}s`, x + frameW / 2, y + frameH + 13);
        }

        const sbData = sCanvas.toDataURL('image/png');
        const sbBase64 = sbData.replace(/^data:image\/png;base64,/, '');
        setStoryboardBase64(sbBase64);
        setStoryboardUrl(sbData);

        setProcessingStep('✅ Storyboard ready!');
        setIsProcessing(false);
        setMessages(prev => {
          const filtered = prev.filter(m => m.type !== 'processing');
          return [
            ...filtered,
            {
              role: 'ai',
              content: `I've analyzed your video (${Math.round(duration)}s, ${extractedFrames.length} frames extracted). Tell me more about your video for better results — what's it about, who's your target audience, what song or vibe does it have?\n\nOr just press Generate to get captions now.`
            }
          ];
        });
        resolve(extractedFrames);
      };

      video.onerror = () => {
        setIsProcessing(false);
        setMessages(prev => {
          const filtered = prev.filter(m => m.type !== 'processing');
          return [...filtered, { role: 'ai', content: '❌ Frame extraction encountered an issue. Try a different video format (MP4, MOV, or WEBM).' }];
        });
        reject(new Error('Video load error'));
      };
    });
  }, []);

  // ── File handler ──
  const handleFile = useCallback((file) => {
    if (!file) return;
    const validTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-matroska'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp4|mov|webm|mkv)$/i)) {
      addToast('Please upload MP4, MOV, or WEBM video');
      return;
    }
    setVideoFile(file);
    setFrames([]);
    setStoryboardBase64('');
    setStoryboardUrl('');
    setAnalysisData(null);
    setMessages([]);
    extractFrames(file).catch(() => {});
  }, [extractFrames, addToast]);

  // ── Drop handlers ──
  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  }, [handleFile]);

  const onDragOver = useCallback((e) => { e.preventDefault(); setDragOver(true); }, []);
  const onDragLeave = useCallback(() => setDragOver(false), []);

  // ── Call Gemini API ──
  const callGemini = useCallback(async (userText, retry = false) => {
    if (!storyboardBase64) { addToast('Please upload a video first'); return; }
    if (!apiKey) { setView('onboarding'); return; }

    const userMsg = userText.trim() || 'Generate viral captions and strategy for this video.';
    if (!retry) {
      setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    }
    setIsGenerating(true);
    setInputText('');

    const contextPrompt = buildUserContextPrompt(userMsg, Math.round(videoDuration), selectedPlatforms);

    // Build conversation history
    const previousMessages = messages.filter(m => m.type !== 'processing');
    const historyContents = previousMessages.map(m => ({
      role: m.role === 'ai' ? 'model' : 'user',
      parts: [{ text: m.content || (m.parsedData ? 'Previous analysis results' : '') }]
    }));

    const currentParts = [
      { text: MASTER_SYSTEM_PROMPT },
      { inline_data: { mime_type: 'image/png', data: storyboardBase64 } },
      { text: contextPrompt + (retry ? '\n\nIMPORTANT: Your previous response was not valid JSON. Return ONLY the JSON object with no other text, no markdown code fences.' : '') }
    ];

    const body = {
      contents: [
        ...historyContents,
        { role: 'user', parts: currentParts }
      ],
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json'
      }
    };

    try {
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
      );

      if (resp.status === 429) {
        setIsGenerating(false);
        setMessages(prev => [...prev, { role: 'ai', content: '⏳ The AI is busy right now. Please wait 30 seconds and try again.' }]);
        return;
      }
      if (resp.status === 400 || resp.status === 403) {
        setIsGenerating(false);
        setMessages(prev => [...prev, { role: 'ai', content: '🔑 Your Gemini API key appears to be invalid. Please check it in settings.' }]);
        return;
      }
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}`);
      }

      const data = await resp.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Empty response');

      const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(clean);

      setAnalysisData(parsed);
      setIsGenerating(false);
      setMessages(prev => [...prev, { role: 'ai', type: 'analysis', content: 'Here\'s your viral strategy:', parsedData: parsed }]);

    } catch (e) {
      console.error('Gemini error:', e);
      if (!retry && e instanceof SyntaxError) {
        // JSON parse failure — retry once
        callGemini(userText, true);
        return;
      }
      setIsGenerating(false);
      setMessages(prev => [...prev, { role: 'ai', content: `❌ ${e.message === 'Failed to fetch' ? 'Connection error. Please check your internet connection.' : 'Something went wrong. Please try again.'}` }]);
    }
  }, [storyboardBase64, apiKey, videoDuration, selectedPlatforms, messages, addToast]);

  // ── Send message ──
  const sendMessage = useCallback(() => {
    const text = inputText.trim();
    if (!text && !storyboardBase64) return;
    callGemini(text);
  }, [inputText, callGemini, storyboardBase64]);

  // ── Key press ──
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Auto-resize textarea ──
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
    }
  }, [inputText]);

  // ── Export all ──
  const exportAll = useCallback(() => {
    if (!analysisData) return;
    const d = analysisData;
    let out = '═══ VIRAL AI — COMPLETE STRATEGY ═══\n\n';

    if (d.hooks?.length) {
      out += '🎣 HOOKS:\n';
      d.hooks.forEach((h, i) => { out += `${i + 1}. ${h.text}\n`; });
      out += '\n';
    }
    if (d.tiktok) {
      out += '♪ TIKTOK:\n';
      d.tiktok.captions?.forEach((c, i) => { out += `Caption ${i + 1}: ${c.text}\n`; });
      out += `Description: ${d.tiktok.description || ''}\n`;
      out += `Hashtags: ${(d.tiktok.hashtags || []).map(h => h.startsWith('#') ? h : '#' + h).join(' ')}\n\n`;
    }
    if (d.instagram) {
      out += '◎ INSTAGRAM:\n';
      d.instagram.captions?.forEach((c, i) => { out += `Caption ${i + 1}: ${c.text}\n`; });
      out += `Description: ${d.instagram.description || ''}\n`;
      out += `Hashtags: ${(d.instagram.hashtags || []).map(h => h.startsWith('#') ? h : '#' + h).join(' ')}\n\n`;
    }
    if (d.youtube) {
      out += '▶ YOUTUBE SHORTS:\n';
      d.youtube.titles?.forEach((t, i) => { out += `Title ${i + 1}: ${t.text}\n`; });
      out += `Description: ${d.youtube.description || ''}\n`;
      out += `Hashtags: ${(d.youtube.hashtags || []).join(' ')}\n`;
      out += `Keywords: ${(d.youtube.seoKeywords || []).join(', ')}\n\n`;
    }
    if (d.contentStrategy) {
      out += '💡 STRATEGY:\n';
      out += `Best Platform: ${d.contentStrategy.primaryPlatformRecommendation || ''}\n`;
      out += `Post Order: ${d.contentStrategy.crossPostingOrder || ''}\n`;
    }
    navigator.clipboard.writeText(out);
    addToast('All outputs copied! ✓');
  }, [analysisData, addToast]);

  // ════════════════════════════════════════════════════════════
  // RENDER — ANALYSIS RESULT INSIDE CHAT BUBBLE
  // ════════════════════════════════════════════════════════════
  const renderAnalysis = (data) => {
    if (!data) return null;
    const vi = data.videoIntelligence || {};
    const vs = data.viralScores || {};
    const hooks = data.hooks || [];
    const plat = data[platformTab] || {};
    const strategy = data.contentStrategy || {};

    return (
      <div className="vai-analysis">
        {/* Video Intelligence */}
        <div className="vai-analysis__section">
          <div className="vai-analysis__section-title">📊 CONTENT ANALYSIS</div>
          <div className="vai-analysis__meta">
            <span className="vai-badge" style={{ background: 'rgba(108,99,255,0.2)', color: '#6c63ff' }}>{vi.detectedCategory || 'Unknown'}</span>
            <span className="vai-badge" style={{ background: 'rgba(255,107,107,0.15)', color: '#ff6b6b' }}>{vi.pacingStyle || 'Mixed'}</span>
          </div>
          <div className="vai-analysis__mood">Mood: {vi.visualMood || 'N/A'}</div>
          <div className="vai-analysis__arc">{vi.emotionalArc || ''}</div>
          {vi.contentStrengths?.length > 0 && (
            <div className="vai-analysis__strengths">
              <span className="vai-label">Strengths:</span>
              {vi.contentStrengths.map((s, i) => <span key={i} className="vai-chip vai-chip--green">{s}</span>)}
            </div>
          )}
          {vi.algorithmicRisks?.length > 0 && (
            <div className="vai-analysis__risks">
              <span className="vai-label">Risks:</span>
              {vi.algorithmicRisks.map((r, i) => <span key={i} className="vai-chip vai-chip--red">{r}</span>)}
            </div>
          )}
        </div>

        {/* Viral Scores */}
        <div className="vai-analysis__section">
          <div className="vai-analysis__section-title">🎯 VIRAL SCORES</div>
          <div className="vai-scores-grid">
            <div className="vai-scores-grid__ring">
              <ScoreRing score={vs.overallViralScore || 0} label="Overall" />
            </div>
            <div className="vai-scores-grid__bars">
              <ScoreBar label="Hook Strength" score={vs.hookStrength || 0} delay={0} />
              <ScoreBar label="Retention" score={vs.retentionPotential || 0} delay={100} />
              <ScoreBar label="Shareability" score={vs.shareability || 0} delay={200} />
              <ScoreBar label="Curiosity" score={vs.curiosityFactor || 0} delay={300} />
              <ScoreBar label="Emotional" score={vs.emotionalImpact || 0} delay={400} />
            </div>
          </div>
          {vs.scoreReasoning && <div className="vai-analysis__reasoning">{vs.scoreReasoning}</div>}
        </div>

        {/* Hooks */}
        {hooks.length > 0 && (
          <div className="vai-analysis__section">
            <div className="vai-analysis__section-title">🎣 TOP HOOKS</div>
            <div className="vai-hooks-list">
              {hooks.map((h, i) => (
                <div key={i} className="vai-hook-card">
                  <div className="vai-hook-card__text">"{h.text}"</div>
                  <div className="vai-hook-card__meta">
                    <span className="vai-badge vai-badge--sm" style={{ background: 'rgba(108,99,255,0.15)', color: '#a89eff' }}>{h.psychologicalTrigger}</span>
                    <span className="vai-hook-card__score" style={{ color: h.strengthScore >= 70 ? '#4ade80' : '#ff9900' }}>{h.strengthScore}/100</span>
                    <CopyBtn text={h.text} onCopied={addToast} />
                  </div>
                  {h.placementAdvice && <div className="vai-hook-card__advice">{h.placementAdvice}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Platform Tabs */}
        <div className="vai-analysis__section">
          <div className="vai-platform-tabs">
            {['tiktok', 'instagram', 'youtube'].map(p => (
              <button key={p} className={`vai-platform-tab ${platformTab === p ? 'vai-platform-tab--active' : ''}`} onClick={() => setPlatformTab(p)}>
                <PlatformIcon platform={p} /> {p === 'youtube' ? 'YouTube' : p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          {/* TikTok Content */}
          {platformTab === 'tiktok' && data.tiktok && (
            <div className="vai-platform-content">
              <div className="vai-platform-content__header">
                <PlatformIcon platform="tiktok" size={20} />
                <span>TikTok Optimization</span>
              </div>
              {data.tiktok.captions?.map((c, i) => (
                <div key={i} className="vai-caption-card">
                  <div className="vai-caption-card__header">
                    <span className="vai-label">Caption {i + 1}</span>
                    <EngagementBadge level={c.estimatedEngagement} />
                  </div>
                  <div className="vai-caption-card__text">{c.text}</div>
                  <CopyBtn text={c.text} label="Copy" onCopied={addToast} />
                </div>
              ))}
              {data.tiktok.description && (
                <div className="vai-desc-block">
                  <div className="vai-label">Full Description</div>
                  <div className="vai-desc-block__text">{data.tiktok.description}</div>
                  <CopyBtn text={data.tiktok.description} label="Copy" onCopied={addToast} />
                </div>
              )}
              {data.tiktok.hashtags?.length > 0 && (
                <div className="vai-hashtags-block">
                  <div className="vai-label">Hashtags <CopyBtn text={data.tiktok.hashtags.map(h => h.startsWith('#') ? h : '#' + h).join(' ')} label="Copy all" onCopied={addToast} /></div>
                  <div className="vai-hashtags-row">{data.tiktok.hashtags.map((h, i) => <HashtagPill key={i} tag={h} onCopied={addToast} />)}</div>
                </div>
              )}
              {data.tiktok.bestPostingTime && <div className="vai-info-row"><span className="vai-label">⏰ Best Time:</span> {data.tiktok.bestPostingTime}</div>}
              {data.tiktok.algorithmTip && <div className="vai-tip-card"><span className="vai-tip-card__icon">💡</span><div><div className="vai-label">Algorithm Tip</div>{data.tiktok.algorithmTip}</div></div>}
              {data.tiktok.seoCaptionAdvice && <div className="vai-info-row"><span className="vai-label">🔍 SEO:</span> {data.tiktok.seoCaptionAdvice}</div>}
            </div>
          )}

          {/* Instagram Content */}
          {platformTab === 'instagram' && data.instagram && (
            <div className="vai-platform-content">
              <div className="vai-platform-content__header">
                <PlatformIcon platform="instagram" size={20} />
                <span>Instagram Reels Optimization</span>
              </div>
              {data.instagram.captions?.map((c, i) => (
                <div key={i} className="vai-caption-card">
                  <div className="vai-caption-card__header">
                    <span className="vai-label">Caption {i + 1}</span>
                    <EngagementBadge level={c.estimatedEngagement} />
                  </div>
                  <div className="vai-caption-card__text">{c.text}</div>
                  <CopyBtn text={c.text} label="Copy" onCopied={addToast} />
                </div>
              ))}
              {data.instagram.description && (
                <div className="vai-desc-block">
                  <div className="vai-label">Full Description</div>
                  <div className="vai-desc-block__text">{data.instagram.description}</div>
                  <CopyBtn text={data.instagram.description} label="Copy" onCopied={addToast} />
                </div>
              )}
              {data.instagram.hashtags?.length > 0 && (
                <div className="vai-hashtags-block">
                  <div className="vai-label">Hashtags <CopyBtn text={data.instagram.hashtags.map(h => h.startsWith('#') ? h : '#' + h).join(' ')} label="Copy all" onCopied={addToast} /></div>
                  <div className="vai-hashtags-row">{data.instagram.hashtags.map((h, i) => <HashtagPill key={i} tag={h} onCopied={addToast} />)}</div>
                </div>
              )}
              {data.instagram.bestPostingTime && <div className="vai-info-row"><span className="vai-label">⏰ Best Time:</span> {data.instagram.bestPostingTime}</div>}
              {data.instagram.saveTriggerAdvice && <div className="vai-tip-card vai-tip-card--save"><span className="vai-tip-card__icon">🔖</span><div><div className="vai-label">Save Trigger Strategy</div>{data.instagram.saveTriggerAdvice}</div></div>}
              {data.instagram.shareTriggerAdvice && <div className="vai-tip-card vai-tip-card--share"><span className="vai-tip-card__icon">📤</span><div><div className="vai-label">Share Trigger Strategy</div>{data.instagram.shareTriggerAdvice}</div></div>}
              {data.instagram.algorithmTip && <div className="vai-tip-card"><span className="vai-tip-card__icon">💡</span><div><div className="vai-label">Algorithm Tip</div>{data.instagram.algorithmTip}</div></div>}
            </div>
          )}

          {/* YouTube Content */}
          {platformTab === 'youtube' && data.youtube && (
            <div className="vai-platform-content">
              <div className="vai-platform-content__header">
                <PlatformIcon platform="youtube" size={20} />
                <span>YouTube Shorts Optimization</span>
              </div>
              {data.youtube.titles?.map((t, i) => (
                <div key={i} className="vai-caption-card">
                  <div className="vai-caption-card__header">
                    <span className="vai-label">Title {i + 1}</span>
                    {t.estimatedCTR && <span className="vai-badge" style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80' }}>CTR: {t.estimatedCTR}</span>}
                  </div>
                  <div className="vai-caption-card__text">{t.text}</div>
                  {t.keywordFocus && <div className="vai-caption-card__keyword">Keyword: {t.keywordFocus}</div>}
                  <CopyBtn text={t.text} label="Copy" onCopied={addToast} />
                </div>
              ))}
              {data.youtube.description && (
                <div className="vai-desc-block">
                  <div className="vai-label">SEO Description</div>
                  <div className="vai-desc-block__text">{data.youtube.description}</div>
                  <CopyBtn text={data.youtube.description} label="Copy" onCopied={addToast} />
                </div>
              )}
              {data.youtube.hashtags?.length > 0 && (
                <div className="vai-hashtags-block">
                  <div className="vai-label">Hashtags <CopyBtn text={data.youtube.hashtags.join(' ')} label="Copy all" onCopied={addToast} /></div>
                  <div className="vai-hashtags-row">{data.youtube.hashtags.map((h, i) => <HashtagPill key={i} tag={h} onCopied={addToast} />)}</div>
                </div>
              )}
              {data.youtube.seoKeywords?.length > 0 && (
                <div className="vai-hashtags-block">
                  <div className="vai-label">SEO Keywords</div>
                  <div className="vai-hashtags-row">{data.youtube.seoKeywords.map((k, i) => <span key={i} className="vai-chip">{k}</span>)}</div>
                </div>
              )}
              {data.youtube.bestPostingTime && <div className="vai-info-row"><span className="vai-label">⏰ Best Time:</span> {data.youtube.bestPostingTime}</div>}
              {data.youtube.loopEngineeringTip && <div className="vai-tip-card vai-tip-card--loop"><span className="vai-tip-card__icon">🔁</span><div><div className="vai-label">Loop Engineering Tip</div>{data.youtube.loopEngineeringTip}</div></div>}
              {data.youtube.algorithmTip && <div className="vai-tip-card"><span className="vai-tip-card__icon">💡</span><div><div className="vai-label">Algorithm Tip</div>{data.youtube.algorithmTip}</div></div>}
            </div>
          )}
        </div>

        {/* Content Strategy */}
        {strategy.primaryPlatformRecommendation && (
          <div className="vai-analysis__section">
            <div className="vai-analysis__section-title">🚀 CONTENT STRATEGY</div>
            <div className="vai-strategy-grid">
              <div className="vai-strategy-item">
                <div className="vai-label">Best Platform</div>
                <div className="vai-strategy-item__value">{strategy.primaryPlatformRecommendation}</div>
              </div>
              <div className="vai-strategy-item">
                <div className="vai-label">Cross-Post Order</div>
                <div className="vai-strategy-item__value">{strategy.crossPostingOrder}</div>
              </div>
            </div>
            {strategy.repurposingIdeas?.length > 0 && (
              <div className="vai-strategy-list">
                <div className="vai-label">Repurposing Ideas</div>
                {strategy.repurposingIdeas.map((idea, i) => <div key={i} className="vai-strategy-list__item">→ {idea}</div>)}
              </div>
            )}
            {strategy.followUpContentIdeas?.length > 0 && (
              <div className="vai-strategy-list">
                <div className="vai-label">Follow-Up Content Ideas</div>
                {strategy.followUpContentIdeas.map((idea, i) => <div key={i} className="vai-strategy-list__item">→ {idea}</div>)}
              </div>
            )}
            {strategy.audienceRetentionTip && (
              <div className="vai-tip-card"><span className="vai-tip-card__icon">🎯</span><div><div className="vai-label">Audience Retention Tip</div>{strategy.audienceRetentionTip}</div></div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="vai-analysis__actions">
          <button className="vai-btn vai-btn--secondary" onClick={() => callGemini('Regenerate with fresh variations — give me completely different captions and hooks.')}>
            🔄 Regenerate
          </button>
          <button className="vai-btn vai-btn--secondary" onClick={exportAll}>
            📋 Copy All Outputs
          </button>
        </div>
      </div>
    );
  };

  // ════════════════════════════════════════════════════════════
  // RENDER — VIEWS
  // ════════════════════════════════════════════════════════════

  // ── ONBOARDING VIEW ──
  if (view === 'onboarding') {
    return (
      <div className="vai-onboarding">
        <style>{appStyles}</style>
        <div className="vai-onboarding__card">
          <div className="vai-logo">VIRAL<span className="vai-logo__ai">AI</span></div>
          <p className="vai-onboarding__tagline">Upload. Analyze. Go Viral.</p>
          <p className="vai-onboarding__desc">Enter your Gemini API key to start analyzing videos and generating platform-specific viral strategies.</p>
          <div className="vai-onboarding__input-wrap">
            <input
              id="api-key-input"
              type={showKey ? 'text' : 'password'}
              className="vai-input"
              placeholder="Paste your Gemini API key"
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveApiKey()}
            />
            <button className="vai-onboarding__toggle" onClick={() => setShowKey(!showKey)}>
              {showKey ? '🙈' : '👁️'}
            </button>
          </div>
          <p className="vai-onboarding__privacy">🔒 Your API key is stored locally in your browser and never sent to our servers.</p>
          <button id="start-btn" className="vai-btn vai-btn--primary vai-btn--lg" onClick={saveApiKey} disabled={!keyInput.trim()}>
            Start Analyzing →
          </button>
          <a className="vai-onboarding__link" href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">
            Get a free Gemini API key →
          </a>
        </div>
      </div>
    );
  }

  // ── MAIN VIEW ──
  return (
    <div className="vai-app">
      <style>{appStyles}</style>

      {/* Header */}
      <header className="vai-header">
        <div className="vai-header__left">
          <div className="vai-logo vai-logo--sm">VIRAL<span className="vai-logo__ai">AI</span></div>
        </div>
        <div className="vai-header__right">
          <button className="vai-icon-btn" onClick={settingsOpen ? () => setSettingsOpen(false) : () => setSettingsOpen(true)} title="Settings">
            ⚙️
          </button>
        </div>
      </header>

      {/* Settings Slide-over */}
      {settingsOpen && (
        <div className="vai-settings-overlay" onClick={() => setSettingsOpen(false)}>
          <div className="vai-settings" onClick={e => e.stopPropagation()}>
            <div className="vai-settings__header">
              <span>Settings</span>
              <button className="vai-icon-btn" onClick={() => setSettingsOpen(false)}>✕</button>
            </div>
            <div className="vai-settings__body">
              <label className="vai-label">Gemini API Key</label>
              <div className="vai-onboarding__input-wrap">
                <input
                  type={showKey ? 'text' : 'password'}
                  className="vai-input"
                  value={keyInput}
                  onChange={e => setKeyInput(e.target.value)}
                />
                <button className="vai-onboarding__toggle" onClick={() => setShowKey(!showKey)}>
                  {showKey ? '🙈' : '👁️'}
                </button>
              </div>
              <button className="vai-btn vai-btn--primary" style={{ marginTop: 12 }} onClick={() => { saveApiKey(); setSettingsOpen(false); }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="vai-main">
        {/* ── Left Column: Video & Storyboard ── */}
        <div className="vai-panel vai-panel--left">
          <div className="vai-panel__title">
            <span className="vai-panel__icon">🎬</span> Video
          </div>

          {/* Upload Zone */}
          {!videoUrl ? (
            <div
              id="video-upload-zone"
              className={`vai-upload ${dragOver ? 'vai-upload--active' : ''}`}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm" style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0])} />
              <div className="vai-upload__icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <div className="vai-upload__text">Drop your Short, Reel or TikTok here</div>
              <div className="vai-upload__subtext">MP4, MOV, WEBM · Under 3 min</div>
            </div>
          ) : (
            <div className="vai-video-preview">
              <video src={videoUrl} controls className="vai-video-player" />
              <button className="vai-btn vai-btn--ghost vai-btn--sm" style={{ marginTop: 8 }} onClick={() => {
                setVideoFile(null); setVideoUrl(''); setFrames([]); setStoryboardBase64(''); setStoryboardUrl(''); setAnalysisData(null); setMessages([]);
              }}>
                Remove & Upload New
              </button>
            </div>
          )}

          {/* Processing indicator */}
          {isProcessing && (
            <div className="vai-processing">
              <div className="vai-processing__spinner" />
              <div className="vai-processing__text">{processingStep}</div>
            </div>
          )}

          {/* Storyboard */}
          {storyboardUrl && (
            <div className="vai-storyboard">
              <div className="vai-panel__title" style={{ marginTop: 16 }}>
                <span className="vai-panel__icon">📸</span> Visual Storyboard
              </div>
              <img src={storyboardUrl} alt="Video storyboard" className="vai-storyboard__img" />
            </div>
          )}
        </div>

        {/* ── Center Column: Chat ── */}
        <div className="vai-panel vai-panel--center">
          <div className="vai-chat">
            {/* Messages */}
            <div className="vai-chat__messages">
              {/* Welcome message */}
              {messages.length === 0 && !isProcessing && (
                <div className="vai-msg vai-msg--ai">
                  <div className="vai-msg__avatar">V</div>
                  <div className="vai-msg__bubble">
                    <div className="vai-msg__name">VIRAL AI</div>
                    <div className="vai-msg__content">
                      {videoUrl
                        ? 'Your video is loaded. I\'m ready to analyze it — tell me about your content, target audience, and vibe. Or just hit Generate!'
                        : 'Welcome! Upload a Short, Reel, or TikTok video to get started. I\'ll extract frames, build a visual storyboard, and generate platform-specific viral strategy powered by Gemini AI.'}
                    </div>
                  </div>
                </div>
              )}

              {messages.map((msg, i) => {
                if (msg.role === 'user') {
                  return (
                    <div key={i} className="vai-msg vai-msg--user">
                      <div className="vai-msg__bubble vai-msg__bubble--user">
                        <div className="vai-msg__content">{msg.content}</div>
                      </div>
                    </div>
                  );
                }
                // AI message
                return (
                  <div key={i} className="vai-msg vai-msg--ai">
                    <div className="vai-msg__avatar">V</div>
                    <div className="vai-msg__bubble">
                      <div className="vai-msg__name">VIRAL AI</div>
                      {msg.type === 'processing' ? (
                        <div className="vai-msg__content vai-msg__content--processing">
                          <div className="vai-processing__spinner vai-processing__spinner--sm" />
                          {processingStep || msg.content}
                        </div>
                      ) : msg.type === 'analysis' && msg.parsedData ? (
                        <div className="vai-msg__content">
                          {renderAnalysis(msg.parsedData)}
                        </div>
                      ) : (
                        <div className="vai-msg__content">{msg.content}</div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Generating indicator */}
              {isGenerating && (
                <div className="vai-msg vai-msg--ai">
                  <div className="vai-msg__avatar">V</div>
                  <div className="vai-msg__bubble">
                    <div className="vai-msg__name">VIRAL AI</div>
                    <div className="vai-msg__content vai-msg__content--processing">
                      <div className="vai-dots">
                        <span className="vai-dot" /><span className="vai-dot" /><span className="vai-dot" />
                      </div>
                      <span>{generatingMessages[generatingStep]}</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="vai-chat__input-area">
              {/* Platform selectors */}
              <div className="vai-platform-selector">
                {[
                  { key: 'tiktok', label: 'TikTok', icon: '♪' },
                  { key: 'instagram', label: 'Reels', icon: '◎' },
                  { key: 'youtube', label: 'Shorts', icon: '▶' },
                ].map(p => (
                  <button
                    key={p.key}
                    className={`vai-platform-pill ${selectedPlatforms.includes(p.key) ? 'vai-platform-pill--active' : ''}`}
                    onClick={() => togglePlatform(p.key)}
                  >
                    {p.icon} {p.label}
                  </button>
                ))}
              </div>
              <div className="vai-chat__input-row">
                <textarea
                  ref={textareaRef}
                  id="chat-input"
                  className="vai-textarea"
                  placeholder="Describe your video... e.g. 'EDM music edit, festival vibe, euphoric mood' (optional)"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  disabled={isGenerating || isProcessing}
                />
                <button
                  id="send-btn"
                  className="vai-send-btn"
                  onClick={sendMessage}
                  disabled={isGenerating || isProcessing || !storyboardBase64}
                  title={storyboardBase64 ? 'Generate' : 'Upload a video first'}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column: Quick Stats ── */}
        <div className="vai-panel vai-panel--right">
          <div className="vai-panel__title">
            <span className="vai-panel__icon">📈</span> Quick Stats
          </div>

          {analysisData ? (
            <div className="vai-stats">
              <div className="vai-stats__ring-wrap">
                <ScoreRing score={analysisData.viralScores?.overallViralScore || 0} size={140} label="Viral Score" />
              </div>

              <div className="vai-stats__platforms">
                {['tiktok', 'instagram', 'youtube'].map(p => {
                  const pData = analysisData[p];
                  const score = p === 'youtube'
                    ? (pData?.titles?.[0]?.estimatedCTR === 'High' ? 82 : pData?.titles?.[0]?.estimatedCTR === 'Very High' ? 90 : 65)
                    : (pData?.captions?.[0]?.estimatedEngagement === 'viral' ? 92 : pData?.captions?.[0]?.estimatedEngagement === 'high' ? 78 : 55);
                  return (
                    <div key={p} className="vai-stats__platform-row" onClick={() => setPlatformTab(p)}>
                      <PlatformIcon platform={p} />
                      <span className="vai-stats__platform-label">{p === 'youtube' ? 'YouTube' : p.charAt(0).toUpperCase() + p.slice(1)}</span>
                      <span className="vai-stats__platform-score" style={{ color: score >= 70 ? '#4ade80' : '#ff9900' }}>{score}</span>
                    </div>
                  );
                })}
              </div>

              {analysisData.videoIntelligence?.detectedCategory && (
                <div className="vai-stats__category">
                  <div className="vai-label">Category</div>
                  <span className="vai-badge" style={{ background: 'rgba(108,99,255,0.2)', color: '#6c63ff' }}>
                    {analysisData.videoIntelligence.detectedCategory}
                  </span>
                </div>
              )}

              {analysisData.hooks?.slice(0, 3).map((h, i) => (
                <div key={i} className="vai-stats__hook-chip">
                  <span className="vai-stats__hook-text">"{h.text}"</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="vai-stats vai-stats--empty">
              <div className="vai-stats__empty-icon">📊</div>
              <div className="vai-stats__empty-text">Upload a video and generate analysis to see viral scores and hooks.</div>
            </div>
          )}
        </div>
      </div>

      {/* Toasts */}
      <div className="vai-toasts">
        {toasts.map(t => (
          <Toast key={t.id} message={t.msg} onDone={() => setToasts(prev => prev.filter(x => x.id !== t.id))} />
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════
const appStyles = `
/* ── Layout ── */
.vai-app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  overflow: hidden;
}

.vai-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-secondary);
  flex-shrink: 0;
  z-index: 100;
}
.vai-header__left { display: flex; align-items: center; gap: 12px; }
.vai-header__right { display: flex; align-items: center; gap: 8px; }

.vai-main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* ── Panels ── */
.vai-panel {
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border);
  overflow-y: auto;
  padding: 20px;
}
.vai-panel--left { width: 30%; min-width: 280px; }
.vai-panel--center { width: 45%; border-right: 1px solid var(--border); padding: 0; }
.vai-panel--right { width: 25%; min-width: 220px; border-right: none; }
.vai-panel__title {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.vai-panel__icon { font-size: 14px; }

/* ── Logo ── */
.vai-logo {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 32px;
  letter-spacing: -1px;
  color: var(--text-primary);
}
.vai-logo--sm { font-size: 20px; }
.vai-logo__ai {
  background: linear-gradient(135deg, #6c63ff, #ff6b6b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-left: 2px;
}

/* ── Onboarding ── */
.vai-onboarding {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  background-image: radial-gradient(ellipse at 50% 0%, rgba(108,99,255,0.08) 0%, transparent 70%);
}
.vai-onboarding__card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 48px;
  max-width: 440px;
  width: 100%;
  text-align: center;
  box-shadow: 0 4px 48px rgba(108,99,255,0.08);
}
.vai-onboarding__tagline {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 400;
  color: var(--text-secondary);
  margin: 8px 0 24px;
  letter-spacing: 1px;
}
.vai-onboarding__desc {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 24px;
}
.vai-onboarding__input-wrap {
  position: relative;
  width: 100%;
}
.vai-onboarding__toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
}
.vai-onboarding__privacy {
  font-size: 12px;
  color: var(--text-muted);
  margin: 12px 0 20px;
}
.vai-onboarding__link {
  display: inline-block;
  margin-top: 16px;
  font-size: 13px;
  color: var(--accent-primary);
  text-decoration: none;
  transition: color 0.2s;
}
.vai-onboarding__link:hover { color: #8b85ff; text-decoration: underline; }

/* ── Inputs & Buttons ── */
.vai-input {
  width: 100%;
  padding: 14px 44px 14px 16px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 12px;
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.vai-input:focus {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(108,99,255,0.15);
}
.vai-input::placeholder { color: var(--text-muted); }

.vai-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 24px;
  border: none;
  border-radius: 100px;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.vai-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.vai-btn--primary {
  background: linear-gradient(135deg, #6c63ff, #5a52e0);
  color: #fff;
  box-shadow: 0 4px 16px rgba(108,99,255,0.3);
}
.vai-btn--primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #7b73ff, #6c63ff);
  box-shadow: 0 6px 24px rgba(108,99,255,0.4);
  transform: translateY(-1px);
}
.vai-btn--secondary {
  background: var(--bg-hover);
  color: var(--text-primary);
  border: 1px solid var(--border-bright);
}
.vai-btn--secondary:hover:not(:disabled) {
  background: var(--border-bright);
  transform: translateY(-1px);
}
.vai-btn--ghost {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border);
}
.vai-btn--ghost:hover { background: var(--bg-hover); color: var(--text-primary); }
.vai-btn--lg { padding: 14px 36px; font-size: 16px; }
.vai-btn--sm { padding: 6px 14px; font-size: 12px; }

.vai-icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 6px;
  border-radius: 8px;
  transition: background 0.2s;
  color: var(--text-secondary);
}
.vai-icon-btn:hover { background: var(--bg-hover); }

/* ── Upload Zone ── */
.vai-upload {
  border: 2px dashed var(--border-bright);
  border-radius: 16px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--bg-secondary);
}
.vai-upload:hover, .vai-upload--active {
  border-color: var(--accent-primary);
  background: rgba(108,99,255,0.05);
}
.vai-upload__icon { margin-bottom: 12px; opacity: 0.7; }
.vai-upload__text {
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
}
.vai-upload__subtext {
  font-size: 12px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

/* ── Video Preview ── */
.vai-video-preview { text-align: center; }
.vai-video-player {
  width: 100%;
  max-height: 280px;
  border-radius: 12px;
  background: #000;
  outline: none;
}

/* ── Processing ── */
.vai-processing {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin-top: 12px;
  background: var(--bg-secondary);
  border-radius: 10px;
  border: 1px solid var(--border);
}
.vai-processing__spinner {
  width: 20px; height: 20px;
  border: 2px solid var(--border-bright);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: vai-spin 0.8s linear infinite;
  flex-shrink: 0;
}
.vai-processing__spinner--sm { width: 14px; height: 14px; border-width: 2px; }
.vai-processing__text { font-size: 13px; color: var(--text-secondary); font-family: var(--font-mono); }
@keyframes vai-spin { to { transform: rotate(360deg); } }

/* ── Storyboard ── */
.vai-storyboard__img {
  width: 100%;
  border-radius: 10px;
  border: 1px solid var(--border);
  margin-top: 8px;
}

/* ── Chat ── */
.vai-chat {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.vai-chat__messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.vai-chat__input-area {
  flex-shrink: 0;
  border-top: 1px solid var(--border);
  padding: 12px 20px 16px;
  background: var(--bg-secondary);
}
.vai-chat__input-row {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.vai-textarea {
  flex: 1;
  padding: 12px 16px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 14px;
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 14px;
  resize: none;
  outline: none;
  min-height: 44px;
  max-height: 150px;
  line-height: 1.5;
  transition: border-color 0.2s;
}
.vai-textarea:focus { border-color: var(--accent-primary); }
.vai-textarea::placeholder { color: var(--text-muted); }
.vai-textarea:disabled { opacity: 0.5; }

.vai-send-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #6c63ff, #5a52e0);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
  box-shadow: 0 2px 12px rgba(108,99,255,0.3);
}
.vai-send-btn:hover:not(:disabled) { transform: scale(1.05); box-shadow: 0 4px 20px rgba(108,99,255,0.4); }
.vai-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* ── Platform Selector ── */
.vai-platform-selector {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
}
.vai-platform-pill {
  padding: 5px 12px;
  border-radius: 100px;
  font-size: 12px;
  font-family: var(--font-mono);
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
}
.vai-platform-pill--active {
  border-color: var(--accent-primary);
  background: rgba(108,99,255,0.1);
  color: var(--accent-primary);
}
.vai-platform-pill:hover { border-color: var(--border-bright); color: var(--text-secondary); }

/* ── Messages ── */
.vai-msg { display: flex; gap: 10px; animation: vai-fadeIn 0.3s ease; }
.vai-msg--user { justify-content: flex-end; }
.vai-msg--ai { justify-content: flex-start; }
@keyframes vai-fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

.vai-msg__avatar {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6c63ff, #5a52e0);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 14px;
  color: #fff;
  flex-shrink: 0;
}

.vai-msg__bubble {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 14px 18px;
  max-width: 85%;
  box-shadow: 0 2px 12px rgba(0,0,0,0.15);
}
.vai-msg__bubble--user {
  background: var(--bg-hover);
  border-color: var(--border-bright);
}
.vai-msg__name {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  color: var(--accent-primary);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 6px;
}
.vai-msg__content {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-primary);
  white-space: pre-wrap;
  word-break: break-word;
}
.vai-msg__content--processing {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: 13px;
}

/* ── Dots Animation ── */
.vai-dots { display: flex; gap: 4px; }
.vai-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--accent-primary);
  animation: vai-bounce 1.4s ease-in-out infinite both;
}
.vai-dot:nth-child(2) { animation-delay: 0.16s; }
.vai-dot:nth-child(3) { animation-delay: 0.32s; }
@keyframes vai-bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

/* ── Analysis ── */
.vai-analysis { display: flex; flex-direction: column; gap: 20px; }
.vai-analysis__section {
  border-top: 1px solid var(--border);
  padding-top: 16px;
}
.vai-analysis__section:first-child { border-top: none; padding-top: 0; }
.vai-analysis__section-title {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 500;
  color: var(--accent-primary);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 12px;
}
.vai-analysis__meta { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
.vai-analysis__mood { font-size: 13px; color: var(--text-secondary); margin-bottom: 4px; }
.vai-analysis__arc { font-size: 13px; color: var(--text-secondary); line-height: 1.5; }
.vai-analysis__strengths, .vai-analysis__risks { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-top: 8px; }
.vai-analysis__reasoning { font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin-top: 8px; font-style: italic; }
.vai-analysis__actions { display: flex; gap: 10px; flex-wrap: wrap; }

/* ── Scores Grid ── */
.vai-scores-grid { display: flex; gap: 20px; align-items: flex-start; }
.vai-scores-grid__ring { flex-shrink: 0; }
.vai-scores-grid__bars { flex: 1; display: flex; flex-direction: column; gap: 8px; }

/* ── Score Bar ── */
.vai-score-bar__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.vai-score-bar__label { font-size: 12px; color: var(--text-secondary); font-family: var(--font-mono); }
.vai-score-bar__value { font-size: 12px; font-weight: 600; font-family: var(--font-mono); }
.vai-score-bar__track {
  height: 6px;
  background: var(--bg-primary);
  border-radius: 3px;
  overflow: hidden;
}
.vai-score-bar__fill { height: 100%; border-radius: 3px; width: 0; }

/* ── Score Ring ── */
.vai-score-ring { position: relative; display: inline-flex; align-items: center; justify-content: center; }
.vai-score-ring__inner {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.vai-score-ring__number { font-family: var(--font-display); font-size: 28px; font-weight: 800; }
.vai-score-ring__label { font-family: var(--font-mono); font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }

/* ── Hooks ── */
.vai-hooks-list { display: flex; flex-direction: column; gap: 8px; }
.vai-hook-card {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px;
  transition: border-color 0.2s;
}
.vai-hook-card:hover { border-color: var(--border-bright); }
.vai-hook-card__text {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
  line-height: 1.3;
}
.vai-hook-card__meta { display: flex; align-items: center; gap: 8px; }
.vai-hook-card__score { font-family: var(--font-mono); font-size: 13px; font-weight: 600; }
.vai-hook-card__advice { font-size: 12px; color: var(--text-muted); margin-top: 8px; font-style: italic; }

/* ── Platform Tabs ── */
.vai-platform-tabs { display: flex; gap: 6px; margin-bottom: 16px; }
.vai-platform-tab {
  padding: 8px 16px;
  border-radius: 100px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
}
.vai-platform-tab--active {
  border-color: var(--accent-primary);
  background: rgba(108,99,255,0.1);
  color: var(--accent-primary);
}
.vai-platform-tab:hover:not(.vai-platform-tab--active) { border-color: var(--border-bright); }

/* ── Platform Content ── */
.vai-platform-content { display: flex; flex-direction: column; gap: 14px; }
.vai-platform-content__header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
}

/* ── Caption Card ── */
.vai-caption-card {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px;
  position: relative;
}
.vai-caption-card__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.vai-caption-card__text { font-size: 14px; line-height: 1.6; color: var(--text-primary); }
.vai-caption-card__keyword { font-size: 12px; color: var(--text-muted); margin-top: 6px; font-family: var(--font-mono); }

/* ── Description Block ── */
.vai-desc-block {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px;
}
.vai-desc-block__text { font-size: 14px; line-height: 1.6; color: var(--text-primary); margin-top: 6px; }

/* ── Hashtags ── */
.vai-hashtags-block { }
.vai-hashtags-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.vai-hashtag {
  padding: 4px 12px;
  border-radius: 100px;
  border: 1px solid var(--border-bright);
  background: rgba(108,99,255,0.06);
  color: var(--accent-primary);
  font-family: var(--font-mono);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.vai-hashtag:hover { background: rgba(108,99,255,0.15); border-color: var(--accent-primary); }

/* ── Tip Card ── */
.vai-tip-card {
  display: flex;
  gap: 10px;
  padding: 14px;
  background: rgba(108,99,255,0.05);
  border: 1px solid rgba(108,99,255,0.15);
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-secondary);
}
.vai-tip-card--save { border-color: rgba(74,222,128,0.2); background: rgba(74,222,128,0.04); }
.vai-tip-card--share { border-color: rgba(255,107,107,0.2); background: rgba(255,107,107,0.04); }
.vai-tip-card--loop { border-color: rgba(255,215,0,0.2); background: rgba(255,215,0,0.04); }
.vai-tip-card__icon { font-size: 18px; flex-shrink: 0; }

/* ── Info Row ── */
.vai-info-row { font-size: 13px; color: var(--text-secondary); line-height: 1.5; }

/* ── Badges & Chips ── */
.vai-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 100px;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
}
.vai-badge--sm { padding: 2px 8px; font-size: 10px; }

.vai-label {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.vai-chip {
  display: inline-flex;
  padding: 3px 10px;
  border-radius: 100px;
  font-size: 12px;
  border: 1px solid var(--border);
  background: var(--bg-primary);
  color: var(--text-secondary);
}
.vai-chip--green { border-color: rgba(74,222,128,0.3); color: #4ade80; }
.vai-chip--red { border-color: rgba(255,68,68,0.3); color: #ff4444; }

/* ── Copy Button ── */
.vai-copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 6px;
}
.vai-copy-btn:hover { background: var(--bg-hover); color: var(--text-primary); border-color: var(--border-bright); }

/* ── Strategy ── */
.vai-strategy-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
.vai-strategy-item {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px;
}
.vai-strategy-item__value { font-size: 14px; color: var(--text-primary); margin-top: 4px; }
.vai-strategy-list { margin-top: 10px; }
.vai-strategy-list__item { font-size: 13px; color: var(--text-secondary); line-height: 1.6; padding: 2px 0; }

/* ── Stats Panel ── */
.vai-stats { display: flex; flex-direction: column; gap: 16px; align-items: center; }
.vai-stats--empty { align-items: center; justify-content: center; height: 100%; opacity: 0.5; }
.vai-stats__empty-icon { font-size: 48px; margin-bottom: 12px; }
.vai-stats__empty-text { font-size: 13px; color: var(--text-muted); text-align: center; line-height: 1.5; }
.vai-stats__ring-wrap { padding: 12px 0; }
.vai-stats__platforms { width: 100%; display: flex; flex-direction: column; gap: 4px; }
.vai-stats__platform-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}
.vai-stats__platform-row:hover { background: var(--bg-hover); }
.vai-stats__platform-label { flex: 1; font-size: 13px; color: var(--text-secondary); }
.vai-stats__platform-score { font-family: var(--font-mono); font-size: 14px; font-weight: 600; }
.vai-stats__category { width: 100%; text-align: center; }
.vai-stats__hook-chip {
  width: 100%;
  padding: 10px 14px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 10px;
}
.vai-stats__hook-text {
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.3;
}

/* ── Settings ── */
.vai-settings-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 200;
  display: flex;
  justify-content: flex-end;
}
.vai-settings {
  width: 360px;
  background: var(--bg-card);
  border-left: 1px solid var(--border);
  height: 100%;
  display: flex;
  flex-direction: column;
  animation: vai-slideIn 0.2s ease;
}
@keyframes vai-slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
.vai-settings__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 16px;
}
.vai-settings__body { padding: 20px; }

/* ── Toast ── */
.vai-toasts {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 500;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.vai-toast {
  padding: 10px 20px;
  background: var(--bg-card);
  border: 1px solid var(--accent-green);
  border-radius: 10px;
  font-size: 13px;
  font-family: var(--font-mono);
  color: var(--accent-green);
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  animation: vai-fadeIn 0.3s ease;
}

/* ── Responsive ── */
@media (max-width: 1024px) {
  .vai-main { flex-direction: column; }
  .vai-panel--left { width: 100%; max-height: 35vh; min-width: 0; border-right: none; border-bottom: 1px solid var(--border); }
  .vai-panel--center { width: 100%; flex: 1; }
  .vai-panel--right { display: none; }
}
@media (max-width: 600px) {
  .vai-onboarding__card { margin: 16px; padding: 32px 24px; }
  .vai-msg__bubble { max-width: 95%; }
  .vai-scores-grid { flex-direction: column; align-items: center; }
  .vai-strategy-grid { grid-template-columns: 1fr; }
}
`;
