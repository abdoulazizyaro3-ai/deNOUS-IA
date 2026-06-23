import React, { useState, useEffect, useRef } from "react";
import {
  Mic, MessageSquare, Globe,
  GraduationCap, Settings, User, Volume2, VolumeX, Shield,
} from "lucide-react";
import { KnowledgeNode } from "./types";
import { AgentSquadCard } from "./components/AgentSquadCard";

// Pages
import AssistantVocal from "./pages/AssistantVocal";
import Messages from "./pages/Messages";
import ExplorerAfrique from "./pages/ExplorerAfrique";
import EducationRecherche from "./pages/EducationRecherche";
import Parametres from "./pages/Parametres";
import MonCompte from "./pages/MonCompte";
import Admin from "./pages/Admin";

interface Message {
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  audioDuration?: string;
  isAudio?: boolean;
}

import { useRealtimeVocal } from "./hooks/useRealtimeVocal";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("Assistant vocal");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("Français");
  const [hasInteracted, setHasInteracted] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [keyboardText, setKeyboardText] = useState("");
  const [showVocalResponse, setShowVocalResponse] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [dynamicReliability, setDynamicReliability] = useState<number>(96);
  const [vocalTranslation, setVocalTranslation] = useState<string>("");
  
  const realtime = useRealtimeVocal();
  const voiceState = realtime.voiceState;
  const transcript = realtime.transcript;
  const aiAudioOutput = "";
  
  const [coordinatorLogs, setCoordinatorLogs] = useState<any[]>([
    { agentName: "Agent Principal Coordinateur", role: "Orchestration, Routage", action: "Veille passive de la souveraineté intellectuelle", timestamp: "Actif", status: "success" }
  ]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [nodes, setNodes] = useState<KnowledgeNode[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const carouselRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    { sender: "ai", text: "Bonjour Aminata ! Bienvenue sur deNOUS AI. Que souhaitez-vous savoir aujourd'hui ?", timestamp: "11:40" },
  ]);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [newSavoirText, setNewSavoirText] = useState("");
  const [newSavoirTitle, setNewSavoirTitle] = useState("");
  const [newSavoirTheme, setNewSavoirTheme] = useState("culture");
  const [selectedCountry, setSelectedCountry] = useState("Mali");

  const fetchNodes = async () => {
    try {
      const res = await fetch("/api/nodes");
      const data = await res.json();
      if (data && data.nodes) setNodes(data.nodes);
    } catch (e) { console.error("Error fetching knowledge bank", e); }
  };

  useEffect(() => { fetchNodes(); }, []);

  useEffect(() => {
    let interval: any;
    if (voiceState === "listening") {
      interval = setInterval(() => setRecordingSeconds((prev) => prev + 1), 1000);
    } else { setRecordingSeconds(0); }
    return () => clearInterval(interval);
  }, [voiceState]);

  const speakText = (text: string, audioBase64?: string) => {
    // handled by Realtime hook now
  };

  const stopSpeaking = () => {
    if (realtime.voiceState === 'speaking') {
      realtime.interrupt();
    }
  };

  const handleVocalQuerySubmit = async (queryText: string) => {
    // handled by Realtime hook
  };

  const handleChatQuerySubmit = async (queryText: string) => {
    let finalQueryText = queryText;
    if (attachedFile) {
      finalQueryText = `${queryText} [Document de référence joint: ${attachedFile.name}]`;
      setAttachedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
    if (!finalQueryText.trim()) return;
    try {
      const response = await fetch("/api/gemini/vocal-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: selectedLanguage, textPrompt: finalQueryText, persona: "citizen", channel: "messages" }),
      });
      const data = await response.json();
      if (data && data.answerText) {
        setHasInteracted(true);
        if (data.detectedLanguage) setSelectedLanguage(data.detectedLanguage);
        if (data.coordinatorLogs) setCoordinatorLogs(data.coordinatorLogs);
        setMessages((prev) => [
          ...prev,
          { sender: "ai", text: data.answerText, timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) },
        ]);
      } else throw new Error("Empty response");
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Désolé, une erreur est survenue lors de la communication avec l'assistant.", timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) },
      ]);
    }
  };

  const toggleListening = () => {
    if (realtime.voiceState === 'idle' || realtime.voiceState === 'interrupted') {
      setShowVocalResponse(true);
      realtime.startSession();
    } else if (realtime.voiceState === 'listening') {
      realtime.endTurn();
    } else if (realtime.voiceState === 'speaking' || realtime.voiceState === 'thinking') {
      realtime.stopSession();
    }
  };

  const handleSuggestionClick = (text: string) => {
    if (activeTab === "Messages") {
      setMessages((prev) => [
        ...prev,
        { sender: "user", text, timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) },
      ]);
      handleChatQuerySubmit(text);
    } else {
      setActiveTab("Assistant vocal");
      handleVocalQuerySubmit(text);
    }
  };

  const scrollCarousel = (direction: "left" | "right") => {
    carouselRef.current?.scrollBy({ left: direction === "left" ? -280 : 280, behavior: "smooth" });
  };

  const handleIngestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSavoirText.trim()) return;
    try {
      const res = await fetch("/api/nodes/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newSavoirTitle || "Récit traditionnel de " + selectedCountry, category: "traditionnelle", theme: newSavoirTheme, rawContent: newSavoirText, language: selectedLanguage, country: selectedCountry, region: "Afrique Centrale / Ouest", ethnolinguisticGroup: "Général", period: "Contemporain", source: "Aminata D.", consent: true }),
      });
      const data = await res.json();
      if (data.success) { alert("Enregistrement réussi !"); setNewSavoirTitle(""); setNewSavoirText(""); fetchNodes(); }
    } catch (_) { alert("Erreur lors de la capture de la sagesse."); }
  };

  const navItems = [
    { label: "Assistant vocal", icon: Mic, desc: "Aller vers l'assistant vocal interactif" },
    { label: "Messages", icon: MessageSquare, desc: "Vos messages écrits avec l'assistant virtuel" },
    { label: "Explorer l'Afrique", icon: Globe, desc: "Parcourir la sagesse des différents pays d'Afrique" },
    { label: "Éducation & Recherche", icon: GraduationCap, desc: "Médecine traditionnelle, agriculture rurale et sciences" },
    { label: "Administration", icon: Shield, desc: "Gérer la base de données et les dictionnaires" },
  ];

  const bottomNavItems = [
    { label: "Paramètres", icon: Settings, desc: "Configurer la voix, la langue ou modifier votre application" },
    { label: "Mon compte", icon: User, desc: "Consulter votre compte d'utilisateur deNOUS AI" },
  ];

  return (
    <div id="app-container" className="min-h-screen bg-[#FAF6F0] bg-bogolan font-sans text-[#2B1810] flex flex-col md:flex-row relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-[240px] h-[340px] pointer-events-none opacity-[0.03] select-none z-0">
        <svg viewBox="0 0 100 120" className="w-full h-full fill-[#C1561F]">
          <path d="M10,120 Q30,90 20,40 Q40,75 50,120 M30,120 Q48,70 34,25 Q56,60 62,120" />
          <path d="M50,120 Q65,80 58,35 Q74,70 78,120" />
        </svg>
      </div>
      <div className="absolute top-10 right-2 w-[280px] h-[320px] pointer-events-none opacity-[0.035] select-none z-0">
        <svg viewBox="0 0 100 100" className="w-full h-full fill-[#E8A33D]">
          <path d="M10,40 Q25,25 45,35 Q30,50 10,40 Z M30,30 Q50,10 65,25 Q45,40 30,30 Z" />
          <path d="M55,40 Q75,25 90,45 Q70,55 55,40 Z M25,60 Q45,50 60,68 Q40,75 25,60 Z" />
        </svg>
      </div>
      <div className="absolute top-0 right-0 w-[50%] h-[100%] pointer-events-none opacity-[0.06] select-none z-0">
        <svg viewBox="0 0 100 100" className="w-full h-full fill-[#C1561F]">
          <path d="M 40,10 C 43,8 54,4 59,5 C 64,6 63,12 68,14 C 73,16 78,13 83,16 C 88,19 86,25 84,29 C 82,33 86,37 83,43 C 80,49 71,56 68,61 C 65,66 65,72 63,77 C 61,82 59,88 56,92 C 53,96 48,98 46,95 C 44,92 45,84 43,81 C 41,78 36,76 34,71 C 32,66 33,60 30,55 C 27,50 22,48 19,45 C 16,42 15,38 18,36 C 21,34 26,38 29,36 C 32,34 32,29 33,25 C 34,21 34,17 37,14 C 40,11 37,12 40,10 Z" />
        </svg>
      </div>

      <aside id="sidebar" className="w-full md:w-[290px] bg-[#FAF6F0] bg-bogolan/30 border-r border-[#EADBC8] shrink-0 flex flex-col justify-between py-6 px-4 z-10 shadow-md relative">
        <div className="flex flex-col space-y-7">
          <div className="flex items-center gap-3 px-1 pt-1">
            <div className="w-11 h-11 bg-[#C1561F] rounded-2xl flex items-center justify-center shrink-0 border border-[#E8A33D]/30 shadow-md">
              <svg viewBox="0 0 100 100" className="w-8 h-8 fill-[#E8A33D] filter drop-shadow">
                <path d="M 40,10 C 43,8 54,4 59,5 C 64,6 63,12 68,14 C 73,16 78,13 83,16 C 88,19 86,25 84,29 C 82,33 86,37 83,43 C 80,49 71,56 68,61 C 65,66 65,72 63,77 C 61,82 59,88 56,92 C 53,96 48,98 46,95 C 44,92 45,84 43,81 C 41,78 36,76 34,71 C 32,66 33,60 30,55 C 27,50 22,48 19,45 C 16,42 15,38 18,36 C 21,34 26,38 29,36 C 32,34 32,29 33,25 C 34,21 34,17 37,14 C 40,11 37,12 40,10 Z" />
              </svg>
            </div>
            <div>
              <h1 className="text-[19px] font-black font-display tracking-tight text-[#2B1810] leading-none">deNOUS AI</h1>
              <p className="text-[10px] text-[#C1561F] tracking-tight font-black mt-1 leading-snug">Sagesse et Oralité Africaine 🌍</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-[#C1561F]/5 p-3.5 rounded-2xl border border-[#C1561F]/15">
            <div className="relative">
              <img src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=200" alt="Aminata D." className="w-12 h-12 rounded-full object-cover border-2 border-[#C1561F] shadow-sm" />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#3D6B35] border-2 border-white rounded-full animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-black text-[#2B1810] tracking-tight">Aminata D.</h4>
              <p className="text-[11px] text-[#3D6B35] font-black flex items-center gap-1.5 mt-0.5">🟢 Session active</p>
            </div>
          </div>

          <hr className="border-[#EADBC8]" />

          <div className="space-y-1">
            <p className="text-[10px] uppercase font-black tracking-wider text-[#C1561F] px-3 mb-1.5 sr-only">Navigation</p>
            <nav className="flex flex-col space-y-1">
              {navItems.map((btn) => {
                const IconComp = btn.icon;
                const isActive = activeTab === btn.label;
                return (
                  <div key={btn.label} className="group relative flex items-center">
                    <button onClick={() => { stopSpeaking(); setActiveTab(btn.label); }} className={`flex-1 py-3 px-3 rounded-xl flex items-center gap-3 text-xs md:text-[13px] font-black tracking-normal transition-all duration-150 text-left ${isActive ? "bg-[#F5ECE1] text-[#C1561F] border-l-4 border-[#C1561F] shadow-sm" : "text-[#2B1810]/80 hover:bg-[#F5ECE1]/50 hover:text-[#C1561F]"}`}>
                      <IconComp size={18} className={isActive ? "text-[#C1561F]" : "text-[#2B1810]/50 group-hover:text-[#C1561F] shrink-0"} />
                      <span className="truncate">{btn.label}</span>
                    </button>
                  </div>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="flex flex-col space-y-1 pt-4 border-t border-[#EADBC8]">
          {bottomNavItems.map((btn) => {
            const IconComp = btn.icon;
            const isActive = activeTab === btn.label;
            return (
              <div key={btn.label} className="flex items-center">
                <button onClick={() => { stopSpeaking(); setActiveTab(btn.label); }} className={`flex-1 py-2.5 px-3 rounded-xl flex items-center gap-3 text-xs md:text-[13px] font-black tracking-normal transition-all duration-150 text-left ${isActive ? "bg-[#F5ECE1] text-[#C1561F] border-l-4 border-[#C1561F]" : "text-[#2B1810]/70 hover:bg-[#F5ECE1]/40"}`}>
                  <IconComp size={17} className={isActive ? "text-[#C1561F]" : "text-[#2B1810]/50 shrink-0"} />
                  <span className="truncate">{btn.label}</span>
                </button>
              </div>
            );
          })}
        </div>
      </aside>

      <main id="content-stage" className="flex-1 flex flex-col min-h-screen relative z-10 overflow-y-auto">
        {activeTab !== "Messages" && (
          <header className="px-6 md:px-10 py-4 flex items-center justify-end gap-3 z-20">
            <div className="flex items-center gap-2 bg-[#F5ECE1] border border-[#C1561F]/25 rounded-full px-4 py-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-xs font-black text-[#2B1810] uppercase tracking-wider">🗣️ Langue :</span>
              <select 
                value={selectedLanguage} 
                onChange={(e) => {
                  stopSpeaking();
                  setSelectedLanguage(e.target.value);
                  setHasInteracted(true);
                }}
                className="bg-transparent border-none text-xs font-black text-[#C1561F] focus:outline-none cursor-pointer pr-1 font-sans"
              >
                <option value="Français">Français</option>
                <option value="Bambara">Bambara</option>
                <option value="Mooré">Mooré</option>
                <option value="Dioula">Dioula</option>
                <option value="Anglais">Anglais</option>
              </select>
            </div>
            <button onClick={() => { if (audioEnabled) stopSpeaking(); setAudioEnabled(!audioEnabled); }} className="w-9 h-9 flex items-center justify-center rounded-full bg-white hover:bg-slate-50 border border-[#E5E7EB] shadow-sm transition-all cursor-pointer">
              {audioEnabled ? <Volume2 size={16} className="text-[#5FAF68]" /> : <VolumeX size={16} className="text-red-500" />}
            </button>
          </header>
        )}

        {activeTab === "Assistant vocal" && (
            <AssistantVocal
              voiceState={realtime.voiceState}
              recordingSeconds={recordingSeconds}
              showVocalResponse={showVocalResponse}
              aiResponse={aiResponse}
              vocalTranslation={vocalTranslation}
              dynamicReliability={dynamicReliability}
              selectedLanguage={selectedLanguage}
              toggleListening={toggleListening}
              handleSuggestionClick={handleSuggestionClick}
              speakText={speakText}
              stopSpeaking={stopSpeaking}
              setShowVocalResponse={setShowVocalResponse}
              setVoiceState={() => {}}
              carouselRef={carouselRef}
              scrollCarousel={scrollCarousel}
              transcript={realtime.transcript}
              aiAudioOutput={aiAudioOutput}
            />
        )}
        {activeTab === "Messages" && <Messages messages={messages} keyboardText={keyboardText} setKeyboardText={setKeyboardText} handleQuerySubmit={handleChatQuerySubmit} setMessages={setMessages} speakText={speakText} fileInputRef={fileInputRef} attachedFile={attachedFile} setAttachedFile={setAttachedFile} />}
        {activeTab === "Explorer l'Afrique" && <ExplorerAfrique searchQuery={searchQuery} setSearchQuery={setSearchQuery} handleSuggestionClick={handleSuggestionClick} />}
        {activeTab === "Éducation & Recherche" && <EducationRecherche />}
        {activeTab === "Paramètres" && <Parametres />}
        {activeTab === "Mon compte" && <MonCompte />}
        {activeTab === "Administration" && <Admin />}
      </main>
    </div>
  );
}
