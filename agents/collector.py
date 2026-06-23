# sanka_app/agents/collector.py
import datetime
import json
import re
from typing import Dict, Any, List, Optional
from django.db import models
from sanka_app.models import KnowledgeNode


def run_collector_agent(
    client: Any,
    query: str,
    params: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Agent de collecte - Récupère des informations depuis différentes sources.
    
    Args:
        client: Client Google Gemini (ou None)
        query: La question de l'utilisateur
        params: Paramètres de collecte (source, language, country, etc.)
    
    Returns:
        dict: Données collectées
    """
    if params is None:
        params = {}
    
    if isinstance(client, dict):
        client = client.get("gemini")
    
    timestamp = datetime.datetime.now().isoformat() + "Z"
    sources = []
    collected_data = []
    
    print(f"[Collector] Collecte d'informations pour: {query[:100]}...")
    
    source_type = params.get("source", "all")
    
    # 1. COLLECTE DEPUIS LA BASE DE DONNÉES
    if source_type in ["all", "database"]:
        db_results = search_local_database(query, params)
        if db_results:
            sources.append({
                "type": "database",
                "count": len(db_results),
                "description": f"{len(db_results)} résultat(s) trouvé(s) dans la base de savoirs"
            })
            collected_data.extend(db_results)
            print(f"[Collector] {len(db_results)} résultat(s) trouvé(s) en base de données")
    
    # 2. COLLECTE EN LIGNE (via Gemini)
    if source_type in ["all", "online"] and client is not None:
        try:
            online_results = search_online(client, query, params)
            if online_results:
                sources.append({
                    "type": "online",
                    "count": len(online_results),
                    "description": f"{len(online_results)} résultat(s) trouvé(s) en ligne"
                })
                collected_data.extend(online_results)
                print(f"[Collector] {len(online_results)} résultat(s) trouvé(s) en ligne")
        except Exception as e:
            print(f"[Collector] Erreur recherche en ligne: {e}")
    
    # 3. GÉNÉRATION IA (si aucune source trouvée)
    if not collected_data and client is not None:
        try:
            generated = generate_response(client, query, params)
            if generated:
                sources.append({
                    "type": "ai_generated",
                    "count": 1,
                    "description": "Réponse générée par l'IA"
                })
                collected_data.append(generated)
                print("[Collector] Réponse générée par l'IA")
        except Exception as e:
            print(f"[Collector] Erreur génération IA: {e}")
    
    # 4. FORMATAGE DE LA RÉPONSE
    detected_language = detect_language(query, params)
    
    return {
        "success": True,
        "query": query,
        "timestamp": timestamp,
        "sources": sources,
        "totalResults": len(collected_data),
        "collectedData": collected_data,
        "detectedLanguage": detected_language,
        "synthesis": synthesize_collected_data(collected_data, query) if collected_data else None
    }


def search_local_database(query: str, params: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Recherche dans la base de données locale."""
    results = []
    keywords = extract_keywords(query)
    
    try:
        # Construction de la requête
        q_objects = models.Q(title__icontains=query) | models.Q(description__icontains=query)
        
        # Ajouter les mots-clés
        for keyword in keywords[:5]:
            if len(keyword) > 2:
                q_objects |= models.Q(title__icontains=keyword)
                q_objects |= models.Q(description__icontains=keyword)
                q_objects |= models.Q(tags__icontains=keyword)
        
        # Filtrer par pays
        country = params.get("country")
        if country:
            q_objects &= models.Q(country__icontains=country)
        
        # Rechercher dans tous les savoirs (la traduction est gérée par l'agent d'exploitation)
        # language = params.get("language")
        # if language:
        #     q_objects &= models.Q(language__icontains=language)
        
        # Filtrer par validation
        if params.get("validated_only", False):
            q_objects &= models.Q(validation_status="verified")
        
        # Filtrer par thème
        theme = params.get("theme")
        if theme:
            q_objects &= models.Q(theme__icontains=theme)
        
        nodes = KnowledgeNode.objects.filter(q_objects).distinct()[:10]
        
        for node in nodes:
            results.append({
                "source": "database",
                "type": "knowledge_node",
                "id": node.node_id,
                "title": node.title,
                "description": node.description,
                "content": node.translated_content or node.raw_content or node.description or "",
                "language": node.language,
                "country": node.country,
                "region": node.region,
                "theme": node.theme,
                "category": node.category,
                "reliabilityScore": node.reliability_score,
                "validationStatus": node.validation_status,
                "sourceOriginal": node.source,
                "speakerProfile": node.speaker_profile,
                "createdAt": node.created_at.isoformat() if node.created_at else None
            })

        # Recherche dans les dictionnaires locaux
        try:
            from sanka_app.models import LocalDictionary
            dict_q = models.Q(title__icontains=query) | models.Q(description__icontains=query) | models.Q(extracted_text__icontains=query)
            for keyword in keywords[:5]:
                if len(keyword) > 2:
                    dict_q |= models.Q(title__icontains=keyword)
                    dict_q |= models.Q(description__icontains=keyword)
                    dict_q |= models.Q(extracted_text__icontains=keyword)
            
            lang_filter = params.get("language")
            if lang_filter:
                lang_mapping = {
                    "Dioula": "dioula",
                    "Bambara": "bambara",
                    "Mooré": "moore",
                    "Français": "french"
                }
                dict_lang = lang_mapping.get(lang_filter)
                if dict_lang:
                    dict_q &= models.Q(language=dict_lang)
            
            dicts = LocalDictionary.objects.filter(dict_q).distinct()[:5]
            for d in dicts:
                results.append({
                    "source": "database",
                    "type": "dictionary",
                    "id": d.dictionary_id,
                    "title": d.title,
                    "language": d.language,
                    "description": d.description or "",
                    "content": d.extracted_text or d.description or "",
                    "reliabilityScore": 100
                })
                print(f"[Collector] Dictionnaire trouvé: {d.title}")
        except Exception as e:
            print(f"[Collector] Erreur recherche dictionnaire: {e}")
            
    except Exception as e:
        print(f"[Collector] Erreur recherche locale: {e}")
    
    return results


def search_online(client: Any, query: str, params: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Recherche en ligne via Gemini."""
    from google.genai import types
    
    prompt = f"""
    Recherche des informations pertinentes pour la question suivante:
    
    QUESTION: {query}
    
    Contexte:
    - Langue: {params.get('language', 'Français')}
    - Pays: {params.get('country', 'Toute l\'Afrique')}
    - Thème: {params.get('theme', 'Général')}
    
    Instructions:
    1. Fournis des informations structurées et fiables
    2. Priorise les sources et connaissances africaines
    3. Retourne un JSON avec les clés: title, description, content, source, language, country, theme
    
    Retourne un tableau JSON d'objets.
    """
    
    system_instruction = """
    Tu es l'Agent Collecteur de deNOUS AI.
    Tu recherches des informations sur les sujets liés à l'Afrique et aux savoirs traditionnels.
    Tu dois prioriser les sources africaines authentiques.
    """
    
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                tools=[{"google_search": {}}]
            )
        )
        
        parsed = json.loads(response.text or "[]")
        
        if isinstance(parsed, list):
            return parsed
        elif isinstance(parsed, dict) and "results" in parsed:
            return parsed["results"]
        elif isinstance(parsed, dict):
            return [parsed]
        
        return []
    
    except Exception as e:
        print(f"[Collector] Erreur Gemini: {e}")
        return []


def generate_response(client: Any, query: str, params: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Génère une réponse IA quand aucune source n'est trouvée."""
    from google.genai import types
    
    prompt = f"""
    Réponds à la question suivante de manière complète et structurée:
    
    QUESTION: {query}
    
    Contexte:
    - Langue: {params.get('language', 'Français')}
    - Persona: {params.get('persona', 'chercheur')}
    - Pays: {params.get('country', 'Afrique')}
    
    Retourne un JSON avec: title, description, content, source, language, country, theme
    """
    
    system_instruction = """
    Tu es l'Agent Collecteur de deNOUS AI.
    Tu génères des réponses informatives sur les sujets africains.
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
            "source": "ai_generated",
            "type": "generated_response",
            "title": parsed.get("title", f"Réponse à: {query[:50]}..."),
            "description": parsed.get("description", ""),
            "content": parsed.get("content", ""),
            "language": parsed.get("language", params.get("language", "Français")),
            "country": parsed.get("country", params.get("country", "")),
            "theme": parsed.get("theme", params.get("theme", "Général")),
            "reliabilityScore": 60
        }
    
    except Exception as e:
        print(f"[Collector] Erreur génération: {e}")
        return None


def extract_keywords(query: str) -> List[str]:
    """Extrait les mots-clés d'une requête."""
    stop_words = {
        "le", "la", "les", "un", "une", "des", "pour", "par", "sur", "dans",
        "avec", "sans", "comment", "pourquoi", "quel", "quelle", "quels",
        "quelles", "est", "sont", "était", "étaient", "sera", "seront",
        "je", "tu", "il", "elle", "nous", "vous", "ils", "elles",
        "ce", "cet", "cette", "ces", "mon", "ton", "son", "ma", "ta", "sa"
    }
    
    import re
    query_clean = re.sub(r'[^\w\s]', ' ', query.lower())
    words = query_clean.split()
    keywords = [w for w in words if w not in stop_words and len(w) > 2]
    
    return keywords[:10]


def detect_language(query: str, params: Dict[str, Any]) -> str:
    """Détecte la langue de la requête."""
    if params.get("language"):
        return params["language"]
    
    query_lower = query.lower()
    
    indicators = {
        "Bambara": ["i", "ka", "la", "ma", "na", "ye", "ba", "ni", "sogo", "den", "cogo", "nyini", "fɛ"],
        "Mooré": ["wa", "kibare", "yaa", "tɩ", "bõnd", "daare", "yacouba", "sawadogo"],
    }
    
    scores = {}
    for lang, keywords in indicators.items():
        score = sum(1 for word in query_lower.split() if word in keywords)
        if score > 0:
            scores[lang] = score
    
    if scores:
        return max(scores, key=scores.get)
    
    return "Français"


def synthesize_collected_data(data: List[Dict[str, Any]], query: str) -> Optional[Dict[str, Any]]:
    """Synthèse des données collectées."""
    if not data:
        return None
    
    themes = {}
    countries = set()
    languages = set()
    sources = set()
    
    for item in data:
        theme = item.get("theme", "Général")
        themes[theme] = themes.get(theme, 0) + 1
        
        if item.get("country"):
            countries.add(item["country"])
        
        if item.get("language"):
            languages.add(item["language"])
        
        if item.get("source"):
            sources.add(item["source"])
    
    return {
        "summary": f"{len(data)} résultat(s) trouvé(s) pour: {query}",
        "themes": [{"name": k, "count": v} for k, v in sorted(themes.items(), key=lambda x: x[1], reverse=True)],
        "countries": list(countries),
        "languages": list(languages),
        "sources": list(sources),
        "totalResults": len(data)
    }