import os
import requests
from dotenv import load_dotenv

load_dotenv()

api_key = os.environ.get("OPENAI_API_KEY")
response = requests.get(
    "https://api.openai.com/v1/models",
    headers={"Authorization": f"Bearer {api_key}"}
)
if response.status_code == 200:
    models = response.json()["data"]
    for m in models:
        if "realtime" in m["id"] or "gpt-4" in m["id"]:
            print(m["id"])
else:
    print("Error:", response.text)
