# agents/coordinator.py
import datetime
import json
import re
from typing import Dict, Any, List, Optional, Callable

from agents.analyst import RELIABILITY_THRESHOLD, MAX_FEEDBACK_ITERATIONS


def run_coordinator_agent(
    client: Any,
    user_query: str,
    metadata: Optional[Dict[str, Any]] = None,
    agents: Optional[Dict[str, Callable]] = None
) -> Dict[str, Any]:
    """
    Agent Coordinateur — Orchestre le pipeline multi-agents.

    Workflow avec boucle de rétroaction :
        Collecteur → Structureur → Analyseur
            ↓ score ≥ seuil ?
        Oui → Exploitation
        Non → retour Collecteur (max MAX_FEEDBACK_ITERATIONS)
    """
    if metadata is None:
        metadata = {}
    if agents is None:
        agents = {}

    timestamp = datetime.datetime.now().isoformat() + "Z"
    logs = []

    print(f"[Coordinateur] Requête : {user_query[:100]}...")

    # 1. ANALYSE DE L'INTENTION
    intent = analyze_intent(client, user_query, metadata)
    logs.append({
        "timestamp": timestamp,
        "step": "intent_analysis",
        "intent": intent,
        "confidence": intent.get("confidence", 0),
    })
    print(f"[Coordinateur] Intention : {intent.get('type')} ({intent.get('confidence')}%)")

    # 2. STRATÉGIE
    strategy = determine_strategy(intent, metadata, agents)
    logs.append({
        "timestamp": datetime.datetime.now().isoformat() + "Z",
        "step": "strategy_determination",
        "strategy": strategy,
    })
    print(f"[Coordinateur] Stratégie : {strategy.get('description')}")

    # 3. EXÉCUTION AVEC BOUCLE DE RÉTROACTION
    results = []
    last_successful_output = None

    steps = strategy.get("steps", [])
    has_feedback_loop = (
        "collector" in agents
        and "analyst" in agents
        and any(s["agent"] == "analyst" for s in steps)
    )

    if has_feedback_loop:
        # Pipeline avec boucle collector ↔ analyst
        results, last_successful_output, logs = _run_pipeline_with_feedback(
            client=client,
            user_query=user_query,
            metadata=metadata,
            agents=agents,
            steps=steps,
            logs=logs,
        )
    else:
        # Pipeline simple (pas d'agent analyst ou collecteur)
        results, last_successful_output, logs = _run_simple_pipeline(
            client=client,
            user_query=user_query,
            metadata=metadata,
            agents=agents,
            steps=steps,
            logs=logs,
        )

    # 4. SYNTHÈSE ET VERDICT
    synthesis = synthesize_results(results, intent)
    verdict = generate_verdict(results, intent, synthesis)

    final_result = {
        "timestamp": timestamp,
        "query": user_query,
        "intent": intent,
        "strategy": strategy,
        "results": results,
        "synthesis": synthesis,
        "verdict": verdict,
        "logs": logs,
        "coordinatorLogs": logs,
        "verdictSupervision": verdict,
    }

    successful_results = [r for r in results if r.get("status") == "success"]
    if successful_results:
        final_result["agentResult"] = successful_results[-1].get("result")

    print(f"[Coordinateur] Terminé. Verdict : {verdict.get('status')}")
    return final_result


# ─────────────────────────────────────────────────────────────────────────────
# PIPELINE AVEC BOUCLE DE RÉTROACTION
# ─────────────────────────────────────────────────────────────────────────────

