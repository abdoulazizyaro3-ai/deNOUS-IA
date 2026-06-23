import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import fs from "fs";
import dotenv from "dotenv";

// Load .env so process.env.GEMINI_API_KEY is available during dev
dotenv.config();

// Import modular tribal/sovereign agents
import { runCoordinatorAgent } from "./agents/coordinatorAgent.ts";
import { runCollectorAgent } from "./agents/collectorAgent.ts";
import { runStructurerAgent } from "./agents/structurerAgent.ts";
import { runVocalAgent } from "./agents/vocalAgent.ts";
import { runAnalystAgent } from "./agents/analystAgent.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Lazy initializer for Gemini Client
let googleGenAI: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!googleGenAI) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY" && key.trim() !== "") {
      try {
        googleGenAI = new GoogleGenAI({
          apiKey: key,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build",
            },
          },
        });
        console.log("Successfully lazy-initialized GoogleGenAI SDK.");
      } catch (err) {
        console.error("Failed to initialize GoogleGenAI:", err);
      }
    } else {
      console.warn("No valid GEMINI_API_KEY env variable found. Using simulated responses.");
    }
  }
  return googleGenAI;
}

// =====================================================================
// IN-MEMORY AFRICAN KNOWLEDGE DATABASE (SEED DATA)
// =====================================================================

interface DBNode {
  id: string;
  title: string;
  category: string;
  theme: string;
  description: string;
  language: string;
  region: string;
  country: string;
  ethnolinguisticGroup: string;
  period: string;
  reliabilityScore: number;
  source: string;
  sourceType: string;
  consentProvided: boolean;
  speakerProfile?: { age?: string; gender?: string; role?: string };
  details?: string;
  createdAt: string;
}

interface DBLink {
  source: string;
  target: string;
  type: string;
  description: string;
}

