# sanka_app/agents/analyst.py
import datetime
import json
from typing import Dict, Any, List, Optional


def run_analyst_agent(
    client: Any,
    query: str,
    params: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Agent Analyste - Génère des rapports d'analyse approfondie.

    Signature normalisée : (client, query, params) pour compatibilité
    avec le Coordinateur.

    Args:
        client: Client Google Gemini (ou None)
        query: La question / sujet du rapport
        params: Paramètres optionnels (theme, node_ids, all_nodes, ...)

    Returns:
        dict: Rapport structuré
    """
    if params is None:
        params = {}

    if isinstance(client, dict):
        client = client.get("gemini")

    # Extraire les paramètres depuis le dict
    topic = query
    theme = params.get("theme")
    node_ids = params.get("node_ids", [])
    all_nodes = params.get("all_nodes", [])

    if not isinstance(all_nodes, list):
        all_nodes = []
    if not isinstance(node_ids, list):
        node_ids = []

    # Filtrer les nœuds correspondants
    target_nodes = [n for n in all_nodes if n.get("id") in node_ids]

    if len(target_nodes) > 0:
        nodes_context = json.dumps(
            [{"title": n["title"], "desc": n["description"], "source": n.get("source", "")}
             for n in target_nodes],
            ensure_ascii=False
        )
    else:
        nodes_context = json.dumps(
            [{"title": n["title"], "desc": n["description"]}
             for n in all_nodes[:3]],
            ensure_ascii=False
        )

    # ============================================================
    # MODE HORS-LIGNE (sans client Gemini)
    # ============================================================
    if client is None:
        print("[Analyst Agent] No Gemini client available. Simulated structured report generated.")

        target_nodes_str = "\n".join([
            f"   - **{n['title']}** ({n.get('country', 'Afrique')}) : {n['description']}"
            for n in target_nodes
        ])

        report_text = f"""### RAPPORT TRADITIONNEL SOUVERAIN (Émulateur hors-ligne)
Sujet: **{topic}**
Thème: **{theme or "Général"}**

*Ce document a été généré en mode hors-ligne sans clé Gemini active.*

#### I. Introduction & Enjeux Continentaux
L'exploitation contemporaine de nos connaissances ancestrales africaines repose sur des défis éthiques majeurs, notamment le protocole de Nagoya et la transition agroécologique indispensable.

#### II. Analyse Spécifique sur la Thématique : {theme or topic}
1. **Valorisation et Durabilité** : Établir des liens rigoureux entre les pratiques communautaires et l'innovation technologique moderne permet de formuler de nouveaux paradigmes de développement endogènes.
2. **Étude de cas tirée des nodes sélectionnés**:
{target_nodes_str}

#### III. Recommandations Actionnables
- Mettre en place des agents de collecte de terrain équipés de protocoles de consentement éclairé stricts.
- Cartographier systématiquement les entités en graphe sémantique pour révéler les synergies invisibles.
- Développer des assistants vocaux locaux légers pour combler la barrière de l'analphabétisme."""

        return {
            "reportText": report_text,
            "answerText": report_text,
            "generatedAt": datetime.datetime.now().isoformat() + "Z",
            "nodesReferenced": [n["title"] for n in target_nodes],
            "isSimulated": True
        }

    # ============================================================
    # MODE AVEC GEMINI
    # ============================================================
    prompt = f"""
    Évalue la fiabilité, la véracité et la pertinence des informations concernant le sujet suivant: "{topic}".
    Le thème central est: "{theme or "Non spécifié"}".
    
    Voici les données collectées et structurées:\n{nodes_context}

    Ton rôle est UNIQUEMENT de fact-checker ces informations.
    Utilise 'google_search' pour vérifier si les données sont exactes, à jour et fiables.
    
    Tu dois renvoyer STRICTEMENT un objet JSON avec cette structure:
    {{
        "reliabilityScore": "High" | "Medium" | "Low",
        "verifiedFacts": ["fait 1", "fait 2"],
        "contradictions": ["contradiction 1"] ou [],
        "analystNotes": "Bref commentaire critique sur la fiabilité"
    }}
    """

    system_instruction = """
    Tu es l'analyste de fiabilité de 'deNOUS AI' / 'Mémoire Africaine'.
    Ton rôle EXCLUSIF est de vérifier la fiabilité et la véracité des informations collectées.
    N'hésite pas à utiliser 'google_search' pour recouper les sources.
    Ne rédige JAMAIS le rapport final. Tu dois SEULEMENT renvoyer le JSON demandé.
    """

    from google.genai import types

    try:
        print(f"[Analyst Agent] Vérification de la fiabilité sur \"{topic}\" avec Gemini...")
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.1,
                response_mime_type="application/json",
                tools=[{"google_search": {}}]
            )
        )

        try:
            analysis_data = json.loads(response.text or "{}")
        except json.JSONDecodeError:
            analysis_data = {"analystNotes": "Erreur de décodage de l'analyse"}

        # On retourne l'analyse PLUS les données structurées d'origine pour ne pas briser la chaîne
        structured_data = params.get("structured_data", [])
        return {
            "reliabilityAnalysis": analysis_data,
            "structured_data": structured_data,
            "generatedAt": datetime.datetime.now().isoformat() + "Z",
            "nodesReferenced": [n["title"] for n in target_nodes],
            "isSimulated": False
        }
    except Exception as e:
        print("[Analyst Agent] Failed generating report with OpenAI:", e)
        return {
            "reportText": "Erreur lors de la génération avec l'IA: " + str(e),
            "answerText": "Erreur lors de la génération avec l'IA: " + str(e),
            "generatedAt": datetime.datetime.now().isoformat() + "Z",
            "nodesReferenced": [],
            "isSimulated": False,
            "error": str(e)
        }
