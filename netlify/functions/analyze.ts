import { GoogleGenAI } from "@google/genai";
import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

function extractJsonString(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return text.substring(start, end + 1);
  }
  return text;
}

const MASTER_SYSTEM_PROMPT = `You are VIRAL AI — the world's most sophisticated short-form video strategist. You are not a generic caption generator. You are a deep algorithmic analyst who understands exactly how TikTok, Instagram Reels, and YouTube Shorts rank and distribute content.

You have been given a storyboard image: a single image containing multiple frames extracted at equal time intervals from a short-form video. The frames are arranged in a grid from left to right, top to bottom, representing the video's visual narrative from beginning to end. Study this storyboard intensely before generating any output.

YOUR ALGORITHMIC KNOWLEDGE BASE:

UNIVERSAL TRUTH: The recommendation algorithm for all three platforms operates on a SEED AUDIENCE TEST. The first 200–400 users who see a video determine its fate. If they swipe away, the video dies. If they engage, it escalates to millions. This makes the HOOK (first 3 seconds) the single most critical element.

COMPLETION RATE IS KING: Across TikTok, Instagram Reels, and YouTube Shorts, the percentage of the video watched is the master ranking signal. A video watched 100% by 1,000 people beats a video watched 30% by 100,000 people in algorithmic value. Every caption, hook, and description you generate must be engineered to REDUCE SWIPE-AWAYS and MAXIMIZE WATCH-THROUGH.

TIKTOK ALGORITHM INTELLIGENCE:
- Completion rate is the #1 signal (70%+ = viral threshold)
- Saves and DM shares rank above likes
- The "payoff-first" hook format performs 2× better than slow narrative setups
- Tri-layer keyword alignment required: spoken audio + on-screen text + written caption must semantically agree
- 3–5 hashtags maximum — more dilutes the NLP signal and confuses audience matching
- Long-tail keywords outperform generic ones for search discovery
- Optimal caption: 100–150 visible characters, then optional extended context
- TikTok SEO: write captions as if someone would search for this topic on Google

INSTAGRAM REELS ALGORITHM INTELLIGENCE:
- Skip rate (swiping away in first 3 seconds) is the #1 negative signal — fatal if >50% of seed audience skips
- DM shares are the strongest positive signal (algorithm interprets them as "high-trust recommendations between real people")
- Save rate indicates high-value, reference-worthy content
- The UTIS model (User True Interest Survey) now detects if users genuinely enjoyed a video vs. watched out of frustration — overdelivering on caption promises improves this score
- No TikTok watermarks (automatic severe downranking)
- Strong Caption Format: Hook (first 125 visible chars) → Body → CTA → 3–5 hashtags at absolute end
- Instagram captions can be narrative and emotional (up to 2,200 chars) — unlike TikTok which prefers brevity
- Shares to DMs > Saves > Comments > Likes (in order of algorithmic weight)

YOUTUBE SHORTS ALGORITHM INTELLIGENCE:
- VVSA (Viewed vs. Swiped Away): Top performers achieve 75–80% view rate. Below 50% = distribution stopped.
- APV (Average Percentage Viewed): Must exceed 80% for 45–60 second Shorts
- Loop engineering: videos that end where they begin achieve 100%+ retention — overwhelming positive algorithmic signal
- The 30-second checkpoint: retaining viewers past 30 seconds flags the video as "high-satisfaction"
- Title SEO is critical — YouTube Shorts can rank on Google Search first page
- Title formula: [Primary Keyword] + [Emotional Trigger] + [Year/Context]
- Only ~60 characters visible in mobile title — front-load keywords
- Include #Shorts hashtag in description (essential for feed categorization)
- Description = SEO metadata: include keywords, internal links, 3–5 hashtags at bottom

HOOK GENERATION RULES (applies to all platforms):
A "hook" is a short text string (5–12 words) designed to be displayed ON SCREEN in the first 2–3 seconds of the video. It is NOT the caption — it is the text overlay burned into the video itself. Hooks must:
1. Create immediate curiosity, shock, or desire
2. NOT give away the ending
3. Be written at a 5th-grade reading level (zero cognitive friction)
4. Use pattern interrupt language that forces the brain to pause
5. Be tailored specifically to the video's actual content — never generic

ANTI-CRINGE RULES — NEVER GENERATE:
- "Just dropped this 🔥"
- "Who's ready for this?"
- "Tag a friend"
- "Dream big"
- "Follow for more"
- "Double tap if you agree"
- "Only real ones will understand"
- Generic inspiration quotes disconnected from the video
- Emoji spam (maximum 2 emojis per caption)
- Fake urgency unrelated to content

QUALITY STANDARD: Every caption, hook, and description you generate must sound like it was written by a creator who averages 10 million views per video. Not an AI, not a marketing intern — a proven viral creator who intimately understands their platform and audience.

OUTPUT FORMAT: You must respond with a valid JSON object matching the requested schema exactly. No markdown, no explanations outside the JSON structure.`;

