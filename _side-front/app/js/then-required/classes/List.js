'use strict'
/**
  Classe List
  ----------
  Gestion des listes
**/
class List {
  /** ---------------------------------------------------------------------
    *   CLASSE
    *
  *** --------------------------------------------------------------------- */

  /**
    | Éléments de l'interface
  **/
  static get panel(){return DGet('#lists-panel')}
  static get divListing(){return this.panel.querySelector('#div-lists')}
  static get listing(){return this.divListing.querySelector('#lists')}
  static get sortTypeMenu(){return this.divListing.querySelector('select.sort-type')}
  static get btnPlus(){return this.panel.querySelector('div#div-lists div.btn-plus')}
  static get btnMoins(){return this.panel.querySelector('div#div-lists div.btn-moins')}
  static get form(){return DGet('form#list-form')}
  static get btnSaveList(){return this.form.querySelector('button#btn-save-list')}
  static get btnCancelList(){return this.form.querySelector('button#btn-cancel-save-list')}
  static get idField(){return DGet('form#list-form input#list-id')}
  static get divSteps(){return this.form.querySelector('#listbox-list-steps')}
  static get stepsList(){return this.divSteps.querySelector('ul#list-steps')}

  /**
    Initialisation du panneau des listes
  **/
  static init(){
    let btnEdit   = DGet('div#div-lists div.btn-edit')
      , btnShow   = DGet('div#div-lists div.btn-show')
      , divSteps  = this.panel.querySelector('#listbox-list-steps')
      , btnAddStep = divSteps.querySelector('.btn-plus')
      , btnSupStep = divSteps.querySelector('.btn-moins')
    this.btnPlus.addEventListener('click',this.addList.bind(this))
    this.btnMoins.addEventListener('click',this.removeSelectedList.bind(this))
    btnEdit.addEventListener('click',this.editSelectedList.bind(this))
    btnShow.addEventListener('click',this.showSelectedList.bind(this))

    // Les éléments du formulaire
    this.btnSaveList.addEventListener('click', this.saveList.bind(this))
    this.btnCancelList.addEventListener('click',this.cancelSaveList.bind(this))

    // Les boutons pour ajouter ou supprimer une étape
    btnAddStep.addEventListener('click',this.addStep.bind(this))
    btnSupStep.addEventListener('click',this.removeStep.bind(this))

    // Le menu pour changer de type de classement
    this.sortTypeMenu.addEventListener('change', this.changeTypeClassement.bind(this))

    this.current = null
  }

  /**
    Retourne l'instance List de la liste d'identifiant +list_id+
  **/
  static getById(list_id){
    return this.listsById[list_id]
  }

  /**
    Reçoit le LI (dom element) et retourne l'instance {List}
  **/
  static getByLi(li){
    return this.getById(li.getAttribute('data-id'))
  }

  /**
    Pour modifier le type de classement
    (méthode appelée par le menu des types de classement)
  **/
  static changeTypeClassement(){
    var sortMethod = this.sortTypeMenu.value
    // La valeur qui servira à être mise en regard du titre
    var keyValeurSorting = ((meth)=>{
      switch(meth){
        case 'alphaSorting':
        case 'alphaInvSorting':
          return null
        case 'echeanceSorting':
        case 'echeanceInvSorting':
          return 'firstEcheance'
        case 'echeanceFinSorting':
          return 'firstEcheanceFin'
      }
    })(sortMethod)
    // console.log("Méthode de classement utilisée : `%s` (key valeur : %s)", sortMethod, keyValeurSorting)
    // L'échéance peut/pourrait être définie par deux choses :
    // 1. une échéance précise définie explicitement pour la liste
    // 2. l'échéance calculée de la dernière étape
    var listsClassed = []
    this.listing.querySelectorAll('li').forEach(li=>listsClassed.push(this.getByLi(li)))
    listsClassed = listsClassed.sort(this[sortMethod].bind(this))
    // console.log("listsClassed = ", listsClassed)
    // On classe finalement la liste en ajoutant au titre la valeur retenue
    listsClassed.map(list => {
      this.listing.appendChild(list.li)
      // console.log("list[%s] = %s", keyValeurSorting, list[keyValeurSorting])
      var valeurSorting = keyValeurSorting ? ` <span class="small">(prochaine échéance le ${humanDateFor(list[keyValeurSorting])})</span>` : ''
      list.li.querySelector('.key-sort').innerHTML = `${valeurSorting}`
    })
  }

