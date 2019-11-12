'use strict'
/**
  Classe pour une étape absolue
**/
class Step {
  /** ---------------------------------------------------------------------
    *   CLASSE
    *
  *** --------------------------------------------------------------------- */
  static init(){
    // Initialisation de la liste dans le formulaire de liste
    List.divSteps.querySelector('.btn-up').addEventListener('click', this.moveCurrentUp.bind(this))
    List.divSteps.querySelector('.btn-down').addEventListener('click', this.moveCurrentDown.bind(this))
  }

  static get current(){return this._current}
  static set current(v){
    if ( this._current ) {
      this.current.li.classList.remove('current')
      List.divSteps.querySelector('div.btns-selected').classList.add('hidden')
    }
    if ( v ){
      this._current = v
      v.li.classList.add('current')
      List.divSteps.querySelector('div.btns-selected').classList.remove('hidden')
    }
  }

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

  // Pour monter l'étape courante
  static moveCurrentUp(){
    var prev = this.current.li.previousSibling
    if (prev){
      console.log("prev:",prev)
      this.current.li.parentNode.insertBefore(this.current.li,prev)
    }
    console.log("up")
  }
  // Pour descendre l'étape courante
  static moveCurrentDown(){
    var next = this.current.li.nextSibling
    if (next){
      if ( next.nextSibling ){
        this.current.li.parentNode.insertBefore(this.current.li, next.nextSibling)
      } else {
        this.current.li.parentNode.appendChild(this.current.li)
      }
    }
    console.log("Down")
  }

  /**
    Appelée lorsque les étapes de la liste ont été modifiées (que la liste
    contienne déjà des éléments ou non)
    Vérifie si des modifications d'étapes sont à faire dans la liste {List}
    +liste+ et les opère.
    Cf. Manuel-App-Developper.md#on_change_steps_with_items (Changement des
    étapes d'une liste possédant des items)
  **/
  static async checkAndResolveStepsChanges(liste){
    if ( !liste._items ) await list.load()

    // Répétition pour chaque item de la liste concernée
    liste.forEachItem( item => {
      if (item.doneSteps.length) {
        // <= L'item possède des étapes faites
        // => Il faut la traiter

        console.log("steps au début de l'item #%d : %s", item.id, item.steps)

        // On commence par faire une table avec en clé l'ID de l'étape et
        // en valeur une table qui contiendra le nouvel index à donner à
        // l'étape, et son temps s'il est défini
        var itemTableSteps = {}
        item.doneSteps.forEach(step => {
          Object.assign(itemTableSteps, {[step.stepId]: {id:step.stepId, index:null, date:step.simpleDate, doneStep:step}})
        })

        // On boucle sur chaque étape de la liste
        var stepCount = liste.steps.length
        for(var istep = 0; istep < stepCount; ++istep){
          var step_id = liste.steps[istep].id
          if ( undefined === itemTableSteps[step_id] ) {
            Object.assign(itemTableSteps, {[step_id]: {id:step_id, index:istep, date:null, doneStep:null}})
          }
          // On règle toujours l'index
          itemTableSteps[step_id].index = parseInt(istep,10)
        }

        // On épure la table pour ne garder que les éléments qui définissent
        // un index (les autres correspondent à des étapes supprimées)
        for(var stepid in itemTableSteps){
          if ( itemTableSteps[stepid].index === null ){
            delete itemTableSteps[stepid]
          }
        }

        // On classe les étapes de l'item par l'index
        var newSteps = Object.values(itemTableSteps).sort((a,b) => {return a.index > a.index ? 1 : -1})
        // On recompose la liste final en créant les dates si nécessaire
        var newStepsStr = []
        for(var istep = 0, len = newSteps.length; istep < len; ++istep){
          var dstep = newSteps[istep]
          var date
          if ( dstep.date ) {
            date = dstep.date
          } else {
            // Il faut trouver une date
            var nextStep = newSteps[parseInt(istep,10)+1]
            if ( nextStep && nextStep.doneStep ) {
              var newTime = nextStep.doneStep.time - 4 * 3600 * 1000 /* 4 heures avant */
              date = new Date(newTime)
              // console.log("---- nextStep: ", nextStep)
              // console.log("nextStep.time: %d, => newTime = %d, date = ", nextStep.doneStep.time, newTime, date)
              // Ici il pourra y avoir une erreur si une étape dure moins de
              // 4 heures
            } else {
              // Pas d'étape suivante, on met maintenant
              date = new Date()
            }
            date = date.toLocaleDateString('en-US')
          }
          newStepsStr.push(`${dstep.id}:${date}`)
        } // fin de boucle sur chaque étape
        // On compose la donnée string et on la donne à l'item pour
        // enregistrement
        item.steps = newStepsStr.join(';')
        console.log("steps à la fin de l'item #%d : %s", item.id, item.steps)
        item.update()
      } // fin de si l'item a des étapes faites (doneSteps)
    })
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
      span.addEventListener('focus',  my.onFocus.bind(my, span))
      span.addEventListener('blur',   my.onBlur.bind(my, span))
    })
  }

  async destroy(){
    const my = this
    this.li.remove()
    var request = `DELETE FROM steps WHERE id = ${this.id}`
    var res = await MySql2.execute(request)
    List.updateList()
    List.showForm() // a été masqué par List.updateList()
  }

  onFocus(span, ev){
    Step.current = this
    span.select()
    return stopEvent(ev)
  }
  onBlur(span, ev){
    // On ne déselectionne pas, sinon les boutons seraient injouables (ils
    // disparaitraient aussitôt)
    return stopEvent(ev)
  }

  /** ---------------------------------------------------------------------
    *   Propriétés volatiles de Step
    *
  *** --------------------------------------------------------------------- */

  // Retourne l'instance {List} de la liste à laquelle appartient l'étape
  get list(){return this._list || defP(this,'_list',List.getById(this.list_id))}

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
