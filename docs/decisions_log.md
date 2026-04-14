## ADR-001 - Déplacement de l'appel IA vers le Frontend (Cloud)
**Date** : 2026-03-12
**Statut** : Accepté

### Contexte
L'environnement cloud restreint l'utilisation de la clé API Gemini depuis le backend Node.js (Erreur `API_KEY_INVALID`), imposant une exécution côté client.

### Décision
Effectuer l'appel à l'API Gemini directement depuis le client React (Frontend) après avoir extrait l'audio sur le serveur Node.js.

### Alternatives évaluées
- **Option A : Proxy backend** - Rejeté : Bloque toujours sur la validation de la clé dans cet environnement spécifique.
- **Option B : Appel direct frontend** - Accepté : Sécurisé par l'environnement, résout l'erreur 400.

### Conséquences
- ✅ Positives : Résolution du bug critique, réduction de la charge CPU du serveur.
- ⚠️ Risques : Exposition de la logique de prompt côté client.
- 🔧 Actions requises : Ajout du SDK `@google/genai` dans le bundle frontend.

---

## ADR-002 - Architecture Locale Python/Whisper
**Date** : 2026-03-12
**Statut** : Accepté

### Contexte
Le cahier des charges exige une version fonctionnant 100% en local, sans dépendance au cloud ou à des API payantes.

### Décision
Création d'un backend alternatif en Python (FastAPI) utilisant le modèle Whisper d'OpenAI exécuté localement.

### Alternatives évaluées
- **Option A : Whisper.cpp / WebAssembly** - Rejeté : Trop lourd pour le navigateur client, performances instables sur de longues vidéos.
- **Option B : Python FastAPI + Whisper** - Accepté : Standard de l'industrie, robuste, facile à installer en local.

### Conséquences
- ✅ Positives : Autonomie totale, gratuité d'utilisation, confidentialité des données garantie.
- ⚠️ Risques : Nécessite une installation locale (FFmpeg, Python, dépendances) par l'utilisateur.
- 🔧 Actions requises : Création d'un `README_LOCAL.md` détaillé.

---

## ADR-003 - Formatage Entrelacé des Documents
**Date** : 2026-03-13
**Statut** : Accepté

### Contexte
La séparation de la transcription et de la traduction en deux sections distinctes rendait la lecture comparative difficile pour l'utilisateur.

### Décision
Générer les documents Word et PDF en entrelaçant chaque segment original (Noir) avec sa traduction (Terracotta `#E24C38`) immédiatement en dessous.

### Conséquences
- ✅ Positives : Amélioration majeure de l'UX de lecture.
- 🔧 Actions requises : Refonte de la logique de génération dans `server.ts` (utilisation de `flatMap` et gestion fine des couleurs avec `pdfkit` et `docx`).

---

## ADR-004 - Implémentation d'un ErrorBoundary global
**Date** : 2026-04-14
**Statut** : Accepté

### Contexte
Des erreurs inattendues lors du rendu React (par exemple, des problèmes de parsing JSON ou de manipulation du DOM) provoquaient l'affichage d'une page blanche, dégradant fortement l'expérience utilisateur.

### Décision
Mettre en place un composant `ErrorBoundary` (basé sur les classes React) pour envelopper l'application principale (`WrappedApp` dans `main.tsx`) et capturer les erreurs de rendu.

### Conséquences
- ✅ Positives : Résilience accrue de l'application. Les utilisateurs voient désormais un message d'erreur clair avec un bouton de rechargement au lieu d'une page blanche.
- 🔧 Actions requises : Typage strict des `props` et `state` du composant `ErrorBoundary` pour TypeScript.
