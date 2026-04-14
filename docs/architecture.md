# Vue d'ensemble
L'application suit une architecture hybride. Le frontend React peut communiquer soit avec un backend Node.js (pour la version Cloud Preview utilisant Gemini), soit avec un backend Python FastAPI (pour la version locale utilisant Whisper).

# Arborescence annotée
```text
projet/
├── src/
│   ├── App.tsx         # ✔️ Pourquoi : Composant principal (UI + Logique d'appel API)
│   │                   # ❌ Impact si absent : Plus d'interface utilisateur
│   ├── main.tsx        # ✔️ Pourquoi : Point d'entrée React avec ErrorBoundary
│   └── index.css       # ✔️ Pourquoi : Styles globaux et configuration Tailwind
├── public/
│   └── icon.svg        # ✔️ Pourquoi : Logo officiel (Aurion Labs-G) pour PWA et favicon
├── server.ts           # ✔️ Pourquoi : Backend Cloud (Express, FFmpeg, Docx, PDFKit)
│                       # 👥 Utilisé par : L'environnement Cloud Preview
├── main.py             # ✔️ Pourquoi : Backend Local (FastAPI, Whisper)
│                       # 👥 Utilisé par : L'utilisateur en local
├── android/            # ✔️ Pourquoi : Projet natif généré par Capacitor pour l'APK
├── docs/               # ✔️ Pourquoi : Documentation complète du projet
├── Dockerfile          # ✔️ Pourquoi : Recette de déploiement conteneurisé (Node + FFmpeg)
├── .dockerignore       # ✔️ Pourquoi : Exclut les fichiers inutiles du conteneur
└── package.json        # ✔️ Pourquoi : Dépendances et scripts de build
```

# Flux de données
1. **Upload** : Utilisateur -> Sélection Vidéo -> Frontend
2. **Extraction** : Frontend -> FormData -> Serveur (Node ou Python) -> FFmpeg -> Audio Base64
3. **IA (Cloud)** : Frontend -> Audio Base64 -> API Gemini -> JSON (Transcription/Traduction)
4. **IA (Local)** : Serveur Python -> Whisper -> JSON (Transcription/Traduction)
5. **Génération** : Frontend -> JSON -> Serveur -> Fichiers (Word, PDF, SRT) -> Téléchargement

# Conventions
- **Nommage** : camelCase (variables, fonctions), PascalCase (composants React).
- **Structure dossiers** : Monolithe hybride (Frontend + 2 Backends dans le même repo).
- **UI** : Approche Mobile-First stricte avec Tailwind CSS.

# Dépendances critiques
| Package | Version | Rôle | Alternatives |
|---------|---------|------|--------------|
| `@google/genai` | ^1.29.0 | IA Cloud (Transcription/Traduction) | OpenAI API |
| `fluent-ffmpeg` | ^2.1.3 | Extraction audio (Node.js) | ffmpeg.wasm |
| `@ffmpeg-installer/ffmpeg` | ^1.1.0 | Binaire FFmpeg autonome | Installation système |
| `docx` / `pdfkit` | latest | Génération de documents | pdfmake |
| `@capacitor/core` | ^8.2.0 | Wrapper Mobile (Génération APK) | React Native |
| `openai-whisper` | latest | IA Locale (Python) | Whisper.cpp |

# Points sensibles
- 🔐 **Fichiers secrets** : `.env` (contient `GEMINI_API_KEY`). Ne jamais commiter.
- 🎯 **Logique métier** : La synchronisation des timestamps entre la transcription et la traduction est critique pour la génération des documents.
- ⚡ **Optimisations** : Le nettoyage des fichiers temporaires vidéo et audio sur le serveur (`fs.unlinkSync`) est vital pour éviter la saturation du disque.

# Roadmap technique
- Extraire la logique d'appel API de `App.tsx` vers des hooks personnalisés (`useTranscription`).
- Implémenter des WebSockets pour une barre de progression réelle lors de l'extraction FFmpeg sur de gros fichiers.
