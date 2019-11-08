'use strict'
/**
  Classe Item
  ----------
  Pour les items de liste
**/
class Item {

  /** ---------------------------------------------------------------------
    *   CLASSE
    *
  *** --------------------------------------------------------------------- */

  /**
    Initialisation du panneau des items
    Notamment pour rendre actif les + et -
  **/
  static init(){
    let btnPlus   = document.querySelector('div#div-list-items div.btn-plus')
      , btnMoins  = document.querySelector('div#div-list-items div.btn-moins')
    btnPlus.addEventListener('click', this.addItemToCurrentList.bind(this))
    btnMoins.addEventListener('click', this.removeSelectedItem.bind(this))
  }

  static addItemToCurrentList(ev){
    console.log("Ajout d'item demandé")
    let form = document.querySelector('form#item-form')
    form.classList.remove('noDisplay')
    return stopEvent(ev)
  }
  static removeSelectedItem(ev){
    console.log("Destruction d'item demandée")
    return stopEvent(ev)
  }


  /** ---------------------------------------------------------------------
    *   INSTANCE
    *
    * Une instance, c'est par exemple un article pour une liste qui serait
    * un blog.
  *** --------------------------------------------------------------------- */
  constructor(data){
    this.data = data
  }

  /**
    |Propriétés volatiles
  **/

  // Liste (instance List) auquel appartient l'itemp
  get list(){
    if (undefined === this._list){
      this._list = List.getById(this.list_id)
    } return this._list
  }
  // Liste des valeurs des étapes exécutées
  get aSteps(){
    if ( undefined === this._asteps ) {
      this._asteps = this.steps.split(';')
    } return this._asteps
  }
  /**
    |Propriétés fixes (enregistrées)
  **/
  get titre(){return this.data.titre}
  set titre(v){this.data.titre = v}
  get description(){return this.data.description}
  set description(v){this.data.description = v}
  get list_id(){return this.data.list_id}
  set list_id(v){this.data.list_id = v}
  get steps(){return this.data.steps}
  set steps(v){this.data.steps = v}
}
