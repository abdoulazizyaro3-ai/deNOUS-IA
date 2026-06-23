import React from "react";

interface CartographieProps {
  setActiveTab: (tab: string) => void;
}

export default function Cartographie({ setActiveTab }: CartographieProps) {
  return (
    <div className="px-6 md:px-12 py-8 max-w-5xl mx-auto w-full space-y-6">
      <div className="border-b border-[#E5E7EB] pb-4">
        <h2 className="text-xl font-bold font-display text-[#344035]">🗺️ Cartographie des Savoirs Actifs</h2>
        <p className="text-xs text-[#354e38]/60 mt-0.5">Visualisez géographiquement la répartition des foyers de savoirs collectés.</p>
      </div>
      <div className="bg-[#E5E7EB]/40 rounded-3xl border-2 border-dashed border-[#5FAF68]/30 min-h-[420px] flex flex-col items-center justify-center p-6 text-center space-y-4 relative overflow-hidden bg-white">
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
          <svg viewBox="0 0 100 100" className="w-[80%] h-full fill-emerald-600 mx-auto">
            <path d="M 40,10 C 43,8 54,4 59,5 C 64,6 63,12 68,14 C 73,16 78,13 83,16 C 88,19 86,25 84,29 C 82,33 86,37 83,43 C 80,49 71,56 68,61 C 65,66 65,72 63,77 C 61,82 59,88 56,92 C 53,96 48,98 46,95 C 44,92 45,84 43,81 C 41,78 36,76 34,71 C 32,66 33,60 30,55 C 27,50 22,48 19,45 C 16,42 15,38 18,36 C 21,34 26,38 29,36 C 32,34 32,29 33,25 C 34,21 34,17 37,14 C 40,11 37,12 40,10 Z" />
          </svg>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-center z-10 w-full flex-wrap">
          {[
            { emoji: "🌱", city: "Ségou, Mali", desc: "4 récits agroécologiques (Zaï, sorgho)", color: "text-[#5FAF68]" },
            { emoji: "🩺", city: "Ouahigouya, Burkina", desc: "Pharmacie par les feuilles de Moringa", color: "text-amber-600" },
            { emoji: "📜", city: "Ifá, Osun, Nigéria", desc: "2 manuscrits orologiques Ifá de paix", color: "text-blue-500" },
          ].map((pin, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-[#5FAF68]/20 shadow-md flex items-center gap-3 w-64 text-left">
              <span className="text-2xl">{pin.emoji}</span>
              <div>
                <h4 className="text-xs font-bold text-[#344035]">{pin.city}</h4>
                <span className={`text-[10px] font-bold ${pin.color}`}>{pin.desc}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="pt-6 text-center max-w-md z-10">
          <p className="text-xs text-slate-500 italic max-w-sm">« Chaque point correspond à une transmission orale ayant fait l'objet d'un accord de consentement libre des familles d'anciens. »</p>
          <button onClick={() => setActiveTab("Bibliothèque des savoirs")} className="mt-4 px-4 py-2 bg-[#5FAF68] hover:bg-[#4e9b57] text-white rounded-xl text-xs font-bold transition-all inline-block">
            Voir la base de données
          </button>
        </div>
      </div>
    </div>
  );
}
