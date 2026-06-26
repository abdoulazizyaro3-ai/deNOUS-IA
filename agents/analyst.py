# agents/analyst.py
import datetime
import json
from typing import Dict, Any, List, Optional

# Seuil minimal de fiabilité avant de déclencher une demande de complément
RELIABILITY_THRESHOLD = 80
MAX_FEEDBACK_ITERATIONS = 3

# Poids par type de source (identique au collecteur pour cohérence)
SOURCE_TYPE_WEIGHTS = {
    "article_scientifique": 95,
    "institution_gouvernementale": 88,
    "organisation_internationale": 85,
    "universite": 85,
    "ong": 72,
    "presse_reconnue": 70,
    "archive": 78,
    "communaute_locale": 65,
    "media": 60,
    "blog": 30,
    "forum": 20,
    "ia_generee": 55,
    "inconnue": 40,
}

CONFIDENCE_LABELS = {
    (90, 101): "Très élevée",
    (75, 90): "Élevée",
    (60, 75): "Modérée",
    (40, 60): "Faible",
    (0, 40): "Très faible",
}


def run_analyst_agent(
    client: Any,
    query: str,
    params: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Agent Analyseur & Validateur de fiabilité.

    - Calcule un Score de Fiabilité (0–100) basé sur les sources et leur qualité.
    - Si le score est inférieur au seuil, retourne une demande de complément
      au Collecteur (boucle de rétroaction).
    - Fournit une justification détaillée du score.
    """
    if params is None:
        params = {}

    if isinstance(client, dict):
        client = client.get("gemini")

    topic = query
    theme = params.get("theme")
    node_ids = params.get("node_ids", [])
    all_nodes = params.get("all_nodes", [])
    structured_data = params.get("structured_data", [])
    sources = params.get("sources", [])
    iteration = params.get("_feedback_iteration", 0)

    if not isinstance(all_nodes, list):
        all_nodes = []
    if not isinstance(node_ids, list):
        node_ids = []
    if not isinstance(structured_data, list):
        structured_data = []
    if not isinstance(sources, list):
        sources = []

    # Construire le contexte de nœuds pour l'analyse
    target_nodes = [n for n in all_nodes if n.get("id") in node_ids]
    context_nodes = target_nodes if target_nodes else all_nodes[:3]

    nodes_context = json.dumps(
        [{"title": n.get("title", ""), "desc": n.get("description", ""), "source": n.get("source", "")}
         for n in context_nodes],
        ensure_ascii=False,
    )

    # ── MODE HORS-LIGNE ────────────────────────────────────────────────────────
    if client is None:
        print("[Analyst] Mode hors-ligne — calcul local du score de fiabilité.")
        reliability = _compute_local_reliability_score(sources, structured_data)
        return _build_analyst_result(
            reliability_score=reliability["score"],
            confidence=reliability["confidence"],
            justification=reliability["justification"],
            verified_facts=[],
            contradictions=[],
            analyst_notes="Score calculé localement (mode hors-ligne).",
            structured_data=structured_data,
            sources=sources,
            target_nodes=context_nodes,
            needs_more_data=reliability["score"] < RELIABILITY_THRESHOLD,
            missing_info=["Données insuffisantes — connexion IA requise pour vérification approfondie."],
            is_simulated=True,
            iteration=iteration,
        )

    # ── MODE AVEC GEMINI ──────────────────────────────────────────────────────
    sources_json = json.dumps(sources, ensure_ascii=False, indent=2) if sources else "Aucune source fournie."
    data_json = json.dumps(structured_data[:5], ensure_ascii=False, indent=2) if structured_data else "Aucune donnée structurée."

    prompt = f"""
Tu es l'Agent Validateur de fiabilité de deNOUS AI.

Sujet analysé : "{topic}"
Thème : "{theme or 'Non spécifié'}"
Itération de vérification : {iteration + 1}/{MAX_FEEDBACK_ITERATIONS}

DONNÉES COLLECTÉES :
{data_json}

SOURCES DÉCLARÉES :
{sources_json}

NŒUDS DE CONNAISSANCE :
{nodes_context}

Ta mission :
1. Vérifier la véracité des informations avec google_search si nécessaire.
2. Identifier les contradictions, incohérences ou informations manquantes.
3. Calculer un Score de Fiabilité entre 0 et 100 selon les critères suivants :
   - Crédibilité et réputation des sources (article scientifique=95, institution gouvernementale=88,
     université=85, ONG=72, presse=70, blog=30, forum=20)
   - Nombre de sources indépendantes confirmant la même information (bonus jusqu'à +15)
   - Fraîcheur des données (données < 1 an : bonus +5 ; > 5 ans : malus -10)
   - Cohérence avec les connaissances internes (pas de contradictions : +10)
   - Présence de contradictions (-15 par contradiction majeure)
4. Identifier les informations manquantes ou nécessitant davantage de preuves.

Retourne STRICTEMENT ce JSON :
{{
    "reliability_score": <entier 0-100>,
    "confidence": "Très élevée | Élevée | Modérée | Faible | Très faible",
    "justification": ["raison 1", "raison 2", "raison 3"],
    "verified_facts": ["fait vérifié 1", "fait vérifié 2"],
    "contradictions": ["contradiction détectée 1"],
    "analyst_notes": "Commentaire global sur la qualité des informations",
    "missing_info": ["information manquante 1", "point nécessitant davantage de preuves 1"],
    "needs_more_data": true | false
}}
"""

    system_instruction = (
        "Tu es l'Agent Validateur de fiabilité de deNOUS AI. "
        "Ton rôle est EXCLUSIVEMENT de vérifier la fiabilité et la véracité des informations collectées. "
        "Tu calcules un score numérique précis et tu identifies les lacunes. "
        "Tu ne rédiges JAMAIS la réponse finale. "
        "Retourne uniquement le JSON demandé."
    )

    from google.genai import types

    try:
        print(f"[Analyst] Vérification fiabilité (itération {iteration + 1}) sur \"{topic}\"...")
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.1,
                response_mime_type="application/json",
                tools=[{"google_search": {}}],
            ),
        )

        try:
            analysis = json.loads(response.text or "{}")
        except json.JSONDecodeError:
            analysis = {"analyst_notes": "Erreur de décodage de l'analyse IA."}

        score = int(analysis.get("reliability_score", 50))
        score = max(0, min(100, score))
        confidence = analysis.get("confidence") or _score_to_confidence(score)
        needs_more = analysis.get("needs_more_data", score < RELIABILITY_THRESHOLD)

        return _build_analyst_result(
            reliability_score=score,
            confidence=confidence,
            justification=analysis.get("justification", []),
            verified_facts=analysis.get("verified_facts", []),
            contradictions=analysis.get("contradictions", []),
            analyst_notes=analysis.get("analyst_notes", ""),
            structured_data=structured_data,
            sources=sources,
            target_nodes=context_nodes,
            needs_more_data=needs_more and iteration < MAX_FEEDBACK_ITERATIONS - 1,
            missing_info=analysis.get("missing_info", []),
            is_simulated=False,
            iteration=iteration,
        )

    except Exception as e:
        print(f"[Analyst] Erreur Gemini: {e}")
        reliability = _compute_local_reliability_score(sources, structured_data)
        return _build_analyst_result(
            reliability_score=reliability["score"],
            confidence=reliability["confidence"],
            justification=reliability["justification"],
            verified_facts=[],
            contradictions=[],
            analyst_notes=f"Analyse de secours (erreur IA : {e}).",
            structured_data=structured_data,
            sources=sources,
            target_nodes=context_nodes,
            needs_more_data=reliability["score"] < RELIABILITY_THRESHOLD,
            missing_info=[],
            is_simulated=True,
            iteration=iteration,
        )


# ─────────────────────────────────────────────────────────────────────────────
# CALCUL LOCAL DU SCORE (mode hors-ligne ou fallback)
# ─────────────────────────────────────────────────────────────────────────────

def _compute_local_reliability_score(
    sources: List[Dict[str, Any]],
    structured_data: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """Calcule un score de fiabilité sans appel IA, basé sur les métadonnées."""
    justification = []

    if not sources and not structured_data:
        return {
            "score": 20,
            "confidence": "Très faible",
            "justification": ["Aucune source ni donnée structurée fournie."],
        }

    # Score de base des sources
    if sources:
        weights = [SOURCE_TYPE_WEIGHTS.get(s.get("source_type", "inconnue"), 40) for s in sources]
        base_score = sum(weights) / len(weights)
        justification.append(f"Score moyen des sources : {base_score:.0f}/100 ({len(sources)} source(s)).")

        # Bonus sources multiples indépendantes
        methods = {s.get("retrieval_method", "") for s in sources}
        if len(methods) >= 2:
            base_score = min(100, base_score + 10)
            justification.append("Sources provenant de méthodes de collecte diversifiées (+10).")

        # Fraîcheur
        today = datetime.date.today()
        recent_count = 0
        for s in sources:
            pub_date = s.get("publication_date", "")
            if pub_date:
                try:
                    year = int(pub_date[:4])
                    if today.year - year <= 1:
                        recent_count += 1
                except ValueError:
                    pass
        if recent_count > 0:
            base_score = min(100, base_score + 5)
            justification.append(f"{recent_count} source(s) récente(s) (< 1 an) (+5).")
    else:
        base_score = 40
        justification.append("Aucune métadonnée de source disponible — score de base : 40.")

    # Ajustement selon les données structurées
    if structured_data:
        db_items = [d for d in structured_data if d.get("source") == "database"]
        if db_items:
            base_score = min(100, base_score + 5)
            justification.append(f"{len(db_items)} élément(s) validé(s) depuis la base interne (+5).")

    score = int(round(base_score))
    return {
        "score": score,
        "confidence": _score_to_confidence(score),
        "justification": justification,
    }


def _score_to_confidence(score: int) -> str:
    for (low, high), label in CONFIDENCE_LABELS.items():
        if low <= score < high:
            return label
    return "Inconnue"


def _build_analyst_result(
    reliability_score: int,
    confidence: str,
    justification: List[str],
    verified_facts: List[str],
    contradictions: List[str],
    analyst_notes: str,
    structured_data: List[Dict[str, Any]],
    sources: List[Dict[str, Any]],
    target_nodes: List[Dict[str, Any]],
    needs_more_data: bool,
    missing_info: List[str],
    is_simulated: bool,
    iteration: int,
) -> Dict[str, Any]:
    """Construit le résultat normalisé de l'Analyseur."""
    result = {
        "reliabilityAnalysis": {
            "reliability_score": reliability_score,
            "confidence": confidence,
            "justification": justification,
            "verified_facts": verified_facts,
            "contradictions": contradictions,
            "analyst_notes": analyst_notes,
        },
        "structured_data": structured_data,
        "sources": sources,
        "generatedAt": datetime.datetime.now().isoformat() + "Z",
        "nodesReferenced": [n.get("title", "") for n in target_nodes],
        "isSimulated": is_simulated,
        "_feedback_iteration": iteration,
        "threshold": RELIABILITY_THRESHOLD,
    }

    if needs_more_data:
        # Signal de rétroaction vers le Collecteur
        result["needs_more_data"] = True
        result["feedback_request"] = {
            "missing_info": missing_info,
            "contradictions": contradictions,
            "message": (
                f"Score de fiabilité insuffisant ({reliability_score}/100, seuil : {RELIABILITY_THRESHOLD}). "
                f"Veuillez enrichir les données avec des sources supplémentaires."
            ),
            "iteration": iteration + 1,
        }
    else:
        result["needs_more_data"] = False
        result["feedback_request"] = None

    return result
