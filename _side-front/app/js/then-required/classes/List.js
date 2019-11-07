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
    btnPlus.addEventListener('click',this.addList.bind(this))
    btnMoins.addEventListener('click',this.removeSelectedList.bind(this))

  }

  static addList(ev){
    let form = document.querySelector('form#list-form')
    let btnSave = document.querySelector('button#btn-save-list')
    btnSave.addEventListener('click', this.createList.bind(this))
    form.classList.remove('noDisplay')
    return stopEvent(ev)
  }
  static async createList(){
    let form = document.querySelector('form#list-form')
    let btnSave = document.querySelector('button#btn-save-list')
    form.classList.add('noDisplay')
    btnSave.removeEventListener('click', this.createList.bind(this))
    // On essaie de créer la liste
    // On récupère ses données
    var newList = new List({})
    for( var prop of ['titre','description','steps']){
      newList[prop] = document.querySelector(`#list-${prop}`).value
    }
    console.log("new list : ", newList)
    newList.steps = newList.steps.split(CR).join(';')
    console.log("étapes : ", newList.steps)

    // TODO Il faut d'abord vérifier qu'elle soit valide
    if ( newList.isValid() ){
      // TODO On l'enregistre dans la base
      var req = "INSERT INTO lists (titre, description, steps, created_at) VALUES (?,?,?, NOW())"
      var res = await MySql2.execute(req, [newList.titre, newList.description, newList.steps])
      // On l'affiche dans la liste TODO : au début
      let listUL = document.querySelector('UL#lists')
      listUL.appendChild(newList.li)
    } else {
      console.error("--- Liste invalide ---")
      alert("Liste invalide, impossible de la créer (cf. en console)")
    }
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
    this.listes = {}
    // On doit récupérer la liste des listes
    let listes = await MySql2.execute('SELECT * FROM lists ORDER BY titre')
    // On fait un item LI par liste
    let listUL = document.querySelector('UL#lists')
    listUL.innerHTML = ''
    for ( var liste /* TextRow */ of listes ) {
      var iList = new List(liste)
      listUL.appendChild(iList.li)
      iList.observe()
      Object.assign(this.listes, iList)
    }
  }

  // L'instance List courante
  static get current(){return this._current}
  static set current(v){
    this._current = v
    document.querySelector('.list-name').innerHTML = v.titre
  }

  /**
    Méthode de classe qui affiche la liste d'identifiant ID (donc ses items,
    et permet de les gérer)
  **/
  static show(list_id){

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
  }
  onClick(ev){
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
  /**
    | Méthodes de données fixe
  **/
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
