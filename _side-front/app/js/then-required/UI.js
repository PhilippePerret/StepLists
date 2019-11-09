'use strict'
if ('undefined' === typeof UI){ UI = {} }
Object.assign(UI,{
  class: 'UI'
, showPanel(panelName){
    this.hideCurrentPanel()
    this.currentPanel = this[panelName]
    this.currentPanel.classList.remove('noDisplay')
    if(panelName === 'itemsPanel'){
      // Il faut calculer la taille des étapes dans le listing, en pixel,
      // en fonction de leur nombre et de la largeur du listing.
      Item.defineDimensions()
    }
  }
, showLists(){this.showPanel('listsPanel')}
, hideCurrentPanel(){
    this.currentPanel.classList.add('noDisplay')
  }

})
Object.defineProperties(UI,{
    currentPanel:{
        get(){return this._currentPanel || this.mainPanel}
      , set(v){this._currentPanel = v}
    }
  , mainPanel:{get(){return document.querySelector('div#main-panel')}}
  , listsPanel:{get(){return document.querySelector('div#lists-panel')}}
  , itemsPanel:{get(){return document.querySelector('div#items-panel')}}
  , prefsPanel:{get(){return document.querySelector('div#preferences-panel')}}
})
