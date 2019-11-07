# Node JS Framework

* [Présentation](#presentation)
* [Construction d'une nouvelle application](#buil_new_app)
* [Lancer l'application](#run_app)
* [Interface de l'application](#app_ui)
  * [Actualisation du fichier HTML principal](#update_html_file)
* [Réglage des paramètres MySql](#define_mysql_settings)
  * [Définition des tables DB](#define_tables_db)
  * [Reconstruction complète de la base de données](#rebuild_db)


## Présentation {#presentation}

*Node JS Framework* est un framework permettant de construire très rapidement une application NodeJS simple (mais avec toutes les fonctionnalités de base utiles : base de données, messages, etc.).


## Construction d'une nouvelle application {#buil_new_app}

* dupliquer tout le dossier `NodeJSFramework` à l'endroit voulu et renommer ce dossier du nom de l'application,
* reporter le nom de cette application dans le fichier `package.json` (propriétés `name` et `productName`),
* dans `package.json`, régler la valeur du compte github,
* [pour le moment] détruire le dossier `.git` et relancer `git init` (`git add -A;git commit -m "Premier dépôt";`)
* Ajouter ce dossier à `Github Desktop` pour le publier plus facilement,
* définir les [paramètres MySql](#define_mysql_settings) si l'application a besoin d'une base de données,
* définir les tables DB dans le fichier `./_side-back/app/js/db/tables.js` (cf. [Définition des tables DB](#define_tables_db)),
* lancer la commande `npm update` pour actualiser les modules
* si `electron` n'est pas encore chargé sur l'ordinateur, jouer `npm install electron -g`,
* définir le fichier `./_side-front/app/main-template.html` pour qu'il corresponde à l'apparence voulue pour l'application (cf. [Interface de l'application](#app_ui)),
* jouer npm start


---

## Lancer l'application {#run_app}

`npm start`

---


## Interface de l'application {#app_ui}

L'interface de l'application se définit dans le fichier `./_side-front/app/main-template.html`.


### Actualisation du fichier HTML principal {#update_html_file}

Lancer l'application avec `npm run start-update`

Cette commande est à utiliser après la modification du template de l'application (le fichier `./_side-front/app/main-template.html`).

---

## Réglage des paramètres MySql {#define_mysql_settings}

Les paramètres MySql se définissent dans le fichier `./data/secret/mysql.js`.

> Note : le dossier `./data/secret/` contient tous les fichiers/dossiers qui contiennent des informations sensibles et ne doivent pas être "gittés".

Pour définir les données MySql avec le code :

```javascript

const MYSQL_DATA = {
    local:{
        host: 'localhost'
      , user: 'root'
      , password: '_PASSWORDLOCAL_'
      , database: '_DB_BASE_NAME_'
    }
  , distant:{
        host: '_DISTANT_HOST_'
      , user: '_DISTANT_USER_'
      , password: '_DISTANT_PASSWORD_'
      , database: '_DISTANT_DBASENAME_'
    }
}
module.exports = MYSQL_DATA

```

Il faut notamment définir `database` qui sera la base à utiliser pour l'application.

### Définition des tables DB {#define_tables_db}

On définit les tables DB dans le fichier `./_side-back/app/js/db/tables.js` qui définit la constantE `DB_TABLES`. C'est une liste dont chaque élément définit une table :

```javascript

const DB_TABLES = [
    {/* définition table A (cf. ci-dessous) */}
  , {/* définition table B */}
  //...
  , {/* définition table Z */}
]

```

Chaque table est définie par un hash qui contient :

```javascript

// Définition de la table A
{
      name: "nom_de_la_table"
    , autoincrement: true // ou false
    , columns: [
          {/* définition de la colonne 1 (cf. ci-dessous) */}
        , {/* définition de la colonne 2 */}
        // ...
        , {/* définition de la colonne X */}
      ]
}

```

> Note : si `autoincrement` est true, il est inutile de créer la colonne `id`, ce sera fait automatiquement.

Chaque colonne est définie par un hash qui contient :

```javascript

// Définition de la colonne 1
{
    name: 'nom_de_la_colonne'
  , type: 'INT' // ou autre type valide
  , default: null // valeur par défaut, 'NULL' pour valeur null
  , unique: false // ou true si la valeur doit être unique
  , notNull: true // ou false si la valeur peut être non définie
}
```

Une définition complète peut donc ressembler à :

```javascript

const DB_TABLES = [
  {
      name: "Auteurs"
    , autoincrement: true // crée la colonne ID
    , columns: [
          {name:'prenom', type:'VARCHAR(100)', notNull:true}
        , {name:'nom',    type:'VARCHAR(100)', notNull:true}
        , {name:'naissance' type:'VARCHAR(8)'}
        , {name:'created_at', type:'DATE'}
      ]
  }
, {
      name: 'Livres'
    , autoincrement:true
    , columns:[
          {name:'titre', type:'VARCHAR(255)'}
        , {name:'auteur_id', type:'INT'}
        , {name:'reference_type', type:'VARCHAR(8)'}  // p.e. 'ISBN'
        , {name:'reference', type:'VARCHAR(30)'}      //p.e. le n° ISBN
      ]
  }
]

```

### Reconstruction complète de la base de données {#rebuild_db}

ATTENTION : cette opération détruit toutes les données qui pourraient se trouver dans les tables.

Lancer `npm run update-db`

---
