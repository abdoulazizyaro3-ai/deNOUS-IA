import React, { useState } from "react";
import { User, Lock, Mail, Globe, MapPin, Loader2, ArrowRight } from "lucide-react";

interface AuthProps {
  onLoginSuccess: (userData: any) => void;
}

export default function Auth({ onLoginSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("Mali");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = isLogin ? "/api/login/" : "/api/register/";
    
    const payload = isLogin 
      ? { username, password }
      : { username, email, password, fullName, country };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        onLoginSuccess(data.user);
      } else {
        setError(data.error || "Une erreur est survenue.");
      }
    } catch (err) {
      setError("Problème de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF6F0] bg-bogolan flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Decorative background shapes */}
      <div className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-[#C1561F]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-[#3D6B35]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Logo Area */}
      <div className="mb-8 text-center z-10">
        <div className="w-16 h-16 mx-auto bg-[#C1561F] rounded-2xl flex items-center justify-center shadow-lg border border-[#E8A33D]/30 mb-4">
          <svg viewBox="0 0 100 100" className="w-10 h-10 fill-[#E8A33D] filter drop-shadow">
            <path d="M 40,10 C 43,8 54,4 59,5 C 64,6 63,12 68,14 C 73,16 78,13 83,16 C 88,19 86,25 84,29 C 82,33 86,37 83,43 C 80,49 71,56 68,61 C 65,66 65,72 63,77 C 61,82 59,88 56,92 C 53,96 48,98 46,95 C 44,92 45,84 43,81 C 41,78 36,76 34,71 C 32,66 33,60 30,55 C 27,50 22,48 19,45 C 16,42 15,38 18,36 C 21,34 26,38 29,36 C 32,34 32,29 33,25 C 34,21 34,17 37,14 C 40,11 37,12 40,10 Z" />
          </svg>
        </div>
        <h1 className="text-3xl font-black font-display tracking-tight text-[#2B1810]">deNOUS AI</h1>
        <p className="text-sm font-bold text-[#C1561F] mt-1 tracking-wider uppercase">Sagesse & Oralité Africaine</p>
      </div>

      {/* Card */}
      <div className="bg-white border border-[#EADBC8] p-8 rounded-3xl shadow-2xl w-full max-w-md z-10 relative">
        <div className="flex gap-4 mb-8 relative">
          <button 
            onClick={() => { setIsLogin(true); setError(null); }}
            className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all ${isLogin ? 'border-[#C1561F] text-[#C1561F]' : 'border-transparent text-[#2B1810]/40 hover:text-[#2B1810]'}`}
          >
            Se connecter
          </button>
          <button 
            onClick={() => { setIsLogin(false); setError(null); }}
            className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all ${!isLogin ? 'border-[#C1561F] text-[#C1561F]' : 'border-transparent text-[#2B1810]/40 hover:text-[#2B1810]'}`}
          >
            S'inscrire
          </button>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={16} className="text-[#2B1810]/40" />
                </div>
                <input 
                  type="text" 
                  required 
                  placeholder="Nom complet" 
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF6F0] border border-[#EADBC8] rounded-xl text-sm text-[#2B1810] focus:outline-none focus:border-[#C1561F] transition-colors placeholder:text-[#2B1810]/40 font-medium"
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={16} className="text-[#2B1810]/40" />
                </div>
                <input 
                  type="email" 
                  required 
                  placeholder="Adresse email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF6F0] border border-[#EADBC8] rounded-xl text-sm text-[#2B1810] focus:outline-none focus:border-[#C1561F] transition-colors placeholder:text-[#2B1810]/40 font-medium"
                />
              </div>
            </>
          )}

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User size={16} className="text-[#2B1810]/40" />
            </div>
            <input 
              type="text" 
              required 
              placeholder="Nom d'utilisateur" 
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#FAF6F0] border border-[#EADBC8] rounded-xl text-sm text-[#2B1810] focus:outline-none focus:border-[#C1561F] transition-colors placeholder:text-[#2B1810]/40 font-medium"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={16} className="text-[#2B1810]/40" />
            </div>
            <input 
              type="password" 
              required 
              placeholder="Mot de passe" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#FAF6F0] border border-[#EADBC8] rounded-xl text-sm text-[#2B1810] focus:outline-none focus:border-[#C1561F] transition-colors placeholder:text-[#2B1810]/40 font-medium"
            />
          </div>

          {!isLogin && (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Globe size={16} className="text-[#2B1810]/40" />
              </div>
              <select 
                value={country}
                onChange={e => setCountry(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#FAF6F0] border border-[#EADBC8] rounded-xl text-sm text-[#2B1810] focus:outline-none focus:border-[#C1561F] transition-colors font-medium appearance-none"
              >
                <option value="Mali">Mali</option>
                <option value="Burkina Faso">Burkina Faso</option>
                <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                <option value="Sénégal">Sénégal</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 mt-6 bg-[#C1561F] hover:bg-[#A8341A] text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-70"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : (isLogin ? "Se connecter" : "Créer mon compte")}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <p className="text-[11px] text-center text-[#2B1810]/40 font-bold mt-6">
          {isLogin ? "Pas encore de compte ? Cliquez sur S'inscrire en haut." : "En vous inscrivant, vous rejoignez la communauté des gardiens du savoir."}
        </p>
      </div>
    </div>
  );
}
