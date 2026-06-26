# agents/collector.py
import datetime
import json
import re
from typing import Dict, Any, List, Optional
from django.db import models
from sanka_app.models import KnowledgeNode


# Poids de fiabilité par type de source
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


def run_collector_agent(
    client: Any,
    query: str,
    params: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Agent hybride de collecte de connaissances.

    Collecte depuis :
    - RAG interne (base locale, dictionnaires, archives)
    - Recherche Web (via Gemini google_search)
    - Web scraping sur sites autorisés
    - Génération IA en dernier recours

    Chaque résultat est accompagné de ses métadonnées source complètes.
    """
    if params is None:
        params = {}

    if isinstance(client, dict):
        client = client.get("gemini")

    timestamp = datetime.datetime.now().isoformat() + "Z"
    retrieval_date = datetime.date.today().isoformat()

    # Sources agrégées avec métadonnées complètes
    detailed_sources: List[Dict[str, Any]] = []
    collected_data: List[Dict[str, Any]] = []

    print(f"[Collector] Collecte pour: {query[:100]}...")

    source_type = params.get("source", "all")

    # ── 1. RAG INTERNE ────────────────────────────────────────────────────────
    if source_type in ["all", "database"]:
        db_results = search_local_database(query, params, retrieval_date)
        if db_results:
            collected_data.extend(db_results)
            for r in db_results:
                detailed_sources.append(r["_source_meta"])
            print(f"[Collector] {len(db_results)} résultat(s) RAG interne")

    # ── 2. RECHERCHE WEB ──────────────────────────────────────────────────────
    if source_type in ["all", "online"] and client is not None:
        try:
            web_results = search_web(client, query, params, retrieval_date)
            if web_results:
                collected_data.extend(web_results)
                for r in web_results:
                    detailed_sources.append(r["_source_meta"])
                print(f"[Collector] {len(web_results)} résultat(s) web")
        except Exception as e:
            print(f"[Collector] Erreur recherche web: {e}")

    # ── 3. WEB SCRAPING (si peu de résultats ou données obsolètes) ────────────
    if source_type in ["all", "scraping"] and client is not None:
        if len(collected_data) < 2 or params.get("force_scraping", False):
            try:
                scraped = scrape_authorized_sites(client, query, params, retrieval_date)
                if scraped:
                    collected_data.extend(scraped)
                    for r in scraped:
                        detailed_sources.append(r["_source_meta"])
                    print(f"[Collector] {len(scraped)} résultat(s) scraping")
            except Exception as e:
                print(f"[Collector] Erreur scraping: {e}")

    # ── 4. GÉNÉRATION IA (dernier recours) ────────────────────────────────────
    if not collected_data and client is not None:
        try:
            generated = generate_response(client, query, params, retrieval_date)
            if generated:
                collected_data.append(generated)
                detailed_sources.append(generated["_source_meta"])
                print("[Collector] Réponse générée par l'IA")
        except Exception as e:
            print(f"[Collector] Erreur génération IA: {e}")

    detected_language = detect_language(query, params)

    # Données nettoyées (sans la clé interne _source_meta)
    clean_data = [_strip_meta(item) for item in collected_data]

    # Format sources normalisé pour la réponse finale
    sources_output = _deduplicate_sources(detailed_sources)

    return {
        "success": True,
        "query": query,
        "timestamp": timestamp,
        "totalResults": len(clean_data),
        "collectedData": clean_data,
        "sources": sources_output,
        "detectedLanguage": detected_language,
        "synthesis": synthesize_collected_data(clean_data, query) if clean_data else None,
        # Transmis aux agents suivants pour la traçabilité
        "content": _build_content_summary(clean_data),
    }


# ─────────────────────────────────────────────────────────────────────────────
# FONCTIONS DE COLLECTE
# ─────────────────────────────────────────────────────────────────────────────

def search_local_database(query: str, params: Dict[str, Any], retrieval_date: str) -> List[Dict[str, Any]]:
    """RAG interne : base KnowledgeNode + dictionnaires locaux."""
    results = []
    keywords = extract_keywords(query)

    try:
        q_objects = models.Q(title__icontains=query) | models.Q(description__icontains=query)
        for keyword in keywords[:5]:
            if len(keyword) > 2:
                q_objects |= models.Q(title__icontains=keyword)
                q_objects |= models.Q(description__icontains=keyword)
                q_objects |= models.Q(tags__icontains=keyword)

        if params.get("country"):
            q_objects &= models.Q(country__icontains=params["country"])
        if params.get("validated_only", False):
            q_objects &= models.Q(validation_status="verified")
        if params.get("theme"):
            q_objects &= models.Q(theme__icontains=params["theme"])

        nodes = KnowledgeNode.objects.filter(q_objects).distinct()[:10]
        for node in nodes:
            source_meta = {
                "title": node.title,
                "url": node.source or "",
                "author": node.speaker_profile or "",
                "organization": "Base de savoirs deNOUS AI",
                "publication_date": node.created_at.date().isoformat() if node.created_at else "",
                "retrieval_date": retrieval_date,
                "source_type": "archive",
                "retrieval_method": "RAG",
                "reliability_weight": SOURCE_TYPE_WEIGHTS["archive"],
            }
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
                "createdAt": node.created_at.isoformat() if node.created_at else None,
                "_source_meta": source_meta,
            })

        # Dictionnaires locaux
        try:
            from sanka_app.models import LocalDictionary
            dict_q = (
                models.Q(title__icontains=query)
                | models.Q(description__icontains=query)
                | models.Q(extracted_text__icontains=query)
            )
            for keyword in keywords[:5]:
                if len(keyword) > 2:
                    dict_q |= models.Q(title__icontains=keyword)
                    dict_q |= models.Q(description__icontains=keyword)
                    dict_q |= models.Q(extracted_text__icontains=keyword)

            lang_filter = params.get("language")
            if lang_filter:
                lang_mapping = {"Dioula": "dioula", "Bambara": "bambara", "Mooré": "moore", "Français": "french"}
                dict_lang = lang_mapping.get(lang_filter)
                if dict_lang:
                    dict_q &= models.Q(language=dict_lang)

            dicts = LocalDictionary.objects.filter(dict_q).distinct()[:5]
            for d in dicts:
                source_meta = {
                    "title": d.title,
                    "url": "",
                    "author": "",
                    "organization": "Dictionnaire local deNOUS AI",
                    "publication_date": "",
                    "retrieval_date": retrieval_date,
                    "source_type": "archive",
                    "retrieval_method": "RAG",
                    "reliability_weight": SOURCE_TYPE_WEIGHTS["archive"],
                }
                results.append({
                    "source": "database",
                    "type": "dictionary",
                    "id": d.dictionary_id,
                    "title": d.title,
                    "language": d.language,
                    "description": d.description or "",
                    "content": d.extracted_text or d.description or "",
                    "reliabilityScore": 100,
                    "_source_meta": source_meta,
                })
        except Exception as e:
            print(f"[Collector] Erreur recherche dictionnaire: {e}")

    except Exception as e:
        print(f"[Collector] Erreur recherche locale: {e}")

    return results


def search_web(client: Any, query: str, params: Dict[str, Any], retrieval_date: str) -> List[Dict[str, Any]]:
    """Recherche web ciblée via Gemini google_search."""
    from google.genai import types

    prompt = f"""
Effectue une recherche web approfondie pour répondre à la question suivante :

QUESTION : {query}

Contexte :
- Langue : {params.get('language', 'Français')}
- Pays / Région : {params.get('country', 'Toute l\'Afrique')}
- Thème : {params.get('theme', 'Général')}

Instructions :
1. Priorise les sources africaines fiables (institutions gouvernementales, universités, ONG, presses reconnues).
2. Pour chaque résultat, fournis les métadonnées de source les plus précises possibles.
3. Retourne STRICTEMENT un tableau JSON d'objets avec les clés :
   title, description, content, url, author, organization, publication_date, source_type
   (source_type parmi : institution_gouvernementale, universite, organisation_internationale,
    ong, article_scientifique, presse_reconnue, media, blog, forum, communaute_locale, archive)
"""

    system_instruction = (
        "Tu es l'Agent Collecteur de deNOUS AI. "
        "Tu recherches des informations fiables sur les sujets africains et les savoirs traditionnels. "
        "Tu dois toujours fournir les métadonnées de source complètes."
    )

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.2,
                response_mime_type="application/json",
                tools=[{"google_search": {}}],
            ),
        )

        try:
            items = json.loads(response.text or "[]")
        except json.JSONDecodeError:
            items = []

        if isinstance(items, dict):
            items = items.get("results", [items])

        results = []
        for item in (items if isinstance(items, list) else []):
            raw_type = item.get("source_type", "inconnue")
            weight = SOURCE_TYPE_WEIGHTS.get(raw_type, SOURCE_TYPE_WEIGHTS["inconnue"])
            source_meta = {
                "title": item.get("title", ""),
                "url": item.get("url", ""),
                "author": item.get("author", ""),
                "organization": item.get("organization", ""),
                "publication_date": item.get("publication_date", ""),
                "retrieval_date": retrieval_date,
                "source_type": raw_type,
                "retrieval_method": "Web Search",
                "reliability_weight": weight,
            }
            results.append({
                **item,
                "source": "web",
                "_source_meta": source_meta,
            })
        return results

    except Exception as e:
        print(f"[Collector] Erreur Gemini web search: {e}")
        return []


def scrape_authorized_sites(client: Any, query: str, params: Dict[str, Any], retrieval_date: str) -> List[Dict[str, Any]]:
    """
    Web scraping sur des sites autorisés (institutions africaines, bases académiques).
    Utilise Gemini pour extraire et structurer les contenus.
    """
    from google.genai import types

    # Sites autorisés par domaine thématique
    authorized_domains = [
        "au.int", "uneca.org", "afdb.org", "who.int", "fao.org",
        "worldbank.org", "undp.org", "unesco.org", "africa-union.org",
    ]

    prompt = f"""
Tu dois extraire des informations structurées depuis des sources institutionnelles africaines fiables
pour répondre à la question suivante :

QUESTION : {query}

Sites institutionnels de référence à consulter (via recherche) :
{', '.join(authorized_domains)}

Extrais les contenus textuels, tableaux, statistiques et métadonnées disponibles.
Pour chaque information, précise :
- La source exacte (URL, organisation, auteur, date de publication)
- Le type de contenu : texte, tableau, statistique, document PDF, audio/vidéo

Retourne STRICTEMENT un tableau JSON d'objets avec :
title, content, url, author, organization, publication_date, source_type, content_type
(content_type : texte | tableau | statistique | pdf | multimedia)
"""

    system_instruction = (
        "Tu es l'Agent Collecteur-Scraper de deNOUS AI. "
        "Tu extrais des informations fiables depuis des sources institutionnelles africaines autorisées. "
        "Tu ne collectes jamais de données personnelles ou non autorisées."
    )

    try:
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
            items = json.loads(response.text or "[]")
        except json.JSONDecodeError:
            items = []

        if isinstance(items, dict):
            items = items.get("results", [items])

        results = []
        for item in (items if isinstance(items, list) else []):
            raw_type = item.get("source_type", "institution_gouvernementale")
            weight = SOURCE_TYPE_WEIGHTS.get(raw_type, SOURCE_TYPE_WEIGHTS["inconnue"])
            source_meta = {
                "title": item.get("title", ""),
                "url": item.get("url", ""),
                "author": item.get("author", ""),
                "organization": item.get("organization", ""),
                "publication_date": item.get("publication_date", ""),
                "retrieval_date": retrieval_date,
                "source_type": raw_type,
                "retrieval_method": "Web Scraping",
                "reliability_weight": weight,
            }
            results.append({
                **item,
                "source": "scraping",
                "_source_meta": source_meta,
            })
        return results

    except Exception as e:
        print(f"[Collector] Erreur scraping: {e}")
        return []


def generate_response(client: Any, query: str, params: Dict[str, Any], retrieval_date: str) -> Optional[Dict[str, Any]]:
    """Génère une réponse IA quand aucune source externe n'est disponible."""
    from google.genai import types

    prompt = f"""
Réponds à la question suivante de manière complète et structurée :

QUESTION : {query}

Contexte :
- Langue : {params.get('language', 'Français')}
- Pays : {params.get('country', 'Afrique')}

Retourne un JSON avec : title, description, content, language, country, theme
"""

    system_instruction = "Tu es l'Agent Collecteur de deNOUS AI. Tu génères des réponses sur les sujets africains."

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
            ),
        )
        parsed = json.loads(response.text or "{}")
        source_meta = {
            "title": parsed.get("title", f"Réponse IA: {query[:50]}"),
            "url": "",
            "author": "deNOUS AI",
            "organization": "deNOUS AI",
            "publication_date": retrieval_date,
            "retrieval_date": retrieval_date,
            "source_type": "ia_generee",
            "retrieval_method": "Web Search",
            "reliability_weight": SOURCE_TYPE_WEIGHTS["ia_generee"],
        }
        return {
            "source": "ai_generated",
            "type": "generated_response",
            "title": parsed.get("title", f"Réponse à: {query[:50]}..."),
            "description": parsed.get("description", ""),
            "content": parsed.get("content", ""),
            "language": parsed.get("language", params.get("language", "Français")),
            "country": parsed.get("country", params.get("country", "")),
            "theme": parsed.get("theme", params.get("theme", "Général")),
            "reliabilityScore": 55,
            "_source_meta": source_meta,
        }
    except Exception as e:
        print(f"[Collector] Erreur génération: {e}")
        return None


