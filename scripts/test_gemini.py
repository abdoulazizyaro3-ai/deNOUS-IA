import asyncio
import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

async def test():
    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"), http_options={'api_version': 'v1alpha'})
    async with client.aio.live.connect(model="gemini-3.1-flash-live-preview", config={"response_modalities": ["AUDIO"]}) as session:
        print("SUCCESS")

if __name__ == "__main__":
    asyncio.run(test())