  // Callback de classement par alphabeth
  static alphaSorting(a, b){ return a.titre > b.titre ? 1 : -1 }
  static alphaInvSorting(a, b) { return a.titre < b.titre ? 1 : -1 }

  /**
    Callback de classement par échéance
    Note : classer une liste par échéance, c'est la classer par rapport
    à son item le plus récent
  **/
  static echeanceSorting(a,b){
    return a.firstEcheance > b.firstEcheance ? 1 : -1
  }
  static echeanceFinSorting(a,b){
    return a.firstEcheanceFin > b.firstEcheanceFin ? 1 : -1
  }
  static echeanceInvSorting(a,b){
    return a.firstEcheance < b.firstEcheance ? 1 : -1
  }

  /**
    Demande d'ajout d'une étape (formulaire de la liste)
    Méthode appelée quand on clique sur le bouton "+" de la liste des
    étapes.
  **/
  static addStep(){
    const newId = Step.newId()
    this.stepsList.insertAdjacentHTML('beforeend', Step.defaultLi(newId))
    let li = this.form.querySelector(`.step#step-${newId}`)
    li.querySelectorAll('input[type="text"]').forEach(span => span.addEventListener('focus', ()=>{span.select()}))
    // On focus dans le premier champ (titre)
    li.querySelector('input[type="text"]').focus()
  }
  static removeStep(){
    console.log("Je vais supprimer l'étape séelectionnée")
  }


  // Affichage du formulaire et placement du pointeur dans le
  // premier champ
  static showForm(){
    this.form.classList.remove('noDisplay')
    this.form.querySelector('input[type="text"]').focus()
  }
  static hideForm(){this.form.classList.add('noDisplay')}
  static resetForm(){
    var prop
    for(prop of ['id','titre','description','originalStepsList']){
      this.form.querySelector(`#list-${prop}`).value = ''
    }
    for(prop of ['steps']){
      this.form.querySelector(`#list-${prop}`).innerHTML = ''
    }
  }

  /**
    Méthode appelée par le bouton pour afficher les items de la liste
    courante
  **/
  static showSelectedList(ev){
    this.current.showItems()
    return stopEvent(ev)
  }
  /**
    Méthode appelée quand on veut créer une nouveau liste (bouton "+")
  **/
  static addList(ev){
    this.showForm()
    this.resetForm()
    return stopEvent(ev)
  }

  /**
    Méthode appelée quand on veut éditer une liste (bouton "📝")
  **/
  static editSelectedList(ev){
    this.showForm()
    // Mettre les valeurs de la liste dans les champs
    this.current.edit()
    return stopEvent(ev)
  }

  /**
    Méthode appelée par le bouton "Enregistrer" du formulaire
    Il s'agit soit d'une création soit d'une édition
  **/
  static async saveList(){
    if (this.idField.value == '') { await this.createList() }
    else {await this.updateList()}
  }
  static async cancelSaveList(){this.hideForm()}

  /**
    Méthode appelée pour créer la nouvelle liste
  **/
  static async createList(){
    // On essaie de créer la liste

    // On checke la validité des données en les relevant
    if (!this.checkDataValidity()) return
    // On crée la nouvelle instance avec les données relevées
    var newList = new List(this.provData)
    // On l'enregistre
    await newList.create()
    // On l'affiche
    newList.build()
    // On ferme le formulaire
    this.hideForm()
    // On ajoute cette liste
    Object.assign(this.listsById, {[newList.id]: newList})
    // On la met en liste courante
    this.current = newList
  }

