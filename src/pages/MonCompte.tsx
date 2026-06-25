import React from "react";
import { User, Globe, Mail, MapPin, BookOpen, Compass, LogOut, Award, Shield } from "lucide-react";
import { motion } from "framer-motion";

interface MonCompteProps {
  currentUser?: any;
  onLogout?: () => void;
}

export default function MonCompte({ currentUser, onLogout }: MonCompteProps) {
  // Use real user data or fallback to defaults
  const userProfile = {
    fullName: currentUser?.profile?.full_name || currentUser?.username || "Aminata D.",
    email: currentUser?.email || "aminata.diarra@denous.ai",
    role: currentUser?.profile?.role === "moderator" ? "Modérateur" : "Utilisateur",
    country: currentUser?.profile?.country || "Mali",
    region: currentUser?.profile?.region || "Ségou",
    language: "Bambara / Français",
    joinedDate: "Juin 2026",
  };

  return (
    <div className="px-4 sm:px-6 md:px-12 py-8 max-w-4xl mx-auto w-full">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8"
      >
        <div>
          <div className="inline-flex items-center justify-center p-3 bg-[#C1561F]/10 rounded-2xl mb-4">
            <User className="w-8 h-8 text-[#C1561F]" />
          </div>
          <h2 className="text-3xl font-black font-serif text-[#2B1810] tracking-tight">Mon Compte</h2>
          <p className="text-sm text-[#2B1810]/60 mt-2 max-w-xl">
            Gérez vos informations personnelles et découvrez votre parcours d'exploration africaine.
          </p>
        </div>
        {onLogout && (
          <button 
            onClick={onLogout}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold transition-colors w-full sm:w-auto"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl shadow-sm border border-[#EADBC8]/50 text-center relative overflow-hidden lg:col-span-1"
        >
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#C1561F]/10 to-transparent"></div>
          <div className="relative w-28 h-28 mx-auto bg-[#F5ECE1] rounded-full border-4 border-white shadow-md flex items-center justify-center mt-2">
            <User size={48} className="text-[#C1561F]" />
            <span className="absolute bottom-1 right-1 w-5 h-5 bg-[#059669] border-4 border-white rounded-full" />
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-black text-[#2B1810]">{userProfile.fullName}</h3>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F5ECE1]/50 border border-[#C1561F]/20 text-[#C1561F] text-[10px] font-black rounded-full mt-2 uppercase tracking-wider">
              {userProfile.role === "Modérateur" ? <Shield size={12} /> : <User size={12} />}
              {userProfile.role}
            </div>
          </div>
          
          <div className="mt-6 pt-6 text-left border-t border-[#EADBC8]/50 space-y-4">
            <div className="flex items-center gap-3 p-3 bg-[#FAF6F0] rounded-xl border border-[#EADBC8]/30">
              <div className="p-2 bg-white rounded-lg shadow-sm"><Mail size={16} className="text-[#C1561F]" /></div>
              <div className="truncate">
                <span className="block text-[10px] uppercase font-bold text-[#2B1810]/40">Email</span>
                <span className="block text-xs font-bold text-[#2B1810]/80 truncate">{userProfile.email}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[#FAF6F0] rounded-xl border border-[#EADBC8]/30">
              <div className="p-2 bg-white rounded-lg shadow-sm"><MapPin size={16} className="text-[#C1561F]" /></div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-[#2B1810]/40">Localisation</span>
                <span className="block text-xs font-bold text-[#2B1810]/80">{userProfile.country}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Info & Stats section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6 lg:col-span-2"
        >
          {/* Welcome Card */}
          <div className="bg-gradient-to-br from-white to-[#F5ECE1]/30 p-6 sm:p-8 rounded-3xl border border-[#EADBC8]/50 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#059669]/5 rounded-full blur-3xl group-hover:bg-[#059669]/10 transition-colors"></div>
            <h3 className="text-lg font-bold text-[#2B1810] flex items-center gap-2 mb-4">
              <Compass className="text-[#059669]" size={22} />
              Votre espace d'apprentissage
            </h3>
            <p className="text-sm text-[#2B1810]/70 leading-relaxed mb-4">
              Bienvenue sur votre espace personnel. deNOUS AI est conçu pour vous aider à explorer l'Afrique dans toute sa globalité : son patrimoine, son économie, sa démographie, ses sites touristiques et toutes les informations essentielles concernant le continent africain.
            </p>
            <p className="text-sm text-[#2B1810]/70 leading-relaxed">
              Interrogez l'assistant vocal ou utilisez le chat pour obtenir des réponses précises tirées directement de nos bases de données.
            </p>
          </div>

          {/* Quick Guide Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EADBC8]/50 shadow-sm">
            <h4 className="text-sm font-black uppercase tracking-wider text-[#C1561F] flex items-center gap-2 mb-6">
              <BookOpen size={18} />
              Guide d'exploration
            </h4>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-2xl bg-[#C1561F]/10 flex items-center justify-center shrink-0 font-black text-[#C1561F]">1</div>
                <div>
                  <h5 className="font-bold text-[#2B1810] text-sm">Découverte interactive</h5>
                  <p className="text-xs text-[#2B1810]/60 mt-1 leading-relaxed">Utilisez l'onglet <strong>Explorer l'Afrique</strong> pour parcourir la carte ou posez vos questions à l'<strong>Assistant vocal</strong>.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-2xl bg-[#059669]/10 flex items-center justify-center shrink-0 font-black text-[#059669]">2</div>
                <div>
                  <h5 className="font-bold text-[#2B1810] text-sm">Conversations et recherches</h5>
                  <p className="text-xs text-[#2B1810]/60 mt-1 leading-relaxed">L'onglet <strong>Messages</strong> permet des recherches détaillées et des échanges approfondis sur les thématiques africaines.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
