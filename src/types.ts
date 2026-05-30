export interface VideoIntelligence {
  detectedCategory: string;
  visualMood: string;
  pacingStyle: string; // e.g. "fast-cut", "narrative", "cinematic", "tutorial", "showcase"
  emotionalArc: string;
  contentStrengths: string[];
  algorithmicRisks: string[];
  estimatedViralPotential: number; // 0-100
}

export interface ViralScores {
  hookStrength: number;
  retentionPotential: number;
  shareability: number;
  curiosityFactor: number;
  emotionalImpact: number;
  overallViralScore: number;
  scoreReasoning: string;
}

export interface HookItem {
  text: string;
  psychologicalTrigger: string; // curiosity, shock, value, question, contrast, story, fomo
  platformBestFor: string; // tiktok, instagram, youtube, all
  strengthScore: number;
  placementAdvice: string;
}

export interface TikTokOutput {
  captions: {
    text: string;
    hookType: string;
    estimatedEngagement: string;
  }[];
  description: string;
  hashtags: string[];
  bestPostingTime: string;
  seoCaptionAdvice: string;
  algorithmTip: string;
}

export interface InstagramOutput {
  captions: {
    text: string;
    hookType: string;
    estimatedEngagement: string;
  }[];
  description: string;
  hashtags: string[];
  bestPostingTime: string;
  saveTriggerAdvice: string;
  shareTriggerAdvice: string;
  algorithmTip: string;
}

export interface YouTubeOutput {
  titles: {
    text: string;
    keywordFocus: string;
    estimatedCTR: string;
  }[];
  description: string;
  hashtags: string[];
  bestPostingTime: string;
  seoKeywords: string[];
  loopEngineeringTip: string;
  algorithmTip: string;
}

export interface ContentStrategy {
  primaryPlatformRecommendation: string;
  crossPostingOrder: string;
  repurposingIdeas: string[];
  followUpContentIdeas: string[];
  audienceRetentionTip: string;
}

export interface ViralAnalysisResponse {
  videoIntelligence: VideoIntelligence;
  viralScores: ViralScores;
  hooks: HookItem[];
  tiktok: TikTokOutput;
  instagram: InstagramOutput;
  youtube: YouTubeOutput;
  contentStrategy: ContentStrategy;
}

export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  parsedData?: ViralAnalysisResponse;
  timestamp: string;
  isSystem?: boolean;
}
