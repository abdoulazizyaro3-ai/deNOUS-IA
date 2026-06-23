import asyncio
import os
from google import genai
from google.genai.types import HttpOptions
from dotenv import load_dotenv

load_dotenv()

if "GOOGLE_API_KEY" in os.environ:
    del os.environ["GOOGLE_API_KEY"]

async def test():
    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
    async with client.aio.live.connect(model="gemini-2.5-flash-native-audio-latest", config={"response_modalities": ["AUDIO"]}) as session:
        print("CONNECTED")
        await session.send(input={"realtime_input": {"media_chunks": [{"mime_type": "audio/pcm;rate=16000", "data": "AAAA"}]}})
        print("SENT")
        await asyncio.sleep(1)

if __name__ == "__main__":
    asyncio.run(test())
