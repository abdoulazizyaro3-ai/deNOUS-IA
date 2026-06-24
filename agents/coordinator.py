# sanka_app/agents/coordinator.py
import datetime
import json
import re
from typing import Dict, Any, List, Optional, Callable


def run_coordinator_agent(
    client: Any,
    user_query: str,
    metadata: Optional[Dict[str, Any]] = None,
    agents: Optional[Dict[str, Callable]] = None
) -> Dict[str, Any]:
    """
    Agent Coordinateur - Orchestre les autres agents.
    
    Args:
        client: Client Google Gemini (ou None pour mode offline)
        user_query: La question de l'utilisateur
        metadata: Métadonnées (langue, pays, persona, etc.)
        agents: Dictionnaire des agents disponibles {nom: fonction}
    
    Returns:
        dict: Résultat avec logs et décisions
    """
    if metadata is None:
        metadata = {}
    
    if agents is None:
        agents = {}
    
    timestamp = datetime.datetime.now().isoformat() + "Z"
    logs = []
    
    print(f"[Coordinateur] Analyse de la requête: {user_query[:100]}...")
    
    # 1. ANALYSE DE L'INTENTION
    intent = analyze_intent(client, user_query, metadata)
    
    logs.append({
        "timestamp": timestamp,
        "step": "intent_analysis",
        "intent": intent,
        "confidence": intent.get("confidence", 0)
    })
    
    print(f"[Coordinateur] Intention détectée: {intent.get('type')} (confiance: {intent.get('confidence')}%)")
    
    # 2. DÉTERMINATION DE LA STRATÉGIE
    strategy = determine_strategy(intent, metadata, agents)
    
    logs.append({
        "timestamp": datetime.datetime.now().isoformat() + "Z",
        "step": "strategy_determination",
        "strategy": strategy
    })
    
    print(f"[Coordinateur] Stratégie: {strategy.get('description')}")
    
    # 3. EXÉCUTION DE LA STRATÉGIE
    results = []
    # Garde la sortie du dernier agent réussi pour chaînage
    last_successful_output = None
    
    for step in strategy.get("steps", []):
        agent_name = step.get("agent")
        action = step.get("action")
        params = step.get("params", {})
        
        # Fusionner les métadonnées avec les paramètres
        merged_params = {**metadata, **params}
        
        if agent_name in agents:
            print(f"[Coordinateur] Lancement de l'agent: {agent_name}")
            
            try:
                # -- CHAÎNAGE ENTRE AGENTS --
                # Le structurer reçoit les données du collecteur (pas la query brute)
                # L'analyste reçoit les données du structurer ou collecteur
                if agent_name in ("structurer", "analyst", "exploitation", "vocal") and last_successful_output is not None:
                    # Transmettre les données collectées/structurées via params
                    collected = []
                    if isinstance(last_successful_output, dict):
                        collected = last_successful_output.get("collectedData") or \
                                    last_successful_output.get("items") or \
                                    last_successful_output.get("structured_data") or \
                                    []
                    merged_params["structured_data"] = collected
                    merged_params["all_nodes"] = metadata.get("all_nodes", [])
                    # Pour le structurer : on passe les données collectées directement
                    if agent_name == "structurer":
                        input_data = collected if collected else user_query
                        agent_result = agents[agent_name](client, input_data, merged_params)
                    else:
                        agent_result = agents[agent_name](client, user_query, merged_params)
                else:
                    agent_result = agents[agent_name](client, user_query, merged_params)

                if isinstance(agent_result, dict) and "error" in agent_result and "answerText" not in agent_result:
                    print(f"[Coordinateur] L'agent {agent_name} a renvoyé une erreur: {agent_result.get('error')}")
                    results.append({
                        "agent": agent_name,
                        "action": action,
                        "result": agent_result,
                        "status": "failed",
                        "error": agent_result.get("error"),
                        "timestamp": datetime.datetime.now().isoformat() + "Z"
                    })
                    logs.append({
                        "timestamp": datetime.datetime.now().isoformat() + "Z",
                        "step": f"agent_execution_{agent_name}",
                        "agent": agent_name,
                        "status": "failed",
                        "error": agent_result.get("error")
                    })
                else:
                    last_successful_output = agent_result

                    results.append({
                        "agent": agent_name,
                        "action": action,
                        "result": agent_result,
                        "status": "success",
                        "timestamp": datetime.datetime.now().isoformat() + "Z"
                    })
                    
                    logs.append({
                        "timestamp": datetime.datetime.now().isoformat() + "Z",
                        "step": f"agent_execution_{agent_name}",
                        "agent": agent_name,
                        "status": "success"
                    })
                
            except Exception as e:
                error_msg = str(e)
                print(f"[Coordinateur] Erreur avec {agent_name}: {error_msg}")
                results.append({
                    "agent": agent_name,
                    "action": action,
                    "result": None,
                    "status": "failed",
                    "error": error_msg,
                    "timestamp": datetime.datetime.now().isoformat() + "Z"
                })
                
                logs.append({
                    "timestamp": datetime.datetime.now().isoformat() + "Z",
                    "step": f"agent_execution_{agent_name}",
                    "agent": agent_name,
                    "status": "failed",
                    "error": error_msg
                })
        else:
            print(f"[Coordinateur] Agent non disponible: {agent_name}")
            logs.append({
                "timestamp": datetime.datetime.now().isoformat() + "Z",
                "step": "agent_not_available",
                "agent": agent_name,
                "status": "skipped"
            })
    
    # 4. SYNTHÈSE DES RÉSULTATS
    synthesis = synthesize_results(results, intent)
    
    # 5. DÉCISION FINALE ET VERDICT
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
        "verdictSupervision": verdict
    }
    
    # Associer le résultat du dernier agent exécuté avec succès (qui produit la réponse finale)
    successful_results = [r for r in results if r.get("status") == "success"]
    if successful_results:
        final_result["agentResult"] = successful_results[-1].get("result")
    
    print(f"[Coordinateur] Orchestration terminée. Verdict: {verdict.get('status')}")
    
    return final_result


