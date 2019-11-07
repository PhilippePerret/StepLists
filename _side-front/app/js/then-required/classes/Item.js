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
    return stopEvent(ev)
  }
  static removeSelectedItem(ev){
    console.log("Destruction d'item demandée")
    return stopEvent(ev)
  }


  /** ---------------------------------------------------------------------
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */
  constructor(data){
    this.data = data
  }


}