  // Actualisation de la liste courante
  static updateList(){
    if (!this.checkDataValidity()) return
    this.current.update(this.provData)
    this.hideForm()
  }

  static async removeSelectedList(ev){
    if(!this.current)return // pas de liste sélectionnée
    if (await confirmer(`Êtes-vous certain de vouloir détruire la liste « ${this.current.titre} » (et tous ses éléments) ?\n\nCette opération est IRRÉVERSIBLE.`)){
      this.current.destroy()
    } else {
      console.log("Je ne détruis pas la liste")
    }
    return stopEvent(ev)
  }

  /**
    Méthode principale qui affiche toutes les listes (et permet d'en
    créer de nouvelles)
  **/
  static async showAll(){
    UI.showLists()
    if ( ! this.inited ) {
      await this.peuple()
      this.inited = true
    }
  }

  /**
    Méthode pour peupler la liste des listes
  **/
  static async peuple(){
    if ( undefined === this.listsById){
      await this.loadLists()
    }
    // On fait un item LI par liste
    this.listing.innerHTML = ''
    for ( var iList /* TextRow */ of Object.values(this.listsById) ) {
      this.listing.appendChild(iList.li)
      iList.observe()
    }
  }

  static async loadLists(){
    var lists = {}
    // On doit récupérer la liste des listes
    let listes = await MySql2.execute('SELECT * FROM lists ORDER BY titre')
    for(var liste of listes){
      if (liste.sorted_items) liste.sorted_items = String(liste.sorted_items)
      var iList = new List(liste)
      Object.assign(lists, {[iList.id]: iList})
    }
    this.listsById = lists
  }

  /**
    Méthode qui checke la validité des données dans le formulaire
    que ce soit pour l'édition ou la création
  **/
  static checkDataValidity(){
    var provData = {}
      , errors = []

    // On récupère les données du formulaire
    for(var prop of ['id','titre','description']){
      Object.assign(provData, {[prop]: DGet(`form#list-form #list-${prop}`).value.trim()})
    }
    // Pour les étapes
    var steps = []
    for (var li of this.form.querySelectorAll('#list-steps li')) {
      var step_data = {id:parseInt(li.getAttribute('data-id'),10)}
      for (var step_prop of ['titre','description','nombre_jours']){
        Object.assign(step_data, {[step_prop]: li.querySelector(`.${step_prop}`).value})
      }
      if (step_data.titre!=""){
        step_data.titre.length > 4 || errors.push(`L'étape "${step_data}" doit faire au moins 4 caractères…`)
        step_data.titre.length < 255 || errors.push(`L'étape "${step_data}" est trop longue (254 caractères max)`)
      } else {
        errors.push(`Une étape doit avoir un titre !`)
      }
      step_data.description.length < 255 || errors.push(`L'étape "${step_data}" a une description trop longue (254 caractères max)`)
      if (step_data.nombre_jours!=""){
        step_data.nombre_jours = parseInt(step_data.nombre_jours, 10)
        step_data.nombre_jours < 999 || errors.push("Le nombre de jours ne peut excéder 999.")
      } else {
        errors.push(`Il faut définir le nombre de jours par défaut d'une étape de travail.`)
      }
      steps.push(step_data)
    }
    steps.length > 0 || errors.push("Il faut définir les étapes de travail (au moins une) !")
    provData.stepsData = steps

    if ( provData.id == ''){delete provData.id}
    else { provData.id = parseInt(provData.id,10)}

    provData.titre || errors.push("Le titre est requis")
    if (provData.titre){
      provData.titre.length > 3 || errors.push("Le titre doit être au moins de 4 lignes.")
      provData.titre.length < 201 || errors.push("Le titre est trop long (200 lettres max)")
    }
    provData.description.length < 65000 || errors.push("La description est trop longue (65000 caractères max)")

    if (errors.length){
      console.error("Des erreurs sont survenues : ", errors.join(CR))
      alert("Des erreurs sont survenues, je ne peux pas enregistrer la liste telle quelle. Consulter la console.")
      return false
    } else {
      console.log("List::provData est mis à ", provData)
      this.provData = provData
      return true
    }
  }