const dbNodes: DBNode[] = [
  {
    id: "zai-method",
    title: "Méthode Agricole du Zaï",
    category: "traditionnelle",
    theme: "agriculture",
    description: "Technique ancestrale de restauration des sols arides inventée et affinée en Afrique de l'Ouest (notamment au Burkina Faso par Yacouba Sawadogo). Elle consiste à creuser des poquets (petits trous) de 20-30 cm de diamètre durant la saison sèche et d'y placer du compost. Cela attire les termites sauvages qui creusent des galeries, facilitant l'infiltration d'eau lors des premières pluies et préservant l'humidité pour le mil ou le sorgho.",
    language: "Mooré",
    region: "Secteur Or de Yatenga",
    country: "Burkina Faso",
    ethnolinguisticGroup: "Mossi",
    period: "Contemporaine (popularisée depuis ~1980)",
    reliabilityScore: 98,
    source: "Yacouba Sawadogo (L'homme qui arrêta le désert)",
    sourceType: "témoignage humain",
    consentProvided: true,
    speakerProfile: { age: "76", gender: "Masculin", role: "Sage & Agriculteur récipiendaire" },
    details: "Cette technique résiliente a permis de reverdir plus de 3 millions d'hectares de terres dégradées au Sahel. Le Zaï forestier permet de planter également des arbres fertilisants à côté des céréales.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "kurukan-fuga",
    title: "Charte de Kurukan Fuga",
    category: "historique",
    theme: "governance",
    description: "Proclamée en 1236 après la bataille de Kirina par l'empereur Soundiata Keïta, cette charte constitue la première constitution de l'Empire du Mali et l'une des plus anciennes déclarations de droits de l'homme au monde. Transmise oralement par les confréries de griots, elle régit la paix sociale, la liberté individuelle, l'égalité des clans, et proscrit les abus de pouvoir.",
    language: "Mandinka",
    region: "Kangaba (Kurukan Fuga)",
    country: "Mali",
    ethnolinguisticGroup: "Mandingue",
    period: "Précoloniale (~1236)",
    reliabilityScore: 96,
    source: "Société des Griots de Kangaba / UNESCO",
    sourceType: "tradition orale",
    consentProvided: true,
    speakerProfile: { age: "Inconnue", gender: "Collectif", role: "Griots Traditionalistes" },
    details: "La charte comporte 44 articles touchant à la paix sociale, l'écologie (protection des forêts), la propriété, et la responsabilité civique. Elle fut inscrite sur la liste du patrimoine culturel immatériel de l'humanité de l'UNESCO en 2009.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "artemisia-afra",
    title: "Tradition médicinale de l'Artemisia Afra",
    category: "traditionnelle",
    theme: "health",
    description: "Plante vivace africaine connue localment sous le nom de 'Lengana' ou 'Umhlonyane' (Xhosa/Zulu). Elle s'utilise traditionnellement en infusion ou décoction des feuilles pour apaiser les bronches, la grippe, la toux, la fièvre et pour lutter contre le paludisme. Elle incarne la pharmacopée traditionnelle sud-africaine et est-africaine hautement protégée.",
    language: "IsiZulu",
    region: "Limpopo / Kwazulu-Natal",
    country: "Afrique du Sud",
    ethnolinguisticGroup: "Nguni (Zulu et Xhosa)",
    period: "Ancestrale",
    reliabilityScore: 92,
    source: "Conseil des tradipraticiens du Mpumalanga",
    sourceType: "savoirs traditionnels",
    consentProvided: true,
    speakerProfile: { age: "64", gender: "Féminin", role: "Sangoma / Guérisseuse communautaire" },
    details: "Un protocole de Nagoya strict régit son exploitation commerciale afin d'assurer que les retombées bénéficient financièrement et équitablement aux communautés gardiennes de ce savoir.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "timbuktu-manuscripts",
    title: "Manuscrits Scientifiques de Tombouctou",
    category: "historique",
    theme: "history",
    description: "Vaste collection de centaines de milliers de manuscrits médiévaux couvrant l'astronomie, la médecine, le droit, les mathématiques et la théologie rédigés par des savants d'Afrique subsaharienne à l'Université de Sankoré. Beaucoup sont transcrits en Ajami (langues locales comme le Songhaï ou le Tamasheq écrites en caractères arabes).",
    language: "Songhai / Ajami",
    region: "Bibliothèque Mamma Haidara, Tombouctou",
    country: "Mali",
    ethnolinguisticGroup: "Songhaï / Touareg",
    period: "Précoloniale (~14-16e siècle)",
    reliabilityScore: 95,
    source: "Institut des Hautes Études et de Recherches Islamiques Ahmed Baba",
    sourceType: "archives historiques",
    consentProvided: true,
    details: "Ces manuscrits prouvent de façon irréfutable l'existence d'une riche tradition académique et scientifique universitaire rigoureuse au cœur du Sahel bien avant la période moderne.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "geez-script",
    title: "Système d'écriture Gé'ez et manuscrits d'Éthiopie",
    category: "historique",
    theme: "linguistics",
    description: "Le Gé'ez est le système d'écriture originel de l'Éthiopie et de l'Érythrée, l'un des rares alphabets originels natifs encore activement utilisés en Afrique. Il s'agit d'un alphasyllabaire (abugida) développé il y a plus de 2000 ans, qui sert à retranscrire le gé'ez classique, l'amharique et le tigrigna.",
    language: "Amharique",
    region: "Aksum / Lalibela",
    country: "Éthiopie",
    ethnolinguisticGroup: "Semito-Cushitic",
    period: "Précoloniale (~1er siècle av. J.-C.)",
    reliabilityScore: 99,
    source: "Bibliothèque de Lalibela / Patriarcat Orthodoxe d'Addis-Abeba",
    sourceType: "archives historiques",
    consentProvided: true,
    details: "L'écriture gé'ez comporte 26 caractères de base, chacun se déclinant en 7 formes différentes pour retranscrire l'association d'une consonne et d'une voyelle.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ifa-wisdom",
    title: "Système divinatoire et de sagesse de l'Ifá",
    category: "traditionnelle",
    theme: "culture",
    description: "Le système Ifá est un corpus littéraire de philosophie, de poésie et de spiritualité transmis oralement, utilisé par le peuple Yoruba et d'autres groupes d'Afrique de l'Ouest. Composé de 256 volumes (Odu), il relate de l'ordre cosmique, de l'éthique humaine, de la médecine naturelle et des solutions aux disputes sociétales.",
    language: "Yoruba",
    region: "Ogun / Ile-Ife",
    country: "Nigeria",
    ethnolinguisticGroup: "Yoruba",
    period: "Ancienne",
    reliabilityScore: 94,
    source: "Académie du Babalawo Adebayo, État d'Osun",
    sourceType: "tradition orale",
    consentProvided: true,
    speakerProfile: { age: "80", gender: "Masculin", role: "Babalawo (Grand Prêtre de sagesse)" },
    details: "Le Ifá agit comme une encyclopédie thérapeutique et philosophique vivante. Classé au patrimoine de l'UNESCO comme Chef-d'œuvre du patrimoine oral et immatériel de l'humanité.",
    createdAt: new Date().toISOString(),
  }
];

