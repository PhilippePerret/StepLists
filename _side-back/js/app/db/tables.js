'use strict'

/**
  Module contenant la définition des tables de la base de données propres
  à l'application
**/

const DB_Tables = [
  {
      name: 'Lists'
    , autoincrement: true // ajoute automatiquement la colonne ID
    , columns: [
          {name: 'titre', type:'VARCHAR(200)', unique:true, notNull:true, default:null}
        , {name:'description',  type:'TEXT'}
        , {name:'type',         type:'INTEGER(1)'}
        , {name:'stepsId',      type:'TINYTEXT'}//Ids séparés par des espaces
        , {name:'sorted_items', type:'TEXT'}
        , {name:'created_at',   type:'DATE'}
        , {name:'updated_at',   type:'DATE'}
      ]
  }
, {
      name: 'Steps'
    , autoincrement:true
    , columns: [
          {name: 'titre', type:'VARCHAR(200)', unique:false, notNull:true}
        , {name:'list_id', type:'INT'} // juste pour mémoire (*)
        , {name:'description', type:'TEXT'}
        , {name:'nombreJours',type:'INT(3)'}
        , {name:'created_at', type:'DATE'}
        , {name:'updated_at', type:'DATE'}
      ]
      /**
        (*) C'est "juste pour mémoire" dans le sens où la propriété `steps`
            de la liste consigne les identifiants des listes, ce qui permet
            de gérer plus facilement le classement.
      **/
  }
, {
      name: 'Items'
    , autoincrement: true
    , columns: [
          {name:'titre',        type:'VARCHAR(255)', unique:true, notNull:true}
        , {name:'description',  type:'TEXT'}
        , {name:'list_id',      type:'INTEGER'}
        , {name:'steps',        type:'TINYTEXT'}
        , {name:'expectedNext', type:'DATE'}
        , {name:'action1',      type:'TEXT'}
        , {name:'action2',      type:'TEXT'}
        , {name:'action3',      type:'TEXT'}
        , {name:'created_at',   type:'DATE'}
        , {name:'updated_at',   type:'DATE'}
      ]
  }
]

module.exports = DB_Tables
