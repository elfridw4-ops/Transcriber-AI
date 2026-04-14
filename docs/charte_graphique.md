# Logo
## Variantes
- **Principale** : Icône `Languages` (Lucide React) en blanc, centrée dans un carré aux coins arrondis de couleur Emerald-600.
- **Typographie associée** : "Transcriber AI" en police sans-serif, Extra-bold, tracking-tight.
- **Favicon** : Reprise du carré Emerald avec l'icône `Languages`.

## Règles d'usage
- **Zone de protection** : Laisser un espace vide équivalent à 50% de la taille de l'icône autour du logo.
- ❌ **Interdictions** : Ne pas changer la couleur de l'icône (doit rester blanche ou monochrome sombre), ne pas déformer les proportions.

# Palette couleurs
## Principales
- **Primary (Emerald)** : `#059669` (emerald-600) - Utilisé pour les boutons CTA, les icônes principales et les éléments de succès.
- **Secondary (Dark)** : `#1a1a1a` - Utilisé pour les textes principaux et les contrastes forts.
- **Background** : `#f8f9fa` - Fond principal de l'application (gris très clair).

## Sémantiques
- **Success** : `#10b981` (emerald-500)
- **Error** : `#ef4444` (red-500) - Messages d'erreur et bouton de réinitialisation.
- **Translation Text** : `#E24C38` (Terracotta) - Couleur spécifique utilisée dans les exports Word/PDF pour différencier la traduction du texte original.

## Accessibilité
- Le contraste du texte blanc sur fond Emerald-600 respecte les normes WCAG AA (Ratio > 4.5:1).

# Typographie
## Hiérarchie
- **Font-family UI** : `Inter`, `ui-sans-serif`, `system-ui`, `sans-serif`.
- **Font-family Data/Timestamps** : `JetBrains Mono`, `ui-monospace`, `monospace`.
- **H1** : Text-3xl/4xl, Font-extrabold, Tracking-tight, Leading-tight.
- **Body** : Text-sm/base, Text-black/60 (Gris foncé pour réduire la fatigue visuelle).

# Composants UI
## Boutons
- **Primaire (Upload/Process)** : Hauteur 14 (mobile) / 12 (desktop), `rounded-xl`, fond Emerald-600, texte blanc gras, ombre `shadow-lg shadow-emerald-600/20`, effet `active:scale-95`.
- **Secondaire (Caméra/Reset)** : Bordure `border-black/10`, fond transparent, effet `hover:bg-black/5`.
- **Boutons d'export** : Fonds teintés très clairs (ex: `bg-blue-50/30` pour Word) avec bordures subtiles.

## Espacements
- **Grille** : Système Tailwind basé sur 4px.
- **Conteneur principal** : `max-w-6xl mx-auto px-4 sm:px-6`.
- **Cartes** : Padding généreux `p-5 sm:p-8`, `rounded-2xl`.

## Iconographie
- **Style** : Outlined (Lucide React).
- **Taille** : De 16px (w-4 h-4) pour les petites actions à 32px (w-8 h-8) pour les illustrations vides.

# Principes design
- **Ton** : Professionnel, Efficace, Accessible.
- **Voix** : Directe et rassurante ("Vidéo vers Texte en un clic", "Succès !").
- **Personnalité** : Moderne, Rapide, Fiable.
- **Marque** : Transcriber AI is a product of Aurion Labs-G. All rights reserved by Aurion Labs-G.

# Responsive
- **Breakpoints** : `sm` (480px), `md` (768px), `lg` (1200px).
- **Mobile-first** : Interface conçue prioritairement pour le tactile (boutons larges, layout en colonne unique sur petit écran).

# Motion
- **Transitions** : Utilisation de Framer Motion (`AnimatePresence`) pour des apparitions fluides (`opacity`, `y: 20 -> 0`).
- **Micro-interactions** : Barre de progression animée, effets de scale sur les clics de boutons.
