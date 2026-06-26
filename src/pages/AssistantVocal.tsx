import React from "react";
import { Mic, ShieldCheck } from "lucide-react";

interface AssistantVocalProps {
  currentUser?: any;
  voiceState: "idle" | "listening" | "thinking" | "speaking" | "interrupted" | "processing" | "playing";
  recordingSeconds: number;
  toggleListening: () => void;
  stopSession: () => void;
  transcript: string;
}

export default function AssistantVocal({
  currentUser,
  voiceState,
  recordingSeconds,
  toggleListening,
  stopSession,
  transcript,
}: AssistantVocalProps) {
  return (
    <div className="flex-1 flex flex-col justify-start px-4 md:px-12 pb-6 pt-2 gap-4 max-w-[1100px] w-full mx-auto relative z-10 bg-[#FAF6F0]/20 bg-bogolan/10 rounded-3xl mt-1 border border-[#EADBC8]/50">
      <div className="text-center space-y-1 py-1.5">
        <h2 className="text-lg md:text-xl font-bold font-display tracking-tight text-[#2B1810] flex items-center justify-center gap-1.5">
          Bonjour <span className="text-[#C1561F]">{currentUser?.profile?.full_name || currentUser?.username || "Utilisateur"}</span> 👋
        </h2>
      </div>

      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="relative flex items-center justify-center w-56 h-56 select-none">
          <div className="absolute inset-0 rounded-full border-4 border-dashed border-[#C1561F]/20 animate-[spin_40s_linear_infinite]" />
          <div className="absolute w-44 h-44 rounded-full border-[6px] border-double border-[#C1561F] bg-[#FAF6F0] shadow-inner opacity-90 flex items-center justify-center" />
          <div className="absolute w-48 h-48 rounded-full border border-dotted border-[#E8A33D]/60 animate-[spin_80s_linear_infinite]" />
          <div className={`absolute w-52 h-52 rounded-full border-2 border-[#E8A33D] transition-all duration-1000 ${voiceState === "listening" ? "animate-ping scale-110 opacity-80" : "opacity-0"}`} />
          <div className={`absolute w-40 h-40 rounded-full bg-[#E8A33D]/25 transition-all duration-1000 ${voiceState === "listening" ? "scale-125 animate-pulse" : "scale-0 opacity-0"}`} />
          <button
            onClick={toggleListening}
            className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 relative z-10 cursor-pointer ${voiceState === "listening" ? "bg-[#A8341A] border-[#E8A33D] text-white" : "bg-[#E8A33D] hover:bg-[#d8922c] border-white text-white"}`}
            aria-label="Appuyer pour parler"
            style={{ backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.15) 100%)" }}
          >
            <Mic size={48} className={`transition-all duration-300 drop-shadow-md ${voiceState === "listening" ? "animate-pulse scale-110 text-white" : "text-white"}`} />
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#FAF6F0] rounded-sm transform rotate-45" />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#FAF6F0] rounded-sm transform rotate-45" />
            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#FAF6F0] rounded-sm transform rotate-45" />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#FAF6F0] rounded-sm transform rotate-45" />
            {voiceState === "listening" ? (
              <span className="absolute bottom-3 text-[10px] bg-white text-[#A8341A] px-2.5 py-0.5 rounded-full font-black shadow-sm">{recordingSeconds}s</span>
            ) : (
              <span className="absolute bottom-3 text-[9px] font-black uppercase text-white tracking-widest bg-black/20 px-2 py-0.5 rounded-full">🎤 PARLER</span>
            )}
          </button>
        </div>

        <div className="text-center space-y-3 pb-1 w-full max-w-md mx-auto">
          {voiceState !== "playing" && (
            <>
              <h3 className="text-base md:text-lg font-black text-[#2B1810] tracking-tight flex items-center gap-2 justify-center">
                <span>✨</span>
                {voiceState === "idle" && "Appuyez sur le Tambour d'or pour parler"}
                {voiceState === "listening" && (transcript ? `« ${transcript} »` : "Parlez, je vous écoute attentivement...")}
                {voiceState === "processing" && "Recherche en cours..."}
                <span>✨</span>
              </h3>
              <p className="text-xs text-[#2B1810]/75 font-semibold bg-[#FAF6F0] px-4 py-1.5 rounded-full inline-block border border-[#EADBC8]">
                {voiceState === "idle" && "👉 Cliquer une fois puis parler à haute voix"}
                {voiceState === "listening" && "🛑 Re-cliquer sur le tambour rouge quand vous avez fini"}
                {(voiceState === "processing" || voiceState === "thinking") && "🌍 L'IA réfléchit..."}
                {voiceState === "interrupted" && "Interrompu. Vous pouvez parler."}
              </p>
              {voiceState !== "idle" && (
                <div className="pt-2">
                  <button 
                    onClick={stopSession}
                    className="px-4 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-full border border-red-200 transition-colors cursor-pointer"
                  >
                    ⏹️ Arrêter complètement la session
                  </button>
                </div>
              )}
            </>
          )}

          {(voiceState === "playing" || voiceState === "speaking") && (
            <div className="py-4 flex flex-col items-center justify-center space-y-4">
              {/* Sound wave animation with 12 dynamic pulsing bars */}
              <div className="flex items-center gap-2 justify-center h-16 w-full">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((bar) => {
                  const delay = `${(bar % 5) * 0.12}s`;
                  const baseHeight = bar % 2 === 0 ? "h-6" : "h-12";
                  return (
                    <span 
                      key={bar} 
                      className={`w-2 bg-gradient-to-t from-[#C1561F] to-[#E8A33D] rounded-full transition-all duration-300 animate-[pulse_0.8s_infinite_alternate] ${baseHeight}`}
                      style={{ 
                        animationDelay: delay
                      }}
                    />
                  );
                })}
              </div>
              <p className="text-xs font-black uppercase tracking-wider text-[#C1561F] bg-[#C1561F]/10 px-4 py-1.5 rounded-full animate-pulse border border-[#C1561F]/20">
                🔊 Réponse vocale en cours... (Cliquer sur le tambour ou parlez fort pour couper)
              </p>
            </div>
          )}

        </div>
      </div>



      <div className="flex justify-center pt-2">
        <div className="bg-[#DFF2E1]/30 border border-[#5FAF68]/15 px-4 py-1.5 rounded-full flex items-center gap-2 text-[11px] font-bold text-[#354e38]/80 shadow-sm">
          <ShieldCheck size={14} className="text-[#5FAF68]" />
          <span>Vos données sont protégées et respectées.</span>
        </div>
      </div>
    </div>
  );
}