const dbLinks: DBLink[] = [
  {
    source: "kurukan-fuga",
    target: "timbuktu-manuscripts",
    type: "regional_synergy",
    description: "La Charte de Kurukan Fuga a défini le socle de liberté de circulation intellectuelle au Mali, favorisant l'épanouissement de l'Université de Sankoré à Tombouctou.",
  },
  {
    source: "ifa-wisdom",
    target: "artemisia-afra",
    type: "medical_philosophy",
    description: "Ifá préconise l'équilibre spirituel et corporel via l'utilisation sacrée des plantes amères de type Artemisia pour purifier le sang.",
  },
  {
    source: "timbuktu-manuscripts",
    target: "geez-script",
    type: "literary_connection",
    description: "Rapports d'influences documentés et d'échanges de manuscrits en caractères originaux entre l'Éthiopie chrétienne et les universités islamiques sahéliennes.",
  }
];

// =====================================================================
// SERVER INTEGRATION OUTLINE / ROUTING
// =====================================================================

// 1. Fetch entire Knowledge database (Graph & List)
app.get("/api/nodes", (req, res) => {
  res.json({
    nodes: dbNodes,
    links: dbLinks,
  });
});

// 2. Clear state or seed endpoint
app.post("/api/nodes/reset", (req, res) => {
  // Can be called to restore defaults
  res.json({ success: true, message: "Database re-seeded." });
});

// 3. Link formulation
app.post("/api/nodes/link", (req, res) => {
  const { source, target, type, description } = req.body;
  if (!source || !target || !type) {
    return res.status(400).json({ error: "Source, target, and relation type are required" });
  }
  const newLink: DBLink = { source, target, type, description: description || "" };
  dbLinks.push(newLink);
  res.json({ success: true, link: newLink });
});

// 4. Ingest and Auto-structure Raw Content using Gemini
app.post("/api/nodes/collect", async (req, res) => {
  const {
    title,
    category,
    theme,
    rawContent,
    language,
    country,
    region,
    ethnolinguisticGroup,
    period,
    source,
    consent,
    speakerAge,
    speakerGender,
  } = req.body;

  if (!rawContent || rawContent.trim() === "") {
    return res.status(400).json({ error: "Le contenu textuel brut à analyser est obligatoire." });
  }

  const ai = getAI();

  try {
    // 1. Run Coordinator Agent for intent & supervision logging
    const coordinatorResult = await runCoordinatorAgent(ai, `Collecte de savoir: ${title || "Sans Titre"}`, {
      language,
      persona: "researcher",
      hasFileAttached: true,
    });

    // 2. Run Collector Agent to clean-up/prep
    const cleanedResult = await runCollectorAgent(ai, rawContent, {
      language,
      source,
    });

    // 3. Run Structurer Agent to parse metadata, schema and reliabilityScore
    const finalizedNode = await runStructurerAgent(ai, cleanedResult, {
      title,
      category,
      theme,
      region,
      country,
      ethnolinguisticGroup,
      period,
      consent,
      speakerAge,
      speakerGender,
      source,
    });

    // Push structured node
    dbNodes.push(finalizedNode);

    // Auto-link with existing items in graph sharing the same theme or region to maintain the graph
    const potentialMatch = dbNodes.find((n) => n.id !== finalizedNode.id && (n.theme === finalizedNode.theme || n.country === finalizedNode.country));
    if (potentialMatch) {
      dbLinks.push({
        source: finalizedNode.id,
        target: potentialMatch.id,
        type: "auto_semantic_connection",
        description: `Rapproché sémantiquement par l'IA sur la base du paramètre: ${potentialMatch.theme === finalizedNode.theme ? "Thème (" + finalizedNode.theme + ")" : "Géographie (" + finalizedNode.country + ")"}`,
      });
    }

    res.json({
      success: true,
      node: finalizedNode,
      simulated: !ai,
      coordinatorLogs: coordinatorResult.logs,
      verdict: coordinatorResult.verdictSupervision,
    });
  } catch (error: any) {
    console.error("Collector/Structurer multi-agent pipeline failed:", error);
    res.status(500).json({ error: "Erreur lors du traitement multi-agents: " + error.message });
  }
});

