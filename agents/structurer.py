# sanka_app/agents/structurer.py
import datetime
import json
import random
import re
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field


class StructurerNode(BaseModel):
    title: str = Field(..., description="Un titre court, respectueux et digne pour ce savoir.")
    category: str = Field(..., description="Catégorie parmi: orale, traditionnelle, historique, administrative, universitaire, audiovisuelle, statistique")
    theme: str = Field(..., description="Thème clé parmi: agriculture, health, education, culture, economy, governance, environment, history, linguistics, craft, alimentation")
    description: str = Field(..., description="Un résumé fidèle, fluide et soigné d'au moins 3-4 phrases expliquant rigoureusement ce savoir.")
    language: str = Field(..., description="Langue africaine ou internationale d'expression d'origine.")
    region: str = Field(..., description="Lieu exact, district ou village d'origine.")
    country: str = Field(..., description="Pays africain concerné.")
    ethnolinguisticGroup: str = Field(..., description="Groupe culturel ou ethnique d'où émane ce savoir.")
    period: str = Field(..., description="Époque estimée (ex: Précoloniale, XIXe, Ancestrale, Contemporaine)")
    reliabilityScore: int = Field(..., description="Score de fiabilité entre 10 et 100 fondé sur la solidité culturelle de la source.")
    source: str = Field(..., description="Nom complet du sage, conteur, ou archive écrite de référence.")
    sourceType: str = Field(..., description="Type de source (témoignage humain, archives écrites, publication universitaire).")
    consentProvided: bool = Field(..., description="Si le consentement Nagoya/communautaire semble acquis d'après les détails.")
    details: str = Field(..., description="Faits et vocabulaire locaux, secrets d'usage ou détails approfondis.")


