import React, { useState } from "react";
import { Eye, EyeOff, ShieldAlert, Key, Sparkles } from "lucide-react";

interface OnboardingViewProps {
  onApiKeySubmit: (key: string) => void;
  isLoadingEnvironment: boolean;
}

export default function OnboardingView({ onApiKeySubmit, isLoadingEnvironment }: OnboardingViewProps) {
  const [keyInput, setKeyInput] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) {
      setErrorMsg("Please enter a valid Gemini API key to proceed.");
      return;
    }
    setErrorMsg("");
    onApiKeySubmit(keyInput.trim());
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E5E5E5] flex flex-col items-center justify-center p-4 sm:p-6 border-2 md:border-8 border-[#1A1A1A]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-100px,rgba(255,59,0,0.05),transparent)] pointer-events-none" />
      
      <div className="w-full max-w-lg bg-[#0F0F0F] border border-white/5 rounded-none p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Decorative thin accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#FF3B00]" />

        <div className="flex flex-col items-center text-center mb-8">
          <div className="mb-4">
            <span className="font-mono text-[#FF3B00] text-xs uppercase tracking-[0.3em]">System // Initialization</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif italic tracking-tighter leading-none text-white">
            Viral_AI
          </h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mt-2">
            Digital Form & Pacing Diagnostics
          </p>
          <p className="text-xs text-white/60 mt-6 max-w-xs leading-relaxed font-sans">
            An exploration into the weight of digital choreography. Formulate viral arcs through real-time frame interpolation.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="apiKey" className="text-[10px] uppercase tracking-[0.2em] text-white/40 flex items-center gap-1.5 font-mono">
                <Key className="w-3 h-3 text-[#FF3B00]" />
                Gemini_API_Key
              </label>
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] uppercase tracking-[0.2em] text-[#FF3B00] hover:underline font-mono"
              >
                [GET_KEY]
              </a>
            </div>

            <div className="relative">
              <input
                id="apiKey"
                type={showKey ? "text" : "password"}
                value={keyInput}
                onChange={(e) => {
                  setKeyInput(e.target.value);
                  setErrorMsg("");
                }}
                placeholder="AI_Studio_Authorizations..."
                className="w-full bg-[#050505] border border-white/10 text-white placeholder-white/20 px-4 py-3 rounded-none focus:outline-none focus:border-[#FF3B00] text-xs font-mono transition-all"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                aria-label={showKey ? "Hide API key" : "Show API key"}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/30 hover:text-white"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {errorMsg && (
              <p className="text-[11px] text-[#FF3B00] mt-2 flex items-center gap-1.5 font-mono">
                <ShieldAlert className="w-3.5 h-3.5" />
                {errorMsg}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full border border-white/20 py-3.5 text-[10px] uppercase tracking-[0.2em] hover:bg-white hover:text-black bg-[#111111]/80 hover:border-white text-white transition-colors rounded-none cursor-pointer duration-300"
          >
            Authenticate Credentials
          </button>
        </form>

        <div className="mt-8 border-t border-white/5 pt-6 text-center">
          <p className="text-[10px] text-white/30 leading-relaxed font-mono uppercase tracking-[0.1em]">
            Stored locally / End-to-end sandbox.
          </p>
        </div>
      </div>
    </div>
  );
}
