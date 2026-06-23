import React from "react";

export function AgentSquadCard() {
  const agents = [
    {
      name: "Chef d'Orchestre",
      file: "coordinatorAgent.ts",
      role: "Orchestration & Routage",
      color: "bg-purple-100 text-purple-700 border-purple-200",
      icon: "🎯"
    },
    {
      name: "Agent Collecte",
      file: "collectorAgent.ts",
      role: "Acquisition multi-sources",
      color: "bg-teal-100 text-teal-700 border-teal-200",
      icon: "📥"
    },
    {
      name: "Agent Structuration",
      file: "structurerAgent.ts",
      role: "Graphe, Fiabilité Nagoya",
      color: "bg-amber-100 text-amber-700 border-amber-200",
      icon: "📐"
    },
    {
      name: "Agent Exploitation",
      file: "analystAgent.ts",
      role: "Rapports & Décideurs",
      color: "bg-rose-100 text-rose-700 border-rose-200",
      icon: "📊"
    },
    {
      name: "Agent Vocal",
      file: "vocalAgent.ts",
      role: "Comprendre & Traduire",
      color: "bg-emerald-100 text-emerald-700 border-emerald-200",
      icon: "🎙️"
    }
  ];

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-3.5 space-y-2 mt-3 shadow-sm">
      <div className="flex items-center gap-1.5 justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">🤖</span>
          <h5 className="text-[10px] font-extrabold text-[#354e38] uppercase tracking-wider">
            Équipe de 5 Agents deNOUS
          </h5>
        </div>
        <span className="text-[8px] bg-[#DFF2E1] text-[#354e38] px-1.5 py-0.5 rounded-full font-bold">
          Souverains
        </span>
      </div>
      
      <p className="text-[9px] text-[#354e38]/70 leading-normal font-semibold">
        Chaque agent autonome possède son fichier dédié et collabore en temps réel pour préserver notre patrimoine.
      </p>

      <div className="space-y-1.5 pt-1">
        {agents.map((agent) => (
          <div key={agent.file} className="flex items-start gap-2 bg-[#F9FBF8] border border-slate-100 p-1.5 rounded-xl text-[9px] hover:border-[#5FAF68]/30 transition-all">
            <span className="text-xs shrink-0 mt-0.5">{agent.icon}</span>
            <div className="space-y-0.5 min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="font-extrabold text-slate-800 truncate">
                  {agent.name}
                </span>
                <span className="text-[7px] text-slate-400 font-mono italic shrink-0">
                  {agent.file}
                </span>
              </div>
              <p className="text-[8px] text-slate-500 font-medium truncate">
                {agent.role}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
