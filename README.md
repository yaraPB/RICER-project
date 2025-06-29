# Resilient Infrastructures and Coordinated Emergency Response (RICER): A GIS and AI-Integrated Approach for Forest Fire Management in Ifrane Province

This project is focused on reducing the impact of forest fires on critical infrastructure, such as transportation networks and healthcare facilities, while enhancing coordination and preparation efforts of relevant stakeholders. This includes :

1. Developing a Centralized GIS-Based Web Platform: Integrating with emergency services for a coordinated response, this platform will facilitate real-time data exchange among stakeholders including the Local authorities, DPEi (for transportation), healthcare facilities, provincial forest department DEFii and la Protection Civil.
2. Implementing AI for Predictive Analysis: AI will be used to forecast forest fire patterns, aiding in preemptive infrastructure protection and evacuation planning.
3. Creating a Provincial Guide: This guide will be dedicated to setting up effective strategies for preventing and responding to forest fires and other natural disasters.

## 1. The Website

**RICER** website will be compromised of the following components:

### General To-do

- [] Sign-in and sign-up for normal civilians (ask CIN number and phone number and also MOSIP integration)
- [] Sign-in and sign-up for government officials (ask CIN number and department and Role)
- Implement all of the Departments

### 1.1 Phase de preparation

| Acronym  | Department                                                                 |
|----------|----------------------------------------------------------------------------|
| ADM      | Autoroutes du Maroc                                                        |
| CCDRF    | Centre de Conservation et de Développement des Ressources Forestières      |
| CEDEFO   | Centre de Défense des Forêts                                               |
| DFCI     | Défense de Forêts Contre les Incendies                                     |
| DPEFLCD  | Direction Provinciale des Eaux et Forêts et de la Lutte Contre la Désertification |
| DREFLCD  | Direction Régionale des Eaux et Forêts et de la Lutte Contre la Désertification |
| FA       | Forces Auxiliaires                                                         |
| FAR      | Forces Armées Royales                                                      |
| GPS      | Global Positioning System                                                  |
| GR       | Gendarmerie Royale                                                         |
| HCEFLCD  | Haut Commissariat aux Eaux et Forêts et à la Lutte contre la Désertification |
| MET      | Ministère de l'Équipement et du Transport                                  |
| MI       | Ministère de l'Intérieur                                                   |
| MJS      | Ministère de la Jeunesse et des Sports                                     |
| ONCE     | Office National des Chemins de Fer                                         |
| ONDA     | Office National Des Aéroports                                              |
| ONEEP    | Office National de l'Électricité et de l'Eau Potable                       |
| OTDF     | Occupation Temporaire du Domaine Forestier                                 |
| PN       | Promotion Nationale                                                        |
| RAA      | Revue Après Action                                                         |
| SF       | Secteur Forestier                                                          |
| SIG      | Système d'Information Géographique                                         |
| TPF      | Tranchée Pare-Feu                                                          |
| USFS     | United States Forest Service                                               |
| VPI      | Véhicule de Première Intervention                                          |

- La DPEFLCD est responsable de la verification des **equipements** et des **infrastrucures**

#### Equipement

1. Material Roulant VPI et Camions.
2. Petit materiel de lutte (les debroussailleuses, les tronconneuses, les battes a feu, les pelle, les pioches, les pompes dorsales, les haches, les scies).
3. Habillement du personnel de lutte (ceci est fait en collaboration avec le DREFLCD), et cela concerne le materiel a savoir les chemises, les gants, pantalons, chaussures, lunettes deprotections, casques, sac-a-dos, protecteurs a oreilles, masque a gaz...
4. Moyen de communication et de positionemment (Cartes de sinfrastructures et equipements DFCI de la zone d'action, GSM, jumelles, GPS, cartes du risque statique...)
5. Materiel de campement (tentes, lits, tables, chaises, groupes electrogenes, sac de couchage, mini-frigos et elements d'hygiene, matelas, citerne d'eau...)
6. Produit retardant

| Nom du produit retardant | Date d'acquisition | Lieu de stockage | Quantité disponible (litres) |
|--------------------------|--------------------|------------------|-------------------------------|
|                          |                    |                  | Magasin                       |
|                          |                    |                  | Aeroport                      |

#### Infrastructures

1. Point d'eau
2. Tranche pare-feu
3. Postes Vigies
4. Pistes Forestieres

### 1.2 Phase de prepositionnement

1. Les VPI (vehicules de premiere intervention)
2. Verification journaliere de l'etat du materiel et des equipements

### 1.3 Phase d'alerte

#### Content of the alert message

Premier message, alerte sur l'incendie:

1. Heure ud declenchement
2. Gravite de l'incident (Couleur de la fumee, vent, essences et composition, importance de l'etendue forestiere, accessibilite des vpi et des camions, duree estimee pour l'arrivee des equipes de lutte).
3. Situation administrative (lieu-dit, caidat, commune rurale)
4. Situation forestiere (secteur, forets)

Deuxieme message: importance de l'incendie:

1. Gravite de l'incident
2. Localisation (Commune rurale, Coordonee geographiques, pentes et exposition (mi-versant, bas-fond, etc...))
3. Situation forestiere
4. Conditions meteorologiques Vent (violent ou non, rafales, direction...) et Temperature (elevee, moderee ou faible).

**DPEFLCD et le principale canal de transmission des messages.**
