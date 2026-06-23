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
        client = client.get("openai")

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
    Génère un rapport d'analyse stratégique, universitaire et culturellement ancré sur le sujet suivant: "{topic}".
    Le thème central est: "{theme or "Non spécifié"}".
    Sers-toi de ces nœuds de connaissances africains réels comme base de travail et d'illustrations empiriques:\n{nodes_context}

    Le rapport doit impérativement comporter une structure universitaire soignée rédigée en français avec:
    1. Un titre fort axé sur la souveraineté cognitive.
    2. Une table des matières textuelle.
    3. Une introduction historique et contemporaine de la problématique.
    4. Un corps de texte détaillé découpé en sections.
    5. Des recommandations précises pour les décideurs africains, les chercheurs et les entrepreneurs de la diaspora.
    6. Une conclusion portant sur 'la conscience cognitive de Sankofa'.
    """

    system_instruction = """
    Tu es l'analyste principal de 'deNOUS AI' / 'Mémoire Africaine'.
    Tu rédiges des rapports d'expertise et de stratégie d'une utilité capitale.
    Garde un niveau de rédaction irréprochable, digne des grands think-tanks d'études d'Afrique souveraine.
    """

    try:
        print(f"[Analyst Agent] Exécution du rapport sur le thème \"{topic}\" avec OpenAI (gpt-4o)...")
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3
        )

        report_text = response.choices[0].message.content or ""
        return {
            "reportText": report_text,
            "answerText": report_text,
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
