import React, { useState } from "react";
import { 
  ViralAnalysisResponse, 
  HookItem, 
  TikTokOutput, 
  InstagramOutput, 
  YouTubeOutput 
} from "../types";
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  Flame, 
  Sparkles, 
  Clock, 
  TrendingUp, 
  Compass, 
  RefreshCw, 
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  CornerDownRight,
  Bookmark,
  Share2,
  Repeat
} from "lucide-react";

interface ResultsViewProps {
  data: ViralAnalysisResponse;
  onBackToChat: () => void;
  onRegenerate: () => void;
  isGenerating: boolean;
  onTriggerToast: (message: string) => void;
}

export default function ResultsView({ 
  data, 
  onBackToChat, 
  onRegenerate, 
  isGenerating,
  onTriggerToast 
}: ResultsViewProps) {
  const [activeTab, setActiveTab] = useState<"tiktok" | "instagram" | "youtube">("tiktok");
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const { videoIntelligence, viralScores, hooks, tiktok, instagram, youtube, contentStrategy } = data;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    onTriggerToast("Copied to clipboard! ✓");
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-[#FF3B00] bg-[#FF3B00]/10 border-[#FF3B00]/20 rounded-none";
    if (score >= 50) return "text-white bg-white/5 border-white/10 rounded-none";
    return "text-white/40 bg-white/5 border-white/10 rounded-none";
  };

  const getScoreBarBg = (score: number) => {
    if (score >= 80) return "bg-[#FF3B00]";
    if (score >= 50) return "bg-white/60";
    return "bg-white/10";
  };

  return (
    <div className="w-full text-[#f0f0f5]">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-white/5 pb-6 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToChat}
            className="w-full sm:w-auto flex items-center justify-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#FF3B00] bg-black border border-white/10 hover:border-[#FF3B00] px-5 py-3 rounded-none transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Strategy Chat
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRegenerate}
            disabled={isGenerating}
            className="w-full sm:w-auto flex items-center justify-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-black bg-[#FF3B00] hover:bg-white hover:text-black border border-transparent px-5 py-3 rounded-none transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
            {isGenerating ? "Analyzing Fresh..." : "Regenerate Analysis"}
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <div className="space-y-8">
        
        {/* Section 1: Video Intelligence Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-8 bg-[#0F0F0F] border border-white/5 rounded-none p-6 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[radial-gradient(circle_150px_at_100%_0%,#FF3B0008,transparent)] pointer-events-none" />
            
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-[10px] font-mono uppercase bg-black text-[#FF3B00] border border-white/10 px-3 py-1 rounded-none">
                  Topic: {videoIntelligence.detectedCategory || "Creator Content"}
                </span>
                <span className="text-[10px] font-mono uppercase bg-black text-white border border-white/10 px-3 py-1 rounded-none flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-[#FF3B00]" />
                  Mood: {videoIntelligence.visualMood || "Cinematic"}
                </span>
                <span className="text-[10px] font-mono uppercase bg-black text-white/60 border border-white/10 px-3 py-1 rounded-none">
                  Pacing: {videoIntelligence.pacingStyle}
                </span>
              </div>

              <h2 className="text-2xl font-serif italic text-white mb-3">
                Algorithmic Video Intelligence
              </h2>
              <p className="text-xs text-white/50 leading-relaxed mb-6 font-mono uppercase">
                Your narrative follows a <span className="text-[white] font-semibold italic">{videoIntelligence.emotionalArc}</span> emotional arc structure. 
                Below is the verified feedback collected from visual framing analyses:
              </p>

              {/* Strengths & Risks lists */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3.5 bg-black border border-white/5 p-4 rounded-none">
                  <h3 className="text-[10px] font-mono text-[#FF3B00] uppercase tracking-wider flex items-center gap-1.5 font-bold mb-1 border-b border-white/5 pb-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Visual Highlights
                  </h3>
                  {videoIntelligence.contentStrengths.map((strength, i) => (
                    <div key={i} className="flex gap-2 items-start text-xs text-white/60 leading-normal font-sans">
                      <span className="text-[#FF3B00] font-bold">✓</span>
                      <span>{strength}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3.5 bg-black border border-white/5 p-4 rounded-none">
                  <h3 className="text-[10px] font-mono text-white/40 uppercase tracking-wider flex items-center gap-1.5 font-bold mb-1 border-b border-white/5 pb-2">
                    <CheckCircle2 className="w-4 h-4 text-[#FF3B00]" />
                    Algorithmic Risks
                  </h3>
                  {videoIntelligence.algorithmicRisks && videoIntelligence.algorithmicRisks.length > 0 ? (
                    videoIntelligence.algorithmicRisks.map((risk, i) => (
                      <div key={i} className="flex gap-2 items-start text-xs text-white/60 leading-normal font-sans">
                        <span className="text-[#FF3B00] font-bold">⚠</span>
                        <span>{risk}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-white/40">No severe retention warnings spotted.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Core Viral Meter */}
          <div className="lg:col-span-4 bg-[#0F0F0F] border border-white/5 rounded-none p-6 flex flex-col justify-between items-center text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_300px_at_50%_120%,#FF3B0008,transparent)] pointer-events-none" />
            
            <div className="w-full flex justify-between items-center text-left border-b border-white/5 pb-3 mb-4">
              <span className="text-[9px] font-mono font-bold text-white/40 uppercase tracking-wider">Algorithmic Grade</span>
              <TrendingUp className="w-4 h-4 text-[#FF3B00]" />
            </div>

            <div className="relative py-4 flex items-center justify-center">
              {/* Score Display (Big Circular representation) */}
              <div className="w-32 h-32 rounded-none border border-white/10 flex flex-col items-center justify-center relative bg-black">
                <span className="text-5xl font-serif italic text-[#FF3B00]">
                  {videoIntelligence.estimatedViralPotential || viralScores.overallViralScore}%
                </span>
                <span className="text-[9px] font-mono text-white/40 tracking-widest uppercase mt-2">Viral Index</span>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-xs font-mono uppercase tracking-widest text-white mb-2">Theoretical Diagnostics</h4>
              <p className="text-xs text-white/50 leading-relaxed max-w-xs px-2 font-sans">
                {viralScores.scoreReasoning || "Based on seed test completion velocity thresholds, metadata context matches well."}
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Core Metric Decomposition */}
        <div className="bg-[#0F0F0F] border border-white/5 rounded-none p-6">
          <h3 className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest border-b border-white/5 pb-3 mb-6">
            Detailed Diagnostic Breakdown
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { label: "Hook Retention Strength", score: viralScores.hookStrength, desc: "Estimated retention past the 3-second seed test marker" },
              { label: "Completion Multiplier", score: viralScores.retentionPotential, desc: "Chances of users watching until the final timestamp" },
              { label: "DM Shareability Ratio", score: viralScores.shareability, desc: "Drives algorithmic placement weightings" },
              { label: "Curiosity Loop Value", score: viralScores.curiosityFactor, desc: "Creates mystery loops forcing rewatch iterations" },
              { label: "Emotional Amplitude", score: viralScores.emotionalImpact, desc: "Impact score measuring comment box activity" }
            ].map((metric, i) => (
              <div key={i} className="bg-black border border-white/5 rounded-none p-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] uppercase font-mono font-bold text-white/70 leading-tight block">{metric.label}</span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-none border ${getScoreColor(metric.score)}`}>
                      {metric.score}
                    </span>
                  </div>
                  <p className="text-[10px] text-white/40 leading-relaxed mt-2 font-mono uppercase">
                    {metric.desc}
                  </p>
                </div>
                <div className="w-full bg-[#111] h-1 rounded-none mt-4 overflow-hidden">
                  <div 
                    className={`h-full ${getScoreBarBg(metric.score)}`} 
                    style={{ width: `${metric.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: High-Retention Visual Hooks */}
        <div className="bg-[#0F0F0F] border border-white/5 rounded-none p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-[radial-gradient(circle_120px_at_0%_0%,#FF3B0008,transparent)] pointer-events-none" />
          
          <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
            <div>
              <h3 className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-[0.2em] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#FF3B00]" />
                Top Proven On-Screen Hooks
              </h3>
              <p className="text-xs text-white/40 mt-1 font-mono uppercase">Wording overlays built to burn into the first 3 seconds</p>
            </div>
            <span className="text-[9px] font-mono text-white/50 bg-black border border-white/10 px-2.5 py-1 rounded-none uppercase tracking-wider">
              5 Variants Generated
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {hooks.map((hook, idx) => (
              <div 
                key={idx} 
                className="bg-[#050505] border border-white/5 rounded-none p-4 hover:border-[#FF3B00]/30 transition-all flex flex-col justify-between group relative"
              >
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => copyToClipboard(hook.text, `hook-${idx}`)}
                    className="p-1.5 bg-black text-white hover:bg-white hover:text-black border border-white/10 transition cursor-pointer"
                    title="Copy Hook Text"
                  >
                    {copiedIndex === `hook-${idx}` ? <Check className="w-3.5 h-3.5 text-[#FF3B00]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    <span className="text-[9px] font-bold font-mono tracking-wide uppercase bg-black text-[#FF3B00] border border-white/15 px-2 py-0.5 rounded-none">
                      {hook.psychologicalTrigger}
                    </span>
                    <span className="text-[9px] font-bold font-mono text-white">
                      {hook.strengthScore}% STR
                    </span>
                  </div>

                  {/* Aesthetic visual mockup of text in video */}
                  <div className="bg-black border border-white/5 aspect-[16/10] rounded-none flex items-center justify-center p-3 text-center relative overflow-hidden mb-3">
                    <p className="text-xs font-bold text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-serif italic">
                      "{hook.text}"
                    </p>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-white/40 border-t border-white/5 pt-2 flex items-center gap-1 font-mono uppercase">
                    <Smartphone className="w-3 h-3 text-[#FF3B00]" />
                    <span>{hook.platformBestFor} Best</span>
                  </div>
                  <p className="text-[10px] text-white/50 leading-tight mt-1 font-sans">
                    {hook.placementAdvice}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Content Strategy Platform Tabs */}
        <div className="bg-[#0F0F0F] border border-white/5 rounded-none p-6">
          <div className="border-b border-white/5 pb-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-[0.2em]">
                Platform Specific Optimization Engines
              </h3>
              <p className="text-xs text-white/40 mt-1 font-mono uppercase">Tuned to platform ranking networks</p>
            </div>

            {/* Platform Selection Pills */}
            <div className="flex flex-wrap sm:flex-nowrap items-stretch sm:items-center gap-1 bg-[#111] border border-white/10 rounded-none w-full sm:w-fit p-1.5">
              {[
                { id: "tiktok", label: "TIKTOK OPTIMIZATION" },
                { id: "instagram", label: "INSTAGRAM REELS" },
                { id: "youtube", label: "YOUTUBE SHORTS" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 sm:flex-none text-[9px] font-mono tracking-widest uppercase px-3 sm:px-4 py-2.5 rounded-none cursor-pointer text-center transition-all ${
                    activeTab === tab.id 
                      ? "bg-[#FF3B00] text-black font-semibold" 
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab contents */}
          {activeTab === "tiktok" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                  {/* Generated caption variants with copy */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-mono text-white/40 uppercase tracking-wider flex items-center gap-1.5 font-bold">
                      <Sparkles className="w-4 h-4 text-[#FF3B00]" />
                      High Engagement Caption Variants (100-150 Chars)
                    </h4>
                    {tiktok.captions.map((caption, idx) => (
                      <div 
                        key={idx} 
                        className="bg-[#050505] border border-white/5 rounded-none p-4 flex justify-between items-center relative group"
                      >
                        <div className="mr-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[9px] font-mono text-[#FF3B00] bg-[#FF3B00]/10 border border-[#FF3B00]/20 px-2.5 py-0.5 rounded-none tracking-wider uppercase">
                              Type: {caption.hookType}
                            </span>
                            <span className="text-[9px] font-mono text-white/50 tracking-wider">
                              Rank: {caption.estimatedEngagement}
                            </span>
                          </div>
                          <p className="text-sm text-white/80 pr-6 font-serif italic">
                            {caption.text}
                          </p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(caption.text, `tt-cap-${idx}`)}
                          className="flex items-center justify-center p-2 rounded-none text-white bg-[#111111] hover:bg-white hover:text-black border border-white/10 hover:border-white transition h-9 w-9 shrink-0 cursor-pointer duration-200"
                          title="Copy Caption"
                        >
                          {copiedIndex === `tt-cap-${idx}` ? <Check className="w-4 h-4 text-[#FF3B00]" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Full detailed caption string */}
                  <div className="bg-[#050505] border border-white/5 rounded-none p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-[10px] font-mono text-white/40 uppercase tracking-wider font-bold">
                        Full Meta Description & Callout Content
                      </h4>
                      <button
                        onClick={() => copyToClipboard(tiktok.description, "tt-desc")}
                        className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-mono text-white bg-transparent border border-white/15 px-3 py-1 hover:border-white h-7 cursor-pointer"
                      >
                        {copiedIndex === "tt-desc" ? <Check className="w-3.5 h-3.5 text-[#FF3B00]" /> : <Copy className="w-3.5 h-3.5" />}
                        Copy All
                      </button>
                    </div>
                    <p className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed font-sans bg-black p-4 rounded-none border border-white/5">
                      {tiktok.description}
                    </p>
                  </div>
                </div>

                {/* Sidebar details */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-[#050505] border border-white/5 rounded-none p-5">
                    <h4 className="text-[10px] font-mono text-[#FF3B00] uppercase tracking-wider font-bold mb-4 flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      Best Time to Post
                    </h4>
                    <p className="text-lg font-bold text-white mb-2 font-mono">
                      {tiktok.bestPostingTime}
                    </p>
                    <p className="text-[11px] text-white/40 leading-relaxed font-mono uppercase">
                      Matches the audience's active feedback window calculated via network index loops.
                    </p>
                  </div>

                  <div className="bg-[#050505] border border-white/5 rounded-none p-5">
                    <h4 className="text-[10px] font-mono text-white/40 uppercase tracking-[0.1em] font-bold mb-3 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-[#FF3B00]" />
                      TikTok SEO Advice
                    </h4>
                    <p className="text-xs text-white/60 leading-relaxed font-mono uppercase">
                      {tiktok.seoCaptionAdvice}
                    </p>
                  </div>

                  <div className="bg-[#050505] border border-white/5 rounded-none p-5 border-l-2 border-l-[#FF3B00]">
                    <h4 className="text-[10px] font-mono text-[#FF3B00] uppercase tracking-wider font-bold mb-2 flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4" />
                      Algorithmic Hack
                    </h4>
                    <p className="text-xs text-white/70 leading-relaxed font-mono uppercase">
                      {tiktok.algorithmTip}
                    </p>
                  </div>

                  <div className="bg-[#050505] border border-white/5 rounded-none p-5">
                    <h4 className="text-[10px] font-mono text-white/40 uppercase tracking-wider mb-4 font-bold">
                      Hashtags (click to copy)
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {tiktok.hashtags.map((tag, idx) => (
                        <button
                          key={idx}
                          onClick={() => copyToClipboard(tag, `tt-tag-${idx}`)}
                          className="text-[10px] font-mono bg-black border border-white/10 text-white/70 hover:text-white px-3 py-1.5 rounded-none transition hover:border-[#FF3B00]"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "instagram" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                  {/* Generated caption variants with copy */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-mono text-white/40 uppercase tracking-wider flex items-center gap-1.5 font-bold">
                      <Sparkles className="w-4 h-4 text-[#FF3B00]" />
                      SCF Format Captions (Hook Visible &rarr; Expand Details)
                    </h4>
                    {instagram.captions.map((caption, idx) => (
                      <div 
                        key={idx} 
                        className="bg-[#050505] border border-white/5 rounded-none p-4 flex justify-between items-center relative group"
                      >
                        <div className="mr-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[9px] font-mono text-[#FF3B00] bg-[#FF3B00]/10 border border-[#FF3B00]/20 px-2.5 py-0.5 rounded-none tracking-wider uppercase">
                              Logic: {caption.hookType}
                            </span>
                            <span className="text-[9px] font-mono text-white/50 tracking-wider">
                              Est. Reach: {caption.estimatedEngagement}
                            </span>
                          </div>
                          <p className="text-sm text-white/80 pr-6 font-serif italic">
                            {caption.text}
                          </p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(caption.text, `ig-cap-${idx}`)}
                          className="flex items-center justify-center p-2 rounded-none text-white bg-[#111111] hover:bg-white hover:text-black border border-white/10 hover:border-white transition h-9 w-9 shrink-0 cursor-pointer duration-200"
                          title="Copy Caption"
                        >
                          {copiedIndex === `ig-cap-${idx}` ? <Check className="w-4 h-4 text-[#FF3B00]" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Full detailed caption string */}
                  <div className="bg-[#050505] border border-white/5 rounded-none p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-[10px] font-mono text-white/40 uppercase tracking-wider font-bold">
                        Full Instagram Caption Body & Call to Action (CTA)
                      </h4>
                      <button
                        onClick={() => copyToClipboard(instagram.description, "ig-desc")}
                        className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-mono text-white bg-transparent border border-white/15 px-3 py-1 hover:border-white h-7 cursor-pointer"
                      >
                        {copiedIndex === "ig-desc" ? <Check className="w-3.5 h-3.5 text-[#FF3B00]" /> : <Copy className="w-3.5 h-3.5" />}
                        Copy All
                      </button>
                    </div>
                    <p className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed font-sans bg-black p-4 rounded-none border border-white/5">
                      {instagram.description}
                    </p>
                  </div>
                </div>

                {/* Sidebar details */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-[#050505] border border-white/5 rounded-none p-5">
                    <h4 className="text-[10px] font-mono text-white/40 uppercase tracking-wider font-bold mb-4 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#FF3B00]" />
                      Best Time to Post
                    </h4>
                    <p className="text-lg font-bold text-white mb-2 font-mono">
                      {instagram.bestPostingTime}
                    </p>
                    <p className="text-[11px] text-white/40 leading-relaxed font-mono uppercase">
                      Reels feeds optimize when posted slightly ahead of localized leisure spikes.
                    </p>
                  </div>

                  <div className="bg-[#050505] border border-white/5 rounded-none p-5 border-l-2 border-l-[#FF3B00] flex gap-3 items-start">
                    <div className="p-1 rounded-none bg-[#FF3B00]/10 text-[#FF3B00] shrink-0 mt-0.5">
                      <Bookmark className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-mono text-white uppercase tracking-wider font-bold mb-1">
                        Save Trigger Strategy
                      </h4>
                      <p className="text-xs text-white/60 leading-relaxed font-mono uppercase">
                        {instagram.saveTriggerAdvice}
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#050505] border border-white/5 rounded-none p-5 border-l-2 border-l-[#FF3B00] flex gap-3 items-start">
                    <div className="p-1 rounded-none bg-[#FF3B00]/10 text-[#FF3B00] shrink-0 mt-0.5">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-mono text-white uppercase tracking-wider font-bold mb-1">
                        DM Share Trigger Strategy
                      </h4>
                      <p className="text-xs text-white/60 leading-relaxed font-mono uppercase">
                        {instagram.shareTriggerAdvice}
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#050505] border border-white/5 rounded-none p-5 border-l-2 border-l-[#FF3B00]">
                    <h4 className="text-[10px] font-mono text-[#FF3B00] uppercase tracking-wider font-bold mb-2 flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4" />
                      Algorithmic Hack
                    </h4>
                    <p className="text-xs text-white/70 leading-relaxed font-mono uppercase">
                      {instagram.algorithmTip}
                    </p>
                  </div>

                  <div className="bg-[#050505] border border-white/5 rounded-none p-5">
                    <h4 className="text-[10px] font-mono text-white/40 uppercase tracking-wider mb-3">
                      Hashtags (click to copy)
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {instagram.hashtags.map((tag, idx) => (
                        <button
                          key={idx}
                          onClick={() => copyToClipboard(tag, `ig-tag-${idx}`)}
                          className="text-[10px] font-mono bg-black border border-white/10 text-white/70 hover:text-white px-3 py-1.5 rounded-none transition hover:border-[#FF3B00]"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "youtube" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                  {/* Generated caption variants with copy */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-mono text-white/40 uppercase tracking-wider flex items-center gap-1.5 font-bold">
                      <Sparkles className="w-4 h-4 text-[#FF3B00]" />
                      SEO Keyword Target Title Variants (Max 60 Chars)
                    </h4>
                    {youtube.titles.map((title, idx) => (
                      <div 
                        key={idx} 
                        className="bg-[#050505] border border-white/5 rounded-none p-4 flex justify-between items-center relative group"
                      >
                        <div className="mr-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[9px] font-mono text-[#FF3B00] bg-[#FF3B00]/10 border border-[#FF3B00]/20 px-2.5 py-0.5 rounded-none tracking-wider uppercase">
                              Keyword Base: {title.keywordFocus}
                            </span>
                            <span className="text-[9px] font-mono text-white/50 tracking-wider">
                              Est. CTR Model: {title.estimatedCTR}
                            </span>
                          </div>
                          <p className="text-sm text-white/80 pr-6 font-serif italic">
                            {title.text}
                          </p>
                        </div>
                        <button
                          onClick={() => copyToClipboard(title.text, `yt-title-${idx}`)}
                          className="flex items-center justify-center p-2 rounded-none text-white bg-[#111111] hover:bg-white hover:text-black border border-white/10 hover:border-white transition h-9 w-9 shrink-0 cursor-pointer duration-200"
                          title="Copy Title"
                        >
                          {copiedIndex === `yt-title-${idx}` ? <Check className="w-4 h-4 text-[#FF3B00]" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Full detailed description string */}
                  <div className="bg-[#050505] border border-white/5 rounded-none p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-[10px] font-mono text-white/40 uppercase tracking-wider font-bold">
                        SEO Optimized Description (Google & YouTube Indexable, include #Shorts)
                      </h4>
                      <button
                        onClick={() => copyToClipboard(youtube.description, "yt-desc")}
                        className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-mono text-white bg-transparent border border-white/15 px-3 py-1 hover:border-white h-7 cursor-pointer"
                      >
                        {copiedIndex === "yt-desc" ? <Check className="w-3.5 h-3.5 text-[#FF3B00]" /> : <Copy className="w-3.5 h-3.5" />}
                        Copy All
                      </button>
                    </div>
                    <p className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed font-sans bg-black p-4 rounded-none border border-white/5">
                      {youtube.description}
                    </p>
                  </div>
                </div>

                {/* Sidebar details */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-[#050505] border border-white/5 rounded-none p-5">
                    <h4 className="text-[10px] font-mono text-white/40 uppercase tracking-wider font-bold mb-4 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#FF3B00]" />
                      Best Time to Post
                    </h4>
                    <p className="text-lg font-bold text-white mb-2 font-mono">
                      {youtube.bestPostingTime}
                    </p>
                    <p className="text-[11px] text-white/40 leading-relaxed font-mono uppercase">
                      Shorts require high early engagement velocities to propagate widely.
                    </p>
                  </div>

                  <div className="bg-[#050505] border border-white/5 rounded-none p-5 border-l-2 border-l-[#FF3B00] flex gap-3 items-start">
                    <div className="p-1 rounded-none bg-[#FF3B00]/10 text-[#FF3B00] shrink-0 mt-0.5">
                      <Repeat className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-mono text-white uppercase tracking-wider font-bold mb-1">
                        Loop Engineering Advice
                      </h4>
                      <p className="text-xs text-white/60 leading-relaxed font-mono uppercase">
                        {youtube.loopEngineeringTip}
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#050505] border border-white/5 rounded-none p-5 border-l-2 border-l-[#FF3B00]">
                    <h4 className="text-[10px] font-mono text-[#FF3B00] uppercase tracking-wider font-bold mb-2 flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4" />
                      YouTube Shorts Rule
                    </h4>
                    <p className="text-xs text-white/70 leading-relaxed font-mono uppercase">
                      {youtube.algorithmTip}
                    </p>
                  </div>

                  <div className="bg-[#050505] border border-white/5 rounded-none p-5">
                    <h4 className="text-[10px] font-mono text-white/40 uppercase tracking-wider mb-3 font-bold">
                      SEO Keyword Seeds
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {youtube.seoKeywords.map((word, idx) => (
                        <span 
                          key={idx} 
                          onClick={() => copyToClipboard(word, `yt-tag-${idx}`)}
                          className="text-[10px] font-mono bg-black border border-white/10 text-white/60 hover:text-white px-2.5 py-1 rounded-none cursor-pointer hover:border-[#FF3B00]"
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 5: Longterm Strategy Blueprints */}
        <div className="bg-[#0F0F0F] border border-white/5 rounded-none p-6">
          <h3 className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-[0.25em] border-b border-white/5 pb-3 mb-6">
            Multi-Platform Syndication & Scaling Strategy
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Recommendation block 1 */}
            <div className="bg-[#050505] border border-white/5 rounded-none p-5 flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-mono text-white/30 uppercase tracking-wider">01 // Primary Alignment</span>
                <h4 className="text-base font-serif italic text-white mt-1 mb-2">
                  Platform Fit
                </h4>
                <p className="text-xs text-white/60 leading-relaxed font-sans">
                  Target <span className="text-[#FF3B00] font-semibold italic">{contentStrategy.primaryPlatformRecommendation}</span> as your anchor. This matches the core design layout and emotional pacing loops perfectly.
                </p>
              </div>
              <div className="border-t border-white/5 mt-4 pt-3 text-[9px] font-mono text-white/30 uppercase tracking-widest">
                Syndication Strategy Active
              </div>
            </div>

            {/* Recommendation block 2 */}
            <div className="bg-[#050505] border border-white/5 rounded-none p-5 flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-mono text-white/30 uppercase tracking-wider">02 // Cross-Posting Chronology</span>
                <h4 className="text-base font-serif italic text-white mt-1 mb-2">
                  Distribution Funnel
                </h4>
                <p className="text-xs text-white/60 leading-relaxed font-sans">
                  Chronological pipeline sequence: <span className="text-[#FF3B00] font-semibold italic">{contentStrategy.crossPostingOrder}</span>. Stagger distributions by 4 hours to avoid crowd saturation.
                </p>
              </div>
              <div className="border-t border-white/5 mt-4 pt-3 text-[9px] font-mono text-white/30 uppercase tracking-widest">
                4-Hour Temporal Stagger
              </div>
            </div>

            {/* Recommendation block 3 */}
            <div className="bg-[#050505] border border-white/5 rounded-none p-5 flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-mono text-white/30 uppercase tracking-wider">03 // Sequential Content Ideas</span>
                <h4 className="text-base font-serif italic text-white mt-1 mb-2">
                  Next Video Sequences
                </h4>
                <div className="space-y-2 mt-1">
                  {contentStrategy.followUpContentIdeas.map((idea, i) => (
                    <div key={i} className="flex gap-1.5 items-start text-xs text-white/60 font-sans">
                      <span className="text-[#FF3B00] font-bold shrink-0">→</span>
                      <span>{idea}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-white/5 mt-4 pt-3 text-[9px] font-mono text-white/30 uppercase tracking-widest">
                Sequential Series Engine
              </div>
            </div>

            {/* Recommendation block 4 */}
            <div className="bg-[#050505] border border-white/5 rounded-none p-5 flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-mono text-white/30 uppercase tracking-wider">04 // Repurposing & Loops</span>
                <h4 className="text-base font-serif italic text-white mt-1 mb-2">
                  Footage Recycling
                </h4>
                <div className="space-y-2 mt-1">
                  {contentStrategy.repurposingIdeas.map((idea, i) => (
                    <div key={i} className="flex gap-1.5 items-start text-xs text-white/60 font-sans">
                      <span className="text-[#FF3B00] font-bold shrink-0">◇</span>
                      <span>{idea}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-white/5 mt-4 pt-3 text-[9px] font-mono text-white/30 uppercase tracking-widest">
                Extracting Maximum ROI
              </div>
            </div>
          </div>

          <div className="bg-[#050505] border border-white/5 rounded-none p-5 mt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex gap-3 items-start">
              <div className="p-2 rounded-none bg-[#FF3B00]/10 text-[#FF3B00] shrink-0 mt-0.5">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-mono uppercase tracking-widest text-white">Retention Editing Guideline</h4>
                <p className="text-xs text-white/50 mt-1.5 pr-6 leading-relaxed font-sans">
                  {contentStrategy.audienceRetentionTip}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
