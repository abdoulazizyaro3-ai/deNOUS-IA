import React, { useRef, useEffect, useState } from "react";
import { Send, Paperclip, Mic, Sparkles, Volume2, X, Bot } from "lucide-react";

interface Message {
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  isAudio?: boolean;
}

interface MessagesProps {
  messages: Message[];
  keyboardText: string;
  setKeyboardText: (v: string) => void;
  handleQuerySubmit: (text: string) => void;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  speakText: (text: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  attachedFile: File | null;
  setAttachedFile: (f: File | null) => void;
  currentUser?: any;
}

export default function Messages({
  messages,
  keyboardText,
  setKeyboardText,
  handleQuerySubmit,
  setMessages,
  speakText,
  fileInputRef,
  attachedFile,
  setAttachedFile,
  currentUser,
}: MessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Watch for new AI messages to show typing indicator briefly
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last?.sender === "user") {
      setIsTyping(true);
    } else {
      setIsTyping(false);
    }
  }, [messages]);

  const handleSubmit = () => {
    if (!keyboardText.trim()) return;
    const userQ = keyboardText;
    setKeyboardText("");
    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: userQ,
        timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    handleQuerySubmit(userQ);
  };

  const suggestions = [
    "🌾 Agriculture traditionnelle",
    "💊 Pharmacopée Mossi",
    "🏛️ Empire du Mali",
    "🌍 Sagesse Wolof",
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-h-screen">
      {/* African-themed chat header */}
      <div className="relative overflow-hidden shrink-0">
        {/* Bogolan-style decorative strip */}
        <div className="h-1 w-full" style={{ background: "repeating-linear-gradient(90deg, #C1561F 0px, #C1561F 20px, #E8A33D 20px, #E8A33D 40px, #3D6B35 40px, #3D6B35 60px, #2B1810 60px, #2B1810 80px)" }} />
        <div className="bg-gradient-to-r from-[#2B1810] via-[#3d2418] to-[#2B1810] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* deNOUS AI avatar */}
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-[#C1561F] flex items-center justify-center shadow-lg border border-[#E8A33D]/30">
                <svg viewBox="0 0 100 100" className="w-6 h-6 fill-[#E8A33D]">
                  <path d="M 40,10 C 43,8 54,4 59,5 C 64,6 63,12 68,14 C 73,16 78,13 83,16 C 88,19 86,25 84,29 C 82,33 86,37 83,43 C 80,49 71,56 68,61 C 65,66 65,72 63,77 C 61,82 59,88 56,92 C 53,96 48,98 46,95 C 44,92 45,84 43,81 C 41,78 36,76 34,71 C 32,66 33,60 30,55 C 27,50 22,48 19,45 C 16,42 15,38 18,36 C 21,34 26,38 29,36 C 32,34 32,29 33,25 C 34,21 34,17 37,14 C 40,11 37,12 40,10 Z" />
                </svg>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#3D6B35] border-2 border-[#2B1810] rounded-full" />
            </div>
            <div>
              <h2 className="text-white font-black text-[15px] tracking-tight">deNOUS AI</h2>
              <p className="text-[#E8A33D]/80 text-[10px] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-[#3D6B35] rounded-full animate-pulse" />
                La Bibliothèque Vivante du Continent
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-[10px] text-white/70 font-bold">
              {messages.length} messages
            </div>
            <div className="px-3 py-1.5 rounded-full bg-[#C1561F]/30 border border-[#C1561F]/40 text-[10px] text-[#E8A33D] font-bold flex items-center gap-1">
              <Sparkles size={10} />
              IA active
            </div>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4 bg-[#FAF6F0] bg-bogolan/5" style={{ backgroundImage: "radial-gradient(circle at 20% 80%, rgba(193,86,31,0.04) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(61,107,53,0.04) 0%, transparent 50%)" }}>
        
        {/* Empty state */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-6 py-12">
            <div className="w-16 h-16 rounded-3xl bg-[#C1561F]/10 border border-[#C1561F]/20 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-10 h-10 fill-[#C1561F]/60">
                <path d="M 40,10 C 43,8 54,4 59,5 C 64,6 63,12 68,14 C 73,16 78,13 83,16 C 88,19 86,25 84,29 C 82,33 86,37 83,43 C 80,49 71,56 68,61 C 65,66 65,72 63,77 C 61,82 59,88 56,92 C 53,96 48,98 46,95 C 44,92 45,84 43,81 C 41,78 36,76 34,71 C 32,66 33,60 30,55 C 27,50 22,48 19,45 C 16,42 15,38 18,36 C 21,34 26,38 29,36 C 32,34 32,29 33,25 C 34,21 34,17 37,14 C 40,11 37,12 40,10 Z" />
              </svg>
            </div>
            <p className="text-[#2B1810]/50 text-sm font-semibold text-center">
              Commencez une conversation avec deNOUS AI
            </p>
          </div>
        )}

        {/* Messages */}
        {messages.map((m, idx) => (
          <div key={idx} className={`flex gap-3 ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
            {/* AI avatar */}
            {m.sender === "ai" && (
              <div className="w-8 h-8 rounded-xl bg-[#C1561F] flex items-center justify-center shrink-0 mt-1 shadow-md border border-[#E8A33D]/30">
                <svg viewBox="0 0 100 100" className="w-4.5 h-4.5 fill-[#E8A33D]">
                  <path d="M 40,10 C 43,8 54,4 59,5 C 64,6 63,12 68,14 C 73,16 78,13 83,16 C 88,19 86,25 84,29 C 82,33 86,37 83,43 C 80,49 71,56 68,61 C 65,66 65,72 63,77 C 61,82 59,88 56,92 C 53,96 48,98 46,95 C 44,92 45,84 43,81 C 41,78 36,76 34,71 C 32,66 33,60 30,55 C 27,50 22,48 19,45 C 16,42 15,38 18,36 C 21,34 26,38 29,36 C 32,34 32,29 33,25 C 34,21 34,17 37,14 C 40,11 37,12 40,10 Z" />
                </svg>
              </div>
            )}

            <div className={`max-w-[78%] group ${m.sender === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
              {/* Bubble */}
              <div className={`relative px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                m.sender === "user"
                  ? "bg-[#2B1810] text-white rounded-br-sm"
                  : "bg-white border border-[#EADBC8] text-[#2B1810] rounded-bl-sm shadow-[0_2px_12px_rgba(43,24,16,0.06)]"
              }`}>
                {/* Subtle pattern for AI bubbles */}
                {m.sender === "ai" && (
                  <div className="absolute top-0 right-0 w-12 h-12 rounded-2xl overflow-hidden opacity-[0.03] pointer-events-none">
                    <svg viewBox="0 0 40 40" className="w-full h-full fill-[#C1561F]">
                      <path d="M20 5 L35 20 L20 35 L5 20 Z" />
                    </svg>
                  </div>
                )}
                <div className="whitespace-pre-line relative z-10">
                  {m.text.split(/(\*\*.*?\*\*)/g).map((part, i) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
                    }
                    return <span key={i}>{part}</span>;
                  })}
                </div>
              </div>

              {/* Metadata row */}
              <div className={`flex items-center gap-2 px-1 ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                <span className="text-[10px] text-[#2B1810]/35 font-medium">{m.timestamp}</span>
                {m.sender === "ai" && (
                  <button
                    onClick={() => speakText(m.text)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-[#C1561F]/10 text-[#C1561F]/60 hover:text-[#C1561F]"
                    title="Écouter ce message"
                  >
                    <Volume2 size={11} />
                  </button>
                )}
              </div>
            </div>

            {/* User avatar */}
            {m.sender === "user" && (
              <div className="w-8 h-8 rounded-xl bg-[#2B1810] flex items-center justify-center shrink-0 mt-1 shadow-md text-white font-bold text-sm">
                {currentUser?.profile?.fullName ? currentUser.profile.fullName.charAt(0).toUpperCase() : currentUser?.username ? currentUser.username.charAt(0).toUpperCase() : "U"}
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-xl bg-[#C1561F] flex items-center justify-center shrink-0 shadow-md border border-[#E8A33D]/30">
              <svg viewBox="0 0 100 100" className="w-4.5 h-4.5 fill-[#E8A33D]">
                <path d="M 40,10 C 43,8 54,4 59,5 C 64,6 63,12 68,14 C 73,16 78,13 83,16 C 88,19 86,25 84,29 C 82,33 86,37 83,43 C 80,49 71,56 68,61 C 65,66 65,72 63,77 C 61,82 59,88 56,92 C 53,96 48,98 46,95 C 44,92 45,84 43,81 C 41,78 36,76 34,71 C 32,66 33,60 30,55 C 27,50 22,48 19,45 C 16,42 15,38 18,36 C 21,34 26,38 29,36 C 32,34 32,29 33,25 C 34,21 34,17 37,14 C 40,11 37,12 40,10 Z" />
              </svg>
            </div>
            <div className="bg-white border border-[#EADBC8] rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-2 h-2 rounded-full bg-[#C1561F]/40 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick suggestions */}
      <div className="px-4 md:px-8 py-2 bg-[#FAF6F0] border-t border-[#EADBC8]/50 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 min-w-max">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => {
                const text = s.replace(/^[^\s]+ /, "");
                setMessages((prev) => [...prev, { sender: "user", text, timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) }]);
                handleQuerySubmit(text);
              }}
              className="px-3 py-1.5 bg-white border border-[#EADBC8] hover:border-[#C1561F]/40 hover:bg-[#FAF6F0] rounded-full text-[11px] font-semibold text-[#2B1810]/70 hover:text-[#C1561F] transition-all whitespace-nowrap"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Input area */}
      <div className="px-4 md:px-8 py-4 bg-white border-t border-[#EADBC8] shrink-0">
        {/* Attached file pill */}
        {attachedFile && (
          <div className="mb-2 flex items-center gap-2 bg-[#FAF6F0] border border-[#EADBC8] rounded-xl px-3 py-1.5 w-fit">
            <span className="text-[11px] font-bold text-[#C1561F]">📎 {attachedFile.name}</span>
            <button onClick={() => setAttachedFile(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <X size={12} />
            </button>
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* Attach */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 rounded-xl bg-[#FAF6F0] border border-[#EADBC8] hover:border-[#C1561F]/40 flex items-center justify-center text-[#2B1810]/40 hover:text-[#C1561F] transition-all shrink-0 cursor-pointer"
            title="Joindre un fichier"
          >
            <Paperclip size={17} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) setAttachedFile(e.target.files[0]);
            }}
          />

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              placeholder="Votre message à deNOUS AI..."
              value={keyboardText}
              onChange={(e) => setKeyboardText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              rows={1}
              className="w-full resize-none rounded-2xl border border-[#EADBC8] hover:border-[#C1561F]/30 focus:border-[#C1561F]/50 bg-[#FAF6F0] px-4 py-2.5 text-sm text-[#2B1810] outline-none transition-all placeholder:text-[#2B1810]/35 max-h-32"
              style={{ lineHeight: "1.5" }}
            />
          </div>

          {/* Send button */}
          <button
            onClick={handleSubmit}
            disabled={!keyboardText.trim()}
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-[#C1561F] hover:bg-[#A8341A] text-white shadow-md hover:shadow-lg active:scale-95"
            title="Envoyer"
          >
            <Send size={16} />
          </button>
        </div>

        <p className="text-[10px] text-[#2B1810]/30 text-center mt-2 font-medium">
          Entrée pour envoyer • Maj+Entrée pour nouvelle ligne
        </p>
      </div>
    </div>
  );
}
