import React from "react";
import { User, Globe, Mail, MapPin, BookOpen, Compass } from "lucide-react";

export default function MonCompte() {
  // Mock data representing standard user properties
  const userProfile = {
    fullName: "Aminata D.",
    email: "aminata.diarra@denous.ai",
    role: "Utilisateur",
    country: "Mali",
    region: "Ségou",
    language: "Bambara / Français",
    joinedDate: "Juin 2026",
  };

  return (
    <div className="px-6 md:px-12 py-8 max-w-4xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="border-b border-[#EADBC8] pb-4">
        <h2 className="text-xl font-bold font-display text-[#334034] flex items-center gap-2">
          <User className="text-[#C1561F]" size={22} />
          Mon Espace Personnel deNOUS AI
        </h2>
        <p className="text-xs text-[#2B1810]/60 mt-0.5 font-medium">
          Consultez vos paramètres de profil et votre parcours de découverte.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white p-6 rounded-3xl border border-[#EADBC8] shadow-sm text-center space-y-4 md:col-span-1">
          <div className="relative w-24 h-24 mx-auto">
            <img
              src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=260"
              alt={userProfile.fullName}
              className="w-full h-full rounded-full object-cover border-4 border-[#F5ECE1] shadow-sm"
            />
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-[#3D6B35] border-2 border-white rounded-full" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#2B1810]">{userProfile.fullName}</h3>
            <span className="inline-block px-2.5 py-0.5 bg-[#FAF6F0] border border-[#EADBC8] text-[10px] text-[#C1561F] font-bold rounded-full mt-1 uppercase">
              {userProfile.role}
            </span>
          </div>
          <div className="pt-2 text-left border-t border-[#EADBC8]/60 space-y-2 text-xs text-[#2B1810]/80">
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-[#C1561F]/70 shrink-0" />
              <span className="truncate" title={userProfile.email}>{userProfile.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe size={14} className="text-[#C1561F]/70 shrink-0" />
              <span>Langues : {userProfile.language}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-[#C1561F]/70 shrink-0" />
              <span>{userProfile.region}, {userProfile.country}</span>
            </div>
          </div>
        </div>

        {/* Info & Stats section */}
        <div className="space-y-6 md:col-span-2">
          {/* Welcome Card */}
          <div className="bg-white p-6 rounded-3xl border border-[#EADBC8] shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-[#334034] flex items-center gap-2">
              <Compass className="text-[#5FAF68]" size={18} />
              À propos de votre espace d'apprentissage
            </h3>
            <p className="text-xs text-[#2B1810]/70 leading-relaxed">
              Bienvenue sur votre compte de consultation. deNOUS AI est conçu pour vous aider à explorer le patrimoine culturel africain, les techniques agricoles traditionnelles résilientes (comme le Zaï) et la médecine traditionnelle.
            </p>
            <p className="text-xs text-[#2B1810]/70 leading-relaxed">
              En tant que lecteur et apprenant, vous pouvez interroger l'assistant vocal en langues locales (Bambara, Dioula, Mooré) et obtenir des réponses précises tirées directement de nos bases de données certifiées par les gardiens de la tradition.
            </p>
          </div>

          {/* Quick Guide Card */}
          <div className="bg-[#FAF6F0]/50 p-6 rounded-3xl border border-[#EADBC8] space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#C1561F] flex items-center gap-1.5">
              <BookOpen size={14} />
              Conseils d'utilisation
            </h4>
            <ul className="space-y-3 text-xs text-[#2B1810]/80">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#F5ECE1] flex items-center justify-center shrink-0 font-bold text-[#C1561F]">1</span>
                <p className="mt-0.5">Pour obtenir des réponses fidèles dans votre langue locale, utilisez l'assistant vocal en sélectionnant <strong>Bambara</strong>, <strong>Dioula</strong> ou <strong>Mooré</strong>.</p>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#F5ECE1] flex items-center justify-center shrink-0 font-bold text-[#C1561F]">2</span>
                <p className="mt-0.5">Le chat de l'onglet <strong>Messages</strong> vous permet de mener des conversations plus longues et d'exporter des comptes rendus écrits sans parole audio.</p>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#F5ECE1] flex items-center justify-center shrink-0 font-bold text-[#C1561F]">3</span>
                <p className="mt-0.5">Toutes les contributions de savoirs traditionnels ou de nouveaux dictionnaires sont soumises à la modération stricte de notre équipe et enregistrées directement depuis le module d'administration.</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
