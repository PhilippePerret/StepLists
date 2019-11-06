# Liste Progression

Application devant permettre de suivre des listes de choses sur plusieurs étapes (on pourrait d'ailleurs l'appeler plutôt "stages" ou "steps").

Je voudrais l'utiliser pour :

* les tutoriels Scrivener
* les corrections Narration
* les articles du blog d'écriture
* les tutoriels de musique


## Principe général

On définit une liste (pe "Tutoriels Scrivener").
On définit les étapes par lesquels on doit passer pour le fabriquer (pe "Réflexion","Plan","Enregistrement de l'audio","Enregistrement vidéo","montage", "diffusion","Annonce")
On définit les objets (les tutoriels)
On les déplace de colonne en colonne à mesure qu'ils sont fabriqués

## Les plus qui aident

Deux liens permettent d'ouvrir le fichier et/ou le dossier lié à l'objet

## Programmation

Node.js en développant mon framework pour faire des applications très rapidement (cf. Projets ou Lois de la narration)

### Classes de l'application

#### List

Un type de liste, définissant ses propres étapes.

#### Step

Une étape, appartenant à une liste.

#### Item

Un objet de liste, à une étape donnée.
