import asyncio
import os
import websockets
from dotenv import load_dotenv

load_dotenv()

async def test_ws():
    api_key = os.environ.get("OPENAI_API_KEY")
    url = "wss://api.openai.com/v1/realtime?model=gpt-realtime-mini"
    
    try:
        from websockets.asyncio.client import connect
        async with connect(
            url,
            additional_headers={
                "Authorization": f"Bearer {api_key}"
            }
        ) as ws:
            print("Connected new!")
            msg = await ws.recv()
            print("Message:", msg)
    except Exception as e:
        print("Error new:", e)

asyncio.run(test_ws())
