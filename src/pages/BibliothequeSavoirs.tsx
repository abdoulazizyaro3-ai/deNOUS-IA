import React from "react";
import { PlusCircle, Volume2 } from "lucide-react";
import { KnowledgeNode } from "../types";

interface BibliothequeSavoirsProps {
  nodes: KnowledgeNode[];
  newSavoirTitle: string;
  setNewSavoirTitle: (v: string) => void;
  newSavoirText: string;
  setNewSavoirText: (v: string) => void;
  newSavoirTheme: string;
  setNewSavoirTheme: (v: string) => void;
  selectedCountry: string;
  setSelectedCountry: (v: string) => void;
  handleIngestSubmit: (e: React.FormEvent) => void;
  fetchNodes: () => void;
  speakText: (text: string) => void;
  handleSuggestionClick: (text: string) => void;
}

export default function BibliothequeSavoirs({
  nodes, newSavoirTitle, setNewSavoirTitle, newSavoirText, setNewSavoirText,
  newSavoirTheme, setNewSavoirTheme, selectedCountry, setSelectedCountry,
  handleIngestSubmit, fetchNodes, speakText, handleSuggestionClick,
}: BibliothequeSavoirsProps) {
  return (
    <div className="px-6 md:px-12 py-8 max-w-5xl mx-auto w-full space-y-6">
      <div className="border-b border-[#E5E7EB] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h2 className="text-xl font-bold font-display text-[#344035]">📚 Bibliothèque des Savoirs Collectés</h2>
          <p className="text-xs text-[#354e38]/60 mt-0.5">Explorez l'inventaire certifié de notre sagesse africaine.</p>
        </div>
        <button onClick={async () => { await fetch("/api/nodes/reset", { method: "POST" }); fetchNodes(); }} className="text-[11px] font-extrabold text-[#5FAF68] bg-[#DFF2E1] px-3 py-1.5 rounded-xl border border-[#5FAF68]/15">
          Réinitialiser la base
        </button>
      </div>
      <div className="bg-white p-6 rounded-3xl border border-[#E5E7EB] shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-[#344035] uppercase tracking-wider flex items-center gap-1.5">
          <PlusCircle size={14} className="text-[#5FAF68]" />
          <span>Contribuer à l'héritage d'un aîné (Capture de Parole)</span>
        </h3>
        <form onSubmit={handleIngestSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input type="text" placeholder="Titre du récit (ex: Tisane digestive du Néré)" value={newSavoirTitle} onChange={(e) => setNewSavoirTitle(e.target.value)} className="bg-[#F4F1E8]/30 px-3 py-2 text-xs rounded-xl focus:ring-1 focus:ring-[#5FAF68] outline-none" required />
            <select value={newSavoirTheme} onChange={(e) => setNewSavoirTheme(e.target.value)} className="bg-[#F4F1E8]/30 px-3 py-2 text-xs rounded-xl focus:ring-1 focus:ring-[#5FAF68] outline-none">
              <option value="agriculture">🌾 Agriculture & Élevage</option>
              <option value="health">💊 Pharmacopée de Santé</option>
              <option value="culture">🏛️ Tradition & Culture</option>
              <option value="education">🎓 Enseignement</option>
            </select>
            <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)} className="bg-[#F4F1E8]/30 px-3 py-2 text-xs rounded-xl focus:ring-1 focus:ring-[#5FAF68] outline-none">
              <option value="Mali">Mali</option>
              <option value="Burkina Faso">Burkina Faso</option>
              <option value="Sénégal">Sénégal</option>
              <option value="Côte d'Ivoire">Côte d'Ivoire</option>
              <option value="Congo">Congo</option>
            </select>
          </div>
          <textarea placeholder="Enregistrez ou écrivez le récit brut complet prononcé par l'ancien..." rows={3} value={newSavoirText} onChange={(e) => setNewSavoirText(e.target.value)} className="w-full bg-[#F4F1E8]/20 p-3 rounded-2xl text-xs focus:ring-1 focus:ring-[#5FAF68] outline-none border border-[#E5E7EB]" required></textarea>
          <div className="flex items-center justify-between text-[11px] text-[#354e38]/70">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="accent-[#5FAF68]" />
              <span>L'ancien a accordé son consentement d'enregistrement oral</span>
            </label>
            <button type="submit" className="bg-[#5FAF68] hover:bg-[#4e9b57] text-white font-bold text-xs px-4 py-2 rounded-xl transition-all">
              Enregistrer la sagesse
            </button>
          </div>
        </form>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {nodes.map((node) => (
          <div key={node.id} className="bg-white p-5 rounded-2xl border border-[#E5E7EB] hover:border-[#5FAF68]/30 transition-all flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center text-[10px] mb-3">
                <span className="px-2 py-0.5 bg-[#F4F1E8] text-[#354e38] font-bold rounded-full">{node.theme}</span>
                <span className="text-[#3D6B35] font-black">{node.reliabilityScore >= 90 ? "🌾 Tradition certifiée" : "🌿 Information validée"}</span>
              </div>
              <h4 className="font-bold text-sm text-[#344035]">{node.title}</h4>
              <p className="text-xs text-[#354e38]/70 mt-2 leading-relaxed italic">« {node.description} »</p>
              {node.source && <p className="text-[10px] text-slate-400 mt-3 font-semibold">Sagesse gardée par : {node.source} ({node.country})</p>}
            </div>
            <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex gap-2 justify-between items-center">
              <button onClick={() => speakText(node.description)} className="px-3 py-1 bg-[#DFF2E1]/60 hover:bg-[#DFF2E1] text-[#354e38] text-[10px] font-bold rounded-lg flex items-center gap-1 transition-all">
                <Volume2 size={11} /><span>Écouter la lecture</span>
              </button>
              <button onClick={() => handleSuggestionClick("Parle-moi en détails de " + node.title)} className="text-[10px] font-bold text-[#5FAF68]">
                En savoir plus &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
