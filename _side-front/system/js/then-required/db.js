'use strict'
/**
  Gestion des tables de la base de données "lois_narration"
**/
const DB = {
  prepareTables(){
    this.tableLois      = new DBTable('lois')
    this.tableThemes    = new DBTable('themes')
    this.tableSubThemes = new DBTable('subthemes')
    this.tableKeywords  = new DBTable('keywords')
    this.tableConnexes  = new DBTable('connected_lois')
    this.tableKwbyLoi   = new DBTable('lois_keywords')
  }
}

class DBTable {
  constructor(name){
    this.name = name // nom de la table
  }
  /**
    Schéma de la table, pour information
  **/
  get schema(){

  }
}
