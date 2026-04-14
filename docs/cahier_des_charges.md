# 1. Prompt initial
Créer une application web dans laquelle un utilisateur peut déposer une vidéo et recevoir : une transcription complète, une traduction en français, des sous-titres automatiques, un fichier Word téléchargeable et un fichier PDF téléchargeable. L'application doit être entièrement utilisable sur mobile (approche Mobile-First).

# 2. Exigences fonctionnelles
- **Upload vidéo** : Formats acceptés (mp4, mov, avi, mkv, webm), limite de 100MB, support de la caméra sur mobile.
- **Traitement audio** : Extraction de la piste audio via FFmpeg.
- **Intelligence Artificielle** : Détection de la langue, transcription avec timestamps, traduction en français.
- **Exports** :
  - Sous-titres : SRT et VTT.
  - Documents : Word (.docx) et PDF.
  - Formatage spécifique : Texte original en noir, traduction en couleur chaude (Terracotta `#E24C38`) placée juste en dessous, segment par segment.

# 3. Exigences non fonctionnelles
- **Performance** : Interface réactive, barre de progression en temps réel, animations fluides (Framer Motion).
- **Sécurité** : Gestion sécurisée de la clé API (côté client pour le cloud), nettoyage immédiat des fichiers temporaires sur le serveur.
- **Scalabilité** : Architecture stateless permettant un déploiement facile.
- **Accessibilité** : Design Mobile-First, cibles de clic larges (min 44px), contrastes élevés.

# 4. Contraintes
- **Environnement Hybride** : Doit fonctionner dans un environnement Cloud (Node.js + Gemini) ET en environnement local strict (Python + Whisper).
- **Simplicité** : Pas de base de données complexe, pas d'authentification utilisateur requise pour le MVP.
- **Mobile** : Doit pouvoir être compilé en APK via Capacitor.
