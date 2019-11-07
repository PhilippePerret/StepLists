'use strict'
/**
  Classe List
  ----------
  Gestion des listes
**/
class List {
  /** ---------------------------------------------------------------------
    *   CLASSE
    *
  *** --------------------------------------------------------------------- */


  /** ---------------------------------------------------------------------
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */
  constructor(data){
    this.data
  }
  get titre(){return this.data.titre}
  set titre(v){this.data.titre = v; this.setModified()}
  get description(){return this.data.description}
  set description(v){this.data.description = v; this.setModified()}
  get sorted_items(){return this.data.sorted_items}
  set sorted_items(v){this.data.sorted_items = v; this.setModified()}
  get type(){return this.data.type}
  set type(v){this.data.type = v; this.setModified()}
  get steps(){return this.data.steps}
  set steps(v){this.data.steps = v; this.setModified()}
  get created_at(){return this.data.created_at}
  set created_at(v){this.data.created_at = v; this.setModified()}
  get updated_at(){return this.data.updated_at}
  set updated_at(v){this.data.updated_at = v; this.setModified()}

  // Pour marquer la donnée modifiée
  setModified(v){v = v || false; this.modified = v}
}
