# Step Lists

## Classes

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
