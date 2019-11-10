# Step Lists
# Manuel du développeur

* [Classes](#lesclasses)
* [Changement des étapes d'une liste possédant des items](#on_change_steps_with_items)

## Classes {#lesclasses}

Elles sont toutes définies dans le dossier `./_side-front/app/js/classes/`.

### List

Pour définir une liste. Une liste contient les propriétés :

* **id**. Identifiant unique de la liste.
* **titre**. Titre de la liste.
* **description**. Description plus précise de la liste.
* **sorted_items**. Ces éléments triés, si nécessaire (\*).
* **type**. Un type, pour définir l'aspect de la liste. N'est pas encore utilisé.
* **steps**. Une suite d'actions. C'est une liste de choses à faire pour qu'un item passe de "en attente" à "achevé". Dans la base de données, elle est de type BLOB et contient la liste au format JSON.
* **created_at**. Date de création de la liste.

(\*) Les items de la liste sont affichés dans l'ordre de leur avancement au niveau des étapes. On peut inverser la liste ou définir une liste fixe personnalisée (enregistrée dans la propriétés `sorted_items`)

### Item

Ce sont les éléments des listes, par exemple une *page* pour la liste des corrections de pages de la collection narration, ou un *article* pour un blog.

Ces propriétés sont :

* **id**. Un identifiant unique.
* **list_id**. Identifiant de la liste à laquelle appartient l'item.
* **titre**. Le titre de l'élément, pour le caractériser.
* **description**. Une description plus précise de l'item, si nécessaire.
* **steps**. Valeurs pour la liste des étapes définies dans la liste. C'est une liste de timestamps qui correspondent à la date de réalisation de l'étape.
* **expectedNext**. Date de réalisation espérée pour l'étape courante.
* **action1**. Action opérée avec le bouton 1. C'est une donnée de type `open::<path>` (ouverture d'un dossier ou d'un fichier), `run::<code>` (exécution d'un code) ou `url::<url>` (ouverture d'URL dans le navigateur par défaut)
* **action2**. Action opérée avec le bouton 2.
* **action3**. Action opérée avec le bouton 3.
* **created_at**. Date de création de l'item.

**Description du cheminement de l'item**

À sa création, l'item appartient à une liste et se trouve dans sa liste d'attente, il n'est pas encore commencé. Ensuite, on le déclenche (ce qui inscrit la date de réalisation de l'étape précédente, donc l'attente ici) en définissant optionnellement une date de réalisation. Si une date de réalisation est définie, et qu'elle est atteinte, une notification est donnée et l'item se met en exergue dans la liste. Quand l'étape est réalisée, on clique sur le bouton "done" de l'item, il enregistre la date de réalisation et passe à l'étape suivante. Et ainsi de suite.

---

## Changement des étapes d'une liste possédant des items {#on_change_steps_with_items}

Que se passe-t-il si les étapes sont redéfinies quand des items existent ? Si on ne fait rien, les données des items seront *désynchronisés*, les temps ne correspondront plus, ainsi que l'étape courante.

Pour le moment, comme les noms des étapes ne sont pas mémorisées, elles ne peuvent pas être liées à leur nom, et même leur nom peut changer.

Noter que le plus simple serait de fournir un identifiant aux étapes et de l'enregistrer avec le temps de l'item.

Oui (on oublie l'autre procédure qui aurait été très consommatrice)

Procédure possible :

* On analyse les changements
* On demande à l'utilisateur de définir si des noms ont changé en présentant une liste des nouvelles procédures avec un menu disant :
  - nouvelle étape
  - ancienne étape : il faut choisir laquelle si elle a changé de nom
* après la confirmation, on peut ajouter les étapes manquantes aux items existants


Exemples :

Soit la liste `Romans` possédant des items `Roman`
Au départ, les étapes sont :

* Brouillon
* Premier jet
* Version définitive

On crée deux romans avec pour nom `Premier roman` et `Second roman`. Donc ces deux romans possèdent les trois étapes.

On modifie la liste des étapes en faisant :

* on crée une nouvelle étape avant `Version définitive` => `Correction`
* on modifie la première étape `Brouillon` => `Conception`

On analyse :

Des items existent, donc il faut les modifier.

Analyse des changements

* `Brouillon` a disparu
* `Conception` et `Correction` sont des nouvelles étapes

Note : si on avait juste eu des insertions (ie seulement l'étape `Correction` ajoutée), on aurait pu passer directement à la correction.

Puisqu'une étape a disparu, il faut demander. On présente la liste des nouvelles étapes avec un menu contenant ["Nouvelle étape", <liste des anciennes étapes disparues avec devant "Remplace"] donc le menu sera :

~~~
MENU
  Nouvelle étape
  Remplace "Brouillon"
~~~

Et on présente la liste des étapes avec :

* Conception MENU
* Rédaction
* Correction MENU
* Version définitive
