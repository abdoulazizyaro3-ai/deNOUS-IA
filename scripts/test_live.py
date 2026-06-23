import os
import asyncio
from dotenv import load_dotenv

load_dotenv()
os.environ.pop('GOOGLE_API_KEY', None)

from google import genai
client = genai.Client(api_key=os.environ.get('GEMINI_API_KEY'))

async def run():
    try:
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
        config = {
            "response_modalities": ["AUDIO"],
            "speech_config": {
                "voice_config": {
                    "prebuilt_voice_config": {
                        "voice_name": "Aoede"
                    }
                }
            },
            "system_instruction": system_instruction,
            "tools": [
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
        }
        async with client.aio.live.connect(model='gemini-2.5-flash-native-audio-latest', config=config) as s:
            print('connected')
            import asyncio
            audio_bytes = b'\x00' * 32000  # 1s of 16kHz PCM
            await s.send_realtime_input(audio={"mime_type": "audio/pcm;rate=16000", "data": audio_bytes})
            print('audio sent')
            await s.send_realtime_input(audio_stream_end=True)
            print('end of turn sent')
            async for response in s.receive():
                print('received response part')
                break
    except Exception as e:
        print("Error:", e)

asyncio.run(run())
