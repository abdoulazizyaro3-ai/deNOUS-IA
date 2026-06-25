import React, { useState, useEffect } from "react";
import AfricaMap from "../components/explore-africa/AfricaMap";
import CountryDescription from "../components/explore-africa/CountryDescription";
import { AnimatePresence, motion } from "framer-motion";
import { Globe } from "lucide-react";

interface ExplorerAfriqueProps {
  searchQuery?: string;
  setSearchQuery?: (v: string) => void;
  handleSuggestionClick?: (text: string) => void;
}

export default function ExplorerAfrique({ searchQuery, setSearchQuery, handleSuggestionClick }: ExplorerAfriqueProps) {
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
  const [countriesData, setCountriesData] = useState<Record<string, any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/explore/countries/')
      .then(res => res.json())
      .then(data => {
        setCountriesData(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Erreur de chargement:", err);
        setIsLoading(false);
      });
  }, []);

  // Track selection and update map highlight
  const handleSelectCountry = (id: string | null) => {
    setSelectedCountryId(id);
  };

  // Lock scroll of body when portal/modal is shown
  useEffect(() => {
    if (selectedCountryId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedCountryId]);

  return (
    <div id="app-root" className="min-h-screen bg-[#fcfbf9] text-stone-900 selection:bg-amber-100 selection:text-amber-900 pb-20 w-full">
      {/* HEADER SECTION */}
      <header className="border-b border-stone-200/50 bg-white/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-emerald-600 flex items-center justify-center text-white shadow-lg overflow-hidden">
              <Globe className="w-5 h-5 animate-[spin_8s_linear_infinite] opacity-90" />
            </div>
            <div>
              <h1 className="font-serif font-extrabold text-lg sm:text-xl tracking-tight text-stone-900">
                Découvrir l'Afrique
              </h1>
              <p className="text-xs text-stone-500 font-sans hidden sm:block">
                Le portail universel de découverte du continent noir
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-stone-500 bg-stone-100/80 px-3 py-1.5 rounded-lg border border-stone-200/40">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            <span>Unité • Diversité • Beauté</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2 space-y-2">

        {/* MAP & SELECTION HUB */}
        <section id="interactive-map-hub" className="space-y-2">
          <div className="text-center max-w-2xl mx-auto space-y-1.5 pt-0 pb-0">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-emerald-500/10 border border-stone-200 text-stone-700 text-[10px] font-black uppercase tracking-widest shadow-sm"
            >
              <Globe className="w-3.5 h-3.5 text-amber-600 animate-[spin_4s_linear_infinite]" /> 
              <span>Carte Interactive Intelligente</span>
            </motion.div>
            
            <h2 className="font-serif font-black text-2xl sm:text-3xl lg:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-stone-900 to-stone-600 tracking-tight">
              Sélectionnez une destination
            </h2>
          </div>

          {isLoading ? (
            <div className="h-[600px] flex items-center justify-center bg-stone-50 rounded-3xl border border-stone-200">
               <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <AfricaMap 
              onSelectCountry={handleSelectCountry} 
              selectedCountryId={selectedCountryId}
              countriesData={countriesData || {}}
            />
          )}
        </section>
      </main>

      {/* DETAILED COUNTRY EXPLORATION PORTAL (MODAL BACKDROP) */}
      <AnimatePresence>
        {selectedCountryId && (
          <div 
            id="portal-modal-overlay"
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-stone-950/80 backdrop-blur-md overflow-hidden"
            onClick={() => setSelectedCountryId(null)}
          >
            {/* Modal Window Container */}
            <div 
              id="portal-modal-container"
              className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl flex flex-col h-[90vh] overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Universal Close Control inside Modal wrapper */}
              <div className="absolute top-4 right-4 z-[55]">
                <button
                  onClick={() => setSelectedCountryId(null)}
                  className="w-10 h-10 rounded-full bg-stone-900/80 hover:bg-rose-600 font-sans font-bold text-white flex items-center justify-center transition-all shadow-lg text-lg hover:scale-115 border border-stone-800/10 cursor-pointer focus:outline-none"
                  title="Fermer le portail de connaissance"
                >
                  ✕
                </button>
              </div>

              {/* Scrolling wrapper for CountryDescription content */}
              <div className="flex-1 overflow-y-auto p-1 scrollbar-thin">
                <CountryDescription countryId={selectedCountryId} countriesData={countriesData || {}} />
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-stone-200/50 mt-20 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-sans text-stone-450">
        <div id="footer-logo" className="text-stone-400">
          © {new Date().getFullYear()} Découvrir l'Afrique. Projet éducatif d'échange culturel.
        </div>
        <div id="footer-links" className="flex items-center gap-4">
          <span className="hover:text-stone-700 transition-colors cursor-pointer flex items-center gap-1">
            🌍 Afrique de l'Ouest, Centrale, Est et Sud
          </span>
          <span className="text-stone-300">|</span>
          <span className="hover:text-stone-700 transition-colors cursor-pointer">
            Conditions de visite virtuelle
          </span>
        </div>
      </footer>
    </div>
  );
}
