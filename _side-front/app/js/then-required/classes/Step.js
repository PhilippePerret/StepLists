'use strict'
/**
  Classe pour une étape absolue
**/
class Step {
  /** ---------------------------------------------------------------------
    *   CLASSE
    *
  *** --------------------------------------------------------------------- */

  static newId(){
    if(undefined === this.lastNewId){this.lastNewId = -0}
    return --this.lastNewId
  }

  static defaultLi(step_id){
    return `
        <li class="step" id="step-${step_id}" data-id="${step_id}"
          ><input type="text" class="titre" placeholder="Titre unique"
          ><input type="text" class="description" placeholder="Description"
          ><input type="text" class="nombre_jours" value="10"
        ></li>
      `
  }
  /**
    Vérifie si des modifications d'étapes sont à faire dans la liste {List}
    +liste+ et les opère.
    Cf. Manuel-App-Developper.md#on_change_steps_with_items (Changement des
    étapes d'une liste possédant des items)
  **/
  static checkAndResolveStepsChanges(liste){
    // On se contente maintenant de gérer les étapes qui n'existent plus
    // et celles qui sont ajoutées (sauf à la fin)
  }

  /** ---------------------------------------------------------------------
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */
  /**
    Instanciation avec la donnée string enregistrée dans la liste
  **/
  constructor(data){
    this.data = data
  }

  build(){
    List.stepsList.appendChild(this.li)
    this.observe()
  }

  observe(){
    const my = this
    this.li.querySelectorAll('input[type="text"]').forEach(span => {
      span.addEventListener('focus',  my.onFocus.bind(my))
      span.addEventListener('blur',   my.onBlur.bind(my))
    })
  }

  onFocus(){
    Step.current = this
    console.log("Focus dans l'étape", this.id)
  }
  onBlur(){
    delete Step.current
    console.log("Blur de l'étape", this.id)
  }

  /** ---------------------------------------------------------------------
    *   Propriétés volatiles de Step
    *
  *** --------------------------------------------------------------------- */

  // Retourne l'instance {List} de la liste à laquelle appartient l'étape
  get list(){
    if (undefined === this._list){
      this._list = List.getById(this.list_id)
    } return this._list
  }

  // Retourne l'objet DOM LI de l'étape
  get li(){
    if ( undefined === this._li ){
      this._li = DCreate('LI',{class:'step',id:`step-${this.id}`, 'data-id':this.id, inner:[
          DCreate('INPUT', {type:"text", class:'titre', placeholder:"Titre unique", value:this.titre})
        , DCreate('INPUT', {type:"text", class:'description', placeholder:"Description", value:this.description})
        , DCreate('INPUT', {type:"text", class:'nombre_jours', value:this.nombreJours})
      ]})
    } return this._li
  }


  /** ---------------------------------------------------------------------
    *   Propriétés fixes de Step
    *
  *** --------------------------------------------------------------------- */
  get id(){return this.data.id}
  get list_id(){return this.data.list_id}
  get titre(){return this.data.titre}
  set titre(v){ this.data.titre = v}
  get description(){return this.data.description}
  set description(v){ this.data.description = v}
  get nombreJours(){return this.data.nombreJours}
  set nombreJours(v){ this.data.nombreJours = v}
  get updated_at(){return this.data.updated_at}
  set updated_at(v){ this.data.updated_at = v}
  get created_at(){return this.data.created_at}
  set created_at(v){ this.data.created_at = v}
}
