# Node JS Framework

* [Construction d'une nouvelle application](#buil_new_app)
* [Interface de l'application](#app_ui)

## Construction d'une nouvelle application {#buil_new_app}

* dupliquer tout le dossier `NodeJSFramework` à l'endroit voulu et renommer ce dossier du nom de l'application,
* reporter le nom de cette application dans le fichier `package.json` (propriétés `name` et `productName`),
* [pour le moment] détruire le dossier `.git` et relancer `git init`
* définir les [paramètres MySql](#define_mysql_settings) si l'application a besoin d'une base de données,
* lancer la commande `npm update` pour actualiser les modules
* si `electron` n'est pas encore chargé sur l'ordinateur, jouer `npm install electron -g`,
* définir le fichier `./_side-front/app/main-template.html` pour qu'il corresponde à l'apparence voulue pour l'application (cf. [Interface de l'application](#app_ui)),
* jouer npm start


---

## Interface de l'application {#app_ui}

L'interface de l'application se définit dans le fichier `./_side-front/app/main-template.html`.

---

## Définition des paramètres MySql {#define_mysql_settings}

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

Il faut notamment définir `database` qui sera la base à utiliser pour l'application. Cette base doit exister et contenir les tables requises. Par défaut, cette table s'appelle `NodeJSFramework` et contient la table `table_essai`.

## Lancement simple de l'application

`npm start`

## Actualisation du fichier HTML principal

Lancer l'application avec `npm run start-update`