  // L'instance List courante
  static get current(){return this._current}
  static set current(v){
    if (this._current){
      this._current.li.classList.remove('selected')
      delete this._current
    }
    if (!this.current){
      // Par exemple au chargement
      DGet('div#div-lists .btns-selected').classList.add('hidden')
      this.btnMoins.classList.add('discret')
    }
    if ( v ) {
      this._current = v
      // On règle le titre partout où il est utilisé
      DGet('.list-name').innerHTML = v.titre
      // On met le lit en exergue
      v.li.classList.add('selected')
      // On affiche les boutons qui permettent de gérer la liste
      DGet('div#div-lists .btns-selected').classList.remove('hidden')
      this.btnMoins.classList.remove('discret')
      // On charge ses données si c'est nécessaire
      v.load()
    }
  }





  /** ---------------------------------------------------------------------
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */
  constructor(data){
    this.data = data
    // console.log("Données liste à l'instanciation : ", data)

    // Table pour enregistrer les changements qui ne seront enregistrés (avec
    // la méthode `saveChanges`) seulement quand un bouton "Actualiser la liste"
    // sera cliquée
    this.unsavedChanges = {}
  }

  // Méthode qui crée la liste
  async create(){
    // Note : quand on crée une liste pour la première fois, +data+ contient
    // :stepData, la liste des données des étapes de travail
    // Il faut créer les étapes nouvelles (elles sont reconnaissables au
    // fait que leur identifiant est négatif)
    if ( this.data.stepsData ) {
      await this.saveSteps(this.data.stepsData)
    }
    var req = "INSERT INTO lists (titre, description, stepsId, created_at) VALUES (?,?,?, NOW())"
    var res = await MySql2.execute(req, [this.titre, this.description, this.stepsId])
    this.data.id = await MySql2.lastInsertId()
    // Il faut aller définir le paramètre `list_id` des étapes
    var request = `UPDATE steps SET list_id = ${this.id} WHERE id IN (${this.stepsId})`
    await MySql2.execute(request)
  }

  async beforeUpdate(newValeurs){
    // Cf. la note dans la méthode create
    if ( newValeurs.stepsData) {
      await this.saveSteps.call(this, newValeurs.stepsData)
      delete this._steps
    }
    delete newValeurs.stepsData
    Object.assign(newValeurs, {stepsId: this.stepsId})
    return newValeurs
  }
  async afterUpdate(){
    await this.reload()
    delete this._echeance
    delete this._echeanceFin
    // S'il y a des items dans cette liste et que les étapes ont été
    // modifiées, il faut checker ce qu'il y a à faire
    if (this.stepsHasChanged) {
      console.log("La liste des étapes a été modifiée, je dois checker les items.")
      Step.checkAndResolveStepsChanges(this)
    } else {
      if (this.items && this.items.length) {
        console.log("Aucun item dans cette liste, les étapes peuvent être modifiées sans souci.")
      }
    }
    this.updateLi()
  }

  /**
    Enregistre dans la table de données les changements mémorisés dans
    this.unsavedChanges
  **/
  async saveChanges(){
    console.log("-> saveChanges")
    console.log("this.unsavedChanges: ", this.unsavedChanges)
    var keys = Object.keys(this.unsavedChanges)
    if ( keys.length ){
      for (var prop in this.unsavedChanges){
        this[prop] = this.unsavedChanges[prop]
      }
      await this.updateInDB(keys)
      this.unsavedChanges = {}
    }
    console.log("<- saveChanges")
  }

