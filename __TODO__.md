

* Améliorer l'affichage des données de l'étape courante :
  - lorsqu'elle n'est pas démarrée : marquer seulement "En attente de démarrage" (supprimer le label)
  - ajouter la fin calculée de l'item
* Gestion des items de liste (avec le nouveau fonction des steps)
  * Mettre en rouge si une échéance est passée

* Ajouter des informations dans le span des étapes exécutées d'un item (son nom complet, date de début/de fin) qui apparaitront quand on clique dessus (pas un attribut title, donc)

* Bien expliquer (pour le développeur) comment fonctionne expectedNext : en fait, c'est quand on passe l'item à l'étape suivante que le programme demande la date de réalisation attendue (peut-être avec une tolérance ? — mais il n'y a pas de champ pour ça, encore)
* Édition d'un item (en cliquant dessus — ie en le mettant en courant)
* Pouvoir détruire une liste, après demande

* Faire le logo
* Faire les tests

## Questions

### Rendre le formulaire d'édition de la liste flottant ?


## Études de cas

### Modification des étapes

étapes initiales : 1;2;5;3
nouvelles étapes : 3;1;4;2

Donc :
- 3 a été déplacé au début
- 4 a été inséré entre 1 et 2
- 5 a été supprimé

Un item contient les trois étapes

étude de la première étape :
- elle ne correspond pas (1 contre 3)
=> On cherche si elle existait déjà dans les étapes initiales
=> Oui
=> On la retire de sa place actuelle pour la mettre dans cette position

En fait, on peut faire un hash des étapes de l'item qui contient :

```javascript

{
  stepId: {stepId: <id step>, index: <position calculée>, time: temps}
  stepId2: {stepId: <id step2>, index: <position calculée>, time: temps ou rien}
}

```

- On fait une table à partir des doneSteps de l'item
  - On met tous les index à null (les étapes qui n'auront plus d'index sont des étapes supprimées)
- On étudie l'étape courante
  SI étape correspond
    On met son index à l'index courant (pas tout de suite)
  SI étape ne correspond pas
    SI l'id existe dans la table
      => on met son index à l'index courant
    SI l'id n'existe pas dans la table
      => On crée une nouvelle entrée dans la table, avec l'index courant
  Quelles que soient les conditions, on met l'index courant ici

Traitement des index restants

- on fait le tour de la table pour supprimer les étapes sans index (correspond)


Au cours de l'étape, on règle 'index' pour que ça corresponde à la nouvelle liste