def _run_pipeline_with_feedback(
    client: Any,
    user_query: str,
    metadata: Dict[str, Any],
    agents: Dict[str, Callable],
    steps: List[Dict[str, Any]],
    logs: List[Dict[str, Any]],
) -> tuple:
    """
    Exécute le pipeline en gérant la boucle Collecteur ↔ Analyseur.

    Flux :
    1. Collecteur (collecte initiale ou enrichissement)
    2. Structureur
    3. Analyseur (calcule le score)
        - score ≥ seuil → Exploitation
        - score < seuil → retour Collecteur avec feedback (max MAX_FEEDBACK_ITERATIONS)
    """
    results = []
    last_successful_output = None

    # Séparer les étapes pré-analyse, analyse et post-analyse
    pre_analyst_steps = [s for s in steps if s["agent"] not in ("analyst", "exploitation")]
    analyst_step = next((s for s in steps if s["agent"] == "analyst"), None)
    exploitation_step = next((s for s in steps if s["agent"] == "exploitation"), None)

    # Données accumulées entre les itérations
    accumulated_sources: List[Dict[str, Any]] = []
    accumulated_data: List[Dict[str, Any]] = []

    for iteration in range(MAX_FEEDBACK_ITERATIONS):
        print(f"[Coordinateur] ── Itération {iteration + 1}/{MAX_FEEDBACK_ITERATIONS} ──")

        # ── COLLECTE (ou enrichissement) ─────────────────────────────────────
        collector_params = {**metadata, "source": "all"}
        if iteration > 0 and last_successful_output:
            # Transmettre le feedback de l'analyseur au collecteur
            feedback = last_successful_output.get("feedback_request", {})
            if feedback:
                collector_params["feedback"] = feedback
                collector_params["missing_info"] = feedback.get("missing_info", [])
                collector_params["contradictions"] = feedback.get("contradictions", [])
                print(f"[Coordinateur] Feedback transmis au Collecteur : {feedback.get('message', '')[:80]}")

        collector_result = _run_agent(
            agents, "collector", client, user_query, collector_params, results, logs, iteration
        )
        if collector_result:
            last_successful_output = collector_result
            new_sources = collector_result.get("sources", [])
            new_data = collector_result.get("collectedData", [])
            # Fusionner avec les résultats précédents (évite les doublons par titre)
            existing_titles = {d.get("title") for d in accumulated_data}
            accumulated_data.extend([d for d in new_data if d.get("title") not in existing_titles])
            existing_source_urls = {s.get("url") or s.get("title") for s in accumulated_sources}
            accumulated_sources.extend([s for s in new_sources if (s.get("url") or s.get("title")) not in existing_source_urls])

        # ── STRUCTUREUR ───────────────────────────────────────────────────────
        structurer_step = next((s for s in pre_analyst_steps if s["agent"] == "structurer"), None)
        if structurer_step and "structurer" in agents:
            structurer_params = {**metadata, **structurer_step.get("params", {})}
            structurer_params["structured_data"] = accumulated_data
            input_data = accumulated_data if accumulated_data else user_query
            structurer_result = _run_agent(
                agents, "structurer", client, input_data, structurer_params, results, logs, iteration
            )
            if structurer_result:
                last_successful_output = structurer_result
                structured_items = (
                    structurer_result.get("items")
                    or structurer_result.get("structured_data")
                    or accumulated_data
                )
                if structured_items:
                    accumulated_data = structured_items

        # ── ANALYSEUR ─────────────────────────────────────────────────────────
        if analyst_step:
            analyst_params = {
                **metadata,
                **analyst_step.get("params", {}),
                "structured_data": accumulated_data,
                "sources": accumulated_sources,
                "all_nodes": metadata.get("all_nodes", []),
                "_feedback_iteration": iteration,
            }
            analyst_result = _run_agent(
                agents, "analyst", client, user_query, analyst_params, results, logs, iteration
            )
            if analyst_result:
                last_successful_output = analyst_result
                score = analyst_result.get("reliabilityAnalysis", {}).get("reliability_score", 0)
                needs_more = analyst_result.get("needs_more_data", False)

                print(f"[Coordinateur] Score de fiabilité : {score}/100 (seuil : {RELIABILITY_THRESHOLD})")

                if not needs_more or iteration >= MAX_FEEDBACK_ITERATIONS - 1:
                    if needs_more and iteration >= MAX_FEEDBACK_ITERATIONS - 1:
                        print(f"[Coordinateur] Nombre max d'itérations atteint ({MAX_FEEDBACK_ITERATIONS}). Poursuite.")
                    break
                # Sinon : nouvelle itération avec enrichissement
                print(f"[Coordinateur] Score insuffisant ({score} < {RELIABILITY_THRESHOLD}). Enrichissement...")
            else:
                break

    # ── EXPLOITATION ──────────────────────────────────────────────────────────
    if exploitation_step and "exploitation" in agents:
        exploitation_params = {
            **metadata,
            **exploitation_step.get("params", {}),
            "structured_data": accumulated_data,
            "sources": accumulated_sources,
            "reliability_analysis": last_successful_output.get("reliabilityAnalysis") if last_successful_output else None,
            "all_nodes": metadata.get("all_nodes", []),
        }
        exploitation_result = _run_agent(
            agents, "exploitation", client, user_query, exploitation_params, results, logs, 0
        )
        if exploitation_result:
            last_successful_output = exploitation_result

    return results, last_successful_output, logs


