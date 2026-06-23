import React from "react";

interface PatrimoineCulturelProps {
  speakText: (text: string) => void;
}

export default function PatrimoineCulturel({ speakText }: PatrimoineCulturelProps) {
  const items = [
    { theme: "Proverbe Bambara", title: "L'eau chaude n'oublie pas sa source", explanation: "Tiré de la sagesse traditionnelle mandingue, ce dicton rappelle que peu importe notre réussite ou la modernité, nos racines africaines et nos aînés restent notre bien fondamental.", speaker: "Kadiatou de Ségou" },
    { theme: "Conte Sacré Mossi", title: "Le lièvre et l'humidité de la nuit", explanation: "Un conte conté sous le baobab qui apprend aux plus jeunes l'art de la patience devant les caprices du climat sahélien pour d'abord écouter la nature.", speaker: "Aîné Boukari de Kaya" },
  ];

  return (
    <div className="px-6 md:px-12 py-8 max-w-4xl mx-auto w-full space-y-6">
      <div className="border-b border-[#E5E7EB] pb-4">
        <h2 className="text-xl font-bold font-display text-[#344035]">🏛️ Patrimoine culturel, proverbes & contes</h2>
        <p className="text-xs text-[#354e38]/60 mt-0.5">La parole chantée et le verbe de transmission.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((prov, i) => (
          <div key={i} className="bg-white p-5 rounded-3xl border border-[#E5E7EB] space-y-3">
            <span className="text-[10.5px] uppercase font-bold text-[#5FAF68]">{prov.theme}</span>
            <blockquote className="text-sm font-extrabold text-[#344035] italic">« {prov.title} »</blockquote>
            <p className="text-xs text-[#354e38]/70 leading-relaxed font-medium">{prov.explanation}</p>
            <div className="pt-2 border-t border-[#E5E7EB] flex justify-between items-center text-[10px] text-slate-400">
              <span>Voix : {prov.speaker}</span>
              <button onClick={() => speakText(prov.title + " . Signification : " + prov.explanation)} className="text-[#5FAF68] font-bold">
                Écouter &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
