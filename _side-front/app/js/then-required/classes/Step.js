'use strict'
/**
  Classe pour une étape absolue
**/
class Step {
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