# ─────────────────────────────────────────────────────────────────────────────
# PIPELINE SIMPLE
# ─────────────────────────────────────────────────────────────────────────────

def _run_simple_pipeline(
    client: Any,
    user_query: str,
    metadata: Dict[str, Any],
    agents: Dict[str, Callable],
    steps: List[Dict[str, Any]],
    logs: List[Dict[str, Any]],
) -> tuple:
    """Pipeline linéaire sans boucle de rétroaction."""
    results = []
    last_successful_output = None

    for step in steps:
        agent_name = step.get("agent")
        params = step.get("params", {})
        merged_params = {**metadata, **params}

        if agent_name not in agents:
            logs.append({
                "timestamp": datetime.datetime.now().isoformat() + "Z",
                "step": "agent_not_available",
                "agent": agent_name,
                "status": "skipped",
            })
            continue

        if agent_name in ("structurer", "analyst", "exploitation", "vocal") and last_successful_output:
            collected = (
                last_successful_output.get("collectedData")
                or last_successful_output.get("items")
                or last_successful_output.get("structured_data")
                or []
            )
            merged_params["structured_data"] = collected
            merged_params["sources"] = last_successful_output.get("sources", [])
            merged_params["all_nodes"] = metadata.get("all_nodes", [])

            if agent_name == "structurer":
                agent_result = agents[agent_name](client, collected if collected else user_query, merged_params)
            else:
                agent_result = agents[agent_name](client, user_query, merged_params)
        else:
            agent_result = agents[agent_name](client, user_query, merged_params)

        _record_result(agent_result, agent_name, step.get("action", ""), results, logs)

        if isinstance(agent_result, dict) and "error" not in agent_result:
            last_successful_output = agent_result

    return results, last_successful_output, logs


# ─────────────────────────────────────────────────────────────────────────────
# UTILITAIRES INTERNES
# ─────────────────────────────────────────────────────────────────────────────

def _run_agent(
    agents: Dict[str, Callable],
    agent_name: str,
    client: Any,
    input_data: Any,
    params: Dict[str, Any],
    results: List[Dict[str, Any]],
    logs: List[Dict[str, Any]],
    iteration: int,
) -> Optional[Dict[str, Any]]:
    """Lance un agent et enregistre son résultat. Retourne le résultat ou None."""
    if agent_name not in agents:
        return None

    print(f"[Coordinateur] → Agent : {agent_name}")
    try:
        result = agents[agent_name](client, input_data, params)
        _record_result(result, agent_name, f"step_{iteration}", results, logs)
        if isinstance(result, dict) and ("error" in result and "answerText" not in result):
            return None
        return result
    except Exception as e:
        print(f"[Coordinateur] Erreur {agent_name}: {e}")
        _record_error(agent_name, str(e), results, logs)
        return None


