import json
import base64
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from google import genai
from google.genai import types
from django.conf import settings
import os

from agents.collector import search_local_database
from asgiref.sync import sync_to_async

class VocalAgentConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        await self.accept()
        
        # Configuration de Gemini Live
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            print("[VocalConsumer] GEMINI_API_KEY manquante.")
            await self.close()
            return
            
        # Forcer le SDK à ignorer GOOGLE_API_KEY globale s'il y en a une expirée
        if "GOOGLE_API_KEY" in os.environ:
            del os.environ["GOOGLE_API_KEY"]
            
        self.client = genai.Client(api_key=api_key, http_options={'api_version': 'v1alpha'})
        
        # Tools configuration
        self.tools = [
            {
                "function_declarations": [
                    {
                        "name": "search_local_database",
                        "description": "Recherche dans la base de données locale des savoirs africains.",
                        "parameters": {
                            "type": "OBJECT",
                            "properties": {
                                "query": {"type": "STRING", "description": "Mots-clés de la recherche"}
                            },
                            "required": ["query"]
                        }
                    }
                ]
            },
            {"google_search": {}}
        ]

        self.listen_task = asyncio.create_task(self.listen_to_gemini())
        print("[VocalConsumer] Initialisé.")

    async def disconnect(self, close_code):
        try:
            if hasattr(self, 'listen_task'):
                self.listen_task.cancel()
            if hasattr(self, 'gemini_session') and self.gemini_session:
                await self.gemini_session.close()
        except Exception as e:
            print(f"[VocalConsumer] Erreur lors de la déconnexion: {e}")
        print("[VocalConsumer] Déconnecté.")

    async def receive(self, text_data=None, bytes_data=None):
        try:
            if text_data:
                data = json.loads(text_data)
                msg_type = data.get("type")
                
                if msg_type == "audio":
                    b64_audio = data.get("data")
                    if b64_audio and hasattr(self, 'gemini_session'):
                        audio_bytes = base64.b64decode(b64_audio)
                        await self.gemini_session.send_realtime_input(
                            audio={"mime_type": "audio/pcm;rate=16000", "data": audio_bytes}
                        )
                elif msg_type == "end_turn":
                    print("[VocalConsumer] Fin de l'enregistrement de l'utilisateur, signal envoyé.", flush=True)
                    if hasattr(self, 'gemini_session'):
                        await self.gemini_session.send_client_content(turn_complete=True)
                elif msg_type == "interrupt":
                    print("[VocalConsumer] Interruption reçue.")
        except Exception as e:
            print(f"[VocalConsumer] Erreur dans receive: {e}", flush=True)

    async def listen_to_gemini(self):
        system_instruction = (
            "Tu es deNOUS AI, l'assistant vocal intelligent du projet deNOUS. "
            "L'année actuelle est 2026. "
            "Tu réponds toujours de manière concise, chaleureuse et naturelle. "
            "Ne dis jamais que tu es Gemini ou que tu as été développé par Google. "
            "Tu as accès à une base de connaissances locale sur les savoirs africains via tes outils (système RAG). "
            "Tu dois OBLIGATOIREMENT utiliser l'outil 'search_local_database' pour rechercher des informations précises avant de répondre à une question factuelle. "
            "Tu parles couramment et tu comprends les langues locales : Dioula, Mooré et Bambara. "
            "Si l'utilisateur te parle dans l'une de ces langues locales, tu DOIS lui répondre dans cette même langue locale. "
            "Pour t'aider avec le vocabulaire et la grammaire exacts, tu es autorisé à utiliser ton outil google_search pour consulter les ressources linguistiques suivantes fournies par l'utilisateur : "
            "https://fr.wikipedia.org/wiki/Moor%C3%A9 , https://fr.wikipedia.org/wiki/Dioula_(langue) et https://fr.wikipedia.org/wiki/Bambara."
        )
        
        try:
            async with self.client.aio.live.connect(
                model="gemini-2.0-flash",
                config={
                    "response_modalities": ["AUDIO"], 
                    "tools": self.tools,
                    "system_instruction": system_instruction,
                    "speech_config": {
                        "voice_config": {
                            "prebuilt_voice_config": {
                                "voice_name": "Aoede"
                            }
                        }
                    }
                }
            ) as session:
                self.gemini_session = session
                print("[VocalConsumer] Connecté et prêt à écouter Gemini.")
                
                async for response in session.receive():
                    if response.server_content and response.server_content.model_turn:
                        for part in response.server_content.model_turn.parts:
                            if part.inline_data:
                                print(f"[VocalConsumer] Audio reçu ({len(part.inline_data.data)} bytes)")
                                audio_b64 = base64.b64encode(part.inline_data.data).decode('utf-8')
                                await self.send(json.dumps({
                                    "type": "audio",
                                    "data": audio_b64
                                }))
                            elif part.text:
                                print(f"[VocalConsumer] Texte reçu: {part.text[:50]}...")
                                await self.send(json.dumps({
                                    "type": "text",
                                    "data": part.text
                                }))
                    
                    if hasattr(response.server_content, "turn_complete") and response.server_content.turn_complete:
                        print("[VocalConsumer] Gemini a fini de répondre (turn_complete).")
                        await self.send(json.dumps({"type": "turn_complete"}))
                    elif response.tool_call:
                        # Traitement de l'appel d'outil
                        for call in response.tool_call.function_calls:
                            if call.name == "search_local_database":
                                args = call.args
                                query = args.get("query", "")
                                print(f"[VocalConsumer] Tool call: search_local_database(query='{query}')")
                                
                                # Exécuter la recherche de manière asynchrone
                                results = await sync_to_async(search_local_database)(query, {})
                                
                                # Renvoyer le résultat à Gemini
                                await session.send_tool_response(
                                    function_responses=[{
                                        "name": "search_local_database",
                                        "id": call.id,
                                        "response": {"result": results}
                                    }]
                                )
        except asyncio.CancelledError:
            pass
        except Exception as e:
            print("[VocalConsumer] Erreur écoute Gemini:", e)
            try:
                await self.send(json.dumps({"type": "error", "message": f"Erreur Gemini (ex: Quota dépassé) : {str(e)}"}))
            except:
                pass
            await self.close()
