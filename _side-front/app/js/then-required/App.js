'use strict'
Object.assign(App,{
  onInit(){
    List.init()
    Item.init()
    Step.init()
    // Pour le test, l'affichage des listes
    List.showAll()
  }
})