def _record_result(
    result: Any,
    agent_name: str,
    action: str,
    results: List[Dict[str, Any]],
    logs: List[Dict[str, Any]],
) -> None:
    ts = datetime.datetime.now().isoformat() + "Z"
    if isinstance(result, dict) and "error" in result and "answerText" not in result:
        status = "failed"
    else:
        status = "success"
    results.append({"agent": agent_name, "action": action, "result": result, "status": status, "timestamp": ts})
    logs.append({"timestamp": ts, "step": f"agent_execution_{agent_name}", "agent": agent_name, "status": status})


def _record_error(
    agent_name: str,
    error: str,
    results: List[Dict[str, Any]],
    logs: List[Dict[str, Any]],
) -> None:
    ts = datetime.datetime.now().isoformat() + "Z"
    results.append({"agent": agent_name, "action": "", "result": None, "status": "failed", "error": error, "timestamp": ts})
    logs.append({"timestamp": ts, "step": f"agent_execution_{agent_name}", "agent": agent_name, "status": "failed", "error": error})


# ─────────────────────────────────────────────────────────────────────────────
# ANALYSE D'INTENTION
# ─────────────────────────────────────────────────────────────────────────────

def analyze_intent(client: Any, query: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
    query_lower = query.lower()

    intents = {
        "collect": {
            "keywords": ["collecter", "trouver", "chercher", "rechercher", "informations", "données", "savoir", "connaissance", "où", "comment trouver", "qu'est-ce que"],
            "description": "Recherche d'informations",
        },
        "structure": {
            "keywords": ["structurer", "organiser", "classer", "catégoriser", "ranger", "ordonner"],
            "description": "Structuration de données",
        },
        "analyze": {
            "keywords": ["analyser", "étudier", "examiner", "évaluer", "comparer", "pourquoi", "comment", "quelles sont les causes"],
            "description": "Analyse approfondie",
        },
        "vocal": {
            "keywords": ["parler", "oral", "voix", "audio", "écouter", "vocal", "dis moi", "raconte", "conte"],
            "description": "Interaction vocale",
        },
        "translate": {
            "keywords": ["traduire", "traduction", "langue", "mot", "signification", "que veut dire", "en français"],
            "description": "Traduction",
        },
        "report": {
            "keywords": ["rapport", "résumé", "synthèse", "document", "publication", "étude", "analyse approfondie"],
            "description": "Génération de rapport",
        },
        "general": {
            "keywords": ["bonjour", "salut", "coucou", "merci", "aide", "bonsoir", "comment ça va"],
            "description": "Conversation générale",
        },
    }

    detected_intent = "general"
    confidence = 50
    matched_keywords = []

    for intent_name, intent_data in intents.items():
        for keyword in intent_data["keywords"]:
            if keyword in query_lower:
                matched_keywords.append(keyword)
                temp_confidence = 60 + len(matched_keywords) * 5
                if temp_confidence > confidence:
                    confidence = temp_confidence
                    detected_intent = intent_name

    if metadata.get("intent"):
        return {
            "type": metadata["intent"],
            "confidence": 90,
            "description": intents.get(metadata["intent"], {}).get("description", "Intention spécifiée"),
            "keywords": matched_keywords,
        }

    return {
        "type": detected_intent,
        "confidence": min(95, confidence),
        "description": intents.get(detected_intent, {}).get("description", "Conversation générale"),
        "keywords": matched_keywords,
    }


def determine_strategy(
    intent: Dict[str, Any],
    metadata: Dict[str, Any],
    available_agents: Dict[str, Callable],
) -> Dict[str, Any]:
    intent_type = intent.get("type", "general")

    strategies = {
        "collect": {
            "description": "Collecte hybride d'informations (RAG + Web)",
            "steps": [
                {"agent": "collector", "action": "search", "params": {"source": "all"}},
                {"agent": "structurer", "action": "structure", "params": {"format": "json"}},
                {"agent": "analyst", "action": "verify", "params": {"depth": "normal"}},
                {"agent": "exploitation", "action": "respond", "params": {"style": "conversational"}},
            ],
        },
        "structure": {
            "description": "Structuration de données",
            "steps": [
                {"agent": "collector", "action": "search", "params": {"source": "database"}},
                {"agent": "structurer", "action": "structure", "params": {"format": "json"}},
                {"agent": "analyst", "action": "verify", "params": {"depth": "normal"}},
                {"agent": "exploitation", "action": "respond", "params": {"style": "conversational"}},
            ],
        },
        "analyze": {
            "description": "Analyse approfondie",
            "steps": [
                {"agent": "collector", "action": "search", "params": {"source": "all"}},
                {"agent": "structurer", "action": "structure", "params": {"format": "json"}},
                {"agent": "analyst", "action": "analyze", "params": {"depth": "deep"}},
                {"agent": "exploitation", "action": "respond", "params": {"style": "report"}},
            ],
        },
        "vocal": {
            "description": "Interaction vocale",
            "steps": [
                {"agent": "collector", "action": "search", "params": {"source": "database"}},
                {"agent": "structurer", "action": "structure", "params": {"format": "json"}},
                {"agent": "analyst", "action": "verify", "params": {"depth": "normal"}},
                {"agent": "exploitation", "action": "respond", "params": {"style": "conversational"}},
            ],
        },
        "translate": {
            "description": "Traduction",
            "steps": [
                {"agent": "exploitation", "action": "translate", "params": {"target_language": metadata.get("language", "Français")}},
            ],
        },
        "report": {
            "description": "Génération de rapport avec validation approfondie",
            "steps": [
                {"agent": "collector", "action": "search", "params": {"source": "all"}},
                {"agent": "structurer", "action": "structure", "params": {"format": "json"}},
                {"agent": "analyst", "action": "verify", "params": {"depth": "deep"}},
                {"agent": "exploitation", "action": "respond", "params": {"style": "report"}},
            ],
        },
        "general": {
            "description": "Conversation générale",
            "steps": [
                {"agent": "exploitation", "action": "respond", "params": {"style": "conversational"}},
            ],
        },
    }

    strategy = strategies.get(intent_type, strategies["general"])
    filtered_steps = [s for s in strategy["steps"] if s["agent"] in available_agents]

    if not filtered_steps and "exploitation" in available_agents:
        filtered_steps = [{"agent": "exploitation", "action": "respond", "params": {"style": "conversational"}}]

    return {
        "description": strategy["description"],
        "steps": filtered_steps,
        "originalIntent": intent_type,
    }


def synthesize_results(results: List[Dict[str, Any]], intent: Dict[str, Any]) -> Dict[str, Any]:
    successful = [r for r in results if r.get("status") == "success"]
    failed = [r for r in results if r.get("status") == "failed"]
    return {
        "totalAgents": len(results),
        "successfulAgents": len(successful),
        "failedAgents": len(failed),
        "successRate": (len(successful) / len(results) * 100) if results else 0,
        "agentsSummary": [
            {"agent": r.get("agent"), "action": r.get("action"), "status": r.get("status")}
            for r in results
        ],
    }


def generate_verdict(
    results: List[Dict[str, Any]],
    intent: Dict[str, Any],
    synthesis: Dict[str, Any],
) -> Dict[str, Any]:
    success_rate = synthesis.get("successRate", 0)

    if success_rate >= 80:
        status, message = "success", "Tous les agents ont exécuté leurs tâches avec succès."
    elif success_rate >= 50:
        status, message = "partial", "Certains agents ont rencontré des difficultés, mais des résultats ont été obtenus."
    else:
        status, message = "failed", "La majorité des agents n'ont pas pu exécuter leurs tâches."

    # Inclure le score de fiabilité final dans le verdict
    analyst_result = next(
        (r.get("result") for r in reversed(results) if r.get("agent") == "analyst" and r.get("status") == "success"),
        None,
    )
    reliability_score = None
    if analyst_result:
        reliability_score = analyst_result.get("reliabilityAnalysis", {}).get("reliability_score")

    return {
        "status": status,
        "message": message,
        "successRate": success_rate,
        "reliabilityScore": reliability_score,
        "intent": intent.get("type"),
        "timestamp": datetime.datetime.now().isoformat() + "Z",
    }
