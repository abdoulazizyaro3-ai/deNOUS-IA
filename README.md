# deNOUS AI

Bienvenue dans le projet **deNOUS AI**, un assistant vocal intelligent et une base de connaissances interactive dédiée aux savoirs africains.

## 🌟 Présentation
Le projet intègre un écosystème hybride combinant un frontend moderne (React + Vite) et un backend robuste (Django + WebSockets). Il utilise l'API Gemini de Google (notamment la Live API) pour animer un assistant vocal naturel, chaleureux et polyglotte, capable de comprendre et de parler des langues locales comme le Dioula, le Mooré et le Bambara.

## 🏗️ Architecture

- **Frontend** : React.js, Tailwind CSS, Vite.
- **Backend Principal** : Django (Python) et Django Channels pour la gestion des WebSockets bidirectionnels en temps réel.
- **Serveur secondaire/Scripts** : Node.js (utilisé par `server.ts` et `export_data.ts` pour gérer/exporter la base de données graphique en mémoire).
- **Agents IA** : Scripts Python multi-agents orchestrés via Gemini (Coordinator, Collector, Structurer, Vocal, Analyst).

## 🚀 Installation & Démarrage

### 1. Prérequis
- [Node.js](https://nodejs.org/) (version 18+)
- [Python 3.10+](https://www.python.org/)
- Clé d'API Google Gemini (à placer dans un fichier `.env`)

### 2. Configuration du backend (Python)
Créez et activez votre environnement virtuel, puis installez les dépendances :
```bash
# Activation de l'environnement virtuel (Windows)
.venv\Scripts\activate

# Installation des dépendances
pip install -r requirements.txt

# Migrations Django (si nécessaire)
python manage.py migrate
```

### 3. Configuration du frontend (Node.js)
```bash
npm install
```

### 4. Lancement
Le projet utilise `concurrently` pour démarrer simultanément le serveur backend et le serveur frontend.

```bash
npm run dev
```

Cela démarrera :
- Vite (Frontend) sur http://localhost:5173
- Django (Backend) sur http://localhost:3000

## 🔧 Variables d'environnement
Créez un fichier `.env` à la racine contenant :
```env
GEMINI_API_KEY=votre_cle_api_gemini
OPENAI_API_KEY=votre_cle_api_openai
```
