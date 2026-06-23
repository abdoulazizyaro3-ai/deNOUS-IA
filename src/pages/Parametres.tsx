import React from "react";

export default function Parametres() {
  return (
    <div className="px-6 md:px-12 py-8 max-w-3xl mx-auto w-full space-y-6">
      <div className="border-b border-[#E5E7EB] pb-4">
        <h2 className="text-xl font-bold font-display text-[#334034]">⚙️ Paramètres de l'Assistant Vocal</h2>
        <p className="text-xs text-[#354e38]/60 mt-0.5 font-medium">Contrôlez finement l'expérience sonore et l'affichage.</p>
      </div>
      <div className="bg-white p-6 rounded-3xl border border-[#E5E7EB] shadow-sm space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#344035] block">Sensibilité du microphone :</label>
          <input type="range" min="1" max="100" defaultValue="75" className="w-full accent-[#5FAF68]" />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>Faible</span>
            <span>75% (Recommandé)</span>
            <span>Sensible</span>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-bold text-[#344035]">Qualité audio des explications synthèse vocale :</p>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button className="p-3 bg-[#DFF2E1]/50 border border-[#5FAF68]/30 rounded-xl text-xs text-left font-bold text-[#354e38]">
              🗣️ Voix chaleureuse africaine (Par défaut)
            </button>
            <button className="p-3 bg-white border border-[#E5E7EB] rounded-xl text-xs text-left text-[#354e38]/75">
              📻 Voix standard synthétique
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