  // Procédure de sauvegarde des étapes de travail
  async saveSteps(stepsData){
    console.log("-> saveSteps")
    // console.log("stepsData = ", stepsData)
    // On conserve la liste courante pour voir s'il y a changement
    if ( this.stepsId) {
      // console.log("this.stepsId au début de saveSteps:", this.stepsId.split(','))
      this.oldStepsId = this.stepsId.split(',').join(',')
    }

    var request, valeurs
      , stepsId = []
    for (var stepData of stepsData){
    // await stepsData.forEach( async stepData => {
      Object.assign(stepData, {list_id: this.id})
      var isNewStep = stepData.id < 0
      if ( isNewStep ) {
        // <= Nouvelle étape
        [request, valeurs] = this.stepCreateRequestFor(stepData)
      } else {
        // <= Étape existante
        [request, valeurs] = this.stepUpdateRequestFor(stepData)
      }
      await MySql2.execute(request,valeurs)
      if ( isNewStep ) {
        stepData.id = await MySql2.lastInsertId()
      }
      console.log("Ajout de %d à la liste des steps", stepData.id)
      stepsId.push(stepData.id)
    }
    this.stepsId = stepsId.join(',')
    // Protection
    if ( this.data.stepsId.length > 254 ) {
      console.error("La longueur de la données étapes est malheureusement trop longue…", this.stepsId)
    }
    // console.log("À la fin de List.saveSteps, this.stepsId = %s (this.data.stepsId %s). Au début : %s", this.stepsId, this.data.stepsId, this.oldStepsId)
  }
  stepCreateRequestFor(dStep){
    return ["INSERT INTO steps "
      + "(titre, list_id, description, nombreJours, created_at, updated_at)"
      + " VALUES (?, ?, ?, ?, NOW(), NOW())"
      , [dStep.titre, this.id, dStep.description, dStep.nombre_jours]
    ]
  }
  stepUpdateRequestFor(dStep){
    return ["UPDATE steps "
      + "SET titre = ?, description = ?, nombreJours = ?, updated_at = NOW() "
      + "WHERE id = ?"
      , [dStep.titre, dStep.description, dStep.nombre_jours, dStep.id]
    ]
  }

  // Actualisation du LI de la liste dans le DOM (et observation)
  updateLi(){
    let oldLi = this.li
    delete this._li
    oldLi.replaceWith(this.li)
    this.observe()
  }

  // Méthode qui construit la liste dans la liste des listes
  build(){
    List.listing.appendChild(this.li)
    this.observe()
  }

  /**
    Pour observer le LI de la liste (pas ses éléments)
  **/
  observe(){
    this.li.addEventListener('click', this.onClick.bind(this))
    this.li.addEventListener('dblclick', this.onDblClick.bind(this))
  }

  async destroy(){
    // Destruction de ses données, de ses étapes et de ses
    // items dans la base de données
    var request = `DELETE FROM lists WHERE id = ${this.id}`
    await MySql2.execute(request)
    request = `DELETE FROM items WHERE list_id = ${this.id}`
    await MySql2.execute(request)
    request = `DELETE FROM steps WHERE list_id = ${this.id}`
    await MySql2.execute(request)
    // Destruction dans la liste
    this.li.remove()
    // Destruction dans la classe
    delete List.listsById[this.id]
    List.current = null
    console.log("Destruction de la liste #%d opérée avec succès", this.id)
  }

  /**
    Exécuter la méthode +method+ sur chaque item de la liste
    Pour interrompre, il suffit que +method+ retourne `false`

    Note : si la méthode est utilisée alors qu'on n'est pas sûr que
    les items soient chargés, on utilise la tournure `await liste.forEachItem(...)`
  **/
  async forEachItem(method){
    if ( !this._items ){ await this.load() }
    for(var item_id in this.items){
      if (false === method(this.items[item_id]) ) break ;
    }
  }