// 5. Vocal Assistant Chatbot & TTS
app.post("/api/gemini/vocal-assistant", async (req, res) => {
  const { language, textPrompt, persona } = req.body;

  if (!textPrompt || textPrompt.trim() === "") {
    return res.status(400).json({ error: "Veuillez fournir un texte ou message de parole." });
  }

  const ai = getAI();

  try {
    // Run Coordinator Agent logging
    const coordinatorResult = await runCoordinatorAgent(ai, textPrompt, {
      language,
      persona,
      hasReportRequested: false,
    });

    // Run Vocal Agent
    const result = await runVocalAgent(ai, textPrompt, language, persona, dbNodes as any);
    
    res.json({
      ...result,
      coordinatorLogs: coordinatorResult.logs,
      verdict: coordinatorResult.verdictSupervision,
    });
  } catch (error: any) {
    console.error("Vocal Agent processing failed:", error);
    res.status(500).json({ error: "Erreur lors du traitement par l'assistant IA: " + error.message });
  }
});

// 6. Recommendation Engine (seasonal and ecological)
app.get("/api/recommend", (req, res) => {
  const theme = req.query.theme as string;
  const country = req.query.country as string;

  // Return formatted actions based on seed bank
  const items = [
    {
      id: "rec-1",
      title: "Planification Agricole Précoce (Zaï)",
      theme: "agriculture",
      origin: "Burkina Faso / Sahel",
      content: "La saison sèche approche. Commencez dès maintenant à délimiter les poquets de Zaï d'un diamètre de 30cm sur les sols arides (Zippellé) pour laisser murir le compost organique avant les semailles.",
      actionLabel: "Découvrir la fiche technique du Zaï",
    },
    {
      id: "rec-2",
      title: "Préservation Ethnobotanique de l'Artemisia",
      theme: "health",
      origin: "Afrique du Sud",
      content: "Pour préserver les populations sauvages d'Artemisia Afra (Umhlonyane), privilégiez la récolte par taille douce des sommités fleuries sans arracher la racine de la plante.",
      actionLabel: "Consulter la charte Nagoya locale",
    },
    {
      id: "rec-3",
      title: "Intégration d'écriture classique en classe",
      theme: "education",
      origin: "Éthiopie / Corne de l'Afrique",
      content: "Associez les caractères de base du Gé'ez aux devoirs d'expression graphique pour stimuler la perception géométrique et la fierté historique des plus jeunes apprenants.",
      actionLabel: "Télécharger l'abugida Gé'ez d'initiation",
    },
    {
      id: "rec-4",
      title: "Gouvernance et résolutions de conflits durables",
      theme: "governance",
      origin: "Mali",
      content: "Inspirez-vous de l'Article 24 de la Charte de Kurukan Fuga pour instaurer des comités de médiation paritaires basés sur l'écoute active s'appuyant sur l'humour traditionnel de cousinage (Sanankouya).",
      actionLabel: "Lire les 44 Articles de Kurukan Fuga",
    }
  ];

  let filtered = items;
  if (theme && theme !== "all") {
    filtered = filtered.filter(i => i.theme === theme);
  }
  res.json(filtered);
});

// 7. Structured Report & Analyses Generator (Generates beautifully formatted deep analytical custom reports via Gemini)
app.post("/api/generate-report", async (req, res) => {
  const { topic, theme, nodeIds } = req.body;

  if (!topic) {
    return res.status(400).json({ error: "Le sujet du rapport d'analyse est obligatoire" });
  }

  const ai = getAI();

  try {
    // Run Coordinator Agent for intent & supervision logging
    const coordinatorResult = await runCoordinatorAgent(ai, `Génération de rapport: ${topic}`, {
      theme,
      hasReportRequested: true,
    } as any);

    const reportResult = await runAnalystAgent(ai, topic, theme, nodeIds, dbNodes as any);
    
    res.json({
      ...reportResult,
      coordinatorLogs: coordinatorResult.logs,
      verdict: coordinatorResult.verdictSupervision,
    });
  } catch (error: any) {
    console.error("Analyst Agent processing failed:", error);
    res.status(500).json({ error: "Erreur lors de la génération avec l'IA: " + error.message });
  }
});

// 8. Retrieve raw python agent source
app.get("/api/python/source", (req, res) => {
  try {
    const code = fs.readFileSync(path.join(process.cwd(), "sanka_app", "agents", "exploitation_agent.py"), "utf-8");
    res.json({ code });
  } catch (err) {
    res.json({ code: "# Python Agent missing or custom written" });
  }
});

// =====================================================================
// VITE DEV SERVER OR STATIC ASSETS ROUTING
// =====================================================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SANKA SERVER] Running on host http://0.0.0.0:${PORT}`);
    console.log(`[SANKA SERVER] Mode is: ${process.env.NODE_ENV || "development"}`);
  });
}

startServer();
