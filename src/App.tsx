import React, { useState, useEffect } from "react";
import OnboardingView from "./components/OnboardingView";
import MainView from "./components/MainView";
import ResultsView from "./components/ResultsView";
import { ViralAnalysisResponse } from "./types";
import { Sparkles, Settings, Key, HelpCircle, X, ShieldCheck, Flame, Cpu } from "lucide-react";

export default function App() {
  const [apiKey, setApiKey] = useState<string>("");
  const [view, setView] = useState<"onboarding" | "main" | "results">("onboarding");
  const [activeAnalysis, setActiveAnalysis] = useState<ViralAnalysisResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Settings Slide Drawer state
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [drawerKeyInput, setDrawerKeyInput] = useState<string>("");

  // Toast widget state
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Load API Key on first mount
  useEffect(() => {
    const key = localStorage.getItem("viralai_key") || "";
    if (key) {
      setApiKey(key);
      setDrawerKeyInput(key);
      setView("main");
    } else {
      setView("onboarding");
    }
  }, []);

  // Handle successful onboarding API Key submission
  const handleApiKeySubmit = (key: string) => {
    localStorage.setItem("viralai_key", key);
    setApiKey(key);
    setDrawerKeyInput(key);
    setView("main");
    triggerToast("System authorized successfully! ✓");
  };

  // Save changes from slide drawer settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = drawerKeyInput.trim();
    if (cleanKey) {
      localStorage.setItem("viralai_key", cleanKey);
      setApiKey(cleanKey);
      triggerToast("Gemini token updated! ✓");
      setIsSettingsOpen(false);
      if (view === "onboarding") {
        setView("main");
      }
    } else {
      triggerToast("Key cannot be empty.");
    }
  };

  const handleClearSettings = () => {
    localStorage.removeItem("viralai_key");
    setApiKey("");
    setDrawerKeyInput("");
    setView("onboarding");
    setIsSettingsOpen(false);
    setActiveAnalysis(null);
    triggerToast("Credentials removed.");
  };

  // Trigger floating toast messages
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 2500);
  };

  const handleAnalysisSuccess = (data: ViralAnalysisResponse) => {
    setActiveAnalysis(data);
    setView("results");
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E5E5E5] flex flex-col font-sans relative select-none selection:bg-[#FF3B00]/30 selection:text-white border-2 md:border-8 border-[#1A1A1A]">
      {/* Background visual gradients */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-[radial-gradient(circle_800px_at_50%_-200px,rgba(255,59,0,0.04),transparent)] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle_250px_at_90%_90%,rgba(255,59,0,0.02),transparent)] pointer-events-none" />

      {/* RENDER VIEW 1: ONBOARDING ACCREDITATION SCREEN */}
      {view === "onboarding" ? (
        <OnboardingView onApiKeySubmit={handleApiKeySubmit} isLoadingEnvironment={false} />
      ) : (
        <>
          {/* Dashboard Header Layout (for views main/results) */}
          <header className="border-b border-white/5 bg-[#0F0F0F]/90 backdrop-blur-md sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
              
              {/* Logo monogram style matching Studio Aether */}
              <div 
                className="flex items-center gap-4 cursor-pointer"
                onClick={() => setView("main")}
              >
                <div className="w-10 h-10 border border-[#FF3B00]/30 flex items-center justify-center bg-[#050505]">
                  <Sparkles className="w-5 h-5 text-[#FF3B00] animate-pulse" />
                </div>
                <div>
                  <h1 className="text-2xl font-serif italic tracking-tighter text-white leading-none">
                    Viral_AI
                  </h1>
                  <p className="text-[9px] font-mono text-white/40 tracking-[0.25em] uppercase mt-0.5 hidden sm:block">
                    Spatial Motion Diagnostics
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {activeAnalysis && (
                  <button
                    onClick={() => setView(view === "results" ? "main" : "results")}
                    className={`text-[10px] font-mono uppercase tracking-[0.15em] px-4 py-2 border transition cursor-pointer flex items-center gap-2 rounded-none ${
                      view === "results"
                        ? "bg-[#111] border-white/10 text-white/60 hover:text-white"
                        : "bg-[#FF3B00]/10 border-[#FF3B00]/30 text-[#FF3B00] hover:bg-[#FF3B00]/25"
                    }`}
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{view === "results" ? "STUDIO CANVAS" : "DIAGNOSTICS DOSSIER"}</span>
                    <span className="inline sm:hidden">{view === "results" ? "STUDIO" : "DOSSIER"}</span>
                  </button>
                )}

                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2.5 rounded-none bg-[#111111] border border-white/10 hover:border-white text-white/40 hover:text-white transition cursor-pointer"
                  title="Configure Keys"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>

            </div>
          </header>

          {/* MAIN PAGE CONTAINER CONTAINER */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
            {view === "main" ? (
              <MainView
                apiKey={apiKey}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onAnalysisSuccess={handleAnalysisSuccess}
                isGenerating={isGenerating}
                setIsGenerating={setIsGenerating}
                onTriggerToast={triggerToast}
              />
            ) : (
              activeAnalysis && (
                <ResultsView
                  data={activeAnalysis}
                  onBackToChat={() => setView("main")}
                  onRegenerate={() => {
                    // Triggers the analysis loop again from results view
                    setView("main");
                    triggerToast("Returning to chat canvas... Type comments or scroll downward.");
                  }}
                  isGenerating={isGenerating}
                  onTriggerToast={triggerToast}
                />
              )
            )}
          </main>
        </>
      )}

      {/* FLOATING TOAST WIDGET POPUP */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F0F0F] border border-[#FF3B00]/30 text-white text-[10px] uppercase font-mono tracking-[0.15em] px-5 py-3 rounded-none shadow-[0_8px_30px_rgba(0,0,0,0.8)] flex items-center gap-3 animate-fade-in-up md:max-w-xs transition-all">
          <div className="w-4 h-4 bg-[#FF3B00]/20 rounded-none flex items-center justify-center">
            <Flame className="w-3 h-3 text-[#FF3B00]" />
          </div>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* OVERLAY SLIDING SETTINGS DRAWER */}
      {isSettingsOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-xs z-40 transition-opacity"
            onClick={() => setIsSettingsOpen(false)}
          />
          
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#0A0A0A] border-l border-white/10 z-50 p-8 flex flex-col justify-between overflow-y-auto shadow-2xl animate-slide-in">
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-[#FF3B00]" />
                  <h3 className="text-xs font-bold text-white font-mono uppercase tracking-[0.2em]">[SYSTEM_CONFIG]</h3>
                </div>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-1 rounded-none text-white/40 hover:text-white hover:bg-white/5 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div>
                  <label htmlFor="drawer-api-key" className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em] block mb-2">
                    Gemini API Authorization
                  </label>
                  
                  <div className="relative">
                    <input
                      id="drawer-api-key"
                      type="password"
                      value={drawerKeyInput}
                      onChange={(e) => setDrawerKeyInput(e.target.value)}
                      placeholder="Input API tokens..."
                      className="w-full bg-[#050505] border border-white/10 text-white placeholder-white/20 px-4 py-3 rounded-none focus:outline-none focus:border-[#FF3B00] text-xs font-mono transition-all"
                    />
                  </div>

                  <p className="text-[10px] text-white/30 tracking-tight leading-relaxed mt-3">
                    Credential stored securely in local state structures. Used exclusively inside the private proxy chain context.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-[#111] border border-white/20 hover:bg-white hover:text-black py-3 px-4 rounded-none text-white font-mono text-[10px] uppercase tracking-[0.2em] transition cursor-pointer shadow-md text-center flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#FF3B00]" />
                    Save Changes
                  </button>
                  
                  {apiKey && (
                    <button
                      type="button"
                      onClick={handleClearSettings}
                      className="bg-neutral-900 hover:bg-[#FF3B00]/20 text-[#FF3B00] border border-[#FF3B00]/20 text-[10px] uppercase font-mono tracking-[0.15em] py-3 px-4 rounded-none transition cursor-pointer"
                    >
                      Disconnect
                    </button>
                  )}
                </div>
              </form>

              <div className="bg-[#0F0F0F] border border-white/5 rounded-none p-5 space-y-3 mt-6">
                <h4 className="text-[11px] font-semibold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <HelpCircle className="w-4 h-4 text-[#FF3B00]" />
                  Need a Gemini Token?
                </h4>
                <p className="text-xs text-white/50 leading-relaxed font-sans">
                  Obtain an access key free of charge inside Google AI Studio's key management environment.
                </p>
                <a 
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block text-[10px] text-[#FF3B00] uppercase font-mono tracking-wider hover:underline"
                >
                  Retrieve key context &rarr;
                </a>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4 mt-8 text-center text-[9px] font-mono text-white/20 tracking-widest uppercase">
              VIRAL AI // EXPERIMENTAL HOOK UNIT VIII
            </div>
          </div>
        </>
      )}
    </div>
  );
}
