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

  static showForm(){this.form.classList.remove('noDisplay')}
  static hideForm(){this.form.classList.add('noDisplay')}
  static resetForm(){
    for(var prop of ['id','titre','description','steps']){
      document.querySelector(`form#list-form #list-${prop}`)
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
    this.resetForm()
    // TODO Mettre les valeurs de la liste dans les champs
    console.error("Il faut implémenter le peuplement du formulaire de liste")
    // this.current.edit()
    return stopEvent(ev)
  }

  /**
    Méthode appelée par le bouton "Enregistrer" du formulaire
    Il s'agit soit d'une création soit d'une édition
  **/
  static async saveList(){
    if (this.idField.value == "") { await this.createList() }
    else {await this.updateList()}
  }
  static async cancelSaveList(){
    this.hideForm()
  }

  static async createList(){
    // On essaie de créer la liste
    // On récupère ses données
    var newList = new List({})
    for( var prop of ['titre','description','steps']){
      newList[prop] = document.querySelector(`#list-${prop}`).value
    }
    newList.steps = newList.steps.split(CR).join(';')

    // Il faut d'abord vérifier qu'elle soit valide
    if ( newList.isValid() ){
      // On l'enregistre dans la base
      var req = "INSERT INTO lists (titre, description, steps, created_at) VALUES (?,?,?, NOW())"
      var res = await MySql2.execute(req, [newList.titre, newList.description, newList.steps])
      // On l'affiche dans la liste TODO : au début
      let listUL = document.querySelector('UL#lists')
      listUL.appendChild(newList.li)
      this.hideForm()
    } else {
      console.error("--- Liste invalide ---")
      alert("Liste invalide, impossible de la créer (cf. en console)")
    }
  }

  static updateList(){

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
      var iList = new List(liste)
      Object.assign(lists, {[iList.id]: iList})
    }
    this.listsById = lists
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
    Méthode qui affiche les items de la liste
  **/
  async showItems(){
    let itemList = document.querySelector('ul#item-list')
    // Masquer la section des listes
    // et Afficher la section des items
    UI.showPanel('itemsPanel')
    // On renseigne l'identifiant de liste qui permettra de régler
    // les list_id des nouveaux items ou items édités
    document.querySelector('#item-list_id').value = this.id
    // Vider la section des items
    itemList.innerHTML = ""
    // Peupler la section des items
    if ( undefined === this._items ){
      await this.loadItems()
    }
    for ( var item_id in this.items ) {
      itemList.appendChild(this.items[item_id].li)
    }
  }

  /**
    | Méthodes d'helpers
  **/
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
    for(var dItem of items){
      var iItem = new Item(dItem)
      Object.assign(this._items, {[iItem.id]: iItem})
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
      this._asteps = this.steps.split(';')
    } return this._asteps
  }

  /**
    | Méthodes de données fixe
  **/
  get id(){return this.data.id}
  get titre(){return this.data.titre}
  set titre(v){this.data.titre = v; this.setModified()}
  get description(){return this.data.description}
  set description(v){this.data.description = v; this.setModified()}
  get sorted_items(){return this.data.sorted_items}
  set sorted_items(v){this.data.sorted_items = v; this.setModified()}
  get type(){return this.data.type}
  set type(v){this.data.type = v; this.setModified()}
  get steps(){return this.data.steps}
  set steps(v){this.data.steps = v; this.setModified()}
  get created_at(){return this.data.created_at}
  set created_at(v){this.data.created_at = v; this.setModified()}
  get updated_at(){return this.data.updated_at}
  set updated_at(v){this.data.updated_at = v; this.setModified()}

  // Pour marquer la donnée modifiée
  setModified(v){v = v || false; this.modified = v}

  /**
    Méthode qui retourne true si les données de la liste sont valides
  **/
  isValid(){
    var errors = []
    this.titre != "" || errors.push("Le titre doit être défini")
    this.steps != [] || errors.push("Il faut impérativement que cette liste ait des étapes.")
    if ( errors.length ){
      console.error("Erreurs trouvées dans les données de la liste :", errors)
    }
    return errors.length == 0
  }
}