# ─────────────────────────────────────────────────────────────────────────────
# UTILITAIRES
# ─────────────────────────────────────────────────────────────────────────────

def extract_keywords(query: str) -> List[str]:
    stop_words = {
        "le", "la", "les", "un", "une", "des", "pour", "par", "sur", "dans",
        "avec", "sans", "comment", "pourquoi", "quel", "quelle", "quels",
        "quelles", "est", "sont", "était", "étaient", "sera", "seront",
        "je", "tu", "il", "elle", "nous", "vous", "ils", "elles",
        "ce", "cet", "cette", "ces", "mon", "ton", "son", "ma", "ta", "sa",
    }
    query_clean = re.sub(r"[^\w\s]", " ", query.lower())
    words = query_clean.split()
    return [w for w in words if w not in stop_words and len(w) > 2][:10]


def detect_language(query: str, params: Dict[str, Any]) -> str:
    if params.get("language"):
        return params["language"]
    query_lower = query.lower()
    indicators = {
        "Bambara": ["i", "ka", "la", "ma", "na", "ye", "ba", "ni", "sogo", "den", "cogo", "nyini", "fɛ"],
        "Mooré": ["wa", "kibare", "yaa", "tɩ", "bõnd", "daare", "yacouba", "sawadogo"],
    }
    scores = {lang: sum(1 for w in query_lower.split() if w in kws) for lang, kws in indicators.items()}
    scores = {k: v for k, v in scores.items() if v > 0}
    return max(scores, key=scores.get) if scores else "Français"


