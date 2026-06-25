import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, RefreshCw, Globe, Check, AlertCircle, X } from "lucide-react";

export default function AdminExploreAfrica({ searchTerm }: { searchTerm: string }) {
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState<any>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/explore/countries/");
      const data = await res.json();
      const list = Object.values(data);
      setCountries(list);
    } catch (err) {
      setError("Erreur lors du chargement des pays.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showNotification = (msg: string, type: "success" | "error") => {
    if (type === "success") {
      setSuccess(msg);
      setTimeout(() => setSuccess(null), 4000);
    } else {
      setError(msg);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleOpenCreate = () => {
    setIsEdit(false);
    setForm({
      id: "",
      name: "",
      localGreeting: "",
      localGreetingExplanation: "",
      capital: "",
      currency: "",
      population: "",
      tagline: "",
      flagEmoji: "🌍",
      overview: "",
      history: "",
      culture: "",
      gastronomy: "",
      keyFacts: [],
      demographics: { total: "", density: "", medianAge: "", urbanRatio: "", lifeExpectancy: "", ethnicGroups: [] },
      economy: { gdp: "", gdpGrowth: "", currency: "", mainSectors: [], keyExports: "" },
      languages: [],
      landmarks: []
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = async (country: any) => {
    setIsEdit(true);
    setLoading(true);
    try {
      const res = await fetch(`/api/explore/countries/${country.id}/`);
      const details = await res.json();
      setForm({ ...country, ...details });
      setIsModalOpen(true);
    } catch (err) {
      showNotification("Erreur lors du chargement des détails.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const url = isEdit ? `/api/explore/countries/${form.id}/update/` : "/api/explore/countries/create/";
    
    const payload = { ...form };
    if (typeof payload.demographics.ethnicGroups === "string") {
      payload.demographics.ethnicGroups = payload.demographics.ethnicGroups.split(",").map((s:string) => s.trim()).filter(Boolean);
    }
    if (typeof payload.economy.mainSectors === "string") {
      payload.economy.mainSectors = payload.economy.mainSectors.split(",").map((s:string) => s.trim()).filter(Boolean);
    }

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotification(isEdit ? "Pays mis à jour !" : "Pays créé !", "success");
        setIsModalOpen(false);
        fetchData();
      } else {
        showNotification(data.error || "Erreur lors de l'enregistrement", "error");
      }
    } catch (err) {
      showNotification("Erreur réseau.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce pays ?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/explore/countries/${id}/delete/`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotification("Pays supprimé.", "success");
        fetchData();
      } else {
        showNotification(data.error || "Impossible de supprimer.", "error");
      }
    } catch (err) {
      showNotification("Erreur réseau.", "error");
    } finally {
      setLoading(false);
    }
  };

  const filtered = countries.filter(c => c.name.toLowerCase().includes((searchTerm || "").toLowerCase()));

  return (
    <div className="bg-white rounded-3xl border border-[#EADBC8] shadow-sm overflow-hidden">
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 flex items-center gap-3 text-xs font-medium">
          <Check className="bg-emerald-500 text-white rounded-full p-0.5 shrink-0" size={18} />
          <span>{success}</span>
        </div>
      )}
      
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 flex items-center gap-3 text-xs font-medium">
          <AlertCircle className="text-rose-500 shrink-0" size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="p-5 border-b border-[#EADBC8] flex justify-between items-center bg-[#FAF6F0]/50">
        <div>
          <h3 className="text-sm font-black text-[#2B1810] tracking-tight">Liste des Pays</h3>
          <p className="text-[10px] text-[#2B1810]/50 font-medium">Gestion des données Explorer l'Afrique</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="px-3 py-2 border bg-white rounded-xl text-xs font-black">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={handleOpenCreate} className="flex items-center gap-1 px-3.5 py-2 bg-[#C1561F] text-white rounded-xl text-xs font-black">
            <Plus size={14} /> Ajouter un Pays
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#FAF6F0] text-[#2B1810]/70 border-b">
              <th className="p-4 font-black">Pays</th>
              <th className="p-4 font-black">Capitale</th>
              <th className="p-4 font-black">Population</th>
              <th className="p-4 font-black text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="border-b hover:bg-[#F5ECE1]/20">
                <td className="p-4 font-black flex items-center gap-2">
                  <span className="text-lg">{c.flagEmoji}</span> {c.name}
                </td>
                <td className="p-4">{c.capital}</td>
                <td className="p-4">{c.population}</td>
                <td className="p-4 flex justify-end gap-2">
                  <button onClick={() => handleOpenEdit(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden mt-20 mb-10">
            <div className="flex items-center justify-between p-5 border-b bg-[#FAF6F0]">
              <h3 className="text-lg font-black">{isEdit ? "Modifier le Pays" : "Ajouter un Pays"}</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <form id="country-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {!isEdit && (
                    <div>
                      <label className="text-xs font-bold block mb-1">ID (ex: bf)</label>
                      <input required value={form.id} onChange={e => setForm({...form, id: e.target.value})} className="w-full p-2 border rounded-xl text-xs" />
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-bold block mb-1">Nom du Pays</label>
                    <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full p-2 border rounded-xl text-xs" />
                  </div>
                  <div>
                    <label className="text-xs font-bold block mb-1">Capitale</label>
                    <input value={form.capital} onChange={e => setForm({...form, capital: e.target.value})} className="w-full p-2 border rounded-xl text-xs" />
                  </div>
                  <div>
                    <label className="text-xs font-bold block mb-1">Emoji Drapeau</label>
                    <input value={form.flagEmoji} onChange={e => setForm({...form, flagEmoji: e.target.value})} className="w-full p-2 border rounded-xl text-xs" />
                  </div>
                </div>

                <div className="p-4 border rounded-xl bg-slate-50 space-y-4">
                  <h4 className="font-bold text-sm">Démographie</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Population totale" value={form.demographics?.total || ""} onChange={e => setForm({...form, demographics: {...form.demographics, total: e.target.value}})} className="p-2 border rounded-xl text-xs" />
                    <input placeholder="Densité" value={form.demographics?.density || ""} onChange={e => setForm({...form, demographics: {...form.demographics, density: e.target.value}})} className="p-2 border rounded-xl text-xs" />
                    <input placeholder="Groupes ethniques (séparés par virgule)" value={typeof form.demographics?.ethnicGroups === "string" ? form.demographics.ethnicGroups : (form.demographics?.ethnicGroups || []).join(", ")} onChange={e => setForm({...form, demographics: {...form.demographics, ethnicGroups: e.target.value}})} className="p-2 border rounded-xl text-xs" />
                  </div>
                </div>

                <div className="p-4 border rounded-xl bg-slate-50 space-y-4">
                  <h4 className="font-bold text-sm">Économie</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <input placeholder="PIB" value={form.economy?.gdp || ""} onChange={e => setForm({...form, economy: {...form.economy, gdp: e.target.value}})} className="p-2 border rounded-xl text-xs" />
                    <input placeholder="Croissance" value={form.economy?.gdpGrowth || ""} onChange={e => setForm({...form, economy: {...form.economy, gdpGrowth: e.target.value}})} className="p-2 border rounded-xl text-xs" />
                    <input placeholder="Secteurs (séparés par virgule)" value={typeof form.economy?.mainSectors === "string" ? form.economy.mainSectors : (form.economy?.mainSectors || []).join(", ")} onChange={e => setForm({...form, economy: {...form.economy, mainSectors: e.target.value}})} className="p-2 border rounded-xl text-xs" />
                  </div>
                </div>

                <div className="p-4 border rounded-xl bg-slate-50 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-sm">Sites Touristiques</h4>
                    <button type="button" onClick={() => setForm({...form, landmarks: [...(form.landmarks || []), { name: "", description: "", image: "" }]})} className="text-xs text-blue-600 font-bold hover:underline">
                      + Ajouter un site
                    </button>
                  </div>
                  {(form.landmarks || []).map((lm: any, index: number) => (
                    <div key={index} className="grid gap-2 p-3 border rounded-lg bg-white relative shadow-sm">
                      <div className="grid grid-cols-3 gap-2">
                        <input placeholder="Nom du site" value={lm.name} onChange={e => { const newLms = [...form.landmarks]; newLms[index].name = e.target.value; setForm({...form, landmarks: newLms}); }} className="col-span-1 p-2 border rounded text-xs" />
                        <input placeholder="Image principale URL (ex: /img.jpg)" value={lm.image || lm.image_url || ""} onChange={e => { const newLms = [...form.landmarks]; newLms[index].image = e.target.value; setForm({...form, landmarks: newLms}); }} className="col-span-1 p-2 border rounded text-xs" />
                        <input placeholder="Description courte" value={lm.description} onChange={e => { const newLms = [...form.landmarks]; newLms[index].description = e.target.value; setForm({...form, landmarks: newLms}); }} className="col-span-1 p-2 border rounded text-xs" />
                      </div>
                      
                      <div className="grid grid-cols-5 gap-2 mt-2">
                        <input placeholder="Image 1 (URL)" value={lm.image1 || ""} onChange={e => { const newLms = [...form.landmarks]; newLms[index].image1 = e.target.value; setForm({...form, landmarks: newLms}); }} className="p-2 border rounded text-xs bg-slate-50" />
                        <input placeholder="Image 2 (URL)" value={lm.image2 || ""} onChange={e => { const newLms = [...form.landmarks]; newLms[index].image2 = e.target.value; setForm({...form, landmarks: newLms}); }} className="p-2 border rounded text-xs bg-slate-50" />
                        <input placeholder="Image 3 (URL)" value={lm.image3 || ""} onChange={e => { const newLms = [...form.landmarks]; newLms[index].image3 = e.target.value; setForm({...form, landmarks: newLms}); }} className="p-2 border rounded text-xs bg-slate-50" />
                        <input placeholder="Image 4 (URL)" value={lm.image4 || ""} onChange={e => { const newLms = [...form.landmarks]; newLms[index].image4 = e.target.value; setForm({...form, landmarks: newLms}); }} className="p-2 border rounded text-xs bg-slate-50" />
                        <input placeholder="Image 5 (URL)" value={lm.image5 || ""} onChange={e => { const newLms = [...form.landmarks]; newLms[index].image5 = e.target.value; setForm({...form, landmarks: newLms}); }} className="p-2 border rounded text-xs bg-slate-50" />
                      </div>
                      
                      <div className="grid grid-cols-1 gap-2 mt-2">
                        <textarea placeholder="Description Détaillée (Modal)" rows={2} value={lm.detailedDescription || ""} onChange={e => { const newLms = [...form.landmarks]; newLms[index].detailedDescription = e.target.value; setForm({...form, landmarks: newLms}); }} className="p-2 border rounded text-xs bg-slate-50 w-full" />
                        <input placeholder="Pourquoi visiter ?" value={lm.whyVisit || ""} onChange={e => { const newLms = [...form.landmarks]; newLms[index].whyVisit = e.target.value; setForm({...form, landmarks: newLms}); }} className="p-2 border rounded text-xs bg-slate-50 w-full" />
                        <textarea placeholder="Conseils pratiques (séparés par un saut de ligne)" rows={2} value={lm.practicalTips || ""} onChange={e => { const newLms = [...form.landmarks]; newLms[index].practicalTips = e.target.value; setForm({...form, landmarks: newLms}); }} className="p-2 border rounded text-xs bg-slate-50 w-full" />
                      </div>

                      <button type="button" onClick={() => { const newLms = form.landmarks.filter((_:any, i:number) => i !== index); setForm({...form, landmarks: newLms}); }} className="absolute -right-2 -top-2 bg-red-100 text-red-600 rounded-full p-1"><Trash2 size={12} /></button>
                    </div>
                  ))}
                </div>

                <div className="p-4 border rounded-xl bg-slate-50 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-sm">Langues</h4>
                    <button type="button" onClick={() => setForm({...form, languages: [...(form.languages || []), { name: "", type: "", percentage: "" }]})} className="text-xs text-blue-600 font-bold hover:underline">
                      + Ajouter une langue
                    </button>
                  </div>
                  {(form.languages || []).map((lang: any, index: number) => (
                    <div key={index} className="grid grid-cols-3 gap-2 p-2 border rounded-lg bg-white relative">
                      <input placeholder="Nom (ex: Bambara)" value={lang.name} onChange={e => { const newLangs = [...form.languages]; newLangs[index].name = e.target.value; setForm({...form, languages: newLangs}); }} className="p-2 border rounded text-xs" />
                      <input placeholder="Type (ex: Nationale)" value={lang.type || lang.language_type || ""} onChange={e => { const newLangs = [...form.languages]; newLangs[index].type = e.target.value; setForm({...form, languages: newLangs}); }} className="p-2 border rounded text-xs" />
                      <input placeholder="Pourcentage (ex: 80%)" value={lang.percentage} onChange={e => { const newLangs = [...form.languages]; newLangs[index].percentage = e.target.value; setForm({...form, languages: newLangs}); }} className="p-2 border rounded text-xs" />
                      <button type="button" onClick={() => { const newLangs = form.languages.filter((_:any, i:number) => i !== index); setForm({...form, languages: newLangs}); }} className="absolute -right-2 -top-2 bg-red-100 text-red-600 rounded-full p-1"><Trash2 size={12} /></button>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-bold text-sm">Description générale & Culture</h4>
                  <div>
                    <label className="text-xs font-bold block mb-1">Aperçu (Overview)</label>
                    <textarea rows={3} value={form.overview} onChange={e => setForm({...form, overview: e.target.value})} className="w-full p-2 border rounded-xl text-xs" />
                  </div>
                  <div>
                    <label className="text-xs font-bold block mb-1">Histoire</label>
                    <textarea rows={3} value={form.history} onChange={e => setForm({...form, history: e.target.value})} className="w-full p-2 border rounded-xl text-xs" />
                  </div>
                  <div>
                    <label className="text-xs font-bold block mb-1">Culture</label>
                    <textarea rows={3} value={form.culture} onChange={e => setForm({...form, culture: e.target.value})} className="w-full p-2 border rounded-xl text-xs" />
                  </div>
                  <div>
                    <label className="text-xs font-bold block mb-1">Gastronomie</label>
                    <textarea rows={3} value={form.gastronomy} onChange={e => setForm({...form, gastronomy: e.target.value})} className="w-full p-2 border rounded-xl text-xs" />
                  </div>
                </div>
              </form>
            </div>
            <div className="p-5 border-t bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-xs font-bold bg-white border rounded-xl">Annuler</button>
              <button type="submit" form="country-form" disabled={loading} className="px-5 py-2.5 text-xs font-bold bg-[#C1561F] text-white rounded-xl">
                {loading ? "Sauvegarde..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
