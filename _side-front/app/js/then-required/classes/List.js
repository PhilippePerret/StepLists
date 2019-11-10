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
    Initialisation du panneau des listes
  **/
  static init(){
    let btnPlus   = document.querySelector('div#div-lists div.btn-plus')
      , btnMoins  = document.querySelector('div#div-lists div.btn-moins')
      , btnEdit   = document.querySelector('div#div-lists div.btn-edit')
      , btnShow   = document.querySelector('div#div-lists div.btn-show')
    btnPlus.addEventListener('click',this.addList.bind(this))
    btnMoins.addEventListener('click',this.removeSelectedList.bind(this))
    btnEdit.addEventListener('click',this.editSelectedList.bind(this))
    btnShow.addEventListener('click',this.showSelectedList.bind(this))

    // Les éléments du formulaire
    this.btnSaveList.addEventListener('click', this.saveList.bind(this))
    this.btnCancelList.addEventListener('click',this.cancelSaveList.bind(this))

  }

  /**
    Retourne l'instance List de la liste d'identifiant +list_id+
  **/
  static getById(list_id){
    return this.listsById[list_id]
  }

  /**
    | Éléments de l'interface
  **/
  static get form(){return document.querySelector('form#list-form')}
  static get btnSaveList(){return document.querySelector('form#list-form button#btn-save-list')}
  static get btnCancelList(){return document.querySelector('form#list-form button#btn-cancel-save-list')}
  static get idField(){return document.querySelector('form#list-form input#list-id')}

  static showForm(){this.form.classList.remove('noDisplay')}
  static hideForm(){this.form.classList.add('noDisplay')}
  static resetForm(){
    // console.log("-> List::resetForm")
    for(var prop of ['id','titre','description','steps']){
      document.querySelector(`form#list-form #list-${prop}`).value = ''
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
  static async cancelSaveList(){
    this.hideForm()
  }

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

  static removeSelectedList(ev){
    console.log("Destruction de liste demandée")
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
      liste.steps = String(liste.steps)
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

    for(var prop of ['id','titre','description','steps']){
      Object.assign(provData, {[prop]: document.querySelector(`form#list-form #list-${prop}`).value.trim()})
    }
    if ( provData.id == ''){delete provData.id}
    else { provData.id = parseInt(provData.id,10)}

    provData.titre || errors.push("Le titre est requis")
    if (provData.titre){
      provData.titre.length > 3 || errors.push("Le titre doit être au moins de 4 lignes.")
      provData.titre.length < 201 || errors.push("Le titre est trop long (200 lettres max)")
    }
    provData.description.length < 65000 || errors.push("La description est trop longue (65000 caractères max)")

    provData.steps.length > 0 || errors.push("Les étapes doivent être définies.")

    if (errors.length){
      console.error("Des erreurs sont survenues : ", errors.join(CR))
      alert("Des erreurs sont survenues, je ne peux pas enregistrer la liste telle quelle. Consulter la console.")
      return false
    } else {
      this.provData = provData
      return true
    }
  }

  // L'instance List courante
  static get current(){return this._current}
  static set current(v){
    if (this._current){
      this._current.li.classList.remove('selected')
    }
    this._current = v
    // On règle le titre partout où il est utilisé
    document.querySelector('.list-name').innerHTML = v.titre
    // On met le lit en exergue
    v.li.classList.add('selected')
    // On affiche les boutons qui permettent de gérer la liste
    document.querySelector('div#div-lists .btns-selected').classList.remove('hidden')
  }





  /** ---------------------------------------------------------------------
    *   INSTANCE
    *
  *** --------------------------------------------------------------------- */
  constructor(data){
    this.data = data
    // On doit garder une trace des étapes actuelles pour pouvoir checker
    // et corriger les items (leurs étapes) s'ils existent
    this.keptSteps = `${this.steps}`
  }

  // Méthode qui crée la liste
  async create(){
    var req = "INSERT INTO lists (titre, description, steps, created_at) VALUES (?,?,?, NOW())"
    var res = await MySql2.execute(req, [this.titre, this.description, this.steps])
  }

  async afterUpdate(){
    if ( undefined === this._items ){
      await this.loadItems()
    }
    // S'il y a des items dans cette liste et que les étapes ont été
    // modifiées, il faut checker ce qu'il y a à faire
    if ( this.items.length && this.keptSteps != this.steps) {
      Step.checkAndResolveStepsChanges(this)
    } else {
      if (this.items.length) {
        console.log("Aucun item dans cette liste, les étapes peuvent être modifiées sans souci.")
      }
    }
    this.updateLi()
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
  edit(){
    List.resetForm()
    for(var prop of ['id','titre','description','steps']){
      var val = this[prop] || ''
      document.querySelector(`form#list-form #list-${prop}`).value = val
    }
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
    if ( undefined === this._items ){
      await this.loadItems()
    }
    var liste
    if ( this.sorted_items ) {
      // TODO Lorsqu'on pourra classer les items, c'est la liste
      // classée qu'on prendra
    } else {
      liste = Object.values(this.items)
    }
    liste.map(item => item.build())
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
    Pour relever tous les items de la liste
  **/
  async loadItems(){
    this._items = {}
    var items = await MySql2.execute('SELECT * FROM items WHERE list_id = ?', [this.id])
    for(var dataItem of items){
      var instanceItem = new Item(dataItem)
      Object.assign(this._items, {[instanceItem.id]: instanceItem})
    }
  }
  /**
    | Méthodes de données volatiles
  **/
  get items(){
    return this._items
  }

  // Retourne la liste des étapes (comme Array)
  // Note : dans la base, c'est un string
  get aSteps(){
    if ( undefined === this._asteps ) {
      this._asteps = this.steps.split(CR)
    } return this._asteps
  }

  /**
    Retourne la liste des instances {Step} des étapes de la liste courante
  **/
  get iSteps(){
    if (undefined === this._isteps){
      this._isteps = this.aSteps.map(dStep => new Step(dStep))
    } return this._isteps
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
  get steps(){return this.data.steps}
  set steps(v){this.data.steps = v}
  get created_at(){return this.data.created_at}
  set created_at(v){this.data.created_at = v}
  get updated_at(){return this.data.updated_at}
  set updated_at(v){this.data.updated_at = v}

  // Pour marquer la donnée modifiée
  setModified(v){v = v || false; this.modified = v}

}
List.prototype.update = updateInstance
