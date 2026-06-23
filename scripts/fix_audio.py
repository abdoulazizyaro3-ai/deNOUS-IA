import os
import base64
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sanka_project.settings')
django.setup()

from sanka_app.models import LocalAudio

a = LocalAudio.objects.first()
path = r'C:\Users\HP 250 G8\Desktop\IAchallenge\IAchallenge\audios\accents\2026\06\21\WhatsApp_Audio_2026-06-21_at_16.17.16.mpeg'

with open(path, 'rb') as f:
    data = base64.b64encode(f.read()).decode('utf-8')
    a.audio_data = data
    a.save()
    print('Saved base64 data, length:', len(data))
