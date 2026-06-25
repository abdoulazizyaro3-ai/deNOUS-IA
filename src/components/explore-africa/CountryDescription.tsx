import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  Quote, 
  Globe,
  Compass,
  Sparkles,
  MapPin,
  Users,
  TrendingUp,
  Languages,
  Info,
  Star,
  Coins,
  Calendar,
  Briefcase,
  UtensilsCrossed,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface CountryDescriptionProps {
  countryId: string | null;
  countriesData: Record<string, any>;
  key?: string;
}

// Inline helper for landmark modal details
function getLandmarkDetails(landmark: any) {
  const categoryImages: Record<string, string[]> = {
    nature: [
      "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=1200&auto=format&fit=crop"
    ],
    town: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop"
    ],
    festive: [
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop"
    ]
  };

  const safeId = String(landmark.id || "").toLowerCase();
  const isFestive = safeId.includes("fest") || safeId.includes("siao") || safeId.includes("fespaco") || safeId.includes("snc") || safeId.includes("amani") || safeId.includes("femua") || safeId.includes("jazz") || safeId.includes("art");
  const isTown = safeId.includes("mall") || safeId.includes("plaza") || safeId.includes("market") || safeId.includes("march") || safeId.includes("artisan") || safeId.includes("rood");
  
  const defaultImages = isFestive ? categoryImages.festive : isTown ? categoryImages.town : categoryImages.nature;

  // Use dynamic images from admin if provided, otherwise fallback to defaults
  const dynamicImages = [landmark.image1, landmark.image2, landmark.image3, landmark.image4, landmark.image5].filter(Boolean);
  const finalImages = dynamicImages.length > 0 ? dynamicImages : defaultImages;

  // Use dynamic text from admin if provided, otherwise fallback
  const finalDetailedDescription = landmark.detailedDescription || `${landmark.description} Ce lieu exceptionnel incarne la grande richesse de la région. Visiter ${landmark.name} permet d'entrer en connexion directe avec la ferveur vibrante de ses habitants, d'admirer des techniques ou des reliefs préservés uniques et d'immortaliser des moments mémorables au cours de votre voyage d'exploration d'Afrique.`;
  const finalWhyVisit = landmark.whyVisit || "Pour l'immersion intense et authentique au contact d'un patrimoine africain d'envergure mondiale.";
  const finalPracticalTips = landmark.practicalTips ? landmark.practicalTips.split('\n').filter((t: string) => t.trim() !== '') : [
    "Demandez des conseils avisés auprès d'un comptoir d'office de tourisme ou d'un guide officiel.",
    "Prévoyez les rands, rands CFA ou livres locales nécessaires pour régler les taxes d'entrée.",
    "Prenez soin de respecter l'écosystème local et les traditions sacrées en vigueur dans cette communauté."
  ];

  return {
    images: finalImages,
    detailedDescription: finalDetailedDescription,
    whyVisit: finalWhyVisit,
    practicalTips: finalPracticalTips
  };
}

// Custom cultural quotes matching each country to enrich the experience
const countryQuotes: Record<string, { text: string; author: string }> = {
  burkina_faso: {
    text: "L'intégrité n'est pas une simple vertu, c'est un engagement quotidien envers la dignité de notre terre.",
    author: "Esprit de Thomas Sankara"
  },
  senegal: {
    text: "La Teranga n'est pas seulement de l'hospitalité, c'est le lien sacré qui unit l'humain à son semblable.",
    author: "Sagesse de la Teranga"
  },
  maroc: {
    text: "Le thé à la menthe se boit à petites gorgées, pour apprendre à apprécier le goût précieux du temps qui passe.",
    author: "Proverbe Berbère"
  },
  egypt: {
    text: "L'Égypte est un don du Nil, suspendu au fil sacré de son fleuve éternel et à la mémoire de ses bâtisseurs.",
    author: "Hérodote & Sagesse Ancienne"
  },
  rdc: {
    text: "La musique congolaise est le parfum sonore qui guérit les cœurs et fait danser l'âme de notre grand fleuve.",
    author: "Esprit de la Rumba et de la SAPE"
  },
  south_africa: {
    text: "Ubuntu : Je suis parce que nous sommes. Notre force réside dans la beauté multicolore de nos différences.",
    author: "Philosophie de Nelson Mandela"
  },
  cote_divoire: {
    text: "Le découragement n'est pas ivoirien. Notre joie de vivre est l'énergie qui transformera chaque défi en fête.",
    author: "Adage du Nouchi d'Abidjan"
  },
  kenya: {
    text: "Hakuna Matata. Avancer d'un pas ferme sur la terre sauvage en respectant l'harmonie sacrée de la nature.",
    author: "Art de vivre Swahili"
  }
};

