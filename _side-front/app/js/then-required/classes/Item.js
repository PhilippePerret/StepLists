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


  // Les éléments graphiques
  static get panel(){return UI.itemsPanel}
  static get btnPlus(){return this.panel.querySelector('.btn-plus')}
  static get btnMoins(){return this.panel.querySelector('.btn-moins')}
  static get divListing(){return this.panel.querySelector('#div-list-items')}
  static get listing(){return this.divListing.querySelector('ul#item-list')}
  static get displayTypeMenu(){return this.panel.querySelector('.display-type')}
  static get sortTypeMenu(){return this.divListing.querySelector('.sort-type')}
  static get btnUp(){return this.divListing.querySelector('.btn-up')}
  static get btnDown(){return this.divListing.querySelector('.btn-down')}
  static get form(){return DGet('form#item-form')}
  static get btnSaveItem(){return DGet("button#btn-save-item")}
  static get btnCancelSaveItem(){return DGet("button#btn-cancel-edit-item")}
  static get idField(){return DGet('form#item-form input#item-id')}
  static get buttonsSelect(){return UI.itemsPanel.querySelector('div.btns-selected')}
  static get divInfos(){return this.panel.querySelector('#selected-item-infos')}

  /**
    Initialisation du panneau des items
    Notamment pour rendre actif les + et -
  **/
  static init(){
    // Surveillance des boutons + et -
    this.btnPlus.addEventListener('click', this.addItemToCurrentList.bind(this))
    this.btnMoins.addEventListener('click', this.removeSelectedItem.bind(this))

    // Surveillance du menu, dans le formulaire, pour choisir les actions
    for(var i of [1,2,3]){
      var racineId = `item-action${i}`
      var selectId = `#${racineId}-type`
      var selectObj = DGet(selectId)
      selectObj.addEventListener('change', this.onChooseTypeAction.bind(this,i))
      var btnChooseId = `#btn-choose-file-action${i}`
      let btnChoose   = DGet(btnChooseId)
      btnChoose.addEventListener('click',this.chooseActionFile.bind(this,i))
    }

    // Pour sauver un item (nouveau ou pas) ou annuler sa création/édition
    this.btnSaveItem.addEventListener('click', this.onSaveItem.bind(this))
    this.btnCancelSaveItem.addEventListener('click', this.cancelSaveItem.bind(this))

    // --- Les boutons d'action sur la sélection ---
    // Pour éditer l'item sélectionné
    var btnEditItem = this.panel.querySelector('.btn-edit-item')
    btnEditItem.addEventListener('click',this.editSelectedItem.bind(this))
    // Pour faire avancer l'item (+ 1 étape)
    var btnNextStep = this.buttonsSelect.querySelector('.btn-next-step')
    btnNextStep.addEventListener('click',this.SelectedToNextStep.bind(this))
    // Pour faire reculer l'item (- 1 étape)
    var btnPrevStep = this.buttonsSelect.querySelector('.btn-prev-step')
    btnPrevStep.addEventListener('click',this.SelectedToPrevStep.bind(this))
    // Pour remonter ou descendre l'item dans la liste
    this.btnUp.addEventListener('click', this.moveSelectedUp.bind(this))
    this.btnDown.addEventListener('click', this.moveSelectedDown.bind(this))

    // Observer les boutons d'action véritable, dans le bloc des infos, qui
    // permettent de lancer l'action
    this.divInfos.querySelector('#btn-action1').addEventListener('click',this.onClickActionButton.bind(this,1))
    this.divInfos.querySelector('#btn-action2').addEventListener('click',this.onClickActionButton.bind(this,2))
    this.divInfos.querySelector('#btn-action3').addEventListener('click',this.onClickActionButton.bind(this,3))

    // Tous les boutons permettant de sauver la liste
    DGetAll('.btn-save-list').forEach(btn => {
      btn.addEventListener('click',this.updateCurrentList.bind(this))
    })
    // Pour forcer l'affichage à bien se régler
    this.current = null

    // Pour observer le menu du type de classement
    this.sortTypeMenu.addEventListener('change',this.defineSortingType.bind(this))
    // Pour observer le menu du type d'affichage
    this.displayTypeMenu.addEventListener('change',this.onChangeDisplayType.bind(this))
  }// /init

  static getById(item_id){
    return List.current.items[item_id]
  }
  /**
    Reçoit le LI (dom element) et retourne l'instance {Item}
  **/
  static getByLi(li){
    return this.getById(li.getAttribute('data-id'))
  }

  static forEachLi(method){
    this.listing.querySelectorAll('li.li-item').forEach(li => {
      console.log("li, this.getByLi(li)", li, this.getByLi(li))
      method(this.getByLi(li))
    })
  }

  /**
    Appelée quand on change de mode d'affichage des étapes
  **/
  static onChangeDisplayType(){
    const dispProp = this.displayTypeMenu.value
    this.forEachLi(item => item.setTextCurrentStep(item[dispProp]))
  }

  /**
    Règle l'ordre d'affichage en fonction du type d'affichage voulu
  **/
  static defineSortingType(){
    if ( this.sortTypeMenu.value == 'customSorting' ){
      this.customSort()
    } else {
      this.sortBy({sortMethod:this.sortTypeMenu.value})
    }
  }

  /**
    Classe la liste des items

    @param params {Object} Table de classement :
      @param params.sortMethod    La méthode de classement à utiliser (cf. plus bas)
  **/
  static sortBy(params){
    if(undefined === params){
      // <= +params+ n'est pas défini
      // => Il faut le définir d'après le menu avant de repasser par ici
      return this.defineSortingType()
    }

    var unsortableItems = []
      , sortableItems = []

    // Dans un premier temps, on sépare les items en attente (à ne pas classer)
    // des items lancés
    this.forEachLi(item => {
      if ( item.indexCurrentStep ) {
        // <= L'item est démarré
        sortableItems.push(item)
      } else {
        unsortableItems.push(item)
      }
    })

    // On classe les items démarrés
    sortableItems = sortableItems.sort(this[params.sortMethod].bind(this))
    // console.log("sortableItems = ", sortableItems)

    // On affiche la liste (note : on change le mode d'affichage de l'item pour
    // qu'ils affichent leur échéance plutôt que leur nom)
    this.listing.innerHTML = ''
    sortableItems.map( item => { this.listing.appendChild(item.li) } )

    if ( unsortableItems.length ) {
      // Ajout d'un délimiteur
      this.listing.appendChild(DCreate('DIV',{style:'border:2px solid #b1b1fb;'}))
      // Ajout à la fin les items non démarrés
      unsortableItems.map(item => this.listing.appendChild(item.li))
    }

    // On change le mode d'affichage pour voir l'échéance plutôt que le nom
    // de l'étape courante
    this.displayTypeMenu.value = ( (method) => {
      switch(method){
        case 'echeanceFinSorting':  return 'human_echeanceFin'
        case 'echeanceSorting':     return 'human_echeance'
        default:                    return 'titreCurrentStep'
      }
    })(params.sortMethod)
    this.onChangeDisplayType()

  }

  /**
    Classe les items en fonction de la liste défini
  **/
  static customSort(){
    // <= Le classement défini par l'utilisateur
    // => Il suffit d'afficher les items dans l'ordre
    if (List.current.sorted_items){
      List.current.sortedItems.forEach( item => {
        this.listing.appendChild(item.li)
        item.setTextCurrentStep(item.currentStep.titre)
      })
    } else {
      alert("Pas de classement propre défini. Pour l'obtenir, déplacer les items à l'aide des flèches puis enregistrer la liste.")
      // TODO On remet le menu type de classement à la première valeur
    }
  }

  /**
    Callbacks pour les classements
  **/
  static alphabSorting(a,b){return a.titre > b.titre ? 1 : -1}
  static alphabInvSorting(a,b){return a.titre < b.titre ? 1 : -1}
  static echeanceSorting(a,b){return a.echeance > b.echeance ? 1 : -1}
  static echeanceFinSorting(a,b){return a.echeanceFin > b.echeanceFin ? 1 : -1}

  /**
    Définit les dimensions utiles
  **/
  static defineDimensions(){
    if ( !this.listing.offsetWidth ){
      return setTimeout(this.defineDimensions.bind(this),500)
    }
    // Largeur actuelle du listing
    var listingW    = this.listing.offsetWidth
    var stepsCount  = List.current.steps.length
    var titreWidth  = 262
    var liPadding   = 12 + (4 * stepsCount)
    this.spanStepWidth = Math.ceil((listingW - (titreWidth + liPadding)) / stepsCount)
    // On retire le bord
    this.spanStepWidth -= 2 // 2 x 1px
    // console.log("listingW = ", listingW)
    // console.log("stepsCount = ", stepsCount)
    // console.log("spanStepWidth", this.spanStepWidth)
  }

  /**
    Méthode pour remonter ou descendre l'item
  **/
  static moveSelectedUp(ev){
    var li = this.current.li
    if ( li.previousSibling ) {
      li.parentNode.insertBefore(li, li.previousSibling)
      this.memoriseSortedItems()
      this.showButtonSaveList()
    }
    return stopEvent(ev)
  }
  static moveSelectedDown(ev){
    var li = this.current.li
    if ( li.nextSibling ) {
      li.parentNode.insertBefore(li, li.nextSibling.nextSibling)
      this.memoriseSortedItems()
      this.showButtonSaveList()
    }
    return stopEvent(ev)
  }

  // Prendre le nouveau classement des items et le mémoriser dans les
  // changements non enregistrés de la liste de l'item courant
  static memoriseSortedItems(){
    var newSortedItems = []
    this.listing.querySelectorAll('li').forEach(li => {
      newSortedItems.push(li.getAttribute('data-id'))
    })
    newSortedItems = newSortedItems.join(';')
    Object.assign(this.current.list.unsavedChanges, {sorted_items: newSortedItems})
  }

  // Afficher le bouton "Actualiser la liste"
  static showButtonSaveList(){
    this.divListing.querySelector('.btn-save-list').classList.remove('noDisplay')
  }

  /**
    Méthode permettant d'actualiser la liste de l'item courant
    Cette méthode est utilisée, par exemple, lorsque l'on a fini de
    classer les items (c'est sa seule fonction pour le moment, mais
    on pourrait imaginer qu'il y en ait d'autres).
  **/
  static updateCurrentList(){
    this.current.list.saveChanges()
  }

  /**
    Méthode appelée quand on clique sur un bouton d'action
  **/
  static onClickActionButton(iAction, ev){
    console.log("Action %d invoquée", iAction)
    let actionType = this.current[`action${iAction}Type`]
      , actionValue = this.current[`action${iAction}Value`]
    var cmd
    switch(actionType){
      case 'file':
      case 'folder':
      case 'url':
        cmd = `open "${actionValue}"`
        break
      default:
        cmd = actionValue
    }
    cmd = cmd.replace(/\"/g,'\\"')
    cmd = `bash -c ". ${App.homeDirectory}/.bash_profile; shopt -s expand_aliases\n${cmd}"`
    console.log("Commande exécutée : %s", cmd)
    try {
      exec(cmd, (error, stdout)=>{
        console.log(error, stdout)
      })
    } catch (e) {
      console.error("Problème avec la commande '%s' : %s", cmd, e.message)
    }
    return stopEvent(ev)
  }

  static askForDureeJours(params){
    var defautJours = List.current.steps[params.step].nombreJoursDefaut
    defautJours || (defautJours = 10)
    Object.assign(params,{
      message: "En combien de jours doit être exécutée l'étape ?"
    , defaultAnswer: params.default || defautJours
    , buttons: ['Renoncer','OK']
    , methodOnOK: params.onOK
    , methodOnCancel: function(){}
    })
    // Je dois demander quand elle doit être prête
    var mb = new MessageBox(params)
    mb.show()
  }

  /**
    Faire passer l'item courant à l'étape suivante
  **/
  static SelectedToNextStep(ev){
    const my = this
    this.askForDureeJours({
        onOK: my.execPushNextStep.bind(my)
      , step: this.current.indexCurrentStep+1
    })
    return stopEvent(ev)
  }
  static execPushNextStep(nombreJours, choix){
    if ( choix != 1 ) return // annulation
    this.current.goToNextStep(parseInt(nombreJours,10))
    // Il faut reclasser les listes
    this.sortBy()
  }

  /**
    Faire revenir l'item courant à l'étape précédente
  **/
  static async SelectedToPrevStep(ev){
    if ( await confirmer(locale('confirm-item-to-prev-step', {previous: "précédente"}))) {
      const my = this
      this.askForDureeJours({
          onOK: my.execGotToPrevStep.bind(my)
        , step: this.current.indexCurrentStep-1
      })
      return stopEvent(ev)
    }
    return stopEvent(ev)
  }
  // Pour suivre
  static execGotToPrevStep(nombreJours, choix){
    if ( choix != 1 ) return // annulation
    this.current.goToPrevStep(parseInt(nombreJours,10))
    this.sortBy()
  }

  /**
    Sélectionner l'item +item+
    Fonctionne dans les deux "sens" : peut être appelé directement avec un
    item ou peut être appelée par la méthode 'select' de l'item
  **/
  static select(item){
    this._current = item
    item.select()
  }

  static get current(){return this._current}
  static set current(v){
    if (this._current) {
      this._current.deselect()
      delete this._current
    }
    if ( !this._current){
      // Par exemple à l'affichage
      this.buttonsSelect.classList.add('hidden')
      this.divInfos.classList.add('noDisplay')
      this.btnMoins.classList.add('discret')
    }
    if ( v ) {
      this._current = v
      this._current.select()
      this.buttonsSelect.classList.remove('hidden')
      // Peut-on passer à l'étape suivante ?
      var nextEnable = v.indexCurrentStep < v.list.steps.length - 1
      this.panel.querySelector('.btn-next-step').classList[nextEnable?'remove':'add']('hidden')
      var prevEnable = v.indexCurrentStep > 0
      this.panel.querySelector('.btn-prev-step').classList[prevEnable?'remove':'add']('hidden')
      // Il faut rendre le bouton "-" bien visible
      this.btnMoins.classList.remove('discret')
      // Il faut afficher les infos
      this.divInfos.classList.remove('noDisplay')
      v.show()
    }
  }

  /** ---------------------------------------------------------------------
    *   MÉTHODES FORMULAIRE
    *
  *** --------------------------------------------------------------------- */
  static showForm(){
    this.form.classList.remove('noDisplay')
    this.formIsVisible = true
    this.form.querySelector('input[type="text"]').focus()
  }
  static hideForm(){
    this.form.classList.add('noDisplay')
    this.formIsVisible = false
  }
  static resetForm(){
    var prop
    for(prop of ['id','titre','description']){
      // Surtout pas list_id !
      DGet(`#item-${prop}`).value = ''
    }
    for(var i of [1,2,3]){
      prop = `action${i}`
      DGet(`#item-${prop}`).value = ''
      DGet(`#item-${prop}-type`).selectedIndex = 0
      var obj = DGet(`#btn-choose-file-${prop}`)
      obj.innerHTML = 'Choisir…'
      obj.classList.add('noDisplay')
      obj = DGet(`#item-${prop}`)
      obj.innerHTML = 'Choisir…'
      obj.classList.add('noDisplay')
    }
  }
  /**
    Méthode appelée quand on sélectionne dans le menu une action à
    accomplir par le bouton +actionId+ de l'item édité
  **/
  static onChooseTypeAction(actionId, ev){
    // console.log("actionId = ", actionId)
    let selectObj = DGet(`select#item-action${actionId}-type`)
    // En fonction du choix, on affiche le bouton "choisir…" ou le champ de
    // texte.
    var btnChoose,valField
    switch(selectObj.value){
      case 'file':
      case 'folder':
        [btnChoose,valField] = [true,false]
        break;
      default:
        [btnChoose,valField] = [false,true]
    }
    let btnC = DGet(`#btn-choose-file-action${actionId}`)
    let btnF = DGet(`#item-action${actionId}`)
    btnC.classList[btnChoose?'remove':'add']('noDisplay')
    btnF.classList[valField?'remove':'add']('noDisplay')
    // Dans tous le cas on initialise la valeur du champ de texte, qui peut
    // contenir le path et le nom du bouton choisir
    btnF.value = ""
    btnC.innerHTML = "Choisir…"
  }
  /**
    Méthode appelée quand on clique le bouton "Choisir…" pour choisir le
    fichier ou le dossier associé à un bouton d'action de l'item édité
  **/
  static chooseActionFile(actionId, ev){
    let selectObj = DGet(`select#item-action${actionId}-type`)
    var choix
    switch(selectObj.value){
      case 'file':
        choix  = chooseFile({message: `Fichier à ouvrir avec le bouton ${actionId} :`})
        break;
      case 'folder':
        choix  = chooseFolder({message: `Dossier à ouvrir avec le bouton ${actionId} :`})
        break;
      default:
        console.error("Impossible de traiter le choix %s…", selectObj.value)
    }
    DGet(`#item-action${actionId}`).value = choix || ''
    if (choix) {
      let btnChoose = DGet(`#btn-choose-file-action${actionId}`)
      btnChoose.innerHTML = `Choisir "${path.basename(choix)}"`
    }
  }

  static addItemToCurrentList(ev){
    // Si le formulaire est visible, demander à le fermer
    if (this.formIsVisible){
      alert("Refermer le formulaire ouvert, avant de créer un nouvel item.")
      return
    }
    // console.log("Ajout d'item demandé")
    this.showForm()
    this.resetForm()
    return stopEvent(ev)
  }

  /**
    Méthode appelée par le bouton "Enregrister" du formulaire
    d'édition de l'item
    En fonction de la valeur de 'item-id', on crée un nouvel
    item ou on l'actualise
  **/
  static onSaveItem(ev){
    if (this.idField.value == ''){
      // => création
      this.createNewItem()
    } else {
      // => actualisation
      this.saveSelectedItem()
    }
    return stopEvent(ev)
  }

  // Pour éditer l'item sélectionné
  static editSelectedItem(ev){
    // console.log("Ajout d'item demandé")
    this.showForm()
    this.current.edit()
    return stopEvent(ev)
  }

  static removeSelectedItem(ev){
    this.current.destroy()
    return stopEvent(ev)
  }

  // Annulation de la création de l'item
  static cancelSaveItem(ev){
    this.hideForm()
    return stopEvent(ev)
  }

  // Méthode de création du nouvel item
  static createNewItem(){
    if (!this.checkDataValidity()) return
    this.hideForm()
    let newItem = new Item(this.provData)
    newItem.createAndDisplay()
  }
  // Méthode de sauvegarde de l'item édité
  static saveSelectedItem(){
    if (!this.checkDataValidity()) return
    this.hideForm()
    this.current.update(this.provData)
  }

  static select(item){
    this.current = item
  }


  /**
    Vérifie la validité des données du formulaire.
    Si OK, les met dans `provData` et retourne true. Sinon,
    retourne false après avoir affiché le message d'erreur.
  **/
  static checkDataValidity(){
    var errors = []
    var pData = this.getFormValues()
    pData.titre || errors.push("Le titre est requis")
    pData.list_id || errors.push("La liste d'appartenance devrait être définie (list_id)")
    List.getById(pData.list_id) || errors.push("La liste est inconnue, bizarrement…")

    this.provData = pData

    if (errors.length) {
      console.error("Des erreurs ont été trouvées : ", errors.join(CR))
      alert("Des erreurs ont été trouvées (cf. la console)")
      return false
    } else {
      return true
    }
  }
  // Méthode qui récupère les données du formulaire (sans les checker,
  // en les mettant dans this.provData)
  static getFormValues(){
    var fData = {}
    for(var prop of ['id', 'titre','list_id','description','action1','action2','action3']){
      fData[prop] = DGet(`#item-${prop}`).value
    }
    // Quelques ajustements
    if ( fData.id != '' ){ // <= édition
      fData.id = parseInt(fData.id,10)
    } else {
      delete fData.id
    }
    fData.list_id = parseInt(fData.list_id,10)

    // Il faut ajouter le type aux actions si elles sont définies
    for(var iAction of [1,2,3]){
      var prop = `action${iAction}`
        , type = DGet(`select#item-${prop}-type`).value
      if ( fData[prop] == "" || type == 'none') {
        fData[prop] = null
      } else {
        fData[prop] = `${type}::${fData[prop]}`
      }
    }
    // console.log("Data from form = ", fData)
    return fData
  }



  /** ---------------------------------------------------------------------
    *   INSTANCE
    *
    * Une instance, c'est par exemple un article pour une liste qui serait
    * un blog.
  *** --------------------------------------------------------------------- */
  constructor(data){
    this.data = data
    this.decomposeTypeAndValueInActions()
  }

  // Pour forcer le recalcul de toutes les valeurs (par exemple après un update)
  reset(){
    for(var prop in ['asteps','currentstep','echeance','echeancefin','donesteps','li']){
      delete this[`_${prop}`]
    }
    delete this.list._firstEcheance
    delete this.list._firstEcheanceFin
    this.decomposeTypeAndValueInActions()
  }

  /**
    Méthode d'affichage de l'item (quand il est sélectionné)
  **/
  show(){
    var divInfos = Item.divInfos
      , divTitre    = divInfos.querySelector('.selected-item-titre')
      , divDesc     = divInfos.querySelector('.selected-item-description')
      , btnAction1  = divInfos.querySelector('.btn-action1')
      , btnAction2  = divInfos.querySelector('.btn-action2')
      , btnAction3  = divInfos.querySelector('.btn-action3')
      , spanCreatedAt   = divInfos.querySelector('.date.created_at')
      , spanStartedAt   = divInfos.querySelector('.date.started_at')
      , spanUpdatedAt   = divInfos.querySelector('.date.updated_at')
      , spanExpectedAt  = divInfos.querySelector('.date.expected_at')

    var isStarted = this.indexCurrentStep > 0
    divTitre.innerHTML  = this.titre
    divDesc.innerHTML   = this.description
    spanCreatedAt.innerHTML = this.created_at.toLocaleDateString('fr-FR')
    spanUpdatedAt.innerHTML = (this.updated_at||this.created_at).toLocaleDateString('fr-FR')
    spanStartedAt.innerHTML = isStarted ? this.doneSteps[this.indexCurrentStep-1].date : "En attente"
    spanExpectedAt.innerHTML = isStarted ? this.expectedNext.toLocaleDateString('fr-FR') : '---'
    // Construction des boutons
    var aucuneAction = true
    for(var iAction of [1,2,3]){
      var prop = `action${iAction}`
      var actif = !! this[prop]
      if ( actif ) aucuneAction = false
      var btnAction = divInfos.querySelector(`#btn-${prop}`)
      btnAction.classList[actif?'remove':'add']('noDisplay')
      btnAction.innerHTML = ((actif,type,valeur)=>{
        if (actif){
          switch(type){
            case 'file':    return `Ouvrir le fichier « ${path.basename(valeur)} »`; break;
            case 'folder':  return `Ouvrir le dossier « ${path.basename(valeur)} »`; break;
            case 'url':     return `Ouvrir l'URL « ${path.basename(valeur)} »`; break;
            case 'code':    return `Jouer le code \`${valeur.substring(0,20)}…\``; break;
          }
        } else {return ''}
      })(actif, this[`${prop}Type`], this[`${prop}Value`])
    }
    // Visibilité du texte d'aide
    DGet('.no-action').classList[aucuneAction?'remove':'add']('noDisplay')

  }

  // Méthode qui crée le nouvel item
  // Note : à partir des provData
  async create(){
    this.created_at = new Date()
    let request = "INSERT INTO items (titre, list_id, description, expectedNext, action1, action2, action3, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      , valeurs = [this.titre, this.list_id, this.description, this.expectedNext, this.action1, this.action2, this.action3, this.created_at]
    // console.log("Je vais enregistrer les données : ", valeurs)
    await MySql2.execute(request, valeurs)
    // On récupère son identifiant
    this.data.id = await MySql2.lastInsertId()
    // Après la création, pour pouvoir en prendre compte tout de suite, il
    // faut l'ajouter à sa liste
    Object.assign(this.list._items,{[this.id]: this})
  }

  afterUpdate(){
    this.updated_at = new Date() // provisoirement
    this.reset()
    this.decomposeTypeAndValueInActions()
    this.updateLi()
    if (this.isCurrentItem) this.show()
  }

  // Retourne true si l'item affiché (courant) est cet item-ci
  get isCurrentItem(){
    return (Item.current && Item.current.id == this.id)
  }

  // Méthode qui construit l'item
  build(){
    Item.listing.appendChild(this.li)
    this.observe()
  }

  // Méthode pour détruire l'item de liste
  async destroy(){
    // Confirmer la demande

    if ( false === await confirmer(`Voulez-vous vraiment détruire l'item de liste « ${this.titre} » ?\n\nToutes ses infos seront définitivement perdues.`) ) return
    // Détruire dans l'affichage
    this.li.remove()
    // Détruire dans la base de données
    var request = `DELETE FROM items WHERE ID = ${this.id}`
    var res = await MySql2.execute(request)
    // Détruire dans la liste (seulement si sorted_items est défini)
    if (this.list.sorted_items){this.list.removeItem(this)}
    // Détruire ici
    this.current = null
  }

  observe(){
    const my = this
    my.li.addEventListener('click',my.onClick.bind(my))
    my.li.addEventListener('dblclick',my.onDblClick.bind(my))
  }

  onClick(ev){
    this.select()
    return stopEvent(ev)
  }

  onDblClick(ev){
    this.edit()
    return stopEvent(ev)
  }

  select(){
    if (Item.current != this){
      Item.select(this)
      return
    }
    this.li.classList.add('selected')
  }
  deselect(){
    this.li.classList.remove('selected')
  }

  edit(){
    Item.showForm()
    Item.resetForm()
    for(var prop of ['id','titre','description']){
      DGet(`form#item-form #item-${prop}`).value = this[prop]
    }
    // Les actions
    for(var iAction of [1,2,3]){
      prop = `action${iAction}`
      if ( this[prop] ) {
        // <= L'action est définie
        // => Il faut la régler
        var typeA = this[`${prop}Type`]
        var valueA = this[`${prop}Value`]
        var btnChoose = DGet(`#btn-choose-file-${prop}`)
        var codeField = DGet(`#item-${prop}`)
        // 1. Régler son type dans le menu
        Item.form.querySelector(`#item-${prop}-type`).value = typeA
        // 2. Afficher le champ d'édition voulu
        // 3. Régler la valeur du champ d'édition
        var btn, field
        switch(typeA){
          case 'file':
          case 'folder':
            [btn,field] = [true,false]
            btnChoose.innerHTML = `Choisir ${path.basename(valueA)}`
            break
          default:
            [btn,field] = [false,true]
        }
        // Dans tous les cas, même pour un fichier, on met
        // la valeur dans le champ
        codeField.value = valueA
        btnChoose.classList[btn?'remove':'add']('noDisplay')
        codeField.classList[field?'remove':'add']('noDisplay')
      }
    }
  }
  /**
    Méthode qui crée l'item et l'affiche dans la liste

  **/
  async createAndDisplay(){
    await this.create()
    this.build()
  }

  // Actualisation du LI dans la fenêtre (listing)
  updateLi(){
    var oldLi = this._li
    delete this._li
    oldLi.replaceWith(this.li)
    this.observe()
  }

  get spanCurrentStep(){
    return this.li.querySelectorAll('span')[this.indexCurrentStep+1]
  }
  setTextCurrentStep(str){
    this.spanCurrentStep.innerHTML = str
  }
  /*  Actualise le nom de l'étape courante en fonction du mode d'affichage
      désiré */
  updateTitreCurrentStep(){
    this.setTextCurrentStep(this.currentStep.titre)
  }
  /**
    Règle l'étape courante
    Si +isCurrent+ est true, la marque en étape courante, sinon, la démarque
  **/
  setSpanCurrentStep(isCurrent){
    this.spanCurrentStep.classList[isCurrent?'add':'remove']('current')
  }
  decurrentizeSpanCurrentStep(){this.setSpanCurrentStep(false)}
  currentizeSpanCurrentStep(){
    this.setSpanCurrentStep(true)
    this.updateTitreCurrentStep()
  }
  /**
    Pour faire passer l'item à son étape suivante
    +nombreJours+ est l'échéance attendue
  **/
  async goToNextStep(nombreJours){
    this.decurrentizeSpanCurrentStep()
    // Identifiant de l'étape courante
    var newStepId = this.list.steps[this.indexCurrentStep].id
    // console.log("newStepId = ", newStepId)
    var today = new Date()
    this.aSteps.push(`${newStepId}:${today.toLocaleDateString('en-US')}`)
    var expectedAt = today.addDays(nombreJours)
    var newSteps = this.aSteps.join(';')
    await this.update({steps:newSteps, expectedNext:expectedAt})
    this.steps = newSteps
    this.currentizeSpanCurrentStep()
  }
  /**
    Note :  comme pour la méthode précédente, il est inutile de décrémenter
            indexCurrentStep puisque cette valeur est calculée en fonction
            de la liste des étapes définies
  **/
  async goToPrevStep(nombreJours){
    this.decurrentizeSpanCurrentStep()
    // Identifiant de l'étape courante
    var newStepId = this.list.steps[this.indexCurrentStep].id

    var expectedAt = null

    // On retire les deux dernières étape (l'avant-dernière sera remise,
    // mais avec une autre date de fin attendue)
    this.aSteps.pop()
    if ( this.aSteps.length == 0) {
      // <= l'étape courante était la première
      // => Il ne faut rien faire de plus
    } else {
      this.aSteps.pop()
      var today = new Date()
      this.aSteps.push(`${newStepId}:${today.toLocaleDateString('en-US')}`)
      expectedAt = today.addDays(nombreJours)
    }
    // On actualise
    await this.update({steps:this.aSteps.join(';'), expectedNext:expectedAt})
    // console.log("Après la transformation, steps de l'item = ", this.steps)
    // On update l'affichage pour qu'il prenne en compte les changements
    this.currentizeSpanCurrentStep()
  }
  /**
    |
    | Helpers
    |
  **/

  /**
    Le LI principal de l'item
  **/
  get li(){
    if ( undefined === this._li ) {
      var span
      var li = DCreate('LI',{'data-id':this.id, class:'li-item', id:`item-${this.id}`, inner:[
        DCreate('SPAN',{class:'titre',text:this.titre})
      ]})
      // On fabrique un span par étape
      for(var iStep in this.list.steps){
        var step = this.list.steps[iStep]
        var classNames = ['step']
        if ( iStep < this.indexCurrentStep ) {
          classNames.push('done')
        } else if ( iStep == this.indexCurrentStep ) {
          classNames.push('current')
        }
        var span = DCreate('SPAN',{
            class:classNames.join(' ')
          , style:`width:${Item.spanStepWidth}px;`
          , text:`&nbsp;${step.titre}&nbsp;`
        })
        li.appendChild(span)
      }
      this._li = li
    } return this._li
  }

  /**
    |Propriétés volatiles
  **/

  get doneSteps(){
    return this._donesteps || defP(this,'_donesteps',this.defineDoneSteps())
  }

  // Liste (instance List) auquel appartient l'itemp
  get list(){
    return this._list || defP(this,'_list', List.getById(this.list_id))
  }

  // Retourne l'instance {Step} de l'étape courante de l'item
  get currentStep(){
    return this._currentstep || defP(this,'_currentstep',this.list.steps[this.indexCurrentStep])
  }
  get titreCurrentStep(){
    return this.currentStep.titre
  }
  get indexCurrentStep(){
    return this.aSteps.length
  }

  // Liste des valeurs des étapes exécutées
  get aSteps(){
    return this._asteps || defP(this,'_asteps', this.defineaSteps())
  }

  // Retourne true si l'item est en attente démarrage
  get isEnAttente(){
    this.indexCurrentStep == 0
  }
  /**
    Retourne l'échéance (virtuelle) de l'item courant
    Cette échéance est calculée en fonction
    Elle est nulle si l'étape courante est la première
  **/
  get echeance(){
    return this._echeance || defP(this,'_echeance',this.defineEcheance().echeance)
  }
  get human_echeance(){return humanDateFor(this.echeance)}

  get echeanceFin(){
    return this._echeancefin || defP(this,'_echeancefin',this.defineEcheance().echeanceFin)
  }
  get human_echeanceFin(){return humanDateFor(this.echeanceFin)}


  get action1Value(){return this._a1value}
  get action1Type(){return this._a1type}
  get action2Value(){return this._a2value}
  get action2Type(){return this._a2type}
  get action3Value(){return this._a3value}
  get action3Type(){return this._a3type}
  decomposeTypeAndValueInActions(){
    for(var iAction of [1,2,3]){
      var prop = `action${iAction}`
      if (this[prop]){
        [this[`_a${iAction}type`],this[`_a${iAction}value`]] = this[prop].split('::')
      } else {
        delete this[`_a${iAction}type`]
        delete this[`_a${iAction}value`]
      }
    }
  }
  /**
    |Propriétés fixes (enregistrées)
  **/
  get id(){return this.data.id}
  get titre(){return this.data.titre}
  set titre(v){this.data.titre = v}
  get description(){return this.data.description}
  set description(v){this.data.description = v}
  get list_id(){return this.data.list_id}
  set list_id(v){this.data.list_id = v}
  get expectedNext(){return this.data.expectedNext}
  set expectedNext(v){this.data.expectedNext = v}
  get steps(){return this.data.steps||''}
  set steps(v){this.data.steps = v}
  get action1(){return this.data.action1}
  set action1(v){this.data.action1 = v}
  get action2(){return this.data.action2}
  set action2(v){this.data.action2 = v}
  get action3(){return this.data.action3}
  set action3(v){this.data.action3 = v}
  get updated_at(){return this.data.updated_at}
  set updated_at(v){this.data.updated_at = v}
  get created_at(){return this.data.created_at}
  set created_at(v){this.data.created_at = v}

  // ---------------------------------------------------------------------
  // @private

  defineDoneSteps(){
    var dones = []
    for(var iStep = 0 ; iStep < this.indexCurrentStep; ++iStep){
      dones.push(new DoneStep(this, this.aSteps[iStep]))
    }
    return dones
  }

  defineaSteps(){
    if (this.steps) return this.steps.split(';')
    else return []
  }

  defineEcheance(){
    console.log("-> defineEcheance de “%s”",this.titre)
    var eche = null
      , echeFin = null
    if ( this.indexCurrentStep /* > 0 => item démarré */){
      // Pour calculer l'échéance, on prend le temps de réalisation espérée
      // pour l'étape courante (expectedNext) et on lui ajoute le nombre de
      // jours pour les étapes restantes
      eche = this.expectedNext /* une {Date} */
      echeFin = this.expectedNext
      var stepCount = this.list.steps.length
      for(var istep = this.indexCurrentStep+1; istep < stepCount; ++istep){
        echeFin = echeFin.addDays(this.list.steps[istep].nombreJours)
      }
    }
    // console.log("Item «%s»\nProchaine échéance : %s\nÉchéance fin : %s", this.titre, eche, echeFin)
    this._echeance = eche
    this._echeancefin = echeFin
    return {
      echeance:eche, echeanceFin:echeFin
    }
  }
}

Item.prototype.update = updateInstance
