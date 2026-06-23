import React from "react";
import {
  Mic,
  ChevronRight,
  ChevronLeft,
  Volume2,
  X,
  ShieldCheck,
} from "lucide-react";
import {
  CornIllustration,
  MedicinalIllustration,
  MaliHistoryIllustration,
  RainIllustration,
  MarketIllustration,
  GraduationIllustration,
} from "../components/Illustrations";

interface AssistantVocalProps {
  voiceState: "idle" | "listening" | "thinking" | "speaking" | "interrupted" | "processing" | "playing";
  recordingSeconds: number;
  showVocalResponse: boolean;
  aiResponse: string;
  vocalTranslation: string;
  dynamicReliability: number;
  selectedLanguage: string;
  toggleListening: () => void;
  handleSuggestionClick: (text: string) => void;
  speakText: (text: string, audioBase64?: string) => void;
  stopSpeaking: () => void;
  setShowVocalResponse: (v: boolean) => void;
  setVoiceState: (v: "idle" | "listening" | "processing" | "playing" | "thinking" | "speaking" | "interrupted") => void;
  carouselRef: React.RefObject<HTMLDivElement>;
  scrollCarousel: (dir: "left" | "right") => void;
  transcript: string;
  aiAudioOutput: string;
}

export default function AssistantVocal({
  voiceState,
  recordingSeconds,
  showVocalResponse,
  aiResponse,
  vocalTranslation,
  dynamicReliability,
  selectedLanguage,
  toggleListening,
  handleSuggestionClick,
  speakText,
  stopSpeaking,
  setShowVocalResponse,
  setVoiceState,
  carouselRef,
  scrollCarousel,
  transcript,
  aiAudioOutput,
}: AssistantVocalProps) {
  return (
    <div className="flex-1 flex flex-col justify-start px-4 md:px-12 pb-6 pt-2 gap-4 max-w-[1100px] w-full mx-auto relative z-10 bg-[#FAF6F0]/20 bg-bogolan/10 rounded-3xl mt-1 border border-[#EADBC8]/50">
      <div className="text-center space-y-1 py-1.5">
        <h2 className="text-lg md:text-xl font-bold font-display tracking-tight text-[#2B1810] flex items-center justify-center gap-1.5">
          Bonjour <span className="text-[#C1561F]">Aminata D.</span> 👋
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

          {voiceState === "idle" && aiAudioOutput && (
            <div className="flex justify-center pt-2">
              <button 
                onClick={() => speakText(aiResponse, aiAudioOutput)} 
                className="px-4 py-2 bg-[#E8A33D] hover:bg-[#d8922c] rounded-full text-xs font-black text-white flex items-center gap-2 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Volume2 size={14} /><span>Réécouter la réponse</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs md:text-sm">
          <span className="font-black text-[#2B1810] uppercase tracking-wider">💡 Thèmes à écouter :</span>
          <span className="text-[#C1561F] font-black hover:underline cursor-pointer flex items-center gap-0.5">Voir tout <ChevronRight size={15} /></span>
        </div>
        <div className="relative">
          <button onClick={() => scrollCarousel("left")} className="absolute -left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center text-[#354e38]/70 hover:text-[#354e38] z-20 cursor-pointer"><ChevronLeft size={16} /></button>
          <div ref={carouselRef} className="flex gap-4 overflow-x-auto scrollbar-hide py-1.5 px-1 scroll-smooth snap-x" style={{ scrollbarWidth: "none" }}>
            {[
              { illustration: <CornIllustration />, title: "Comment cultiver le maïs cette saison ?", bgColor: "bg-amber-50/50 hover:bg-amber-50" },
              { illustration: <MedicinalIllustration />, title: "Quelles plantes médicinales utilisent les Mossis ?", bgColor: "bg-emerald-50/50 hover:bg-emerald-50" },
              { illustration: <MaliHistoryIllustration />, title: "Raconte-moi l'histoire du royaume du Mali.", bgColor: "bg-yellow-50/50 hover:bg-yellow-50" },
              { illustration: <RainIllustration />, title: "Va-t-il pleuvoir demain dans ma région ?", bgColor: "bg-blue-50/50 hover:bg-blue-50" },
              { illustration: <MarketIllustration />, title: "Comment créer une petite entreprise ?", bgColor: "bg-orange-50/50 hover:bg-orange-50" },
              { illustration: <GraduationIllustration />, title: "Quels sont les débouchés après la licence ?", bgColor: "bg-indigo-50/50 hover:bg-indigo-50" },
            ].map((card, idx) => (
              <button key={idx} onClick={() => handleSuggestionClick(card.title)} className="min-w-[210px] w-[210px] bg-white border border-[#E5E7EB] hover:border-[#5FAF68] rounded-2xl flex flex-col items-stretch text-left shrink-0 scroll-snap-align-start hover:shadow-md transition-all group duration-200 cursor-pointer overflow-hidden p-0">
                <div className={`h-[110px] flex items-center justify-center transition-colors border-b border-[#E5E7EB] ${card.bgColor}`}>{card.illustration}</div>
                <div className="p-3.5 flex flex-col justify-between flex-1 space-y-3">
                  <p className="text-[11px] font-bold text-[#354e38] leading-relaxed group-hover:text-[#5FAF68] transition-colors flex-1">{card.title}</p>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[9px] text-slate-400 font-bold group-hover:text-[#5FAF68]/70 transition-colors uppercase tracking-wider">Savoir local</span>
                    <div className="w-5 h-5 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-[#DFF2E1] transition-all"><ChevronRight size={11} className="text-[#354e38]/50 group-hover:text-[#5FAF68]" /></div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <button onClick={() => scrollCarousel("right")} className="absolute -right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center text-[#354e38]/70 hover:text-[#354e38] z-20 cursor-pointer"><ChevronRight size={16} /></button>
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
