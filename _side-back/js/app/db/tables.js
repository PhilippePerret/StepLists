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
          {
              name: 'titre'
            , type: 'VARCHAR(200)'
            , unique: true
            , notNull: true
            , default: null // 'NULL' ne serait pas pareil
            ,
          }
        , {name:'description', type:'TEXT'}
        , {name:'type', type:'INTEGER(1)'}
        , {name:'steps', type:'TEXT'}
        , {name:'sorted_items', type:'TEXT'}
        , {name:'created_at', type:'DATE'}
        , {name:'updated_at', type:'DATE'}
      ]
  }
, {
      name: 'Items'
    , autoincrement: true
    , columns: [
          {
              name:'titre'
            , type:'VARCHAR(255)'
            , unique: true
            , notNull:true
          }
        , {name:'description',  type:'TEXT'}
        , {name:'list_id',      type:'INTEGER'}
        , {name:'steps',        type:'TEXT'}
        , {name:'expectedNext', type:'DATE'}
        , {name:'action1',      type:'TEXT'}
        , {name:'action2',      type:'TEXT'}
        , {name:'action3',      type:'TEXT'}
        , {name:'created_at',   type:'DATE'}
      ]
  }
]

module.exports = DB_Tables