def run_structurer_agent(
    client: Any,
    query_or_data: Any,
    params: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Agent de Structuration - Transforme les données collectées en structure organisée.

    Signature normalisée : (client, query_or_data, params) pour compatibilité
    avec le Coordinateur.

    Args:
        client: Client Google Gemini (ou None)
        query_or_data: Soit une requête texte (str), soit des données (dict/list)
                       issues d'un agent précédent.
        params: Paramètres de structuration (format, language, theme, ...)

    Returns:
        dict: Données structurées
    """
    if params is None:
        params = {}

    if isinstance(client, dict):
        client = client.get("gemini")

    # ------------------------------------------------------------------
    # CAS 1 : query_or_data est une simple chaîne de caractères
    #          (le Coordinateur a transmis la user_query directement).
    #          On structure en créant un item minimal depuis la query.
    # ------------------------------------------------------------------
    if isinstance(query_or_data, str):
        minimal_item = {
            "title": query_or_data[:80],
            "description": query_or_data,
            "content": query_or_data,
            "source": "user_query",
            "theme": params.get("theme", "Général"),
            "language": params.get("language", "Français"),
            "country": params.get("country", ""),
        }
        structured = structure_item(client, minimal_item, params)
        return {
            "success": True,
            "type": "single",
            "item": structured,
            "items": [structured],
            "timestamp": datetime.datetime.now().isoformat() + "Z",
            "answerText": structured.get("description", ""),
        }

    data = query_or_data

    # ------------------------------------------------------------------
    # CAS 2 : liste de données collectées
    # ------------------------------------------------------------------
    if isinstance(data, list):
        structured_items = []
        for item in data:
            structured = structure_item(client, item, params)
            if structured:
                structured_items.append(structured)

        return {
            "success": True,
            "type": "collection",
            "count": len(structured_items),
            "items": structured_items,
            "timestamp": datetime.datetime.now().isoformat() + "Z",
            "synthesis": synthesize_structured_data(structured_items, params),
            "answerText": f"{len(structured_items)} élément(s) structuré(s).",
        }

    # ------------------------------------------------------------------
    # CAS 3 : un seul élément dict
    # ------------------------------------------------------------------
    elif isinstance(data, dict):
        structured = structure_item(client, data, params)
        return {
            "success": True,
            "type": "single",
            "item": structured,
            "items": [structured] if structured else [],
            "timestamp": datetime.datetime.now().isoformat() + "Z",
            "answerText": structured.get("description", "") if structured else "",
        }

    else:
        return {
            "success": False,
            "error": "Format de données non supporté",
            "timestamp": datetime.datetime.now().isoformat() + "Z",
            "answerText": "",
        }


def structure_item(client: Any, item: Dict[str, Any], params: Dict[str, Any]) -> Dict[str, Any]:
    """Structure un élément individuel."""

    # Si c'est déjà un nœud de connaissance
    if item.get("type") == "knowledge_node":
        return {
            "id": item.get("id") or generate_id(item.get("title", "node")),
            "title": item.get("title", "Sans titre"),
            "description": item.get("description", ""),
            "content": item.get("content", ""),
            "category": item.get("category") or params.get("category", "orale"),
            "theme": item.get("theme") or params.get("theme", "culture"),
            "language": item.get("language") or params.get("language", "Français"),
            "country": item.get("country") or params.get("country", ""),
            "region": item.get("region") or params.get("region", ""),
            "ethnolinguisticGroup": item.get("ethnolinguisticGroup") or params.get("ethnolinguisticGroup", ""),
            "period": item.get("period") or params.get("period", "Contemporaine"),
            "reliabilityScore": item.get("reliabilityScore", 50),
            "source": item.get("sourceOriginal") or item.get("source", ""),
            "sourceType": item.get("sourceType") or "tradition orale",
            "consentProvided": item.get("consentProvided", True),
            "speakerProfile": item.get("speakerProfile", {}),
            "details": item.get("details", item.get("description", "")),
            "createdAt": item.get("createdAt") or datetime.datetime.now().isoformat()
        }

    # Si c'est une réponse générée par l'IA
    if item.get("source") == "ai_generated":
        return {
            "id": generate_id(item.get("title", "generated")),
            "title": item.get("title", "Sans titre"),
            "description": item.get("description", ""),
            "content": item.get("content", ""),
            "category": "ai_generated",
            "theme": item.get("theme") or params.get("theme", "general"),
            "language": item.get("language") or params.get("language", "Français"),
            "country": item.get("country") or params.get("country", ""),
            "region": params.get("region", ""),
            "ethnolinguisticGroup": params.get("ethnolinguisticGroup", ""),
            "period": "Contemporaine",
            "reliabilityScore": 60,
            "source": "deNOUS AI",
            "sourceType": "ia_generative",
            "consentProvided": True,
            "speakerProfile": {},
            "details": item.get("content", ""),
            "createdAt": datetime.datetime.now().isoformat()
        }

    # Utiliser Gemini pour structurer
    if client is not None:
        try:
            return structure_with_gemini(client, item, params)
        except Exception as e:
            print(f"[Structurer] Erreur Gemini: {e}")

    # Fallback
    return {
        "id": generate_id(item.get("title", "fallback")),
        "title": item.get("title", "Sans titre"),
        "description": item.get("description", ""),
        "content": item.get("content", ""),
        "category": params.get("category", "orale"),
        "theme": params.get("theme", "culture"),
        "language": params.get("language", "Français"),
        "country": params.get("country", ""),
        "region": params.get("region", ""),
        "ethnolinguisticGroup": params.get("ethnolinguisticGroup", ""),
        "period": params.get("period", "Contemporaine"),
        "reliabilityScore": 50,
        "source": params.get("source", "deNOUS AI"),
        "sourceType": "fallback",
        "consentProvided": True,
        "speakerProfile": {},
        "details": item.get("content", item.get("description", "")),
        "createdAt": datetime.datetime.now().isoformat()
    }


def structure_with_gemini(client: Any, item: Dict[str, Any], params: Dict[str, Any]) -> Dict[str, Any]:
    """Structure un élément avec Gemini."""
    from google.genai import types

    prompt = f"""
    Structure les données suivantes en un objet organisé selon le schéma de deNOUS AI:
    
    DONNÉES BRUTES:
    {json.dumps(item, indent=2, ensure_ascii=False)}
    
    INSTRUCTIONS:
    1. Extrais les informations clés
    2. Organise-les selon le schéma standard
    3. Retourne un JSON valide avec tous les champs requis
    """

    system_instruction = """
    Tu es l'Agent Structurateur de deNOUS AI.
    Tu organises les données collectées selon un schéma standard.
    Tu dois retourner un JSON avec: title, category, theme, description, language, region, country, ethnolinguisticGroup, period, reliabilityScore, source, sourceType, consentProvided, details
    """

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json"
            )
        )

        parsed = json.loads(response.text or "{}")

        return {
            "id": generate_id(parsed.get("title", "structured")),
            "title": parsed.get("title", item.get("title", "Sans titre")),
            "description": parsed.get("description", item.get("description", "")),
            "content": item.get("content", ""),
            "category": parsed.get("category", params.get("category", "orale")),
            "theme": parsed.get("theme", params.get("theme", "culture")),
            "language": parsed.get("language", params.get("language", "Français")),
            "country": parsed.get("country", params.get("country", "")),
            "region": parsed.get("region", params.get("region", "")),
            "ethnolinguisticGroup": parsed.get("ethnolinguisticGroup", params.get("ethnolinguisticGroup", "")),
            "period": parsed.get("period", params.get("period", "Contemporaine")),
            "reliabilityScore": parsed.get("reliabilityScore", 50),
            "source": parsed.get("source", params.get("source", "deNOUS AI")),
            "sourceType": parsed.get("sourceType", "tradition orale"),
            "consentProvided": parsed.get("consentProvided", True),
            "speakerProfile": {},
            "details": parsed.get("details", item.get("content", item.get("description", ""))),
            "createdAt": datetime.datetime.now().isoformat()
        }

    except Exception as e:
        print(f"[Structurer] Erreur Gemini structure: {e}")
        raise


def generate_id(title: str) -> str:
    """Génère un ID unique à partir d'un titre."""
    base = re.sub(r'[^a-z0-9]+', '-', title.lower())
    base = re.sub(r'(^-|-$)', '', base)
    return f"{base}-{random.randint(0, 999)}"


def synthesize_structured_data(structured_items: List[Dict[str, Any]], params: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Synthèse des données structurées."""
    if not structured_items:
        return None

    themes = {}
    categories = {}
    languages = set()
    countries = set()

    for item in structured_items:
        theme = item.get("theme", "Général")
        themes[theme] = themes.get(theme, 0) + 1

        category = item.get("category", "Général")
        categories[category] = categories.get(category, 0) + 1

        if item.get("language"):
            languages.add(item["language"])

        if item.get("country"):
            countries.add(item["country"])

    return {
        "totalItems": len(structured_items),
        "themes": [{"name": k, "count": v} for k, v in sorted(themes.items(), key=lambda x: x[1], reverse=True)],
        "categories": [{"name": k, "count": v} for k, v in sorted(categories.items(), key=lambda x: x[1], reverse=True)],
        "languages": list(languages),
        "countries": list(countries),
        "format": params.get("format", "standard")
    }
