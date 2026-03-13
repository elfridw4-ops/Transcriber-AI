# Guide d'Installation Locale - Transcriber AI

Ce projet est conçu pour fonctionner entièrement sur votre machine locale.

## Prérequis
- **Python 3.9+**
- **Node.js & npm**
- **FFmpeg** (Indispensable pour le traitement audio/vidéo)

### Installation de FFmpeg
- **Windows**: `choco install ffmpeg` ou téléchargez sur ffmpeg.org
- **macOS**: `brew install ffmpeg`
- **Linux**: `sudo apt install ffmpeg`

## 1. Installation du Backend (Python)
Ouvrez un terminal dans le dossier du projet :
```bash
# Créer un environnement virtuel (recommandé)
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt
```

## 2. Lancement du Backend
```bash
python main.py
```
Le serveur démarrera sur `http://localhost:8000`.

## 3. Installation et Lancement du Frontend (React)
Ouvrez un **deuxième terminal** :
```bash
npm install
npm run dev
```
L'application sera accessible sur `http://localhost:3000`.

## Utilisation
1. Ouvrez votre navigateur sur `http://localhost:3000`.
2. Sélectionnez une vidéo (ou utilisez la caméra).
3. Cliquez sur "Lancer le traitement".
4. Le modèle **Whisper** s'exécutera localement sur votre processeur/carte graphique.
5. Téléchargez les fichiers générés directement depuis l'interface.

## Structure des fichiers locaux
- `/uploads` : Vidéos originales
- `/audio` : Pistes audio extraites
- `/transcriptions` : Fichiers texte brut
- `/subtitles` : Fichiers .srt
- `/documents` : Fichiers .docx et .pdf