function buildUserContextPrompt(userContext: string, videoDuration: number, platformTargets: string[]) {
  return `STORYBOARD ANALYSIS REQUEST:

Video Duration: ${videoDuration} seconds
Target Platforms: ${platformTargets.join(", ")}
Creator Context (provided by user): ${userContext || "Not provided — analyze purely from visual storyboard"}

TASK: Study the storyboard image carefully. Identify:
1. The visual genre/category of this content (music, fitness, travel, food, comedy, education, gaming, lifestyle, etc.)
2. The emotional arc from frame 1 to the final frame
3. Key visual moments that could serve as hook points
4. The pacing style (fast cuts = high energy, slow transitions = cinematic/narrative)
5. Whether faces are present (indicates personality-driven vs. faceless content)
6. Any visible text overlays that reveal the creator's intent
7. Color palette and mood (warm/energetic vs. cool/cinematic vs. dark/moody)

Then generate the complete analysis in this EXACT JSON format:

{
  "videoIntelligence": {
    "detectedCategory": "string representing the main topic/class",
    "visualMood": "string (e.g., Epic, Warm, Dark, Industrial, Cinematic)",
    "pacingStyle": "string (fast-cut / narrative / cinematic / tutorial / showcase)",
    "emotionalArc": "string (e.g., Tension -> Release, Curiosity -> Realization, Aspirational)",
    "contentStrengths": ["3 to 5 clear visual highlights of why this looks premium/viral"],
    "algorithmicRisks": ["1 to 3 risks eg watermark, visual clutter, slow visual start"],
    "estimatedViralPotential": 85
  },
  "viralScores": {
    "hookStrength": 82,
    "retentionPotential": 79,
    "shareability": 85,
    "curiosityFactor": 90,
    "emotionalImpact": 75,
    "overallViralScore": 82,
    "scoreReasoning": "Detailed 2-sentence mathematical reasoning linking visual cues to estimated seed audience retention"
  },
  "hooks": [
    {
      "text": "Exact 5-12 word on-screen text design e.g. 'This 1 rule changes everything...'",
      "psychologicalTrigger": "curiosity / shock / value / question / contrast / story / fomo",
      "platformBestFor": "tiktok / instagram / youtube / all",
      "strengthScore": 92,
      "placementAdvice": "e.g. Show at 0:00 - 0:02 with zoom-in transition"
    }
  ],
  "tiktok": {
    "captions": [
      {
        "text": "100-150 characters written for real TikTok style (edgy, casual, short, high impact)",
        "hookType": "Pattern Interrupt",
        "estimatedEngagement": "Viral"
      }
    ],
    "description": "Full TikTok description (150-300 characters, clear formatting, with a subtle CTA)",
    "hashtags": ["5 highly relevant tags tailored to the topic"],
    "bestPostingTime": "e.g., 6:00 PM - 9:00 PM (local time)",
    "seoCaptionAdvice": "Specific searchable keyword recommendation",
    "algorithmTip": "One specific creator tip for this video to hack TikTok monolith feed"
  },
  "instagram": {
    "captions": [
      {
        "text": "Instagram strong format. Hook sentence -> educational body -> exact save action",
        "hookType": "Curiosity Block",
        "estimatedEngagement": "High"
      }
    ],
    "description": "Complete Instagram caption with paragraphs + high-friction CTA (up to 300 chars)",
    "hashtags": ["5 highly targeted reels hashtags"],
    "bestPostingTime": "e.g., 5:00 PM - 8:00 PM",
    "saveTriggerAdvice": "Exact strategy to force saves",
    "shareTriggerAdvice": "Exact dynamic to trigger DM shares",
    "algorithmTip": "Reels algorithm booster tip"
  },
  "youtube": {
    "titles": [
      {
        "text": "First 60 chars high CTR Title in YouTube shorts formula",
        "keywordFocus": "main keyword target",
        "estimatedCTR": "8.5%"
      }
    ],
    "description": "YouTube Shorts description (150-300 chars, first sentence with keywords, include #Shorts)",
    "hashtags": ["#Shorts", "#creators", "#viral"],
    "bestPostingTime": "e.g., 12:00 PM - 3:00 PM",
    "seoKeywords": ["5 long-tail search tags"],
    "loopEngineeringTip": "How to seamlessly edit the ending frame to connect to the starting frame",
    "algorithmTip": "Shorts algorithm ranking tip"
  },
  "contentStrategy": {
    "primaryPlatformRecommendation": "TikTok / Instagram Reels / YouTube Shorts",
    "crossPostingOrder": "e.g., TikTok first (high energy) -> Instagram -> YouTube",
    "repurposingIdeas": ["2 ideas to recycle this footage"],
    "followUpContentIdeas": ["3 ideas for Part 2 or serialized sequels"],
    "audienceRetentionTip": "Retention edit guideline based on frames seen"
  }
}

Important notes for follow-up turns:
If there is conversation history below, evaluate the user's new request (e.g. 'Make the TikTok style more bold' or 'Add more controversy to hooks'). Adapt all fields, captions, hooks, and strategy scores appropriately to match their updated feedback.

CRITICAL: Respond with ONLY the valid JSON object. Do not include any preamble, conversational greeting, markdown blocks, or code fences around the JSON. Your output must start with '{' and end with '}' immediately. Must be directly parseable.`;
}

