import React, { useState, useRef, useEffect } from "react";
import { Message, ViralAnalysisResponse } from "../types";
import { generateStoryboard } from "../utils/frameExtractor";
import { 
  Plus, 
  Upload, 
  Film, 
  Trash2, 
  Send, 
  Sliders, 
  Zap, 
  Activity, 
  Clock, 
  BarChart2, 
  ChevronRight, 
  HelpCircle,
  TrendingUp,
  Settings,
  X
} from "lucide-react";

interface MainViewProps {
  apiKey: string;
  onOpenSettings: () => void;
  onAnalysisSuccess: (data: ViralAnalysisResponse) => void;
  isGenerating: boolean;
  setIsGenerating: (val: boolean) => void;
  onTriggerToast: (message: string) => void;
}

export default function MainView({
  apiKey,
  onOpenSettings,
  onAnalysisSuccess,
  isGenerating,
  setIsGenerating,
  onTriggerToast
}: MainViewProps) {
  // Video and frames extraction states
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [storyboardBase64, setStoryboardBase64] = useState<string>("");
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractionProgress, setExtractionProgress] = useState<{
    step: string;
    currentFrame: number;
    totalFrames: number;
  } | null>(null);

  // Chat conversation states
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [targetPlatforms, setTargetPlatforms] = useState<string[]>(["tiktok", "instagram", "youtube"]);
  
  // Rotating status message state during generation
  const [rotatingTip, setRotatingTip] = useState<string>("Studying visual timeline cues...");

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  // Scrolling chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isExtracting, isGenerating]);

  // Handle rotating thinking tips
  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      const tips = [
        "Studying visual storyboard framing elements...",
        "Evaluating aesthetic pacing and emotional cues...",
        "Cross-referencing high-retention platform algorithms...",
        "Synthesizing high-velocity caption hooks...",
        "Testing loop efficiency and DM sharing vectors...",
        "Tuning search keyword indexability scores..."
      ];
      let counter = 0;
      interval = setInterval(() => {
        counter = (counter + 1) % tips.length;
        setRotatingTip(tips[counter]);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Drag and drop events
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Initial welcome message once loaded
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "ai",
          content: "Welcome to **VIRAL AI**.\n\nTo begin, please upload your video in the left sidebar. Once uploaded, I will extract video frames and build a custom visual storyboard. Then, describe your video target goals below (or leave blank) and click **Go Viral**!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, []);

  const handleFileChange = async (file: File) => {
    if (!file) return;

    // Reject formats or sizes that are too big
    if (!file.type.startsWith("video/")) {
      onTriggerToast("Please upload a valid short-form video file.");
      return;
    }

    setVideoFile(file);
    const uStr = URL.createObjectURL(file);
    setVideoUrl(uStr);
    setStoryboardBase64("");

    // Initialize extraction process
    setIsExtracting(true);

    // Logs output in chat
    const logId = `ext-log-${Date.now()}`;
    addLogMessage("🎬 Loading video stream metadata...", logId);

    try {
      const result = await generateStoryboard(file, (progress) => {
        setExtractionProgress(progress);
        
        let label = "Working...";
        if (progress.step === "loading-metadata") label = "🎬 Reading video frame intervals...";
        else if (progress.step === "extracting-frames") {
          label = `📸 Extracted ${progress.currentFrame} of ${progress.totalFrames} rounded frames...`;
        } else if (progress.step === "composing-storyboard") {
          label = "🎨 Customizing collage grid dimensions...";
        }

        updateLogMessage(label, logId);
      });

      setVideoDuration(result.duration);
      setStoryboardBase64(result.storyboardUrl);
      setIsExtracting(false);
      setExtractionProgress(null);

      updateLogMessage(`📸 Successfully extracted ${result.framesList.length} storyboard frames. Collage built!`, logId);

      // AI guide question
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-ready-${Date.now()}`,
          role: "ai",
          content: `Visual Storyboard compiled (${result.duration}s video). \n\nTell me a little more about this clip. What is its core topic? Is there an overlay audio song, or a specific brand voice you prefer? Or, simply click **Generate Strategy** now to analyze directly.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

    } catch (err: any) {
      setIsExtracting(false);
      setExtractionProgress(null);
      updateLogMessage(`❌ Frame extraction failed: ${err.message || "Invalid file"}. Please try an alternative format.`, logId);
      onTriggerToast("Storyboard extraction failed.");
    }
  };

  const addLogMessage = (text: string, id: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id,
        role: "ai",
        content: text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: true
      }
    ]);
  };

  const updateLogMessage = (text: string, id: string) => {
    setMessages((prev) => 
      prev.map((msg) => (msg.id === id ? { ...msg, content: text } : msg))
    );
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = () => {
    setIsDragOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  const clearVideo = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoFile(null);
    setVideoUrl("");
    setVideoDuration(0);
    setStoryboardBase64("");
    onTriggerToast("Video cleared from canvas.");
  };

  // Run Visual AI analyze request
  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!storyboardBase64) {
      onTriggerToast("Please upload and extract a video storyboard first.");
      return;
    }

    if (!apiKey) {
      onTriggerToast("API key is missing. Add your Gemini key in settings.");
      onOpenSettings();
      return;
    }

    const currentInput = inputText.trim();
    setInputText("");

    const displayMsg = currentInput || "Analyze video and formulate viral strategy.";

    // Add user message to history
    const userMsgId = `user-msg-${Date.now()}`;
    const newMessages: Message[] = [
      ...messages,
      {
        id: userMsgId,
        role: "user",
        content: displayMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];

    setMessages(newMessages);
    setIsGenerating(true);

    try {
      // Map prior message items matching { role: 'user' | 'model', text: string }
      const requestHistory = newMessages
        // Filter out system logs and our greetings to save token length
        .filter(m => !m.isSystem && m.id !== "welcome")
        .map(m => ({
          role: m.role === "user" ? "user" : "model",
          text: m.role === "user" ? m.content : (m.parsedData ? JSON.stringify(m.parsedData) : m.content)
        }));

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storyboard: storyboardBase64,
          userContext: currentInput,
          videoDuration,
          selectedPlatforms: targetPlatforms,
          history: requestHistory,
          userApiKey: apiKey
        })
      });

      if (!res.ok) {
        const errorJson = await res.json();
        throw new Error(errorJson.error || "Communication fault.");
      }

      const { result } = await res.json();

      setIsGenerating(false);

      // Add success AI message
      const aiResponse: Message = {
        id: `ai-res-${Date.now()}`,
        role: "ai",
        content: `📈 **Viral Blueprint Formulated!** \n\nI have successfully mapped your short-form narrative timeline. \n\n- Detected category is **${result.videoIntelligence.detectedCategory}**.\n- Estimated reach score is **${result.viralScores.overallViralScore}/100**.\n- Found **${result.hooks?.length || 0} top hook variations**. \n\nClick the **View Full Presentation** button below, or in the right panel, to open your custom dashboard report!`,
        parsedData: result,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiResponse]);
      onAnalysisSuccess(result);
      onTriggerToast("Report generated successfully!");

    } catch (err: any) {
      setIsGenerating(false);
      setMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: "ai",
          content: `❌ **Failed to complete analytical loop:** \n\n${err.message || "Unknown error"}. Make sure your Gemini API key from settings is typed accurately or try submitting again.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const togglePlatform = (id: string) => {
    setTargetPlatforms(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  // Get active analysis reports in history for the Diagnostics screen
  const latestAnalysis = [...messages].reverse().find(m => m.parsedData)?.parsedData;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch h-auto lg:h-[calc(100vh-140px)] lg:max-h-[calc(100vh-140px)]">
      
      {/* COLUMN 1: Video & Storyboard Builder (30% -> col-span-4) */}
      <div className="lg:col-span-4 bg-[#0F0F0F] border border-white/5 rounded-none p-6 flex flex-col justify-between overflow-y-auto min-h-[400px]">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-[0.25em] flex items-center gap-1.5">
              <Film className="w-4 h-4 text-[#FF3B00]" />
              Creative_Assets
            </h3>
            {videoFile && (
              <button 
                onClick={clearVideo}
                className="text-white/40 hover:text-[#FF3B00] flex items-center gap-1.5 text-[10px] uppercase tracking-wider transition font-mono cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                [CLEAR]
              </button>
            )}
          </div>

          {/* Video upload block */}
          {!videoFile ? (
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border border-dashed rounded-none aspect-[16/10] flex flex-col items-center justify-center text-center p-6 cursor-pointer transition-all ${
                isDragOver ? "border-[#FF3B00] bg-[#FF3B00]/5" : "border-white/10 hover:border-white/40 bg-[#070707]"
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
                accept="video/*" 
                className="hidden" 
              />
              <Upload className="w-7 h-7 text-white/30 mb-3 animate-bounce" />
              <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-white">Drag & Drop Video</p>
              <p className="text-[10px] font-mono tracking-wide text-white/30 mt-1">or tap to inspect local files</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Local HTML5 player */}
              <div className="relative aspect-[16/10] bg-black rounded-none overflow-hidden border border-white/10">
                <video 
                  ref={videoPreviewRef}
                  src={videoUrl}
                  controls
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="bg-[#050505] border border-white/5 rounded-none p-3.5 flex justify-between items-center text-xs">
                <div>
                  <p className="font-mono text-white/80 truncate max-w-[180px]">{videoFile.name}</p>
                  <p className="text-[9px] font-mono text-white/30 mt-0.5">Size: {(videoFile.size / 1024 / 1024).toFixed(1)} MB</p>
                </div>
                {videoDuration > 0 && (
                  <span className="font-mono text-xs border border-white/10 text-white/70 px-2 py-0.5 bg-[#111]">
                    {videoDuration}s
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Visual Storyboard rendering container */}
          {storyboardBase64 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-[9px] font-mono tracking-[0.2em] text-white/40 uppercase font-bold">
                GRID STORYBOARD // SEQUENCE MATRIX
              </h4>
              <div className="border border-white/10 bg-[#050505] rounded-none p-1.5 max-h-[220px] overflow-y-auto">
                <img 
                  src={storyboardBase64} 
                  alt="Video Storyboard Collage" 
                  className="w-full h-auto object-cover rounded-none"
                  referrerPolicy="no-referrer"
                />
              </div>
              <p className="text-[9px] text-white/30 leading-relaxed font-mono uppercase tracking-[0.05em]">
                Stitched via frame interpolation algorithms. Transmitted dynamically to the vision processing model.
              </p>
            </div>
          )}

          {isExtracting && (
            <div className="bg-[#050505] border border-white/5 rounded-none p-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/40 font-mono uppercase tracking-wider text-[10px]">Decomposing Video...</span>
                <span className="text-[#FF3B00] font-mono tracking-widest text-[10px]">Frame {extractionProgress?.currentFrame || 0} / {extractionProgress?.totalFrames || "?"}</span>
              </div>
              <div className="w-full bg-white/5 h-[2px] rounded-none overflow-hidden">
                <div 
                  className="bg-[#FF3B00] h-full duration-250"
                  style={{ 
                    width: `${extractionProgress?.totalFrames && extractionProgress.totalFrames > 0 
                      ? (extractionProgress.currentFrame / extractionProgress.totalFrames) * 100 
                      : 10
                    }%` 
                  }}
                />
              </div>
              <p className="text-[10px] font-mono text-white/30 leading-relaxed uppercase">
                Applying spatial diagnostics at proportional frame intervals.
              </p>
            </div>
          )}
        </div>

        {/* Small footer settings prompt */}
        <div className="border-t border-white/5 pt-4 mt-4">
          <button 
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 text-[10px] text-white/30 hover:text-white transition font-mono uppercase tracking-wider"
          >
            <Settings className="w-3.5 h-3.5 text-[#FF3B00]" />
            Manage Auth Tokens &amp; Credentials
          </button>
        </div>
      </div>

      {/* COLUMN 2: Chat Assistant (45% -> col-span-5) */}
      <div className="lg:col-span-5 bg-[#0F0F0F] border border-white/5 rounded-none flex flex-col justify-between overflow-hidden relative">
        {/* Header bar of Chat bubble */}
        <div className="border-b border-white/5 px-6 py-4 bg-[#050505] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-none bg-[#FF3B00] flex items-center justify-center font-bold text-black text-xs font-mono shrink-0">
              V
            </div>
            <div>
              <p className="text-xs font-mono font-bold text-white uppercase tracking-wider">VIRAL_AI_STRATEGIST</p>
              <p className="text-[9px] text-[#FF3B00] flex items-center gap-1 font-mono uppercase tracking-widest mt-0.5">
                <span className="w-1.5 h-1.5 bg-[#FF3B00] rounded-full animate-ping" />
                SANDBOX ACTIVE
              </p>
            </div>
          </div>
          
          {latestAnalysis && (
            <button
              onClick={() => onAnalysisSuccess(latestAnalysis)}
              className="text-[10px] font-mono uppercase tracking-wider bg-white text-black border border-white px-3.5 py-1.5 rounded-none hover:bg-transparent hover:text-white transition cursor-pointer"
            >
              [OPEN_DOSSIER]
            </button>
          )}
        </div>

        {/* Conversation flow */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 h-[420px] lg:h-auto lg:max-h-[calc(100vh-380px)]">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex gap-3 leading-relaxed text-sm ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role !== "user" && !msg.isSystem && (
                <div className="w-7 h-7 rounded-none bg-[#050505] text-[#FF3B00] border border-white/10 flex items-center justify-center font-mono font-bold text-xs shrink-0 self-start">
                  V
                </div>
              )}
              
              <div className={`max-w-[85%] rounded-none p-4 ${
                msg.isSystem 
                  ? "bg-[#050505] text-white/40 border border-white/5 text-xs font-mono"
                  : msg.role === "user"
                    ? "bg-[#FF3B00] text-black font-semibold rounded-none"
                    : "bg-[#050505] text-white/80 border border-white/10 rounded-none font-sans"
              }`}>
                {/* Check system log output or standard chat text rendering */}
                {msg.isSystem ? (
                  <div>{msg.content}</div>
                ) : (
                  <div className="whitespace-pre-wrap link-accented">
                    {/* Simplified markdown format renderer for bolding/bullet marks */}
                    {msg.content.split("\n\n").map((part, i) => {
                      // Basic bullets check
                      if (part.startsWith("- ")) {
                        return (
                          <ul key={i} className="list-disc pl-5 space-y-1 my-2">
                            {part.split("\n").map((b, bi) => (
                              <li key={bi}>{b.replace(/^- /, "")}</li>
                            ))}
                          </ul>
                        );
                      }
                      
                      // Bolding highlights replacement
                      const textString = part.replace(/\*\*(.*?)\*\*/g, "$1");
                      return <p key={i} className="mb-2 last:mb-0 leading-normal">{textString}</p>;
                    })}
                  </div>
                )}
                
                <span className={`text-[9px] font-mono block text-right mt-2 ${msg.role === "user" ? "text-black/50" : "text-white/20"}`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {/* Extracting dots */}
          {isGenerating && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-7 h-7 rounded-none bg-[#050505] text-[#FF3B00] border border-white/5 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                V
              </div>
              <div className="bg-[#050505] border border-white/10 p-4 rounded-none max-w-[85%]">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="w-1.5 h-1.5 bg-[#FF3B00] rounded-full animate-bounce delay-100" />
                  <span className="w-1.5 h-1.5 bg-[#FF3B00] rounded-full animate-bounce delay-300" />
                  <span className="w-1.5 h-1.5 bg-[#FF3B00] rounded-full animate-bounce delay-500" />
                </div>
                <span className="text-[11px] font-mono text-white/40 uppercase tracking-wide animate-pulse">
                  {rotatingTip}
                </span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Bottom Input Drawer */}
        <div className="border-t border-white/5 p-4 bg-[#050505] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0A0A0A] p-2 rounded-none border border-white/10">
            <div className="flex gap-1.5">
              {[
                { id: "tiktok", label: "TIKTOK" },
                { id: "instagram", label: "REELS" },
                { id: "youtube", label: "SHORTS" }
              ].map((plat) => {
                const isActive = targetPlatforms.includes(plat.id);
                return (
                  <button
                    key={plat.id}
                    type="button"
                    onClick={() => togglePlatform(plat.id)}
                    className={`text-[9px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-none cursor-pointer transition-all ${
                      isActive 
                        ? "bg-[#FF3B00]/15 text-[#FF3B00] border border-[#FF3B00]/30"
                        : "text-white/40 hover:text-white/80"
                    }`}
                  >
                    {plat.label}
                  </button>
                );
              })}
            </div>
            <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest mr-2">
              Optimize // Targets
            </span>
          </div>

          <form onSubmit={handleAnalyze} className="flex gap-3">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAnalyze();
                }
              }}
              placeholder={
                storyboardBase64 
                  ? "Formulate comments, pacing instructions, or brand voice constraints..." 
                  : "Insert a visual timeline asset first..."
              }
              disabled={!storyboardBase64 || isGenerating}
              className="flex-1 bg-[#050505] border border-white/10 rounded-none text-white placeholder-white/20 px-4 py-3.5 focus:outline-none focus:border-[#FF3B00] text-xs resize-none disabled:opacity-40 min-h-[50px] font-mono"
            />
            <button
              type="submit"
              disabled={!storyboardBase64 || isGenerating}
              className="bg-[#111111] hover:bg-white text-white hover:text-black border border-white/20 hover:border-white p-4.5 rounded-none flex items-center justify-center shrink-0 disabled:opacity-30 cursor-pointer shadow-md transition-all active:scale-95 duration-200"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

      {/* COLUMN 3: Diagnostics Panel / Live Dashboard (25% -> col-span-3) */}
      <div className="lg:col-span-3 bg-[#0F0F0F] border border-white/5 rounded-none p-5 flex flex-col justify-between overflow-y-auto min-h-[300px]">
        <div className="space-y-6">
          <h3 className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-[0.25em] border-b border-white/5 pb-3 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-[#FF3B00]" />
            Live_Diagnostics
          </h3>

          {!latestAnalysis ? (
            <div className="text-center py-12 space-y-4">
              <BarChart2 className="w-10 h-10 text-white/10 mx-auto opacity-40 animate-pulse" />
              <p className="text-[11px] font-mono uppercase tracking-wider text-white/40">NO DIAGNOSTICS INITIATED</p>
              <p className="text-[10px] font-mono text-white/20 leading-relaxed uppercase">
                Submit an extracted collateral sequence matrix to formulate the real-time retention prediction score layers.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overall viral mini graph circle */}
              <div className="bg-[#050505] border border-[#FF3B00]/20 rounded-none p-5 flex flex-col items-center justify-center text-center">
                <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/40">CORE VELOCITY MATRIX</span>
                <span className="text-5xl font-serif italic font-light text-[#FF3B00] mt-3">
                  {latestAnalysis.viralScores.overallViralScore}%
                </span>
                <div className="h-[1px] w-12 bg-white/10 my-3"></div>
                <p className="text-[9px] font-mono text-white/30 uppercase tracking-[0.05em] leading-normal">
                  Drawn using frame sequence metrics inside Google AI parameters.
                </p>
              </div>

              {/* Identified Category & Details */}
              <div className="bg-[#050505] border border-white/5 rounded-none p-4 space-y-3 font-mono">
                <div className="flex justify-between items-center text-[10px] uppercase border-b border-white/5 pb-2">
                  <span className="text-white/40">Category_Code</span>
                  <span className="text-white font-semibold italic">{latestAnalysis.videoIntelligence.detectedCategory}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] uppercase border-b border-[#222]/30 pb-2">
                  <span className="text-white/40">Spatial_Mood</span>
                  <span className="text-white font-semibold italic">{latestAnalysis.videoIntelligence.visualMood}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] uppercase">
                  <span className="text-white/40">Motion_Style</span>
                  <span className="text-white font-semibold italic">{latestAnalysis.videoIntelligence.pacingStyle}</span>
                </div>
              </div>

              {/* Top hooks listing preview */}
              <div className="space-y-3">
                <h4 className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/40 font-bold">
                  Top_Engagement_Hooks
                </h4>
                {latestAnalysis.hooks.slice(0, 3).map((hook, i) => (
                  <div key={i} className="bg-[#050505] border border-white/5 rounded-none p-3.5 space-y-2">
                    <p className="font-serif italic text-white/90 leading-tight">"{hook.text}"</p>
                    <div className="flex justify-between text-[9px] font-mono uppercase tracking-wider text-white/30">
                      <span>Ref: {hook.psychologicalTrigger}</span>
                      <span className="text-[#FF3B00] font-bold">{hook.strengthScore}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Large action button for complete reports doc */}
        {latestAnalysis && (
          <button
            onClick={() => onAnalysisSuccess(latestAnalysis)}
            className="w-full bg-[#111111] hover:bg-white border border-white/10 hover:border-white font-mono text-[10px] uppercase tracking-[0.2em] text-white hover:text-black py-4 rounded-none transition-all flex items-center justify-between group mt-6 cursor-pointer duration-300"
          >
            <span>[DIAGNOSTICS_REPORT]</span>
            <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-black group-hover:translate-x-1 duration-200" />
          </button>
        )}
      </div>

    </div>
  );
}
