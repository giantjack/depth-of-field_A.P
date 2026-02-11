# Simulateur Profondeur de Champ

## Description

Simulateur interactif de **profondeur de champ** permettant aux photographes de visualiser comment l'ouverture, la distance au sujet et la longueur focale affectent la zone de netteté avant/après le point de mise au point.

## Stack Technique

- **Framework** : React 18 + TypeScript
- **UI** : Chakra UI 2.8
- **Build** : Vite 5
- **Animations** : Framer Motion

## Structure du Projet

```
src/
├── App.tsx                      # Composant principal - calculs et contrôles
├── PhotographyGraphic.tsx       # Visualisation graphique desktop (33 KB)
├── PhotographyGraphicMobile.tsx # Version mobile du graphique
├── utils/                       # Utilitaires (conversion unités)
├── assets/                      # Ressources images/SVG
└── App.css                      # Styles spécifiques
```

## Fonctionnalités

- 4 tailles de capteurs (Plein format, APS-C, Micro 4/3, Smartphone)
- 6 configurations rapides (presets) pour différents setups courants
- 5 sujets avec illustrations SVG (Humain, Humain assis, Petit/Moyen/Grand chien)
- Calcul distance hyperfocale
- Visualisation graphique interactive de la zone nette

## Commandes

```bash
npm install    # Installer les dépendances
npm run dev    # Lancer en développement
npm run build  # Build de production
npm run lint   # Vérification ESLint
```

## Formules Utilisées

- **Distance hyperfocale** : `H = (f² / (N × c)) + f`
  - f = focale, N = ouverture, c = cercle de confusion
- **Limite avant** : `Dn = (s × (H - f)) / (H + s - 2f)`
- **Limite arrière** : `Df = (s × (H - f)) / (H - s)`
- **Angle de vue** : `2 × atan(diagonal / (2 × focal))`

## Constantes Cercle de Confusion (CoC)

| Capteur | CoC (mm) |
|---------|----------|
| Full Frame | 0.029 |
| APS-C | 0.019 |
| Micro 4/3 | 0.015 |
| Smartphone | 0.006 |

## Charte Graphique

- Couleur primaire : `#FB9936` (orange)
- Couleur secondaire : `#212E40` (bleu foncé)

## Notes de Développement

- **Source** : Basé sur le travail open source de Jack Herrington
- Échelle logarithmique pour le slider focale (évite clustering des petites valeurs)
- Conversion : inches ↔ mm (× 25.4)
- Gestion du cas limite : profondeur de champ infinie
- Composants graphiques distincts pour desktop et mobile
- Illustrations SVG personnalisées pour chaque type de sujet