def synthesize_collected_data(data: List[Dict[str, Any]], query: str) -> Optional[Dict[str, Any]]:
    if not data:
        return None
    themes: Dict[str, int] = {}
    countries: set = set()
    languages: set = set()
    sources: set = set()
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
        "summary": f"{len(data)} résultat(s) trouvé(s) pour : {query}",
        "themes": [{"name": k, "count": v} for k, v in sorted(themes.items(), key=lambda x: x[1], reverse=True)],
        "countries": list(countries),
        "languages": list(languages),
        "sources": list(sources),
        "totalResults": len(data),
    }


def _strip_meta(item: Dict[str, Any]) -> Dict[str, Any]:
    return {k: v for k, v in item.items() if k != "_source_meta"}


def _deduplicate_sources(sources: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    seen_urls: set = set()
    unique = []
    for s in sources:
        key = s.get("url") or s.get("title", "")
        if key not in seen_urls:
            seen_urls.add(key)
            unique.append(s)
    return unique


def _build_content_summary(data: List[Dict[str, Any]]) -> str:
    parts = []
    for item in data[:5]:
        title = item.get("title", "")
        content = item.get("content") or item.get("description") or ""
        if title or content:
            parts.append(f"[{title}] {content[:300]}")
    return "\n\n".join(parts)
