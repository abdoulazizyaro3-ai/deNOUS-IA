# sanka_app/agents/vocal.py
import datetime
import json
from typing import Dict, Any, List, Optional
from sanka_app.agents.collector import search_local_database


def run_vocal_agent(
    client: Any,
    query: str,
    params: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Agent Vocal - Gère les interactions vocales.
    
    Args:
        client: Client Google Gemini (ou None)
        query: La question de l'utilisateur
        params: Paramètres (language, persona, etc.)
    
    Returns:
        dict: Réponse vocale
    """
    if params is None:
        params = {}
    
    if isinstance(client, dict):
        client = client.get("gemini")
    
    language = params.get("language", "Français")
    persona = params.get("persona", "citizen")
    
    print(f"[Vocal] Traitement de la requête vocale: {query[:100]}...")
    
    # Récupérer les données structurées si disponibles
    structured_data = params.get("structured_data", [])
    
    # ACCÈS DIRECT À LA BASE DE DONNÉES SI NÉCESSAIRE
    if not structured_data:
        print("[Vocal] Accès direct à la base de données...")
        try:
            db_results = search_local_database(query, params)
            if db_results:
                structured_data.extend(db_results)
                print(f"[Vocal] {len(db_results)} résultat(s) trouvé(s) en base de données.")
        except Exception as e:
            print(f"[Vocal] Erreur lors de la recherche dans la base de données: {e}")
    
    # Si pas de client Gemini
    if client is None:
        return {
            "answerText": generate_vocal_fallback(query, language, persona),
            "detectedLanguage": language,
            "isSimulated": True,
            "timestamp": datetime.datetime.now().isoformat() + "Z"
        }
    
    # Construction du prompt vocal
    prompt = build_vocal_prompt(query, language, persona, structured_data)
    
    system_instruction = f"""
    Tu es l'Agent Vocal de deNOUS AI, un expert linguiste natif et parfaitement bilingue. Tu dois générer une réponse vocale directe pour l'utilisateur.
    
    Règles CRITIQUES pour la réponse vocale :
    1. EXPERTISE LINGUISTIQUE : Tu maîtrises parfaitement la langue demandée ({language}). Comprends la question de l'utilisateur même si elle contient des erreurs, des approximations ou si elle est dans un dialecte local.
    2. MULTIDISCIPLINAIRE : Tu n'es pas limité aux seuls savoirs africains. Tu réponds à TOUTES les questions dans tous les domaines en utilisant tes connaissances générales si aucune donnée locale n'est disponible.
    3. RÉPONSE DIRECTE ET SANS INTRODUCTION : Réponds directement à la question de l'utilisateur. Ne fais pas d'introduction inutile comme "C'est une excellente question". Donne directement la réponse pratique.
    4. SALUTATIONS : Si l'utilisateur formule une salutation, réponds uniquement par une salutation chaleureuse et brève dans la langue demandée.
    5. LANGUE UNIQUE : Réponds ENTIÈREMENT et EXCLUSIVEMENT dans la langue demandée ({language}). Ne rajoute AUCUNE traduction en français, AUCUN préfixe, ni de note explicative à la fin. Pense et rédige comme un locuteur natif de cette langue.
    6. CONVERSATIONNEL : Rédige dans un style purement parlé, fluide et naturel (maximum 2 à 3 phrases courtes). N'utilise jamais de listes, de puces, de numéros ou de termes techniques.
    7. ZÉRO SYMBOLISATION : N'utilise AUCUN caractère de formatage (pas d'astérisques '*', pas de tirets '-', pas de hashtags '#', pas de crochets, pas de parenthèses). Rédige uniquement avec des lettres et de la ponctuation standard.
    """
    
    try:
        from google.genai import types
        
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.4,
            ),
        )
        
        answer_text = response.text or "Je n'ai pas la réponse à cette question."
        
        return {
            "answerText": answer_text,
            "detectedLanguage": language,
            "isSimulated": False,
            "timestamp": datetime.datetime.now().isoformat() + "Z"
        }
    
    except Exception as e:
        print(f"[Vocal] Erreur: {e}")
        return {
            "answerText": "Je n'ai pas la réponse à cette question.",
            "detectedLanguage": language,
            "isSimulated": True,
            "error": str(e),
            "timestamp": datetime.datetime.now().isoformat() + "Z"
        }


def build_vocal_prompt(query: str, language: str, persona: str, structured_data: List[Dict[str, Any]]) -> str:
    """Construit le prompt pour une réponse vocale."""
    structured_summary = json.dumps(structured_data, ensure_ascii=False, indent=2) if structured_data else "Aucune information structurée disponible."
    
    additional_context = ""
    language_lower = language.lower()
    
    try:
        import os
        if language_lower in ["mooré", "moore", "mòoré"]:
            wiki_path = os.path.join(os.path.dirname(__file__), "resources", "moore_wiki.md")
            if os.path.exists(wiki_path):
                with open(wiki_path, "r", encoding="utf-8") as f:
                    wiki_content = f.read()
                    additional_context += f"\n\n[SOURCE LINGUISTIQUE MOORÉ - REFERENCE WIKIPEDIA]\nUtilise cette documentation pour comprendre et formuler correctement le Mooré :\n{wiki_content}\n"
        elif language_lower in ["dioula", "jula", "dyula"]:
            wiki_path = os.path.join(os.path.dirname(__file__), "resources", "dioula_wiki.md")
            if os.path.exists(wiki_path):
                with open(wiki_path, "r", encoding="utf-8") as f:
                    wiki_content = f.read()
                    additional_context += f"\n\n[SOURCE LINGUISTIQUE DIOULA - REFERENCE WIKIPEDIA]\nUtilise cette documentation pour comprendre et formuler correctement le Dioula :\n{wiki_content}\n"
        elif language_lower in ["bambara", "bamanankan"]:
            wiki_path = os.path.join(os.path.dirname(__file__), "resources", "bambara_wiki.md")
            if os.path.exists(wiki_path):
                with open(wiki_path, "r", encoding="utf-8") as f:
                    wiki_content = f.read()
                    additional_context += f"\n\n[SOURCE LINGUISTIQUE BAMBARA - REFERENCE WIKIPEDIA]\nUtilise cette documentation pour comprendre et formuler correctement le Bambara :\n{wiki_content}\n"
    except Exception as e:
        print(f"[Vocal] Erreur lecture ressource linguistique pour {language}: {e}")

    try:
        from sanka_app.models import LocalAudio
        from django.db.models import Q
        
        # Mapping simple pour normaliser la recherche de langue
        mapped_lang = language_lower
        if mapped_lang in ["mooré", "mòoré"]: mapped_lang = "moore"
        if mapped_lang in ["jula", "dyula"]: mapped_lang = "dioula"
        if mapped_lang in ["bamanankan"]: mapped_lang = "bambara"

        audios = LocalAudio.objects.filter(
            Q(language__icontains=mapped_lang) | Q(language__icontains=language_lower)
        )
        
        if audios.exists():
            additional_context += f"\n\n[INFORMATIONS AUDIO LOCALES POUR {language.upper()}]\n"
            additional_context += "Utilise ces informations provenant des enregistrements audios locaux (accents, dialectes, vocabulaire) :\n"
            for audio in audios:
                audio_desc = f"- Titre: {audio.title}"
                if audio.dialect:
                    audio_desc += f" (Dialecte: {audio.dialect})"
                if audio.description:
                    audio_desc += f"\n  Description: {audio.description}"
                if audio.transcript:
                    audio_desc += f"\n  Transcription/Notes: {audio.transcript}"
                additional_context += f"{audio_desc}\n"
    except Exception as e:
        print(f"[Vocal] Erreur lors de la récupération des audios locaux: {e}")

            
    return f"""
