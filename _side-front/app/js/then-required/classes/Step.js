'use strict'
/**
  Classe pour une étape absolue
**/
class Step {
  /** ---------------------------------------------------------------------
    *   CLASSE
    *
  *** --------------------------------------------------------------------- */

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
  constructor(dataStr){
    this.data = dataStr
    this.dispatch(dataStr)
  }
  dispatch(dataStr){
    [this.titre, this.nombreJoursDefaut, this.description] = dataStr.split('::')
  }

}
