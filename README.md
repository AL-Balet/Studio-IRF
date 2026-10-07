# Studio IRF

**L'application web pour communiquer sur les actions de l'IRF.**

Studio IRF facilite la création de visuels pour la communication de l'Institut régional de formation de la zone Asie-Pacifique de l'AEFE. Il permet de composer un post Instagram à partir de photographies, de textes et de logos, puis de télécharger une image prête à publier.

## Fonctionnalités

- Ajout de 1 à 5 photographies, avec modification de leur ordre.
- Quatre gabarits : **Affiche formation**, **Photos rectangles**, **Photos cercles** et **Localisation**.
- Composition automatique en mosaïque pour plusieurs photos dans le gabarit Photos rectangles.
- Déplacement des éléments et redimensionnement des photos directement dans l'aperçu.
- Titre et mention personnalisables, avec retours à la ligne et possibilité de masquer la mention.
- Textes libres avec réglage de la taille, de la couleur et du fond.
- Quatre palettes de couleurs et affichage au choix des logos AEFE, zone Asie-Pacifique, Marianne et La Ruche.
- Localisation sur un globe représentant l'Asie-Pacifique, avec nom du lieu et couleur du repère personnalisables.
- Affichage facultatif d'un type d'action : formation établissement, formation zone ou séminaire.
- Téléchargement au format **PNG, 1080 × 1080 pixels**.

## Utilisation

1. Ouvrir `index.html` dans un navigateur.
2. Choisir un gabarit et ajouter des photographies si nécessaire.
3. Renseigner le titre, la mention et les éventuels textes libres.
4. Choisir une palette et les logos à afficher.
5. Ajuster les éléments dans l'aperçu en les faisant glisser. Utiliser la poignée en bas à gauche des éléments redimensionnables pour changer leur taille.
6. Cliquer sur **Télécharger le visuel**.

Le gabarit **Localisation** peut être utilisé sans photographie. Choisir une ville, renseigner le lieu et sélectionner éventuellement un type d'action. Si le champ du lieu est vide, aucun nom n'apparaît sur le globe.

## Installation

Aucune installation, aucun compte et aucun serveur ne sont nécessaires pour une utilisation locale. Télécharger le projet, extraire les fichiers et ouvrir `index.html`. Le dossier `assets` doit rester à côté des fichiers principaux.

## Structure du projet

```text
studio-irf/
├── index.html      # Interface de l'application
├── styles.css      # Mise en forme de l'interface
├── app.js          # Composition, interactions et export
├── README.md       # Présentation et utilisation
└── assets/         # Logos, icônes, bibliothèque et données du globe
```

Pour publier le projet, conserver cette structure à la racine du dépôt GitHub. L'application peut être hébergée comme un site statique, notamment avec GitHub Pages.

## Technologies

- HTML, CSS et JavaScript.
- Canvas 2D pour la composition et l'export des images.
- D3 pour la projection géographique du globe.
- Icônes Lucide et contours terrestres Natural Earth.

Les ressources nécessaires sont incluses dans le projet : l'application fonctionne sans connexion une fois les fichiers téléchargés.

## Données et confidentialité

Les photographies sont traitées dans le navigateur, sans envoi vers un serveur. Les fichiers originaux ne sont pas modifiés.

La composition n'est pas sauvegardée automatiquement : télécharger le visuel avant de fermer ou de recharger la page. Le PNG exporté est une image finale, pas un fichier de projet rééditable.

Avant toute publication, vérifier les droits d'utilisation des photographies, le consentement des personnes représentées et les règles de communication applicables.

## Ressources et droits

D3 est distribué sous licence ISC (`assets/d3-LICENSE.txt`). Les icônes Lucide sont distribuées sous licence ISC (`assets/lucide-LICENSE.txt`). Les données géographiques Natural Earth sont dans le domaine public.

Les logos et marques présents dans le projet restent la propriété de leurs titulaires. Leur présence dans le dépôt ne constitue pas une autorisation de réutilisation.