  onClick(ev){
    List.current = this
    return stopEvent(ev)
  }
  onDblClick(ev){
    List.current = this
    this.showItems()
    return stopEvent(ev)
  }

  /**
    Méthode pour éditer la liste (peupler le formulaire, qui doit
    déjà être ouvert)
  **/
  async edit(){
    List.resetForm()
    if ( undefined === this._items ){ await this.load() }
    for(var prop of ['id','titre','description']){
      var val = this[prop] || ''
      DGet(`form#list-form #list-${prop}`).value = val
    }
    // On mémorise la liste initiale des étapes
    // (pour pouvoir voir si elles ont changé)
    DGet('#list-originalStepsList').value = this.stepsId
    // Il faut construire les étapes (il y en a toujours au moins une)
    this.steps.map(step => step.build())
  }

  // Retourne true si la liste des étapes a été modifiée
  get stepsHasChanged(){
    return this.stepsId != DGet('#list-originalStepsList').value
  }

  /**
    Méthode qui affiche les items de la liste
  **/
  async showItems(){
    UI.showPanel('itemsPanel')
    // On renseigne l'identifiant de liste qui permettra de régler
    // les list_id des nouveaux items ou items édités
    DGet('#item-list_id').value = this.id
    // Vider la section des items
    Item.listing.innerHTML = ""
    // Peupler la section des items
    if ( undefined === this._items ){ await this.load() }
    var liste, menuItemSorting
    if ( this.sorted_items ) {
      liste = this.sortedItems
      menuItemSorting = 'customSorting'
    } else {
      liste = Object.values(this.items)
      menuItemSorting = 'alphabSorting'
    }
    liste.map(item => item.build())
    // On doit régler le menu de classement
    Item.sortTypeMenu.value = menuItemSorting
  }

  async removeItem(item){
    if ( this.sorted_items ){
      console.log("this.sorted_items au départ : %s", this.sorted_items)
      var itemsList = this.sorted_items.split(';')
      var itemIndex = itemsList.indexOf(item.id)
      itemsList.splice(itemIndex,1)
      this.sorted_items = itemsList.join(';')
      console.log("this.sorted_items après : %s", this.sorted_items)
      await this.updateInDB(['sorted_items'])
      delete this._sorteditems // pour forcer l'actualisation
    }
  }

  /**
    Actualise les données de la liste dans la base de données
  **/
  async updateInDB(props){
    const my = this
    var columns = []
      , valeurs = []
    props.forEach(prop => {
      columns.push(`${prop} = ?`)
      valeurs.push(my[prop])
    })
    valeurs.push(this.id)
    var request = `UPDATE lists SET ${columns.join(', ')} WHERE id = ?`
    var result = await MySql2.execute(request, valeurs)
    // On recharge pour tenir en compte des changements
    await this.reload()
  }

  // Retourne la liste des {Item}s classés (attention, ne pas confondre avec la
  // propriété `sorted_items` ({String}) qui est enregistrée)
  get sortedItems(){return this._sorteditems || defP(this,'_sorteditems',this.sortItems())}
  sortItems(){
    return this.sorted_items.split(';').map(item_id => this.itemsById[item_id])
  }
  get itemsById(){return this._itemsbyid || defP(this,'_itemsbyid',this.setItemsByIds())}
  setItemsByIds(){
    var byId = {}
    Object.values(this.items).forEach(item => Object.assign(byId, {[item.id]: item}))
    return byId
  }
  /**
    |
    | Méthodes d'helpers
    |
  **/

  // LI de la liste
  get li(){
    if ( undefined === this._li ){
      this._li = DCreate('LI', {'data-id':this.id, class:'list', inner:[
          DCreate('SPAN',{class:'titre', text:this.titre})
        , DCreate('SPAN', {class:'key-sort', text:''})
      ]})
    } return this._li
  }