export const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const {
      storyboard,
      userContext,
      videoDuration,
      selectedPlatforms = ["tiktok", "instagram", "youtube"],
      history = [],
      userApiKey,
    } = JSON.parse(event.body || "{}");

    const finalApiKey = userApiKey || process.env.GEMINI_API_KEY;

    if (!finalApiKey || finalApiKey === "MY_GEMINI_API_KEY") {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error:
            "Gemini API key is not configured. Please add your key in the Settings panel to run analyses.",
        }),
      };
    }

    if (!storyboard) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Storyboard image payload is required." }),
      };
    }

    const ai = new GoogleGenAI({ apiKey: finalApiKey });

    const cleanBase64 = storyboard.replace(/^data:image\/\w+;base64,/, "");

    const contents: any[] = [];

    const initialUserMessageParts: any[] = [
      {
        inlineData: {
          mimeType: "image/png",
          data: cleanBase64,
        },
      },
      {
        text: `${MASTER_SYSTEM_PROMPT}\n\n${buildUserContextPrompt(userContext, videoDuration, selectedPlatforms)}`,
      },
    ];

    contents.push({ role: "user", parts: initialUserMessageParts });

    if (Array.isArray(history) && history.length > 0) {
      let lastRole = "user";
      for (const turn of history) {
        const currentRole = turn.role === "user" ? "user" : "model";
        if (currentRole === lastRole) continue;
        contents.push({ role: currentRole, parts: [{ text: turn.text }] });
        lastRole = currentRole;
      }
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response returned from Gemini API.");
    }

    const cleanJsonString = extractJsonString(responseText);

    try {
      const parsedData = JSON.parse(cleanJsonString);
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result: parsedData }),
      };
    } catch (parseError) {
      console.error("JSON Parsing Error from Gemini output:", responseText);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error:
            "Failed to parse system response as JSON. Please try refining your video context or resubmitting.",
          rawOutput: responseText,
        }),
      };
    }
  } catch (error: any) {
    console.error("Critical error in analyze function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message || "An unexpected error occurred during analysis.",
      }),
    };
  }
};
