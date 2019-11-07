'use strict'

// const MYSQL = require('mysql')
// const MYSQL_DATA = require('../data/secret/mysql.js')

// const MYSQL = require('mysql2/promise')
// const bluebird = require('bluebird')
const MYSQL = require('mysql2')

/**
  Fichiers contenant la définition des tables dans la base
**/
const DBTABLES_DATA_ABSPATH = './_side-back/js/app/db/tables.js'
const DBTABLES_DATA_PATH    = '../_side-back/js/app/db/tables.js'


/**
  Données secrètes pour la connexion à la base MySql
  (seulement si le fichier est défini)
**/
const DATA_MYSQL_ABSPATH  = './data/secret/mysql.js'
const DATA_MYSQL_PATH     = '../data/secret/mysql.js'
var dataMySql = null
if ( fs.existsSync(DATA_MYSQL_ABSPATH) ) {
  dataMySql = require(DATA_MYSQL_PATH).local
} else {
  console.warn("Pas de données MySql définies (pas de fichier '%s')", DATA_MYSQL_ABSPATH)
}
const MYSQL_DATA = dataMySql

const MySql2 = {

  /**
    @async
    Exécute la requête +request+ sur la base de données de l'application
    +request+ peut avoir la forme d'une requête string ou :
    {sql: <string request>, rowsAsArray:true} pour retourner le résultat sous
    la forme d'une liste de résultat.
    Si +options+ contient :only_one, :only_first ou :first à true, alors la
    méthode ne retourne que la valeur (PAS la rangée, mais seulement la valeur)
  **/
  async execute(request, values, options){
    if ( ! MYSQL_DATA ) {
      console.error("Désolé mais aucune données de connexion à la base de données MySql n'est définie. Les requêtes SQL sont impossibles.")
      return null
    }
    if ( undefined === this._pool ) {
      this._pool = await MYSQL.createPool({
        // host:'localhost', user: 'root', database: 'test', Promise: bluebird
          host     : MYSQL_DATA.host
        , user     : MYSQL_DATA.user
        , password : MYSQL_DATA.password
        , database : this.database
      });
    }
    if ( undefined === this._promisePool ) {
      this._promisePool = this._pool.promise()
    }
    const [rows, fields] = await this._promisePool.query(request, values)
    // console.log("rows (retourné par '%s') : ", request, rows)
    if ( options && (options.only_first||options.only_one||options.first) ){
      return rows[0]
    } else {
      return rows
    }
  }

  /**
    Retourne la liste des tables de la base de données courante
  **/
, async tableNames(){
    var rows = await this.execute({sql:"SHOW TABLES", rowsAsArray:true})
    var liste = []
    for (var row of rows) { liste.push(row[0]) }
    return liste
  }

, async lastInsertId(){
    var res = await this.execute({sql:"SELECT LAST_INSERT_ID()", rowsAsArray:true})
    var lii = res[0][0]
    if ( lii === 0 ) {
      lii = await this.lastInsertId()
    }
    return lii
  }

  /**
    Méthode qui vérifie, au lancement de l'application, que les tables
    soient bien construites et les construit le cas échéant.
    Note : si le fichier de définition des tables n'existe pas, on ne
    fait rien.
  **/
  , async checkTables(){
      if ( this.tablesHasBeenChecked ) return
      if (false === fs.existsSync(DBTABLES_DATA_ABSPATH)){return}
      let tableNames = await this.tableNames()
      let dbtables = require(DBTABLES_DATA_PATH)
      for ( var dtable of dbtables ){
        if ( tableNames.indexOf(dtable.name) < 0 ){
          await new DBTable(dtable).build()
        }
      }
      this.tablesHasBeenChecked = true
  }
  /**
    Méthode qui permet de créer les tables quand elles n'ont pas
    été encore créées ou qu'elles n'existe pas.
    Si +force+ est true, on force la création (on la détruit si
    elle existe et on la reconstruit)
    cf. le manuel
  **/
, async createTablesIfRequired(force){
    if (false === fs.existsSync(DBTABLES_DATA_ABSPATH)) {
      return console.error("Le fichier '%s' n'existe pas. Impossible de créer les tables dans la base de données. Merci de consulter le manuel.", path.resolve(DBTABLES_DATA_ABSPATH))
    }
    let dbtables = require(DBTABLES_DATA_PATH)
    // console.log("Données des tables à construire le cas échéant = ", dbtables)
    for ( var dtable of dbtables ) {
      var table = new DBTable(dtable)
      if ( force ) {table.forceRebuild()}
      else {table.buildIfNotExists()}
    }
  }
}
Object.defineProperties(MySql2,{
database:{
    get(){return this._database || MYSQL_DATA.database}
  , set(v){this._database = v}
  }
, defaultOptions:{
    get(){return this._defopts || (this._defopts = '0000000000000000')}
  }
})

class DBTable {
  constructor(data){
    this.data = data
  }

  /**
    Appelée pour construire la table, mais seulement si elle n'existe
    pas.
  **/
  async buildIfNotExists(){
    if ( this.exists ) {
      return false
    } else {
      await this.build()
    }
  }

  async forceRebuild(){
    var codeBefore = `DROP TABLE IF EXISTS ${this.name};${CR}`
    await this.build(codeBefore)
  }

  /**
    Construction à proprement parler de la table
  **/
  async build(codeBefore){
    if (!codeBefore) codeBefore = ''
    await MySql2.execute(codeBefore+this.creationCode)
    console.log("Construction de la table '%s' exécutée avec succès.", this.name)
  }

  // Retourne true si la table existe
  get exists(){ return false /* TODO */}

  // Retourne le code de création de la table
  get creationCode(){
    var c = []
    c.push(`CREATE TABLE IF NOT EXISTS ${this.name} (`)
    if ( this.isAutoIncremented ) {
      c.push("id INT PRIMARY KEY AUTO_INCREMENT,")
    }
    var fcols = []
    for ( var dcol of this.columns ) {
      fcols.push(`${dcol.name} ${dcol.type}${dcol.unique?' UNIQUE':''}${dcol.notNull?' NOT NULL':''}${dcol.default? 'DEFAULT '+dcol.default:''}`)
    }
    c.push(fcols.join(','))

    c.push(')' + (this.isAutoIncremented ? ' AUTO_INCREMENT=1' : '') + ' ;')
    return c.join(CR)
  }


  /**
    Les propriétés de la table
  **/
  get name(){ return this.data.name }
  get isAutoIncremented(){return this.data.autoincrement === true}
  get columns(){return this.data.columns}

}