export default function CountryDescription({ countryId, countriesData }: CountryDescriptionProps) {
  const [activeTab, setActiveTab] = useState<"description" | "touristic" | "demographics" | "economy" | "languages">("description");
  const [selectedLandmark, setSelectedLandmark] = useState<any | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [details, setDetails] = useState<any | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Reset selected landmark and fetch details when country changes
  useEffect(() => {
    setSelectedLandmark(null);
    if (countryId) {
      setIsLoadingDetails(true);
      fetch(`/api/explore/countries/${countryId}/`)
        .then(res => res.json())
        .then(data => {
          setDetails(data);
          setIsLoadingDetails(false);
        })
        .catch(err => {
          console.error(err);
          setIsLoadingDetails(false);
        });
    }
  }, [countryId]);

  if (!countryId) return null;

  const currentCountry = countriesData[countryId];
  const quote = countryQuotes[countryId];

  if (!currentCountry || isLoadingDetails) {
    return (
      <div className="flex items-center justify-center p-10 h-full">
         <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!details || details.error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-xs font-semibold m-4">
        Détails descriptifs indisponibles pour ce pays ({countryId}).
      </div>
    );
  }

  // Define tabs information precisely aligned with user request
  const tabs = [
    {
      id: "description" as const,
      label: "Description générale",
      icon: Info,
      iconColor: "text-amber-500 bg-amber-50 border-amber-100",
      activeBg: "bg-amber-500 text-white"
    },
    {
      id: "touristic" as const,
      label: "Sites touristiques",
      icon: Compass,
      iconColor: "text-rose-500 bg-rose-50 border-rose-100",
      activeBg: "bg-rose-500 text-white"
    },
    {
      id: "demographics" as const,
      label: "Démographie",
      icon: Users,
      iconColor: "text-blue-500 bg-blue-50 border-blue-100",
      activeBg: "bg-blue-500 text-white"
    },
    {
      id: "economy" as const,
      label: "Économie",
      icon: TrendingUp,
      iconColor: "text-emerald-500 bg-emerald-50 border-emerald-100",
      activeBg: "bg-emerald-500 text-white"
    },
    {
      id: "languages" as const,
      label: "Langues les plus parlées",
      icon: Languages,
      iconColor: "text-indigo-500 bg-indigo-50 border-indigo-100",
      activeBg: "bg-indigo-500 text-white"
    }
  ];

  return (
    <motion.div
      id="country-description-portal"
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="bg-[#FAFAFA] border border-stone-200/50 rounded-[2rem] shadow-2xl overflow-hidden backdrop-blur-sm"
    >
      {/* HEADER HERO AREA */}
      <div className="relative bg-stone-950 p-6 md:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
        {/* Dynamic Ambilight Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-40 select-none pointer-events-none overflow-hidden mix-blend-screen">
          <span className="text-[300px] md:text-[500px] blur-[60px] opacity-30">{currentCountry.flagEmoji}</span>
        </div>
        
        {/* Decorative corner globe */}
        <div className="absolute -right-10 -top-10 text-stone-700/30 text-9xl pointer-events-none select-none z-0">
          🌍
        </div>

        <div className="space-y-3 z-10 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-3xl filter drop-shadow-md select-none">{currentCountry.flagEmoji}</span>
            <span className="font-mono text-[9px] tracking-widest uppercase font-bold text-amber-400 bg-amber-400/15 border border-amber-400/20 px-2.5 py-1 rounded-full">
              Pavillon National
            </span>
          </div>

          <h3 className="font-serif font-black text-2xl md:text-3xl tracking-tight text-white flex items-center gap-2">
            {currentCountry.name}
            <span className="text-stone-400 font-sans font-light text-base md:text-lg">| {currentCountry.capital}</span>
          </h3>

          <p className="text-amber-100/90 text-xs md:text-sm font-sans font-semibold tracking-wide flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            {currentCountry.tagline}
          </p>
        </div>


      </div>

      {/* DETAILED CONTENT HUB GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border-t border-stone-100">
        
        {/* LEFT COLUMN: TABS SELECTION & COMMENTARY GREETING */}
        <div className="lg:col-span-4 p-6 bg-stone-50/50 border-r border-stone-100 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <span className="font-sans font-extrabold text-[10px] text-stone-400 tracking-wider block uppercase px-1">
              Explorer les rubriques
            </span>

            {/* TAB LIST */}
            <div className="flex flex-col gap-2">
              {tabs.map((tab) => {
                const isSelected = activeTab === tab.id;
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all duration-300 text-left focus:outline-none ${
                      isSelected
                        ? "bg-stone-900 border-stone-800 text-white shadow-xl font-bold scale-[1.02] z-10"
                        : "bg-white border-stone-200/60 text-stone-600 hover:text-stone-900 hover:bg-white hover:shadow-md hover:-translate-y-[1px]"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 transition-all ${
                      isSelected 
                        ? "bg-stone-850 border-stone-800 text-white" 
                        : tab.iconColor
                    }`}>
                      <TabIcon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-extrabold tracking-tight">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* COMMENT SALUE-T-ON GREETING BOX */}
          {currentCountry.localGreeting && (
            <div className="bg-amber-50/40 border border-amber-200/40 rounded-2xl p-4.5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-base select-none">💬</span>
                <span className="text-[10px] font-mono tracking-wider uppercase font-extrabold text-amber-850">
                  Comment salue-t-on ?
                </span>
              </div>
              <p className="font-serif font-black text-amber-900 text-sm">
                « {currentCountry.localGreeting} »
              </p>
              <p className="text-[11px] text-stone-600 font-sans leading-relaxed">
                {currentCountry.localGreetingExplanation}
              </p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: DYNAMIC CONTENT CONTAINER & CULTURAL INFO */}
        <div className="lg:col-span-8 p-6 md:p-8 flex flex-col justify-between gap-8 min-h-[420px]">
          
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                
                {/* 1. DESCRIPTION GÉNÉRALE TAB */}
                {activeTab === "description" && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold">Aperçu continental & Identité</p>
                        <h4 className="font-serif font-black text-lg text-stone-900">Description générale</h4>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-stone-200/60 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 space-y-3">
                      <h5 className="font-serif font-bold text-sm text-stone-850">Introduction</h5>
                      <p className="text-stone-650 leading-relaxed font-sans text-xs md:text-sm">
                        {currentCountry.overview}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-5 rounded-2xl border border-stone-200/60 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 space-y-2">
                        <div className="flex items-center gap-1.5 text-rose-600 font-serif font-extrabold text-xs uppercase tracking-wider">
                          <BookOpen className="w-4 h-4 shrink-0 text-rose-500" />
                          <span>Histoire & Souveraineté</span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-stone-600 font-sans leading-relaxed">
                          {details.history}
                        </p>
                      </div>

                      <div className="bg-white p-5 rounded-2xl border border-stone-200/60 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 space-y-2">
                        <div className="flex items-center gap-1.5 text-emerald-600 font-serif font-extrabold text-xs uppercase tracking-wider">
                          <Sparkles className="w-4 h-4 shrink-0 text-emerald-500" />
                          <span>Tissage culturel</span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-stone-600 font-sans leading-relaxed">
                          {details.culture}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <p className="text-[10px] font-mono text-stone-450 uppercase tracking-widest block mb-2 px-1">Patrimoine gastronomique local</p>
                      <div className="flex items-start gap-3 bg-gradient-to-r from-emerald-50/50 to-white hover:shadow-md transition-all duration-300 p-4 rounded-xl border border-emerald-100/50 text-stone-700">
                        <UtensilsCrossed className="w-5 h-5 text-emerald-650 mt-0.5 shrink-0" />
                        <p className="text-xs font-sans leading-relaxed text-stone-600">
                          {details.gastronomy}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. SITES TOURISTIQUES TAB */}
                {activeTab === "touristic" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 flex items-center justify-center">
                        <Compass className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold">Voyages, Nature & Patrimoine mondial</p>
                        <h4 className="font-serif font-black text-lg text-stone-900">Sites touristiques ({currentCountry.landmarks.length})</h4>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      {currentCountry.landmarks.map((land) => (
                        <div 
                          key={land.id}
                          id={`landmark-card-${land.id}`}
                          onClick={() => {
                            setSelectedLandmark(land);
                            setActiveImageIndex(0);
                          }}
                          className="bg-white border border-stone-200/60 hover:border-rose-300 shadow-sm hover:shadow-xl hover:-translate-y-1 rounded-[1.25rem] overflow-hidden group transition-all duration-300 cursor-pointer flex flex-col justify-between"
                        >
                          <div>
                            <div className="h-32 sm:h-36 w-full relative overflow-hidden bg-stone-100">
                              <img 
                                src={land.image} 
                                alt={land.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                              />
                              <div className="absolute top-2 right-2 bg-stone-900/80 backdrop-blur-xs text-amber-400 py-1 px-2 rounded-lg text-[9px] font-mono font-black flex items-center gap-1 shadow-md">
                                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                <span>{land.rating || 4.8}</span>
                              </div>
                              <div className="absolute bottom-2 left-2 bg-rose-600 text-white font-mono text-[8px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-md">
                                {land.categoryLabel}
                              </div>
                              {/* Hover indicator overlay */}
                              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                                <span className="bg-white/90 backdrop-blur-md text-stone-900 font-sans font-extrabold text-[10px] uppercase tracking-wider px-3.5 py-2 rounded-xl shadow-md flex items-center gap-1.5 animate-bounce">
                                  📸 Voir 5 Photos & Récit
                                </span>
                              </div>
                            </div>

                            <div className="p-3.5 flex flex-col items-center justify-center text-center bg-white">
                              <h5 className="font-serif font-black text-stone-900 text-sm leading-tight group-hover:text-rose-650 transition duration-300 mb-1.5">
                                {land.name}
                              </h5>
                              <p className="flex items-center gap-1 text-[10px] text-stone-500 font-mono">
                                <MapPin className="w-3 h-3 text-rose-500" />
                                <span className="truncate font-sans font-medium text-stone-600">{land.location}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. DÉMOGRAPHIE TAB */}
                {activeTab === "demographics" && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 flex items-center justify-center">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold">Socio-démographie & Peuplement</p>
                        <h4 className="font-serif font-black text-lg text-stone-900">Statistiques de démographie</h4>
                      </div>
                    </div>

                    {/* Meta Key Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="bg-white border border-stone-200/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-4.5 rounded-2xl text-left">
                        <p className="text-[9px] font-mono uppercase tracking-wider text-stone-400 font-semibold leading-none">Population Totale</p>
                        <p className="text-sm font-sans font-black text-stone-900 mt-1 leading-snug">{details.demographics.total}</p>
                      </div>

                      <div className="bg-white border border-stone-200/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-4.5 rounded-2xl text-left">
                        <p className="text-[9px] font-mono uppercase tracking-wider text-stone-400 font-semibold leading-none">Densité moyenne</p>
                        <p className="text-sm font-sans font-black text-stone-900 mt-1 leading-snug">{details.demographics.density}</p>
                      </div>

                      <div className="bg-white border border-stone-200/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-4.5 rounded-2xl text-left">
                        <p className="text-[9px] font-mono uppercase tracking-wider text-stone-400 font-semibold leading-none">Âge Médian</p>
                        <p className="text-sm font-sans font-black text-blue-600 mt-1 leading-snug">{details.demographics.medianAge}</p>
                      </div>

                      <div className="bg-white border border-stone-200/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-4.5 rounded-2xl text-left">
                        <p className="text-[9px] font-mono uppercase tracking-wider text-stone-400 font-semibold leading-none">Espérance de Vie</p>
                        <p className="text-sm font-sans font-black text-emerald-600 mt-1 leading-snug">{details.demographics.lifeExpectancy}</p>
                      </div>

                      <div className="bg-white border border-stone-200/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-4.5 rounded-2xl text-left col-span-2 md:col-span-2">
                        <p className="text-[9px] font-mono uppercase tracking-wider text-stone-400 font-semibold leading-none">Taux d'Urbanisation</p>
                        <p className="text-xs font-sans font-bold text-stone-700 mt-1.5">{details.demographics.urbanRatio}</p>
                        <div className="w-full bg-stone-100 h-1.5 rounded-full mt-2 overflow-hidden shadow-inner">
                          <div 
                            className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full" 
                            style={{ width: details.demographics.urbanRatio.match(/\d+/) ? `${details.demographics.urbanRatio.match(/\d+/)?.[0]}%` : "50%" }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Major Ethnic Groups */}
                    <div className="bg-white border border-stone-200/60 shadow-sm hover:shadow-md transition-all duration-300 p-5 rounded-2xl space-y-3">
                      <p className="text-[10px] font-mono uppercase tracking-wider text-stone-450 font-bold">Mosaïque ethnolinguistique & ethnies</p>
                      <p className="text-xs text-stone-500 leading-relaxed">
                        Le peuplement de cette région traduit une riche histoire migratoire et de cohabitation harmonieuse. Les grands groupes représentés sont :
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {details.demographics.ethnicGroups.map((group, i) => (
                          <span 
                            key={i}
                            className="px-3.5 py-1.5 bg-white border border-stone-200 hover:border-blue-300 text-stone-700 rounded-xl text-xs font-semibold shadow-2xs cursor-default hover:text-blue-600 transition"
                          >
                            👥 {group}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. ÉCONOMIE TAB */}
                {activeTab === "economy" && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold">PIB, Secteurs Financiers & Échanges</p>
                        <h4 className="font-serif font-black text-lg text-stone-900">Richesses de l'économie</h4>
                      </div>
                    </div>

                    {/* Economic Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-white border border-stone-200/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-4.5 rounded-2xl">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-stone-400 block">PIB Nominal</span>
                        <span className="text-base font-sans font-black text-stone-900 block mt-1 leading-none">{details.economy.gdp}</span>
                      </div>

                      <div className="bg-white border border-stone-200/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-4.5 rounded-2xl">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-stone-400 block">Croissance Annuelle</span>
                        <span className="text-base font-sans font-black text-emerald-600 block mt-1 leading-none">{details.economy.gdpGrowth}</span>
                      </div>

                      <div className="bg-white border border-stone-200/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-4.5 rounded-2xl">
                        <span className="text-[9px] font-mono uppercase tracking-wider text-stone-400 block">Unité Monétaire</span>
                        <span className="text-base font-sans font-black text-amber-600 block mt-1 leading-none">{details.economy.currency}</span>
                      </div>
                    </div>

                    {/* Main Sectors list */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white border border-stone-200/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-5 rounded-2xl space-y-3">
                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-stone-450 uppercase tracking-wider">
                          <Briefcase className="w-4 h-4 text-emerald-500" />
                          <span>Piliers industriels & services</span>
                        </div>
                        <ul className="space-y-2">
                          {details.economy.mainSectors.map((sec, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-xs font-sans text-stone-650 font-semibold bg-white p-2.5 rounded-xl border border-stone-150">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                              <span>{sec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-white border border-stone-200/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 p-5 rounded-2xl flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-stone-450 uppercase tracking-wider">
                            <Coins className="w-4 h-4 text-amber-500" />
                            <span>Exportations Majeures</span>
                          </div>
                          <p className="text-xs text-stone-500 leading-relaxed">
                            Les principales ressources d'échange international qui consolident la balance de paiements et les devises étrangères du pays :
                          </p>
                        </div>
                        <p className="mt-3 text-xs bg-amber-50/50 border border-amber-200/40 p-3 rounded-xl font-sans font-extrabold text-amber-950">
                          📦 {details.economy.keyExports}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. LANGUES LES PLUS PARLÉES TAB */}
                {activeTab === "languages" && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 flex items-center justify-center">
                        <Languages className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold">Tradition orale & communication universelle</p>
                        <h4 className="font-serif font-black text-lg text-stone-900">Langues les plus parlées</h4>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-xs text-stone-500 leading-relaxed px-1">
                        Cette nation plurielle cultive une richesse phonétique et sémantique unique. Voici les principales langues utilisées par la population au quotidien :
                      </p>

                      <div className="space-y-3.5 bg-white shadow-sm p-5 rounded-2xl border border-stone-200/60 hover:shadow-md transition-all duration-300">
                        {details.languages.map((lang, lIdx) => {
                          const hasPct = lang.percentage.match(/\d+/);
                          const pctWidth = hasPct ? `${hasPct[0]}%` : "15%";
                          return (
                            <div key={lIdx} className="space-y-1">
                              <div className="flex items-center justify-between text-xs font-sans font-bold text-stone-850">
                                <div className="flex items-center gap-2">
                                  <span className="text-stone-900 font-serif font-black">{lang.name}</span>
                                  <span className="text-[9px] font-mono uppercase tracking-wide font-medium bg-indigo-50 text-indigo-650 px-2 py-0.5 rounded-md border border-indigo-100">
                                    {lang.type}
                                  </span>
                                </div>
                                <span className="font-mono text-indigo-600">{lang.percentage}</span>
                              </div>
                              <div className="w-full bg-stone-200/70 h-2 rounded-full overflow-hidden">
                                <div 
                                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600" 
                                  style={{ width: pctWidth }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* CULTURAL WISDOM QUOTE BAR */}
          {quote && (
            <div className="mt-6 border-t border-stone-100 pt-6">
              <div className="bg-gradient-to-tr from-stone-900 via-stone-850 to-stone-800 rounded-2xl p-4.5 text-stone-100/90 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 border border-stone-750/30">
                <Quote className="absolute right-3.5 top-3.5 w-14 h-14 text-stone-700/20 pointer-events-none select-none" />
                <div className="space-y-1.5 max-w-xl z-10">
                  <p className="italic font-serif text-xs md:text-sm leading-relaxed text-stone-200">
                    « {quote.text} »
                  </p>
                  <p className="text-[9px] font-mono text-amber-400 font-bold tracking-widest uppercase">
                    — {quote.author}
                  </p>
                </div>
                <div className="shrink-0 z-10">
                  <span className="text-xl inline-block p-2 bg-stone-950/50 rounded-lg border border-stone-700/30">
                    💡
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* LANDMARK DETAIL MODAL */}
      <AnimatePresence>
        {selectedLandmark && (() => {
          const details = getLandmarkDetails(selectedLandmark);
          return (
            <motion.div
              key="landmark-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLandmark(null)}
              className="fixed inset-0 bg-stone-950/85 backdrop-blur-md z-[9999] flex items-center justify-center p-4 md:p-6"
            >
              <motion.div
                initial={{ scale: 0.95, y: 30, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 30, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl overflow-hidden max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200"
              >
                {/* Header Slider Area */}
                <div className="relative h-64 md:h-96 w-full bg-stone-900 shrink-0 select-none overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={activeImageIndex}
                      initial={{ opacity: 0, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                      src={details.images[activeImageIndex]}
                      alt={`${selectedLandmark.name} - ${activeImageIndex + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </AnimatePresence>

                  {/* Gradient to darken the active image and bottom text overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/30 to-black/30" />

                  {/* Top Bar inside image */}
                  <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
                    <span className="px-3.5 py-1.5 bg-stone-900/70 backdrop-blur-md text-amber-300 font-mono text-[10px] font-extrabold rounded-full uppercase tracking-widest border border-white/10 shadow-xs">
                      {selectedLandmark.categoryLabel || "Patrimoine National"}
                    </span>
                    <button
                      onClick={() => setSelectedLandmark(null)}
                      className="w-10 h-10 rounded-full bg-stone-950/80 hover:bg-rose-600 text-white flex items-center justify-center border border-white/20 hover:scale-105 active:scale-95 transition duration-200 outline-none"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Chevron Left / Right */}
                  <div className="absolute inset-y-0 inset-x-4 flex items-center justify-between pointer-events-none z-10">
                    <button
                      onClick={() => setActiveImageIndex((prev) => (prev === 0 ? details.images.length - 1 : prev - 1))}
                      className="w-11 h-11 rounded-full bg-stone-950/80 hover:bg-stone-900 text-white flex items-center justify-center border border-white/10 pointer-events-auto active:scale-95 hover:scale-105 transition duration-200 outline-none shadow-md"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => setActiveImageIndex((prev) => (prev === details.images.length - 1 ? 0 : prev + 1))}
                      className="w-11 h-11 rounded-full bg-stone-950/80 hover:bg-stone-900 text-white flex items-center justify-center border border-white/10 pointer-events-auto active:scale-95 hover:scale-105 transition duration-200 outline-none shadow-md"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Information Overlay Bottom */}
                  <div className="absolute bottom-5 left-6 right-6 text-white space-y-1.5 z-10">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-lg select-none">📍</span>
                      <span className="font-mono text-[9px] tracking-wider uppercase font-extrabold text-amber-300 bg-amber-400/20 px-2.5 py-0.5 rounded-md border border-amber-300/20 shadow-xs">
                        {selectedLandmark.location}
                      </span>
                      <span className="bg-white/15 backdrop-blur-xs text-white py-0.5 px-2 rounded-md text-[9px] font-mono font-black flex items-center gap-1 border border-white/10">
                        ★ {selectedLandmark.rating || 4.8}
                      </span>
                    </div>
                    <h4 className="font-serif font-black text-2xl md:text-3.5xl tracking-tight text-white drop-shadow-md">
                      {selectedLandmark.name}
                    </h4>
                  </div>
                </div>

                {/* Micro Thumbnails Indicator Bar */}
                <div className="bg-stone-50 border-b border-stone-200 p-3 flex gap-2 overflow-x-auto shrink-0 select-none justify-center">
                  {details.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`w-14 h-10 rounded-xl overflow-hidden shrink-0 transition-all ${
                        index === activeImageIndex 
                          ? "ring-2 ring-rose-500 scale-105 shadow-sm" 
                          : "opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt="thumbnail" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                {/* Content Area */}
                <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1 min-h-[300px]">
                  
                  {/* Detailed descriptions */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5 text-stone-900">
                      <Info className="w-5 h-5 text-rose-500 shrink-0" />
                      <h5 className="font-serif font-black text-lg">
                        Histoire de ce joyau national
                      </h5>
                    </div>
                    <p className="text-stone-650 leading-relaxed font-sans text-xs md:text-sm text-justify">
                      {details.detailedDescription}
                    </p>
                  </div>

                  {/* Features blocks */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* Why Visit */}
                    <div className="bg-rose-50/40 border border-rose-100 p-5 rounded-2xl flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-rose-650 font-serif font-extrabold text-xs uppercase tracking-wider">
                          <Sparkles className="w-4 h-4 text-rose-500" />
                          <span>Pourquoi venir visiter ?</span>
                        </div>
                        <p className="text-xs text-stone-650 font-sans leading-relaxed">
                          {details.whyVisit}
                        </p>
                      </div>
                      <div className="mt-3 text-[10px] text-right font-mono text-rose-500 font-extrabold uppercase tracking-widest">
                        ✦ Expérience authentique
                      </div>
                    </div>

                    {/* Companion Tips */}
                    <div className="bg-emerald-50/20 border border-emerald-100/50 p-5 rounded-2xl space-y-3">
                      <div className="flex items-center gap-1.5 text-emerald-650 font-serif font-extrabold text-xs uppercase tracking-wider">
                        <BookOpen className="w-4 h-4 text-emerald-500" />
                        <span>Conseils pratiques aux voyageurs</span>
                      </div>
                      <ul className="space-y-2.5">
                        {details.practicalTips.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs font-sans text-stone-650 leading-normal">
                            <span className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 font-mono text-[9px] font-bold mt-0.5">
                              {idx + 1}
                            </span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>

                  {/* Tourism appeal banner */}
                  <div className="bg-gradient-to-tr from-stone-950 via-stone-900 to-stone-850 p-5 rounded-2xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-stone-800">
                    <div className="space-y-1">
                      <h6 className="font-serif font-bold text-xs text-amber-300">Prêt pour votre prochaine aventure africaine ?</h6>
                      <p className="text-[10px] md:text-[11px] text-stone-300 font-sans max-w-md">
                        Planifiez de visiter ce magnifique patrimoine d'exception durant les mois de <strong>{selectedLandmark.dateRange || "saison recommandée"}</strong>.
                      </p>
                    </div>
                    <button 
                      onClick={() => setSelectedLandmark(null)}
                      className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 active:scale-95 transition rounded-xl font-bold font-sans text-xs tracking-wide uppercase shrink-0 shadow-md outline-none"
                    >
                      Fermer & Explorer
                    </button>
                  </div>

                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

    </motion.div>
  );
}
