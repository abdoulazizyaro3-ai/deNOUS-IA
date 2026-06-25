import React from "react";
import { motion } from "framer-motion";
import { Settings, Mic, Volume2, Globe, Shield, Bell } from "lucide-react";

export default function Parametres() {
  return (
    <div className="px-4 sm:px-6 md:px-12 py-8 max-w-4xl mx-auto w-full">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="inline-flex items-center justify-center p-3 bg-[#C1561F]/10 rounded-2xl mb-4">
          <Settings className="w-8 h-8 text-[#C1561F]" />
        </div>
        <h2 className="text-3xl font-black font-serif text-[#2B1810] tracking-tight">Paramètres</h2>
        <p className="text-sm text-[#2B1810]/60 mt-2 max-w-xl">
          Personnalisez votre expérience deNOUS AI. Ajustez l'assistant vocal, vos préférences de langue et la confidentialité de vos données.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assistant Vocal Config */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl shadow-sm border border-[#EADBC8]/50 space-y-6"
        >
          <div className="flex items-center gap-3 border-b border-[#EADBC8]/50 pb-4">
            <Mic className="w-5 h-5 text-[#C1561F]" />
            <h3 className="font-bold text-[#2B1810]">Assistant Vocal</h3>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-[#2B1810]/80 block">Sensibilité du microphone</label>
            <input type="range" min="1" max="100" defaultValue="75" className="w-full accent-[#C1561F] h-1.5 bg-[#EADBC8] rounded-full appearance-none outline-none" />
            <div className="flex justify-between text-[10px] text-[#2B1810]/50 font-bold uppercase tracking-wider">
              <span>Faible</span>
              <span className="text-[#059669]">75% (Recommandé)</span>
              <span>Sensible</span>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold text-[#2B1810]/80">Qualité et timbre vocal</p>
            <div className="grid grid-cols-1 gap-3">
              <button className="flex items-center justify-between p-3.5 bg-gradient-to-r from-[#C1561F]/10 to-transparent border border-[#C1561F]/20 rounded-2xl text-left transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-full shadow-sm">
                    <Volume2 className="w-4 h-4 text-[#C1561F]" />
                  </div>
                  <div>
                    <span className="block text-sm font-black text-[#2B1810]">Voix chaleureuse africaine</span>
                    <span className="block text-[10px] text-[#2B1810]/50 mt-0.5">Optimum pour les récits</span>
                  </div>
                </div>
                <div className="w-4 h-4 rounded-full border-4 border-[#C1561F] bg-white"></div>
              </button>
              <button className="flex items-center justify-between p-3.5 bg-white border border-[#EADBC8]/50 hover:border-[#C1561F]/20 rounded-2xl text-left transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#F5ECE1] rounded-full">
                    <Volume2 className="w-4 h-4 text-[#2B1810]/40" />
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-[#2B1810]/70">Voix standard synthétique</span>
                    <span className="block text-[10px] text-[#2B1810]/40 mt-0.5">Classique et rapide</span>
                  </div>
                </div>
                <div className="w-4 h-4 rounded-full border-2 border-[#EADBC8] bg-transparent"></div>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Global Config */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Langue & Région */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#EADBC8]/50">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-5 h-5 text-[#C1561F]" />
              <h3 className="font-bold text-[#2B1810]">Langue & Région</h3>
            </div>
            <select className="w-full bg-[#F5ECE1] border-none text-sm font-bold text-[#2B1810] p-3.5 rounded-2xl outline-none focus:ring-2 focus:ring-[#C1561F]/30 appearance-none">
              <option>Français (Afrique de l'Ouest)</option>
              <option>English (African)</option>
              <option>Bambara</option>
              <option>Wolof</option>
            </select>
          </div>

          {/* Notifications & Privacy */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#EADBC8]/50 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#F5ECE1] rounded-xl"><Bell className="w-4 h-4 text-[#C1561F]" /></div>
                <div>
                  <h3 className="font-bold text-sm text-[#2B1810]">Notifications Push</h3>
                  <p className="text-[10px] text-[#2B1810]/50">Alertes de nouveaux savoirs</p>
                </div>
              </div>
              <div className="w-10 h-6 bg-[#059669] rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
            
            <div className="h-px bg-[#EADBC8]/50 w-full"></div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#F5ECE1] rounded-xl"><Shield className="w-4 h-4 text-[#C1561F]" /></div>
                <div>
                  <h3 className="font-bold text-sm text-[#2B1810]">Mode Privé</h3>
                  <p className="text-[10px] text-[#2B1810]/50">Ne pas sauvegarder l'historique</p>
                </div>
              </div>
              <div className="w-10 h-6 bg-[#EADBC8] rounded-full relative cursor-pointer">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
