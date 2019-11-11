'use strict'
/** ---------------------------------------------------------------------
  *   Classe DoneStep
  *   ---------------
  Gestion des étapes accomplies
  *
*** --------------------------------------------------------------------- */
class DoneStep {
  /**
    Instanciation à l'aide de l'instance de l'item et de la données qui
    contient "<id step de liste>:<date simple d'achèvement>"
  **/
  constructor(item, dataStr){
    this.item = item
    var [stepid, date] = dataStr.split(':')
    this.stepId = parseInt(stepid,10)
    this._simpledate = date
    console.log("stepId: %d, date: %s", this.stepId, this.date)
  }

  /**
    | Propriétés
  **/
  get titre(){return this.step.titre}
  get date(){return this._date || this.simpleDate}
  get simpleDate(){return this._simpledate}
  // Instance {List} de la liste à laquelle appartient l'item
  get list(){return this.item.list}
  // Retourne l'instance {Step} de l'étape absolue
  get step(){
    return this._step || defP(this,'_step',this.list.stepsById(this.stepId))
  }
  get stepId(){return this._stepid}
  set stepId(v){this._stepid = v}
}
