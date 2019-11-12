* Utiliser les propriétés plutôt que l'eval, pour le classement
* Le calcul de l'échéance de fin est mauvais

* Améliorer l'affichage des données de l'étape courante :
  - lorsqu'elle n'est pas démarrée : marquer seulement "En attente de démarrage" (supprimer le label)
  - ajouter la fin calculée de l'item
* Gestion des items de liste (avec le nouveau fonction des steps)
  * Mettre en rouge si une échéance est passée

* Pouvoir choisir le classement des listes :
  - par ordre alphabétique
  - par ordre de priorité d'échéance (les échéances les plus proches au-dessus)
  => Une fenêtre préférences qui permette d'enregistrer ça

* Faire une classe step pour les étapes qui soit enregistrée dans la base
  - dans les items, associer l'ID avec le temps
  - updater la lecture des steps de l'item

* Ajouter des informations dans le span des étapes exécutées d'un item (son nom complet, date de début/de fin) qui apparaitront quand on clique dessus (pas un title, donc)

* Bien expliquer (pour le développeur) comment fonctionne expectedNext : en fait, c'est quand on passe l'item à l'étape suivante que le programme demande la date de réalisation attendue (peut-être avec une tolérance ? — mais il n'y a pas de champ pour ça, encore)
* Édition d'un item (en cliquant dessus — ie en le mettant en courant)
* Pouvoir détruire une liste, après demande

* Faire le logo
* Faire les tests

* Amélioration : pouvoir donner des informations sur les étapes (on va finir par faire une table, finalement)
  - le titre (on l'a déjà)
  - la description
  - le nombre de jours donnés en général pour l'accomplir (mais on pourra le redéfinir dans l'item propre)
  * => au lieu d'un simplement champ de texte (textarea), mettre un autre listbox-oslike pour créer les nouvelles étapes. Ou voir s'il n'est pas plus simple, pour le moment, de fonctionner en séparant les données avec des '::'. Par exemple : "En attente::Un nouvel item qui n'est pas encore en chantier::4" (le "4" signifie que l'item ne doit pas rester plus de 4 jours en attente)

## Questions

### Rendre le formulaire d'édition de la liste flottant ?