[CONTEXTE DE CONNAISSANCE (Optionnel)]
{structured_summary}

[CONTEXTE LINGUISTIQUE ET CULTUREL (Optionnel)]
{additional_context}

--------------------------------------------------
TA TÂCHE PRINCIPALE :
Tu es l'Agent Vocal de deNOUS AI. Tu es un expert linguiste et un locuteur natif de la langue : {language}. 
Tu dois répondre de manière naturelle, chaleureuse et conversationnelle, comme si tu parlais à un membre de ta communauté.
IMPORTANT: Prends le temps d'analyser la question. Si elle est dans un dialecte local, comprends son sens profond. Formule ta réponse mentalement, puis traduis-la de façon idiomatique et naturelle en {language}.

Langue de réponse exigée : {language}
Persona : {persona}

Voici la question de l'utilisateur à laquelle tu dois répondre DIRECTEMENT, EXCLUSIVEMENT EN {language.upper()}, et de façon pertinente :
"{query}"
"""


def generate_vocal_fallback(query: str, language: str, persona: str) -> str:
    """Génère une réponse vocale de fallback."""
    return f"Je comprends votre question sur : {query[:100]}. Malheureusement, je ne dispose pas de connexion à l'IA pour vous répondre en ce moment. Veuillez réessayer plus tard."