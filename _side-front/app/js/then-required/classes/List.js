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
  static get panel(){return document.querySelector('#lists-panel')}
  static get form(){return document.querySelector('form#list-form')}
  static get btnPlus(){return this.panel.querySelector('div#div-lists div.btn-plus')}
  static get btnMoins(){return this.panel.querySelector('div#div-lists div.btn-moins')}
  static get btnSaveList(){return document.querySelector('form#list-form button#btn-save-list')}
  static get btnCancelList(){return document.querySelector('form#list-form button#btn-cancel-save-list')}
  static get idField(){return document.querySelector('form#list-form input#list-id')}
  static get divSteps(){return this.form.querySelector('#listbox-list-steps')}
  static get stepsList(){return this.divSteps.querySelector('ul#list-steps')}

  /**
    Initialisation du panneau des listes
  **/
  static init(){
    let btnEdit   = document.querySelector('div#div-lists div.btn-edit')
      , btnShow   = document.querySelector('div#div-lists div.btn-show')
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

    this.current = null
  }

  /**
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

  /**
    Retourne l'instance List de la liste d'identifiant +list_id+
  **/
  static getById(list_id){
    return this.listsById[list_id]
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
  }

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
    let listUL = document.querySelector('UL#lists')
    listUL.innerHTML = ''
    for ( var iList /* TextRow */ of Object.values(this.listsById) ) {
      listUL.appendChild(iList.li)
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
      Object.assign(provData, {[prop]: document.querySelector(`form#list-form #list-${prop}`).value.trim()})
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
      document.querySelector('div#div-lists .btns-selected').classList.add('hidden')
      this.btnMoins.classList.add('discret')
    }
    if ( v ) {
      this._current = v
      // On règle le titre partout où il est utilisé
      document.querySelector('.list-name').innerHTML = v.titre
      // On met le lit en exergue
      v.li.classList.add('selected')
      // On affiche les boutons qui permettent de gérer la liste
      document.querySelector('div#div-lists .btns-selected').classList.remove('hidden')
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
    // S'il y a des items dans cette liste et que les étapes ont été
    // modifiées, il faut checker ce qu'il y a à faire
    if (this.stepsHasChanged) {
      console.log("La liste des étapes a été modifiée, je dois checker les items.")
      Step.checkAndResolveStepsChanges(this)
    } else {
      if (this.items.length) {
        console.log("Aucun item dans cette liste, les étapes peuvent être modifiées sans souci.")
      }
    }
    this.updateLi()
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
    console.log("À la fin de List.saveSteps, this.stepsId = %s (this.data.stepsId %s). Au début : %s", this.stepsId, this.data.stepsId, this.oldStepsId)
    if ( this.oldStepsId != this.stepsId ) {
      console.warn("Les données étapes ont changé, il faudrait les checker")
      // TODO
    }
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
    document.querySelector('UL#lists').appendChild(this.li)
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
    if ( undefined === this._items ){ await this.load() /* + étapes surtout */}


    for(var prop of ['id','titre','description']){
      var val = this[prop] || ''
      document.querySelector(`form#list-form #list-${prop}`).value = val
    }
    // Il faut construire les étapes (il y en a au moins une)
    this.steps.map(step => step.build())
    // On mémorise la liste initiale des étapes
    List.form.querySelector('#list-originalStepsList').value = this.stepsId
  }

  // Retourne true si la liste des étapes a été modifiée
  get stepsHasChanged(){
    return this.stepsId != List.form.querySelector('#list-originalStepsList').value
  }

  /**
    Méthode qui affiche les items de la liste
  **/
  async showItems(){
    UI.showPanel('itemsPanel')
    // On renseigne l'identifiant de liste qui permettra de régler
    // les list_id des nouveaux items ou items édités
    document.querySelector('#item-list_id').value = this.id
    // Vider la section des items
    Item.listing.innerHTML = ""
    // Peupler la section des items
    if ( undefined === this._items ){ await this.load() }
    var liste
    if ( this.sorted_items ) {
      liste = this.sorted_items.split()
    } else {
      liste = Object.values(this.items)
    }
    liste.map(item => item.build())
  }

  get sortedItems(){return this._sorteditems || defP(this,'_sorteditems',this.sortItems())}
  sortItems(){
    return this.sorted_items.split(';').map(item_id => this.itemsById[item_id])
  }
  get itemsById(){return this._itemsbyid || defP(this,'_itemsbyid',this.setItemsByIds())}
  setItemsByIds(){
    var byId = {}
    this.items.forEach(item => Object.assign(byId, {[item.id]: item}))
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
      var li = document.createElement('LI')
      li.innerHTML = this.titre
      this._li = li
    } return this._li
  }

  /**
    Pour tout recharger (p.e. après un update, pour être sûr d'avoir
    les dernières valeurs)
  **/
  async reload(){
    for(var prop of ['_items','_steps','modified','dataSteps','_li','oldStepsId']){
      delete this[prop]
    }
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

  // Retourne la liste des étapes (comme Array)
  // Note : dans la base, c'est un string des Identifiants de Steps
  // Ici,
  get aSteps(){ return this.steps }
  get iSteps(){ return this.steps }

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

}
List.prototype.update = updateInstance
