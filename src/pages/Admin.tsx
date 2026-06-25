import React, { useState, useEffect } from "react";
import { 
  Plus, Edit2, Trash2, RefreshCw, FileText, Globe, Search, 
  X, Check, AlertCircle, Upload, Shield, Database, Compass, Info
} from "lucide-react";
import { KnowledgeNode, ArchiveItem } from "../types";
import AdminExploreAfrica from "./AdminExploreAfrica";
import AdminUsers from "./AdminUsers";

interface DictionaryItem {
  id: string;
  title: string;
  language: string;
  description: string;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number;
  extractedText: string;
  createdAt: string;
  updatedAt: string;
}
export default function Admin() {
  const [activeTab, setActiveTab] = useState<"nodes" | "dictionaries" | "archives" | "countries">("nodes");
  const [nodes, setNodes] = useState<KnowledgeNode[]>([]);
  const [dictionaries, setDictionaries] = useState<DictionaryItem[]>([]);
  const [archives, setArchives] = useState<ArchiveItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Modals state
  const [isNodeModalOpen, setIsNodeModalOpen] = useState(false);
  const [isDictModalOpen, setIsDictModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "node" | "dict" | "archive"; id: string; name: string } | null>(null);

  // Forms state - Nodes
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [nodeForm, setNodeForm] = useState({
    id: "",
    title: "",
    category: "culture",
    theme: "culture",
    description: "",
    rawContent: "",
    language: "Français",
    country: "Mali",
    region: "Général",
    ethnolinguisticGroup: "Général",
    reliabilityScore: 80,
    source: "Admin",
  });

  // Forms state - Dictionaries
  const [editingDictId, setEditingDictId] = useState<string | null>(null);
  const [dictForm, setDictForm] = useState({
    id: "",
    title: "",
    language: "dioula",
    description: "",
    extractedText: "",
  });
  const [dictFile, setDictFile] = useState<File | null>(null);

  // Forms state - Archives
  const [editingArchiveId, setEditingArchiveId] = useState<string | null>(null);
  const [archiveForm, setArchiveForm] = useState({
    id: "",
    description: "",
    documentType: "historique",
    provenance: "",
  });
  const [archiveFile, setArchiveFile] = useState<File | null>(null);


  // Helper arrays for options
  const categoriesList = [
    { value: "agriculture", label: "🌾 Agriculture & Élevage" },
    { value: "health", label: "💊 Pharmacopée & Santé" },
    { value: "culture", label: "🏛️ Tradition & Culture" },
    { value: "education", label: "🎓 Enseignement & Éducation" },
    { value: "history", label: "📜 Histoire & Épopées" },
    { value: "spirituality", label: "🕊️ Spiritualité & Croyances" },
    { value: "language", label: "🗣️ Langue & Oralité" },
    { value: "craft", label: "🛠️ Artisanat & Savoir-faire" },
  ];

  const themesList = [
    { value: "agroecology", label: "Agroécologie" },
    { value: "medicinal", label: "Médecine traditionnelle" },
    { value: "proverb", label: "Proverbe" },
    { value: "tale", label: "Conte" },
    { value: "ritual", label: "Rituel" },
    { value: "song", label: "Chant" },
    { value: "dance", label: "Danse" },
    { value: "recipe", label: "Recette" },
    { value: "technique", label: "Technique traditionnelle" },
    { value: "culture", label: "Culture générale" },
  ];

  const languagesList = [
    { value: "Français", label: "Français" },
    { value: "Bambara", label: "Bambara" },
    { value: "Dioula", label: "Dioula" },
    { value: "Mooré", label: "Mooré" },
  ];

  const dictLanguagesList = [
    { value: "dioula", label: "Dioula" },
    { value: "bambara", label: "Bambara" },
    { value: "moore", label: "Mooré" },
    { value: "french", label: "Français" },
  ];

  const docTypesList = [
    { value: "historique", label: "📜 Historique (ex: Manuscrits, Chartes)" },
    { value: "académique", label: "🎓 Académique / Scientifique" },
    { value: "légal", label: "⚖️ Légal / Constitutionnel" },
    { value: "administratif", label: "📁 Administratif / Colonial" },
    { value: "autre", label: "📄 Autre" },
  ];

  const countriesList = ["Mali", "Burkina Faso", "Sénégal", "Guinée", "Côte d'Ivoire", "Niger"];

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch nodes
      const nodesRes = await fetch("/api/nodes");
      const nodesData = await nodesRes.json();
      if (nodesData && nodesData.nodes) setNodes(nodesData.nodes);

      // 2. Fetch dictionaries
      const dictRes = await fetch("/api/dictionaries");
      const dictData = await dictRes.json();
      if (dictData && dictData.dictionaries) setDictionaries(dictData.dictionaries);

      // 3. Fetch archives
      const archiveRes = await fetch("/api/archives");
      const archiveData = await archiveRes.json();
      if (archiveData && archiveData.archives) setArchives(archiveData.archives);


    } catch (err: any) {
      setError("Erreur lors du chargement des données. Veuillez réessayer.");
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

  // --- NODES CRUD HANDLERS ---
  const handleOpenNodeCreate = () => {
    setEditingNodeId(null);
    setNodeForm({
      id: `savoir_${Math.random().toString(36).substr(2, 9)}`,
      title: "",
      category: "culture",
      theme: "culture",
      description: "",
      rawContent: "",
      language: "Français",
      country: "Mali",
      region: "Général",
      ethnolinguisticGroup: "Général",
      reliabilityScore: 85,
      source: "Admin",
    });
    setIsNodeModalOpen(true);
  };

  const handleOpenNodeEdit = (node: KnowledgeNode) => {
    setEditingNodeId(node.id);
    setNodeForm({
      id: node.id,
      title: node.title || "",
      category: node.category || "culture",
      theme: node.theme || "culture",
      description: node.description || "",
      rawContent: node.rawContent || "",
      language: node.language || "Français",
      country: node.country || "Mali",
      region: node.region || "Général",
      ethnolinguisticGroup: node.ethnolinguisticGroup || "Général",
      reliabilityScore: node.reliabilityScore || 85,
      source: node.source || "Admin",
    });
    setIsNodeModalOpen(true);
  };

  const handleNodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nodeForm.title || !nodeForm.description) {
      showNotification("Le titre et la description sont obligatoires.", "error");
      return;
    }

    setLoading(true);
    const url = editingNodeId 
      ? `/api/nodes/${editingNodeId}/update/`
      : "/api/nodes/create/";

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nodeForm),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showNotification(
          editingNodeId ? "Savoir mis à jour avec succès !" : "Nouveau savoir ajouté !",
          "success"
        );
        setIsNodeModalOpen(false);
        fetchData();
      } else {
        showNotification(data.error || "Une erreur est survenue.", "error");
      }
    } catch (err) {
      showNotification("Erreur de connexion avec le serveur.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDeleteNode = (id: string, title: string) => {
    setDeleteConfirm({ type: "node", id, name: title });
  };

  const handleDeleteNode = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/nodes/${id}/delete/`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotification("Savoir supprimé avec succès.", "success");
        setDeleteConfirm(null);
        fetchData();
      } else {
        showNotification(data.error || "Impossible de supprimer.", "error");
      }
    } catch (err) {
      showNotification("Erreur de communication.", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- DICTIONARY CRUD HANDLERS ---
  const handleOpenDictCreate = () => {
    setEditingDictId(null);
    setDictForm({
      id: `dict_${Math.random().toString(36).substr(2, 9)}`,
      title: "",
      language: "dioula",
      description: "",
      extractedText: "",
    });
    setDictFile(null);
    setIsDictModalOpen(true);
  };

  const handleOpenDictEdit = (dict: DictionaryItem) => {
    setEditingDictId(dict.id);
    setDictForm({
      id: dict.id,
      title: dict.title || "",
      language: dict.language || "dioula",
      description: dict.description || "",
      extractedText: dict.extractedText || "",
    });
    setDictFile(null);
    setIsDictModalOpen(true);
  };

  const handleDictSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dictForm.title || !dictForm.language) {
      showNotification("Le titre et la langue sont requis.", "error");
      return;
    }

    setLoading(true);
    const url = editingDictId 
      ? `/api/dictionaries/${editingDictId}/update/`
      : "/api/dictionaries/create/";

    const formData = new FormData();
    formData.append("id", dictForm.id);
    formData.append("title", dictForm.title);
    formData.append("language", dictForm.language);
    formData.append("description", dictForm.description);
    formData.append("extractedText", dictForm.extractedText);
    if (dictFile) formData.append("file", dictFile);

    try {
      const res = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showNotification(
          editingDictId ? "Dictionnaire mis à jour avec succès !" : "Dictionnaire créé avec succès !",
          "success"
        );
        setIsDictModalOpen(false);
        fetchData();
      } else {
        showNotification(data.error || "Erreur lors de l'enregistrement.", "error");
      }
    } catch (err) {
      showNotification("Erreur réseau.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDeleteDict = (id: string, title: string) => {
    setDeleteConfirm({ type: "dict", id, name: title });
  };

  const handleDeleteDict = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dictionaries/${id}/delete/`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotification("Dictionnaire supprimé avec succès.", "success");
        setDeleteConfirm(null);
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

  // --- ARCHIVE CRUD HANDLERS ---
  const handleOpenArchiveCreate = () => {
    setEditingArchiveId(null);
    setArchiveForm({
      id: `archive_${Math.random().toString(36).substr(2, 9)}`,
      description: "",
      documentType: "historique",
      provenance: "",
    });
    setArchiveFile(null);
    setIsArchiveModalOpen(true);
  };

  const handleOpenArchiveEdit = (archive: ArchiveItem) => {
    setEditingArchiveId(archive.id);
    setArchiveForm({
      id: archive.id,
      description: archive.description || "",
      documentType: archive.documentType || "historique",
      provenance: archive.provenance || "",
    });
    setArchiveFile(null);
    setIsArchiveModalOpen(true);
  };

  const handleArchiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!archiveForm.documentType || !archiveForm.provenance) {
      showNotification("Le type de document et la provenance sont obligatoires.", "error");
      return;
    }

    setLoading(true);
    const url = editingArchiveId
      ? `/api/archives/${editingArchiveId}/update/`
      : "/api/archives/create/";

    const formData = new FormData();
    formData.append("id", archiveForm.id);
    formData.append("description", archiveForm.description);
    formData.append("documentType", archiveForm.documentType);
    formData.append("provenance", archiveForm.provenance);
    if (archiveFile) formData.append("file", archiveFile);

    try {
      const res = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showNotification(
          editingArchiveId ? "Archive mise à jour avec succès !" : "Nouvelle archive ajoutée !",
          "success"
        );
        setIsArchiveModalOpen(false);
        fetchData();
      } else {
        showNotification(data.error || "Erreur d'enregistrement.", "error");
      }
    } catch (err) {
      showNotification("Erreur réseau.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDeleteArchive = (id: string, name: string) => {
    setDeleteConfirm({ type: "archive", id, name });
  };

  const handleDeleteArchive = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/archives/${id}/delete/`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotification("Archive supprimée avec succès.", "success");
        setDeleteConfirm(null);
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


  // --- DATABASE RESET ---
  const handleResetDatabase = async () => {
    setLoading(true);
    setIsResetConfirmOpen(false);
    try {
      const res = await fetch("/api/nodes/reset/", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotification("Base de données réinitialisée et re-seedée avec succès !", "success");
        fetchData();
      } else {
        showNotification(data.error || "Échec de la réinitialisation.", "error");
      }
    } catch (err) {
      showNotification("Erreur réseau.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Search filtering
  const filteredNodes = nodes.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.language.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDictionaries = dictionaries.filter(d => 
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.language.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredArchives = archives.filter(a => 
    a.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.documentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.provenance.toLowerCase().includes(searchTerm.toLowerCase())
  );



  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="px-6 md:px-12 py-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header and Action Panel */}
      <div className="border-b border-[#EADBC8] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black font-display text-[#2B1810] flex items-center gap-2">
            <Shield className="text-[#C1561F]" size={28} />
            Espace d'Administration deNOUS AI
          </h2>
          <p className="text-xs text-[#2B1810]/60 mt-1 font-medium">
            Gérez directement les savoirs traditionnels, les dictionnaires de langues locales et les documents d'archives.
          </p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={fetchData} 
            className="flex items-center gap-1.5 px-3 py-2 border border-[#EADBC8] bg-white rounded-xl text-xs font-black text-[#2B1810]/80 hover:bg-[#F5ECE1]/40 transition"
            title="Rafraîchir les données"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Actualiser
          </button>
          
          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-sm transition"
          >
            <Database size={14} />
            Réinitialiser la Base
          </button>
        </div>
      </div>

      {/* Notifications */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-3 text-xs font-medium animate-fadeIn">
          <Check className="bg-emerald-500 text-white rounded-full p-0.5 shrink-0" size={18} />
          <span>{success}</span>
        </div>
      )}
      
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-center gap-3 text-xs font-medium animate-fadeIn">
          <AlertCircle className="text-rose-500 shrink-0" size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-2 rounded-2xl border border-[#EADBC8] shadow-sm">
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => { setActiveTab("nodes"); setSearchTerm(""); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-black tracking-normal transition-all duration-150 ${
              activeTab === "nodes"
                ? "bg-[#F5ECE1] text-[#C1561F] shadow-sm"
                : "text-[#2B1810]/70 hover:bg-[#F5ECE1]/40"
            }`}
          >
            📚 Savoirs locaux ({nodes.length})
          </button>
          <button
            onClick={() => { setActiveTab("dictionaries"); setSearchTerm(""); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-black tracking-normal transition-all duration-150 ${
              activeTab === "dictionaries"
                ? "bg-[#F5ECE1] text-[#C1561F] shadow-sm"
                : "text-[#2B1810]/70 hover:bg-[#F5ECE1]/40"
            }`}
          >
            📖 Dictionnaires ({dictionaries.length})
          </button>
          <button
            onClick={() => { setActiveTab("archives"); setSearchTerm(""); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-black tracking-normal transition-all duration-150 ${
              activeTab === "archives"
                ? "bg-[#F5ECE1] text-[#C1561F] shadow-sm"
                : "text-[#2B1810]/70 hover:bg-[#F5ECE1]/40"
            }`}
          >
            📂 Archives PDF ({archives.length})
          </button>

          <button
            onClick={() => { setActiveTab("countries"); setSearchTerm(""); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-black tracking-normal transition-all duration-150 ${
              activeTab === "countries"
                ? "bg-[#F5ECE1] text-[#C1561F] shadow-sm"
                : "text-[#2B1810]/70 hover:bg-[#F5ECE1]/40"
            }`}
          >
            🌍 Explorer l'Afrique
          </button>
          <button
            onClick={() => { setActiveTab("users"); setSearchTerm(""); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-black tracking-normal transition-all duration-150 ${
              activeTab === "users"
                ? "bg-[#F5ECE1] text-[#C1561F] shadow-sm"
                : "text-[#2B1810]/70 hover:bg-[#F5ECE1]/40"
            }`}
          >
            👥 Utilisateurs
          </button>
        </div>

        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="text-[#2B1810]/40" size={16} />
          </span>
          <input
            type="text"
            placeholder={
              activeTab === "nodes"
                ? "Rechercher un savoir (titre, pays, langue)..."
                : activeTab === "dictionaries"
                ? "Rechercher un dictionnaire (titre, langue)..."
                : activeTab === "archives"
                ? "Rechercher une archive (description, type, provenance)..."
                : activeTab === "countries"
                ? "Rechercher un pays..."
                : "Rechercher un audio (titre, langue, dialecte)..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#FAF6F0] border border-[#EADBC8] rounded-xl text-xs text-[#2B1810] focus:outline-none focus:ring-1 focus:ring-[#C1561F] focus:border-[#C1561F]"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#2B1810]/40 hover:text-[#2B1810]"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* --- TAB 1: SAVOIRS LOCAUX --- */}
      {activeTab === "nodes" && (
        <div className="bg-white rounded-3xl border border-[#EADBC8] shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#EADBC8] flex justify-between items-center bg-[#FAF6F0]/50">
            <div>
              <h3 className="text-sm font-black text-[#2B1810] tracking-tight">Liste des Savoirs Traditionnels</h3>
              <p className="text-[10px] text-[#2B1810]/50 font-medium">Savoirs et récits exploités par le coordinateur et les agents.</p>
            </div>
            <button
              onClick={handleOpenNodeCreate}
              className="flex items-center gap-1 px-3.5 py-2 bg-[#C1561F] hover:bg-[#A94A1A] text-white rounded-xl text-xs font-black shadow-sm transition"
            >
              <Plus size={14} />
              Ajouter un Savoir
            </button>
          </div>

          <div className="overflow-x-auto">
            {loading && nodes.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                <RefreshCw className="animate-spin mx-auto mb-2 text-[#C1561F]" size={24} />
                Chargement des savoirs locaux...
              </div>
            ) : filteredNodes.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                Aucun savoir trouvé.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF6F0] text-[#2B1810]/70 border-b border-[#EADBC8]">
                    <th className="p-4 font-black">ID</th>
                    <th className="p-4 font-black">Titre</th>
                    <th className="p-4 font-black">Thème / Catégorie</th>
                    <th className="p-4 font-black">Pays / Région</th>
                    <th className="p-4 font-black">Langue</th>
                    <th className="p-4 font-black text-center">Score de fiabilité</th>
                    <th className="p-4 font-black text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADBC8]/50">
                  {filteredNodes.map((node) => (
                    <tr key={node.id} className="hover:bg-[#FAF6F0]/30 transition-all">
                      <td className="p-4 font-mono text-[10px] text-slate-400 truncate max-w-[100px]">{node.id}</td>
                      <td className="p-4">
                        <div className="font-bold text-[#2B1810]">{node.title}</div>
                        <div className="text-[10px] text-[#2B1810]/50 truncate max-w-xs">{node.description}</div>
                      </td>
                      <td className="p-4">
                        <span className="inline-block px-2 py-0.5 bg-[#FAF6F0] border border-[#EADBC8] text-[10px] text-[#C1561F] font-bold rounded-md mr-1.5 uppercase">
                          {node.theme}
                        </span>
                        <span className="text-[10px] text-slate-500 capitalize">{node.category}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-[#2B1810]/80">{node.country}</span>
                        <div className="text-[10px] text-slate-400">{node.region}</div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-[#DFF2E1]/70 border border-[#5FAF68]/20 text-[#3D6B35] text-[10px] font-bold rounded-md">
                          {node.language}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-block px-1.5 py-0.5 rounded font-black text-[10px] ${
                          node.reliabilityScore >= 80 
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200" 
                            : "bg-amber-50 text-amber-600 border border-amber-200"
                        }`}>
                          {node.reliabilityScore}%
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenNodeEdit(node)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-lg transition"
                            title="Modifier"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleConfirmDeleteNode(node.id, node.title)}
                            className="p-1.5 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition"
                            title="Supprimer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 2: DICTIONNAIRES --- */}
      {activeTab === "dictionaries" && (
        <div className="bg-white rounded-3xl border border-[#EADBC8] shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#EADBC8] flex justify-between items-center bg-[#FAF6F0]/50">
            <div>
              <h3 className="text-sm font-black text-[#2B1810] tracking-tight">Liste des Dictionnaires Linguistiques</h3>
              <p className="text-[10px] text-[#2B1810]/50 font-medium">Fichiers PDFs et lexiques pour traduire et répondre en langues locales (Bambara, Dioula, Mooré).</p>
            </div>
            <button
              onClick={handleOpenDictCreate}
              className="flex items-center gap-1 px-3.5 py-2 bg-[#C1561F] hover:bg-[#A94A1A] text-white rounded-xl text-xs font-black shadow-sm transition"
            >
              <Plus size={14} />
              Ajouter un Dictionnaire
            </button>
          </div>

          <div className="overflow-x-auto">
            {loading && dictionaries.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                <RefreshCw className="animate-spin mx-auto mb-2 text-[#C1561F]" size={24} />
                Chargement des dictionnaires...
              </div>
            ) : filteredDictionaries.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                Aucun dictionnaire trouvé.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF6F0] text-[#2B1810]/70 border-b border-[#EADBC8]">
                    <th className="p-4 font-black">ID</th>
                    <th className="p-4 font-black">Nom du Dictionnaire</th>
                    <th className="p-4 font-black">Langue</th>
                    <th className="p-4 font-black">Fichier PDF</th>
                    <th className="p-4 font-black">Mots Clés / Contenu Extrait</th>
                    <th className="p-4 font-black text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADBC8]/50">
                  {filteredDictionaries.map((dict) => (
                    <tr key={dict.id} className="hover:bg-[#FAF6F0]/30 transition-all">
                      <td className="p-4 font-mono text-[10px] text-slate-400 truncate max-w-[80px]">{dict.id}</td>
                      <td className="p-4">
                        <div className="font-bold text-[#2B1810]">{dict.title}</div>
                        <div className="text-[10px] text-[#2B1810]/50 truncate max-w-xs">{dict.description || "Aucune description."}</div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-[#FAF6F0] border border-[#EADBC8] text-[10px] text-[#C1561F] font-bold rounded-md uppercase">
                          {dict.language}
                        </span>
                      </td>
                      <td className="p-4">
                        {dict.fileUrl ? (
                          <a 
                            href={dict.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-xs text-[#C1561F] font-bold hover:underline flex items-center gap-1"
                          >
                            <FileText size={13} />
                            <span className="truncate max-w-[120px]">{dict.fileName || "Fichier PDF"}</span>
                            <span className="text-[10px] text-slate-400 font-medium">({formatBytes(dict.fileSize)})</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 italic">Aucun PDF joint</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="text-[10px] text-slate-500 font-medium max-w-xs truncate" title={dict.extractedText}>
                          {dict.extractedText || <span className="text-slate-300 italic">Aucun lexique textuel enregistré</span>}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenDictEdit(dict)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-lg transition"
                            title="Modifier"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleConfirmDeleteDict(dict.id, dict.title)}
                            className="p-1.5 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition"
                            title="Supprimer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 3: ARCHIVES --- */}
      {activeTab === "archives" && (
        <div className="bg-white rounded-3xl border border-[#EADBC8] shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#EADBC8] flex justify-between items-center bg-[#FAF6F0]/50">
            <div>
              <h3 className="text-sm font-black text-[#2B1810] tracking-tight">Liste des Archives Documentaires</h3>
              <p className="text-[10px] text-[#2B1810]/50 font-medium">Archives administratives, chartes historiques et documents scientifiques stockés sous format PDF.</p>
            </div>
            <button
              onClick={handleOpenArchiveCreate}
              className="flex items-center gap-1 px-3.5 py-2 bg-[#C1561F] hover:bg-[#A94A1A] text-white rounded-xl text-xs font-black shadow-sm transition"
            >
              <Plus size={14} />
              Ajouter une Archive
            </button>
          </div>

          <div className="overflow-x-auto">
            {loading && archives.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                <RefreshCw className="animate-spin mx-auto mb-2 text-[#C1561F]" size={24} />
                Chargement des archives...
              </div>
            ) : filteredArchives.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                Aucune archive trouvée.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF6F0] text-[#2B1810]/70 border-b border-[#EADBC8]">
                    <th className="p-4 font-black">ID</th>
                    <th className="p-4 font-black">Type de document</th>
                    <th className="p-4 font-black">Provenance</th>
                    <th className="p-4 font-black">Description / Notes</th>
                    <th className="p-4 font-black">Fichier PDF</th>
                    <th className="p-4 font-black text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADBC8]/50">
                  {filteredArchives.map((archive) => (
                    <tr key={archive.id} className="hover:bg-[#FAF6F0]/30 transition-all">
                      <td className="p-4 font-mono text-[10px] text-slate-400 truncate max-w-[80px]">{archive.id}</td>
                      <td className="p-4 font-bold text-[#2B1810] capitalize">{archive.documentType}</td>
                      <td className="p-4 text-[#C1561F] font-bold">{archive.provenance}</td>
                      <td className="p-4 text-[#2B1810]/80">{archive.description || <span className="text-slate-300 italic">Aucune description</span>}</td>
                      <td className="p-4">
                        {archive.fileUrl ? (
                          <a 
                            href={archive.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-xs text-[#C1561F] font-bold hover:underline flex items-center gap-1"
                          >
                            <FileText size={13} />
                            <span className="truncate max-w-[120px]">{archive.fileName || "Fichier PDF"}</span>
                            <span className="text-[10px] text-slate-400 font-medium">({formatBytes(archive.fileSize)})</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 italic">Aucun PDF joint</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenArchiveEdit(archive)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-lg transition"
                            title="Modifier"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleConfirmDeleteArchive(archive.id, archive.documentType + " (" + archive.provenance + ")")}
                            className="p-1.5 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition"
                            title="Supprimer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}


      {/* --- TAB 5: EXPLORE AFRICA --- */}
      {activeTab === "countries" && (
        <AdminExploreAfrica searchTerm={searchTerm} />
      )}

      {/* --- TAB 6: USERS --- */}
      {activeTab === "users" && (
        <AdminUsers />
      )}

      {/* --- NODE MODAL (CREATE / EDIT) --- */}
      {isNodeModalOpen && (
        <div className="fixed inset-0 bg-[#2B1810]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-3xl border border-[#EADBC8] shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[#EADBC8] flex justify-between items-center bg-[#FAF6F0]">
              <h3 className="font-black text-sm text-[#2B1810] flex items-center gap-1.5">
                {editingNodeId ? "📝 Modifier le Savoir" : "➕ Ajouter un Savoir Traditionnel"}
              </h3>
              <button 
                onClick={() => setIsNodeModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleNodeSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-[#2B1810]/70">Identifiant Unique (ID)</label>
                  <input
                    type="text"
                    value={nodeForm.id}
                    onChange={(e) => setNodeForm({ ...nodeForm, id: e.target.value })}
                    disabled={!!editingNodeId}
                    placeholder="savoir_maïs_mali"
                    className="w-full p-2.5 bg-[#FAF6F0] border border-[#EADBC8] rounded-xl text-xs disabled:opacity-50"
                    required
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-[#2B1810]/70">Titre du Savoir</label>
                  <input
                    type="text"
                    value={nodeForm.title}
                    onChange={(e) => setNodeForm({ ...nodeForm, title: e.target.value })}
                    placeholder="Ex: Techniques d'irrigation Zai au Burkina"
                    className="w-full p-2.5 bg-[#FAF6F0] border border-[#EADBC8] rounded-xl text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-[#2B1810]/70">Catégorie</label>
                  <select
                    value={nodeForm.category}
                    onChange={(e) => setNodeForm({ ...nodeForm, category: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF6F0] border border-[#EADBC8] rounded-xl text-xs font-bold text-[#2B1810]"
                  >
                    {categoriesList.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-[#2B1810]/70">Thème</label>
                  <select
                    value={nodeForm.theme}
                    onChange={(e) => setNodeForm({ ...nodeForm, theme: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF6F0] border border-[#EADBC8] rounded-xl text-xs font-bold text-[#2B1810]"
                  >
                    {themesList.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-[#2B1810]/70">Langue principale</label>
                  <select
                    value={nodeForm.language}
                    onChange={(e) => setNodeForm({ ...nodeForm, language: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF6F0] border border-[#EADBC8] rounded-xl text-xs"
                  >
                    {languagesList.map(l => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-[#2B1810]/70">Pays d'origine</label>
                  <select
                    value={nodeForm.country}
                    onChange={(e) => setNodeForm({ ...nodeForm, country: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF6F0] border border-[#EADBC8] rounded-xl text-xs"
                  >
                    {countriesList.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-[#2B1810]/70">Région spécifique</label>
                  <input
                    type="text"
                    value={nodeForm.region}
                    onChange={(e) => setNodeForm({ ...nodeForm, region: e.target.value })}
                    placeholder="Ex: Région de Mopti"
                    className="w-full p-2.5 bg-[#FAF6F0] border border-[#EADBC8] rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-[#2B1810]/70">Groupe Ethnolinguistique</label>
                  <input
                    type="text"
                    value={nodeForm.ethnolinguisticGroup}
                    onChange={(e) => setNodeForm({ ...nodeForm, ethnolinguisticGroup: e.target.value })}
                    placeholder="Ex: Bambara, Mossi"
                    className="w-full p-2.5 bg-[#FAF6F0] border border-[#EADBC8] rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-[#2B1810]/70">Score de fiabilité (1-100)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={nodeForm.reliabilityScore}
                    onChange={(e) => setNodeForm({ ...nodeForm, reliabilityScore: parseInt(e.target.value) || 80 })}
                    className="w-full p-2.5 bg-[#FAF6F0] border border-[#EADBC8] rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-[#2B1810]/70">Source de l'information</label>
                  <input
                    type="text"
                    value={nodeForm.source}
                    onChange={(e) => setNodeForm({ ...nodeForm, source: e.target.value })}
                    placeholder="Ex: Aîné du village Sekou Y."
                    className="w-full p-2.5 bg-[#FAF6F0] border border-[#EADBC8] rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-[#2B1810]/70">Résumé / Description (Affiché à l'utilisateur)</label>
                <textarea
                  rows={3}
                  value={nodeForm.description}
                  onChange={(e) => setNodeForm({ ...nodeForm, description: e.target.value })}
                  placeholder="Expliquez brièvement le savoir traditionnel..."
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#EADBC8] rounded-xl text-xs resize-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-[#2B1810]/70">Texte brut complet (Pour l'analyse IA)</label>
                <textarea
                  rows={5}
                  value={nodeForm.rawContent}
                  onChange={(e) => setNodeForm({ ...nodeForm, rawContent: e.target.value })}
                  placeholder="Collez ici l'entretien oral complet, l'histoire détaillée ou le processus technique..."
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#EADBC8] rounded-xl text-xs resize-none"
                />
              </div>

              <div className="px-6 py-4 border-t border-[#EADBC8] flex justify-end gap-3 bg-[#FAF6F0] -mx-6 -mb-6">
                <button
                  type="button"
                  onClick={() => setIsNodeModalOpen(false)}
                  className="px-4 py-2 border border-[#EADBC8] hover:bg-slate-50 text-[#2B1810]/80 rounded-xl text-xs font-black transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-[#C1561F] hover:bg-[#A94A1A] text-white rounded-xl text-xs font-black shadow-sm transition disabled:opacity-50"
                >
                  {loading ? "Enregistrement..." : editingNodeId ? "Enregistrer les modifications" : "Créer le savoir"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DICTIONARY MODAL (CREATE / EDIT) --- */}
      {isDictModalOpen && (
        <div className="fixed inset-0 bg-[#2B1810]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl border border-[#EADBC8] shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[#EADBC8] flex justify-between items-center bg-[#FAF6F0]">
              <h3 className="font-black text-sm text-[#2B1810] flex items-center gap-1.5">
                {editingDictId ? "📖 Modifier le Dictionnaire" : "➕ Ajouter un Dictionnaire"}
              </h3>
              <button 
                onClick={() => setIsDictModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleDictSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-[#2B1810]/70">Identifiant Unique (ID)</label>
                <input
                  type="text"
                  value={dictForm.id}
                  onChange={(e) => setDictForm({ ...dictForm, id: e.target.value })}
                  disabled={!!editingDictId}
                  placeholder="dict_dioula_francais"
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#EADBC8] rounded-xl text-xs disabled:opacity-50"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-[#2B1810]/70">Titre du Dictionnaire</label>
                  <input
                    type="text"
                    value={dictForm.title}
                    onChange={(e) => setDictForm({ ...dictForm, title: e.target.value })}
                    placeholder="Ex: Alphabet et vocabulaire de base Dioula"
                    className="w-full p-2.5 bg-[#FAF6F0] border border-[#EADBC8] rounded-xl text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-[#2B1810]/70">Langue ciblée</label>
                  <select
                    value={dictForm.language}
                    onChange={(e) => setDictForm({ ...dictForm, language: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF6F0] border border-[#EADBC8] rounded-xl text-xs font-bold text-[#2B1810]"
                  >
                    {dictLanguagesList.map(l => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-[#2B1810]/70">Description / Métadonnées</label>
                <textarea
                  rows={2}
                  value={dictForm.description}
                  onChange={(e) => setDictForm({ ...dictForm, description: e.target.value })}
                  placeholder="Ex: Alphabet et vocabulaire de base Dioula pour l'agriculture"
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#EADBC8] rounded-xl text-xs resize-none"
                />
              </div>

              {/* PDF File Ingestion */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-[#2B1810]/70">Fichier PDF du dictionnaire</label>
                <div className="border-2 border-dashed border-[#EADBC8] hover:border-[#C1561F] rounded-2xl p-4 bg-[#FAF6F0]/30 transition text-center relative">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setDictFile(e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="mx-auto text-slate-400 mb-2" size={24} />
                  <p className="text-xs font-bold text-[#2B1810]/80">
                    {dictFile ? `Fichier sélectionné : ${dictFile.name}` : "Cliquez ou glissez-déposez un fichier PDF ici"}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">PDF uniquement (Max 15MB)</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-[#2B1810]/70">Extraits du Lexique & Vocabulaire (Recherche IA)</label>
                <textarea
                  rows={5}
                  value={dictForm.extractedText}
                  onChange={(e) => setDictForm({ ...dictForm, extractedText: e.target.value })}
                  placeholder="Entrez des mots clefs ou des définitions :&#10;Bara = Travail&#10;Sogo = Viande&#10;Malo = Riz"
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#EADBC8] rounded-xl text-xs font-mono resize-none"
                />
              </div>

              <div className="px-6 py-4 border-t border-[#EADBC8] flex justify-end gap-3 bg-[#FAF6F0] -mx-6 -mb-6">
                <button
                  type="button"
                  onClick={() => setIsDictModalOpen(false)}
                  className="px-4 py-2 border border-[#EADBC8] hover:bg-slate-50 text-[#2B1810]/80 rounded-xl text-xs font-black transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-[#C1561F] hover:bg-[#A94A1A] text-white rounded-xl text-xs font-black shadow-sm transition disabled:opacity-50"
                >
                  {loading ? "Traitement..." : editingDictId ? "Enregistrer" : "Créer le dictionnaire"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ARCHIVE MODAL (CREATE / EDIT) --- */}
      {isArchiveModalOpen && (
        <div className="fixed inset-0 bg-[#2B1810]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl border border-[#EADBC8] shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[#EADBC8] flex justify-between items-center bg-[#FAF6F0]">
              <h3 className="font-black text-sm text-[#2B1810] flex items-center gap-1.5">
                {editingArchiveId ? "📂 Modifier l'Archive" : "➕ Ajouter un Document d'Archive"}
              </h3>
              <button 
                onClick={() => setIsArchiveModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleArchiveSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-[#2B1810]/70">Identifiant Unique (ID)</label>
                <input
                  type="text"
                  value={archiveForm.id}
                  onChange={(e) => setArchiveForm({ ...archiveForm, id: e.target.value })}
                  disabled={!!editingArchiveId}
                  placeholder="archive_mali_1236"
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#EADBC8] rounded-xl text-xs disabled:opacity-50"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-[#2B1810]/70">Type de document</label>
                  <select
                    value={archiveForm.documentType}
                    onChange={(e) => setArchiveForm({ ...archiveForm, documentType: e.target.value })}
                    className="w-full p-2.5 bg-[#FAF6F0] border border-[#EADBC8] rounded-xl text-xs font-bold text-[#2B1810]"
                  >
                    {docTypesList.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-[#2B1810]/70">Provenance du document</label>
                  <input
                    type="text"
                    value={archiveForm.provenance}
                    onChange={(e) => setArchiveForm({ ...archiveForm, provenance: e.target.value })}
                    placeholder="Ex: Archives Nationales du Mali, UNESCO"
                    className="w-full p-2.5 bg-[#FAF6F0] border border-[#EADBC8] rounded-xl text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-[#2B1810]/70">Description / Contenu abrégé</label>
                <textarea
                  rows={4}
                  value={archiveForm.description}
                  onChange={(e) => setArchiveForm({ ...archiveForm, description: e.target.value })}
                  placeholder="Décrivez l'origine historique, l'auteur, ou le contenu résumé du document..."
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#EADBC8] rounded-xl text-xs resize-none"
                />
              </div>

              {/* PDF Archive upload */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-[#2B1810]/70">Document PDF (Archive)</label>
                <div className="border-2 border-dashed border-[#EADBC8] hover:border-[#C1561F] rounded-2xl p-4 bg-[#FAF6F0]/30 transition text-center relative">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setArchiveFile(e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="mx-auto text-slate-400 mb-2" size={24} />
                  <p className="text-xs font-bold text-[#2B1810]/80">
                    {archiveFile ? `Fichier sélectionné : ${archiveFile.name}` : "Cliquez ou glissez-déposez le PDF de l'archive ici"}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">PDF uniquement (Max 20MB)</p>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-[#EADBC8] flex justify-end gap-3 bg-[#FAF6F0] -mx-6 -mb-6">
                <button
                  type="button"
                  onClick={() => setIsArchiveModalOpen(false)}
                  className="px-4 py-2 border border-[#EADBC8] hover:bg-slate-50 text-[#2B1810]/80 rounded-xl text-xs font-black transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-[#C1561F] hover:bg-[#A94A1A] text-white rounded-xl text-xs font-black shadow-sm transition disabled:opacity-50"
                >
                  {loading ? "Traitement..." : editingArchiveId ? "Enregistrer" : "Créer l'archive"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* --- CONFIRM RESET MODAL --- */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 bg-[#2B1810]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl border border-red-200 shadow-xl overflow-hidden p-6 text-center space-y-4">
            <Database className="mx-auto text-red-600" size={48} />
            <div className="space-y-2">
              <h3 className="text-base font-black text-[#2B1810]">Réinitialiser la Base de Données ?</h3>
              <p className="text-xs text-[#2B1810]/60">
                Attention : Cette action videra les savoirs, dictionnaires et archives créés manuellement, puis ré-importera les données de démonstration d'origine (seeds). Cette action est irréversible.
              </p>
            </div>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 border border-[#EADBC8] hover:bg-slate-50 text-[#2B1810]/80 rounded-xl text-xs font-black transition"
              >
                Annuler
              </button>
              <button
                onClick={handleResetDatabase}
                disabled={loading}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-sm transition"
              >
                {loading ? "Réinitialisation..." : "Oui, réinitialiser"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- CONFIRM DELETE MODAL --- */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-[#2B1810]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl border border-red-200 shadow-xl overflow-hidden p-6 text-center space-y-4">
            <Trash2 className="mx-auto text-red-600" size={40} />
            <div className="space-y-2">
              <h3 className="text-base font-black text-[#2B1810]">Confirmer la suppression</h3>
              <p className="text-xs text-[#2B1810]/60">
                Êtes-vous sûr de vouloir supprimer {
                  deleteConfirm.type === "node" ? "le savoir" : 
                  deleteConfirm.type === "dict" ? "le dictionnaire" : "l'archive"
                } :<br/>
                <span className="font-bold text-[#2B1810] italic">"{deleteConfirm.name}"</span> ?
              </p>
            </div>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-[#EADBC8] hover:bg-slate-50 text-[#2B1810]/80 rounded-xl text-xs font-black transition"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  if (deleteConfirm.type === "node") handleDeleteNode(deleteConfirm.id);
                  else if (deleteConfirm.type === "dict") handleDeleteDict(deleteConfirm.id);
                  else handleDeleteArchive(deleteConfirm.id);
                }}
                disabled={loading}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-sm transition"
              >
                {loading ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