def analyze_intent(client: Any, query: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
    """Analyse l'intention de l'utilisateur."""
    query_lower = query.lower()
    
    # Types d'intentions avec mots-clés
    intents = {
        "collect": {
            "keywords": ["collecter", "trouver", "chercher", "rechercher", "informations", "données", "savoir", "connaissance", "où", "comment trouver", "qu'est-ce que"],
            "description": "Recherche d'informations"
        },
        "structure": {
            "keywords": ["structurer", "organiser", "classer", "catégoriser", "ranger", "ordonner"],
            "description": "Structuration de données"
        },
        "analyze": {
            "keywords": ["analyser", "étudier", "examiner", "évaluer", "comparer", "pourquoi", "comment", "quelles sont les causes"],
            "description": "Analyse approfondie"
        },
        "vocal": {
            "keywords": ["parler", "oral", "voix", "audio", "écouter", "vocal", "dis moi", "raconte", "conte"],
            "description": "Interaction vocale"
        },
        "translate": {
            "keywords": ["traduire", "traduction", "langue", "mot", "signification", "que veut dire", "en français"],
            "description": "Traduction"
        },
        "report": {
            "keywords": ["rapport", "résumé", "synthèse", "document", "publication", "étude", "analyse approfondie"],
            "description": "Génération de rapport"
        },
        "general": {
            "keywords": ["bonjour", "salut", "coucou", "merci", "aide", "bonsoir", "comment ça va"],
            "description": "Conversation générale"
        }
    }
    
    # Détection basée sur les mots-clés
    detected_intent = "general"
    confidence = 50
    matched_keywords = []
    
    for intent_name, intent_data in intents.items():
        for keyword in intent_data["keywords"]:
            if keyword in query_lower:
                matched_keywords.append(keyword)
                temp_confidence = 60 + (len(matched_keywords) * 5)
                if temp_confidence > confidence:
                    confidence = temp_confidence
                    detected_intent = intent_name
    
    # Si une intention est spécifiée dans les métadonnées
    if metadata.get("intent"):
        return {
            "type": metadata["intent"],
            "confidence": 90,
            "description": intents.get(metadata["intent"], {}).get("description", "Intention spécifiée"),
            "keywords": matched_keywords
        }
    
    # Limiter la confiance à 95
    confidence = min(95, confidence)
    
    return {
        "type": detected_intent,
        "confidence": confidence,
        "description": intents.get(detected_intent, {}).get("description", "Conversation générale"),
        "keywords": matched_keywords
    }


def determine_strategy(intent: Dict[str, Any], metadata: Dict[str, Any], available_agents: Dict[str, Callable]) -> Dict[str, Any]:
    """Détermine la stratégie à adopter en fonction de l'intention."""
    intent_type = intent.get("type", "general")
    
    # Stratégies prédéfinies
    strategies = {
        "collect": {
            "description": "Collecte d'informations",
            "steps": [
                {"agent": "collector", "action": "search", "params": {"source": "all"}},
                {"agent": "structurer", "action": "structure", "params": {"format": "json"}},
                {"agent": "analyst", "action": "verify", "params": {"depth": "normal"}},
                {"agent": "exploitation", "action": "respond", "params": {"style": "conversational"}}
            ]
        },
        "structure": {
            "description": "Structuration de données",
            "steps": [
                {"agent": "collector", "action": "search", "params": {"source": "database"}},
                {"agent": "structurer", "action": "structure", "params": {"format": "json"}},
                {"agent": "analyst", "action": "verify", "params": {"depth": "normal"}},
                {"agent": "exploitation", "action": "respond", "params": {"style": "conversational"}}
            ]
        },
        "analyze": {
            "description": "Analyse approfondie",
            "steps": [
                {"agent": "collector", "action": "search", "params": {"source": "all"}},
                {"agent": "structurer", "action": "structure", "params": {"format": "json"}},
                {"agent": "analyst", "action": "analyze", "params": {"depth": "deep"}},
                {"agent": "exploitation", "action": "respond", "params": {"style": "report"}}
            ]
        },
        "vocal": {
            "description": "Interaction vocale",
            "steps": [
                {"agent": "collector", "action": "search", "params": {"source": "database"}},
                {"agent": "structurer", "action": "structure", "params": {"format": "json"}},
                {"agent": "analyst", "action": "verify", "params": {"depth": "normal"}},
                {"agent": "exploitation", "action": "respond", "params": {"style": "conversational"}}
            ]
        },
        "translate": {
            "description": "Traduction",
            "steps": [
                {"agent": "exploitation", "action": "translate", "params": {"target_language": metadata.get("language", "Français")}}
            ]
        },
        "report": {
            "description": "Génération de rapport",
            "steps": [
                {"agent": "collector", "action": "search", "params": {"source": "all"}},
                {"agent": "structurer", "action": "structure", "params": {"format": "json"}},
                {"agent": "analyst", "action": "verify", "params": {"depth": "deep"}},
                {"agent": "exploitation", "action": "respond", "params": {"style": "report"}}
            ]
        },
        "general": {
            "description": "Conversation générale",
            "steps": [
                {"agent": "exploitation", "action": "respond", "params": {"style": "conversational"}}
            ]
        }
    }
    
    # Récupérer la stratégie correspondante
    strategy = strategies.get(intent_type, strategies["general"])
    
    # Filtrer les agents disponibles
    filtered_steps = []
    for step in strategy["steps"]:
        agent_name = step["agent"]
        if agent_name in available_agents:
            filtered_steps.append(step)
    
    # Si aucun agent disponible, utiliser l'agent d'exploitation en fallback
    if not filtered_steps and "exploitation" in available_agents:
        filtered_steps = [{"agent": "exploitation", "action": "respond", "params": {"style": "conversational"}}]
    
    return {
        "description": strategy["description"],
        "steps": filtered_steps,
        "originalIntent": intent_type
    }


def synthesize_results(results: List[Dict[str, Any]], intent: Dict[str, Any]) -> Dict[str, Any]:
    """Synthèse des résultats des agents."""
    successful_results = [r for r in results if r.get("status") == "success"]
    failed_results = [r for r in results if r.get("status") == "failed"]
    
    synthesis = {
        "totalAgents": len(results),
        "successfulAgents": len(successful_results),
        "failedAgents": len(failed_results),
        "successRate": (len(successful_results) / len(results) * 100) if results else 0,
        "agentsSummary": []
    }
    
    for result in successful_results:
        synthesis["agentsSummary"].append({
            "agent": result.get("agent"),
            "action": result.get("action"),
            "status": "success"
        })
    
    for result in failed_results:
        synthesis["agentsSummary"].append({
            "agent": result.get("agent"),
            "action": result.get("action"),
            "status": "failed",
            "error": result.get("error")
        })
    
    return synthesis


def generate_verdict(results: List[Dict[str, Any]], intent: Dict[str, Any], synthesis: Dict[str, Any]) -> Dict[str, Any]:
    """Génère un verdict basé sur les résultats."""
    success_rate = synthesis.get("successRate", 0)
    
    if success_rate >= 80:
        status = "success"
        message = "Tous les agents ont exécuté leurs tâches avec succès."
    elif success_rate >= 50:
        status = "partial"
        message = "Certains agents ont rencontré des difficultés, mais des résultats ont été obtenus."
    else:
        status = "failed"
        message = "La majorité des agents n'ont pas pu exécuter leurs tâches."
    
    return {
        "status": status,
        "message": message,
        "successRate": success_rate,
        "intent": intent.get("type"),
        "timestamp": datetime.datetime.now().isoformat() + "Z"
    }