# 🌟 Semaine de l'Autodidacte 2026 — One Page Officielle

Site web One-Page officiel pour la **2ᵉ Édition de la Semaine de l'Autodidacte** à Ouagadougou (Burkina Faso).

> **Thème :** « Autodidacte, Résilience et Innovation : quels mécanismes pour la validation de leurs acquis et expériences dans le monde professionnel ? »  
> **Dates :** 30, 31 octobre & 1er novembre 2026  
> **Lieu :** Ouagadougou, Burkina Faso  

---

## 🚀 Fonctionnalités & Contenu

1. **En-tête & Navigation Sticky :**
   - Logo officiel extrait du document de l'événement.
   - Barre de navigation réactive avec effet verre (*glassmorphism*) et menu mobile fluide.
   - Bouton d'action direct vers la confirmation de présence.

2. **Hero Section Immersive :**
   - Présentation percutante du thème et de la 2ᵉ édition.
   - **Compte à rebours dynamique en temps réel** jusqu'au 30 octobre 2026 (08h30 GMT).
   - 4 Cartes d'indicateurs clés (3 jours d'immersion, 1 défi hackathon, 3 panels stratégiques, soirée de gala).

3. **Vision & Thématique :**
   - Les 3 piliers fondateurs : Apprendre Autrement (Résilience), Reconnaissance & VAE, Innovation & Impact Local.

4. **Programme Prévisionnel Complet (Interactif) :**
   - Basé fidèlement sur le document PDF officiel :
     - **Jour 1 (Ven. 30 Octobre) :** Cérémonie d'ouverture, panel sur l'autodidaxie et la reconnaissance des compétences, interventions de **PATCOM / M. TAPSOBA**, **CAVAIF / M. TRAORÉ** (Validation des Acquis de l'Expérience) et de l'**APEN**.
     - **Jour 2 (Sam. 31 Octobre) :** Grand Hackathon de l'Autodidacte — Défi : *« Une Application Mobile pour les inventions des Burkinabè »* (Conception, Prototypage, Mentorat, Pitchs et Démonstrations).
     - **Jour 3 (Dim. 1er Novembre) :** Séance de dégustation des produits partenaires, bilan récapitulatif, remise solennelle des prix et distinctions, et grande Soirée de Réseautage / Cocktail de clôture.
   - Filtres par onglets par jour (*Tous les jours*, *Jour 1*, *Jour 2*, *Jour 3*).
   - Bouton de téléchargement du PDF officiel original.

5. **Formulaire de Confirmation de Présence (RSVP) & Pass Numérique VIP :**
   - Recueil des informations : Nom complet, Email, Téléphone / WhatsApp (+226), Organisation, Statut/Rôle (Invité d'honneur, Partenaire, Candidat, etc.).
   - Choix personnalisé des jours de participation (cases à cocher dynamiques).
   - Option de confirmation au Cocktail de clôture.
   - **Pass Virtuel / Billet Électronique instantané avec QR Code scannable** généré en temps réel.
   - Bouton d'impression / sauvegarde en PDF du Pass format badge.
   - Bouton de partage direct de la confirmation sur WhatsApp.

6. **Espace Organisateur & Gestion des Inscrits :**
   - Bouton d'accès discret dans le pied de page (`Espace Organisateur`).
   - Accès protégé par mot de passe (Par défaut : `admin2026`).
   - Tableau de bord en temps réel avec compteurs : Total inscrits, répartition par jour (J1, J2, J3) et participants au cocktail.
   - Barre de recherche instantanée.
   - **Exportation en 1 clic au format Excel / CSV** (encodage UTF-8 avec BOM pour une ouverture parfaite dans Microsoft Excel).
   - Bouton pour insérer des données d'exemples de test.

---

## 🛠️ Comment lancer et utiliser le site

### Méthode 1 : Ouverture directe (Sans serveur)
Double-cliquez simplement sur le fichier `index.html` pour l'ouvrir dans Google Chrome, Edge, Firefox ou Safari.
> Toutes les fonctionnalités (compte à rebours, formulaires, génération de pass avec QR Code, espace organisateur avec stockage `localStorage`) fonctionnent à 100% de manière autonome.

### Méthode 2 : Avec Laragon ou serveur PHP local
Si vous utilisez Laragon ou le serveur PHP intégré :
```powershell
php -S localhost:8000
```
Ouvrez votre navigateur à l'adresse [http://localhost:8000](http://localhost:8000).
> Les confirmations seront à la fois stockées dans le navigateur ET enregistrées côté serveur dans `data/confirmations.json` et `data/confirmations.csv`.

---

## 📂 Structure des fichiers

```text
Semaine AutoDidact/
│
├── index.html                   # Page web principale (One Page)
├── programme-officiel.pdf       # Fichier PDF téléchargeable
├── README.md                    # Guide du projet
│
├── api/
│   └── confirm.php              # API PHP pour enregistrement, liste & export CSV
│
├── assets/
│   ├── css/
│   │   └── style.css            # Feuille de style personnalisée & responsive
│   ├── js/
│   │   ├── main.js              # Logique interactive, compte à rebours & RSVP
│   │   └── qrcode.min.js        # Librairie autonome de génération de QR Code
│   └── img/
│       ├── logo.png             # Logo officiel extrait du PDF
│       └── logo-transparent.png # Version transparente du logo
│
└── data/
    ├── confirmations.json       # Fichier de stockage des confirmations (JSON)
    └── confirmations.csv        # Fichier d'export Excel direct (CSV)
```

---

## 🔐 Identifiants d'administration

- **Mot de passe Espace Organisateur :** `admin2026` (modifiable dans `assets/js/main.js` et `api/confirm.php`).
