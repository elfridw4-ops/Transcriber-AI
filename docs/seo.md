# Optimisations techniques

## Balises Meta
- **Title** : Transcriber AI - Transcription & Traduction Vidéo Automatique (59 caractères)
- **Description** : Transformez vos vidéos en texte et traduisez-les instantanément avec l'IA. Exportez en Word, PDF, SRT et VTT. Rapide, précis et gratuit. (139 caractères)
- **Open Graph / Twitter Cards** : Image de l'interface mettant en valeur la barre de progression et les formats d'export.

## Performance
- **Core Web Vitals** : 
  - LCP optimisé via Vite (bundling rapide).
  - Pas d'images lourdes au chargement initial (utilisation d'icônes SVG Lucide).
- **Critical CSS** : Tailwind CSS purge automatiquement les styles inutilisés en production.

## Structure HTML
- **Hiérarchie** :
  - `H1` : Vidéo vers Texte en un clic.
  - `H2` : Succès !
  - `H3` : Aperçu de la traduction
- **Attributs** : Utilisation de `translate="no"` sur le conteneur principal pour éviter la corruption du DOM par les extensions de traduction.

# Mots-clés

| Primaire | Secondaires | Intention |
|----------|-------------|-----------|
| Transcription vidéo IA | Traduction vidéo, Sous-titres automatiques, Vidéo vers texte | Transactionnelle |
| Convertir vidéo en texte | Générateur SRT, Transcripteur gratuit, Audio en texte | Informationnelle |

# Structure pages

## Landing page (Single Page App)
- **H1** : Vidéo vers Texte en un clic.
- **Meta title** : Transcriber AI - Transcription Vidéo Automatique
- **Meta desc** : Uploadez votre vidéo et obtenez la transcription et traduction en quelques secondes. Formats Word, PDF, SRT.
- **CTA** : "Choisir une vidéo" (Bouton central large, zone de drag & drop).

# Bonnes pratiques long terme
- **Audit mensuel** : Surveiller les erreurs d'indexation via Google Search Console.
- **Création de contenu** : Ajouter une section blog ou FAQ sur les cas d'usage (ex: "Comment sous-titrer une vidéo pour YouTube").
- **Mobile-first indexing** : L'application étant conçue Mobile-First, elle est nativement optimisée pour les robots d'indexation mobiles de Google.
