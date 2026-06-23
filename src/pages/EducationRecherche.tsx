import React from "react";

export default function EducationRecherche() {
  const sujets = [
    "Optimisation mathématique de l'humidité des poquets du Zaï face au changement climatique.",
    "Structure syntaxique et sémantique de la Charte de Kurukan Fuga.",
    "Évaluation bioactive des alcaloïdes présents dans la pharmacopée des Mossis.",
  ];

  return (
    <div className="px-6 md:px-12 py-8 max-w-4xl mx-auto w-full space-y-6">
      <div className="border-b border-[#E5E7EB] pb-4">
        <h2 className="text-xl font-bold font-display text-[#344035]">🎓 Éducation, traductions & recherche</h2>
        <p className="text-xs text-[#354e38]/60 mt-0.5">Le pont solide entre l'oralité villageoise et la science universitaire.</p>
      </div>
      <div className="bg-white p-6 rounded-3xl border border-[#E5E7EB] shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-[#344035]">Sujets de recherche universitaire encouragés :</h3>
        <ul className="space-y-3">
          {sujets.map((sujet, index) => (
            <li key={index} className="text-xs font-semibold text-[#354e38] flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#DFF2E1] flex items-center justify-center shrink-0 font-bold text-[#5FAF68]">{index + 1}</span>
              <p className="mt-0.5">{sujet}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
