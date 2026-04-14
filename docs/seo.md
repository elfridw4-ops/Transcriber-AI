# Stratégie SEO Complète - Transcriber AI

Ce document définit la stratégie de référencement naturel (SEO) pour l'application Transcriber AI, éditée par Aurion Labs-G. L'objectif est de maximiser la visibilité sur les moteurs de recherche pour l'acquisition d'utilisateurs organiques.

## 1. Optimisations SEO Techniques

### Balises et Meta
- **Langue** : L'attribut `lang="fr"` est défini sur la balise `<html>`.
- **Meta Title** : Optimisé pour la longueur (50-60 caractères) et le mot-clé principal.
- **Meta Description** : Incitative, incluant les mots-clés secondaires et la marque (150-160 caractères).
- **Open Graph & Twitter Cards** : Implémentés pour un partage social optimisé (titres, descriptions, type de carte).
- **Robots** : Balise `<meta name="robots" content="index, follow" />` pour autoriser l'indexation.

### Performance (Core Web Vitals)
- **LCP (Largest Contentful Paint)** : Optimisé grâce au bundling Vite.js et à l'absence d'images lourdes au-dessus de la ligne de flottaison.
- **CLS (Cumulative Layout Shift)** : Tailles des conteneurs (notamment la zone vidéo) prédéfinies pour éviter les sauts de mise en page.
- **Vitesse** : CSS purgé via Tailwind CSS v4, scripts minifiés.

### Structure HTML Sémantique
- Utilisation stricte des balises sémantiques HTML5 : `<header>`, `<main>`, `<footer>`, `<section>`.
- **Attributs d'accessibilité** : Utilisation de `translate="no"` sur le conteneur principal pour éviter la corruption du DOM par Google Translate.

## 2. Mots-clés (Recherche & Ciblage)

| Catégorie | Mots-clés ciblés | Intention de recherche | Difficulté estimée |
|-----------|------------------|------------------------|--------------------|
| **Principaux** | Transcription vidéo IA, Convertir vidéo en texte, Traduction vidéo automatique | Transactionnelle (Prêt à utiliser) | Élevée |
| **Secondaires** | Générateur de sous-titres SRT, Transcripteur gratuit, Audio en texte IA | Informationnelle / Outil | Moyenne |
| **Longue traîne** | Comment sous-titrer une vidéo YouTube, Traduire une vidéo en français, Extraire le texte d'une vidéo MP4 | Informationnelle (Tutoriel) | Faible |
| **Marque** | Transcriber AI, Aurion Labs-G | Navigationnelle | Très faible |

## 3. Structure de Pages Optimisée

Actuellement, l'application est une Single Page Application (SPA). Pour une stratégie SEO à long terme, voici la structure recommandée :

### Landing Page (Page d'accueil actuelle)
- **URL** : `/`
- **Cible** : Conversion immédiate, outil principal.
- **Contenu** : Zone de drop vidéo, proposition de valeur claire.

### Pages Internes (À développer pour le SEO)
- **Page Cas d'usage** : `/cas-d-usage/sous-titres-youtube` (Cible les créateurs).
- **Page Fonctionnalité** : `/fonctionnalites/traduction-video` (Cible la traduction).
- **Blog / Ressources** : `/blog/comment-transcrire-video-gratuitement` (Acquisition longue traîne).
- **Pages Légales** : `/mentions-legales`, `/cgu` (Trust flow et réassurance).

## 4. Exemples de Titres et Balises

### Page d'accueil (Outil de transcription)
- **Meta Title** : `Transcriber AI - Transcription & Traduction Vidéo Automatique`
- **Meta Description** : `Transformez vos vidéos en texte et traduisez-les instantanément avec l'IA. Exportez en Word, PDF, SRT et VTT. Transcriber AI is a product of Aurion Labs-G.`
- **H1** : `Vidéo vers Texte en un clic.`
- **H2** : `Comment ça marche ?`, `Formats d'export supportés`, `Succès !`
- **H3** : `Aperçu de la traduction`

### Page Cas d'usage (Exemple : Sous-titres)
- **Meta Title** : `Générateur de Sous-titres Automatique (SRT/VTT) - Transcriber AI`
- **Meta Description** : `Générez des sous-titres précis pour vos vidéos en quelques secondes. Téléchargez aux formats SRT ou VTT. Propulsé par Aurion Labs-G.`
- **H1** : `Générez des sous-titres automatiquement pour vos vidéos`

## 5. Bonnes Pratiques SEO sur le long terme

1. **Sitemap XML & Robots.txt** : À générer et soumettre à la Google Search Console dès que l'application aura plusieurs pages.
2. **Netlinking (Backlinks)** : Inscrire Transcriber AI sur des annuaires d'outils IA (ex: There's an AI for that, Toolify) pour obtenir des liens entrants de qualité.
3. **Mobile-First Indexing** : Maintenir une interface 100% responsive. Google indexe en priorité la version mobile.
4. **Données Structurées (Schema.org)** : Ajouter le schéma `SoftwareApplication` ou `WebApplication` dans le `<head>` pour afficher des extraits enrichis (Rich Snippets) dans les résultats de recherche.
5. **Accessibilité (A11y)** : S'assurer que tous les boutons ont des labels (`aria-label`) et que les contrastes de couleurs restent au-dessus du ratio 4.5:1 (déjà validé dans la charte graphique).
