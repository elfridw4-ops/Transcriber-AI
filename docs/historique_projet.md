# Présentation
- **Nom du projet** : Transcriber AI
- **Objectif principal** : Transformer automatiquement des vidéos en transcriptions, traductions et documents exportables (Word, PDF, SRT, VTT).
- **Utilisateurs cibles** : Créateurs de contenu, étudiants, journalistes, professionnels nécessitant des sous-titres ou des comptes-rendus.
- **Fonctionnalités clés** : 
  - Upload vidéo (galerie/caméra)
  - Extraction audio locale/cloud
  - Transcription IA avec détection de langue
  - Traduction française
  - Export bilingue entrelacé (Word/PDF)

# Architecture
- **Vue d'ensemble architecturale** : Architecture hybride supportant une exécution Cloud (Node.js + Gemini API) et une exécution Locale (Python + Whisper).
- **Stack technique** :
  - **Frontend** : React 19, Vite, Tailwind CSS v4, Lucide React, Framer Motion.
  - **Backend (Cloud)** : Node.js, Express, FFmpeg, Google GenAI SDK, docx, pdfkit.
  - **Backend (Local)** : Python 3, FastAPI, OpenAI Whisper.
  - **Mobile** : Capacitor (pour génération APK Android).
- **Diagrammes de flux de données** :
  1. Client -> Vidéo -> Serveur (Extraction Audio via FFmpeg)
  2. Serveur -> Audio Base64 -> Client
  3. Client -> Audio -> Gemini API -> JSON (Transcription + Traduction)
  4. Client -> JSON -> Serveur (Génération Docs) -> Fichiers téléchargeables

# Décisions techniques
- **Appel IA côté Frontend (Cloud)** : Déplacement de l'appel Gemini du backend vers le frontend pour respecter les contraintes de sécurité des clés API dans l'environnement Cloud.
- **Backend Local Python** : Implémentation d'un serveur FastAPI avec Whisper pour répondre au besoin d'une exécution 100% locale, gratuite et déconnectée.
- **Capacitor pour Android** : Choisi pour encapsuler rapidement l'application web existante en une application mobile native (APK) sans réécrire le code en Flutter ou React Native.
- **Mise en forme entrelacée (Word/PDF)** : Choix ergonomique pour afficher la traduction (en couleur Terracotta) directement sous le texte original (en noir) segment par segment, facilitant la lecture bilingue.

# Historique des modifications
| Date | Description | Impact | Auteur |
|---|---|---|---|
| 2026-03-12 | Refonte Mobile-First (Tailwind) | UI/UX optimisée pour smartphones | Assistant |
| 2026-03-12 | Migration appel Gemini vers Frontend | Résolution erreur API Key | Assistant |
| 2026-03-12 | Création backend local Python/Whisper | Autonomie locale garantie | Assistant |
| 2026-03-12 | Intégration Capacitor (Android) | Support mobile natif (APK) | Assistant |
| 2026-03-13 | Formatage entrelacé Word/PDF + Fix DOM | Lisibilité accrue, Stabilité React | Assistant |
| 2026-04-14 | Création du système de documentation | Maintenabilité et Onboarding | Assistant |
| 2026-04-14 | Ajout ErrorBoundary et permissions Caméra | Stabilité UI et accès natif mobile | Assistant |