  /**
    Pour tout recharger (p.e. après un update, pour être sûr d'avoir
    les dernières valeurs)
  **/
  async reload(){
    for(var prop of ['_items','_steps','_sorted_items','_firstecheance','_firstecheancefin','_li','modified','dataSteps','_li','oldStepsId']){
      delete this[prop]
    }
    this.isLoaded = false
    await this.load()
  }
  /**
    Pour relever tous les items de la liste et toutes ses étapes
    - Relève des étapes
    - Relève des items et instanciations
  **/
  async load(){
    if (this.isLoaded) return
    // On charge les étapes
    await this.loadSteps()
    // On charge les items et on en fait des instances
    this._items = {}
    var items = await MySql2.execute('SELECT * FROM items WHERE list_id = ?', [this.id])
    for(var dataItem of items){
      var instanceItem = new Item(dataItem)
      Object.assign(this._items, {[instanceItem.id]: instanceItem})
    }
    this.isLoaded = true
  }
  /**
    | Méthodes de données volatiles
  **/

  /**
    Retourne la première échéance prochaine
    Puisqu'il s'agit d'une liste, la première échéance prochaine correspond à
    la plus prochaine échéance de sa liste d'items.
    +firstEcheanceFin+ retourne l'échéance de fin complète de l'item la plus
    proche.
  **/
  get firstEcheance(){
    return this._firstecheance || defP(this,'_firstecheance', this.defineFirstEcheance().first)
  }
  get firstEcheanceFin(){
    return this._firstecheancefin || defP(this,'_firstecheancefin', this.defineFirstEcheance().firstFin)
  }

  get items(){
    return this._items
  }

  get steps(){
    if ( undefined === this._steps ){
      this._steps = []
      this.stepsId.split(',').forEach( step_id => {
        step_id = parseInt(step_id,10)
        this._steps.push(new Step(this.dataSteps[step_id]))
      })
    } return this._steps
  }

  async loadSteps(){
    var request = `SELECT * FROM steps WHERE id IN (${this.stepsId})`
    // console.log("Requête :", request)
    this.dataSteps = {}
    var stepsInDB = await MySql2.execute(request)
    stepsInDB.forEach(dStep => Object.assign(this.dataSteps, {[String(dStep.id)]: dStep}))

    // console.log("steps loadées : ", this.dataSteps)
  }


  /**
    | Méthodes de données fixe
  **/
  get id(){return this.data.id}
  get titre(){return this.data.titre}
  set titre(v){this.data.titre = v}
  get description(){return this.data.description}
  set description(v){this.data.description = v}
  get sorted_items(){return this.data.sorted_items}
  set sorted_items(v){this.data.sorted_items = v}
  get type(){return this.data.type}
  set type(v){this.data.type = v}
  get stepsId(){return this.data.stepsId}
  set stepsId(v){this.data.stepsId = v}
  get created_at(){return this.data.created_at}
  set created_at(v){this.data.created_at = v}
  get updated_at(){return this.data.updated_at}
  set updated_at(v){this.data.updated_at = v}

  // Pour marquer la donnée modifiée
  setModified(v){v = v || false; this.modified = v}

  /**
    Définit et retourne la première plus proche échéance de la liste
    cf. firstEcheance
    Fonctionnement : on passe en revue la liste des éléments et on
    prend la plus proche échéance
  **/
  async defineFirstEcheance(){
    console.log("-> defineFirstEcheance de “%s”", this.titre)
    var first = null
      , firstFin = null
    if ( undefined === this._items ) await this.load()
    Object.values(this.items).forEach(item => {
      if ( !first || (item.echeance && item.echeance < first)) {
        first = item.echeance
      }
      if ( !firstFin || (item.echeanceFin && item.echeanceFin < firstFin)){
        firstFin = item.echeanceFin
      }
    })
    this._firstecheance = first
    this._firstecheancefin = firstFin
    return {
        first:first         // la première prochaine échéance
      , firstFin:firstFin   // la première prochaine échéance de fin d'item
    }
  }

}
List.prototype.update = updateInstance
