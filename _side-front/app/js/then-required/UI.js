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
    // On applique le titre
    this.panelTitle.innerHTML = ((panel)=>{
      switch(panel){
        case 'listsPanel':return "Listes suivies";
        case 'itemsPanel':return `<button onclick="UI.showPanel.call(UI,'listsPanel')">◁</button> ${List.current.titre}`;
        case 'prefsPanel':return "Préférences";
        case 'mainPanel':return 'Accueil';
        default: return 'Panneau inconnu…'
      }
    })(panelName)
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
  , panelTitle:{get(){return DGet('h1#panel-title')}}
  , mainPanel:{get(){return DGet('div#main-panel')}}
  , listsPanel:{get(){return DGet('div#lists-panel')}}
  , itemsPanel:{get(){return DGet('div#items-panel')}}
  , prefsPanel:{get(){return DGet('div#preferences-panel')}}
})
