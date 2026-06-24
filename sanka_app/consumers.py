import json
import base64
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
import os
import websockets
from django.conf import settings

from agents.collector import search_local_database
from asgiref.sync import sync_to_async

class VocalAgentConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        await self.accept()
        
        # Configuration de OpenAI Realtime
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            print("[VocalConsumer] OPENAI_API_KEY manquante.")
            await self.close()
            return

        self.api_key = api_key
        self.url = "wss://api.openai.com/v1/realtime?model=gpt-realtime-mini"
        self.openai_ws = None
        self.audio_buffer = []
        self.end_turn_pending = False
        self.has_sent_audio = False
        
        query_string = self.scope.get('query_string', b'').decode('utf-8')
        language = "Français"
        from urllib.parse import parse_qs
        qs = parse_qs(query_string)
        if 'language' in qs:
            language = qs['language'][0]
            
        self.system_instruction = (
            f"Tu es deNOUS AI, l'assistant vocal intelligent du projet deNOUS. "
            f"L'année actuelle est 2026. "
            f"Tu réponds toujours de manière concise, chaleureuse et naturelle. "
            f"Ne dis jamais que tu es Gemini, OpenAI, ou que tu as été développé par Google/OpenAI. "
            f"Tu as accès à une base de connaissances locale sur les savoirs africains via l'outil 'search_local_database'. "
            f"Si l'information demandée ne se trouve pas dans la base de données locale ou nécessite des informations récentes, tu DOIS utiliser l'outil 'search_web' pour chercher sur Internet. "
            f"RÈGLE CRITIQUE 1 : Pour les questions factuelles, base tes réponses UNIQUEMENT sur les informations trouvées via tes outils. Si tu ne trouves rien, dis que tu ne sais pas et n'invente jamais d'informations. Cependant, pour les salutations (bonjour, salut...) et la conversation informelle, réponds naturellement de manière chaleureuse sans utiliser tes outils de recherche. "
            f"RÈGLE CRITIQUE 2 : Tu DOIS ABSOLUMENT formuler toute ta réponse vocale dans la langue suivante : {language}. Même si l'utilisateur parle une autre langue, tu réponds en {language}."
        )

        self.tools = [
            {
                "type": "function",
                "name": "search_local_database",
                "description": "Recherche dans la base de données locale des savoirs africains.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {"type": "string", "description": "Mots-clés de la recherche"}
                    },
                    "required": ["query"]
                }
            },
            {
                "type": "function",
                "name": "search_web",
                "description": "Recherche sur Internet (Google Search) quand l'information n'est pas dans la base de données locale ou pour avoir des informations en temps réel.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {"type": "string", "description": "Mots-clés pour la recherche Web"}
                    },
                    "required": ["query"]
                }
            }
        ]

        self.listen_task = asyncio.create_task(self.listen_to_openai())
        print("[VocalConsumer] Initialisé.")

    async def disconnect(self, close_code):
        try:
            if hasattr(self, 'listen_task'):
                self.listen_task.cancel()
            if self.openai_ws:
                await self.openai_ws.close()
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
                    if b64_audio:
                        self.has_sent_audio = True
                        if self.openai_ws:
                            await self.openai_ws.send(json.dumps({
                                "type": "input_audio_buffer.append",
                                "audio": b64_audio
                            }))
                        else:
                            # Limite pour éviter les fuites de mémoire (environ 500 chunks = quelques secondes)
                            if len(self.audio_buffer) < 500:
                                self.audio_buffer.append(b64_audio)
                elif msg_type == "end_turn":
                    print("[VocalConsumer] Fin de l'enregistrement de l'utilisateur, signal envoyé.", flush=True)
                    if self.openai_ws:
                        if self.has_sent_audio:
                            await self.openai_ws.send(json.dumps({
                                "type": "input_audio_buffer.commit"
                            }))
                            await self.openai_ws.send(json.dumps({
                                "type": "response.create"
                            }))
                            self.has_sent_audio = False
                        else:
                            print("[VocalConsumer] Aucun audio envoyé. Bypassing commit.")
                            await self.send(json.dumps({"type": "turn_complete"}))
                    else:
                        self.end_turn_pending = True
                elif msg_type == "interrupt":
                    print("[VocalConsumer] Interruption reçue.")
                    if self.openai_ws:
                        await self.openai_ws.send(json.dumps({
                            "type": "response.cancel"
                        }))
                    else:
                        self.audio_buffer = []
                        self.end_turn_pending = False
        except Exception as e:
            print(f"[VocalConsumer] Erreur dans receive: {e}", flush=True)

    async def listen_to_openai(self):
        try:
            async with websockets.connect(
                self.url,
                additional_headers={
                    "Authorization": f"Bearer {self.api_key}"
                }
            ) as ws:
                self.openai_ws = ws
                print("[VocalConsumer] Connecté et prêt à écouter OpenAI.")
                
                # Setup session
                await ws.send(json.dumps({
                    "type": "session.update",
                    "session": {
                        "type": "realtime",
                        "instructions": self.system_instruction,
                        "tools": self.tools
                    }
                }))
                
                # Send buffered audio
                for b64 in self.audio_buffer:
                    await ws.send(json.dumps({
                        "type": "input_audio_buffer.append",
                        "audio": b64
                    }))
                if self.audio_buffer:
                    self.has_sent_audio = True
                self.audio_buffer = []
                
                if self.end_turn_pending:
                    if self.has_sent_audio:
                        await ws.send(json.dumps({"type": "input_audio_buffer.commit"}))
                        await ws.send(json.dumps({"type": "response.create"}))
                        self.has_sent_audio = False
                    else:
                        print("[VocalConsumer] Aucun audio envoyé (buffer). Bypassing commit.")
                        await self.send(json.dumps({"type": "turn_complete"}))
                    self.end_turn_pending = False

                async for message_str in ws:
                    response = json.loads(message_str)
                    event_type = response.get("type")
                    
                    if event_type == "response.output_audio.delta":
                        audio_b64 = response.get("delta")
                        if audio_b64:
                            await self.send(json.dumps({
                                "type": "audio",
                                "data": audio_b64
                            }))
                    
                    elif event_type == "response.output_text.delta":
                        text = response.get("delta")
                        if text:
                            await self.send(json.dumps({
                                "type": "text",
                                "data": text
                            }))
                            
                    elif event_type == "response.done":
                        print("[VocalConsumer] OpenAI a fini de répondre.")
                        await self.send(json.dumps({"type": "turn_complete"}))
                        
                    elif event_type == "response.function_call_arguments.done":
                        call_id = response.get("call_id")
                        name = response.get("name")
                        args_str = response.get("arguments", "{}")
                        
                        if name == "search_local_database":
                            try:
                                args = json.loads(args_str)
                                query = args.get("query", "")
                                print(f"[VocalConsumer] Tool call: search_local_database(query='{query}')")
                                
                                results = await sync_to_async(search_local_database)(query, {})
                                
                                # Envoie de la réponse de l'outil
                                await ws.send(json.dumps({
                                    "type": "conversation.item.create",
                                    "item": {
                                        "type": "function_call_output",
                                        "call_id": call_id,
                                        "output": json.dumps(results)
                                    }
                                }))
                                
                                # Déclencher la création de la réponse avec l'outil
                                await ws.send(json.dumps({
                                    "type": "response.create"
                                }))
                            except Exception as fn_err:
                                print(f"[VocalConsumer] Erreur outil search_local_database: {fn_err}")
                                
                        elif name == "search_web":
                            try:
                                args = json.loads(args_str)
                                query = args.get("query", "")
                                print(f"[VocalConsumer] Tool call: search_web(query='{query}')")
                                
                                import os
                                from google import genai
                                from agents.collector import search_online
                                
                                gemini_api_key = os.environ.get("GEMINI_API_KEY")
                                if gemini_api_key:
                                    gemini_client = genai.Client(api_key=gemini_api_key)
                                    # Exécuter search_online de manière asynchrone
                                    results = await sync_to_async(search_online)(gemini_client, query, {})
                                else:
                                    results = [{"error": "GEMINI_API_KEY non configurée"}]
                                
                                # Envoie de la réponse de l'outil
                                await ws.send(json.dumps({
                                    "type": "conversation.item.create",
                                    "item": {
                                        "type": "function_call_output",
                                        "call_id": call_id,
                                        "output": json.dumps(results)
                                    }
                                }))
                                
                                # Déclencher la création de la réponse avec l'outil
                                await ws.send(json.dumps({
                                    "type": "response.create"
                                }))
                            except Exception as fn_err:
                                print(f"[VocalConsumer] Erreur outil search_web: {fn_err}")
                                
                    elif event_type == "error":
                        error_msg = response.get('error', {}).get('message', '')
                        print(f"[VocalConsumer] Erreur de l'API OpenAI: {error_msg}")
                        if "buffer too small" in error_msg or "Cancellation failed" in error_msg or "no active response" in error_msg:
                            # Ignorer silencieusement
                            if "buffer too small" in error_msg:
                                await self.send(json.dumps({"type": "turn_complete"}))
                        else:
                            await self.send(json.dumps({
                                "type": "error", 
                                "message": f"Erreur OpenAI: {error_msg}"
                            }))
        except asyncio.CancelledError:
            pass
        except Exception as e:
            print("[VocalConsumer] Erreur connexion OpenAI:", e)
            try:
                await self.send(json.dumps({"type": "error", "message": f"Erreur OpenAI: {str(e)}"}))
            except:
                pass
            await self.close()
