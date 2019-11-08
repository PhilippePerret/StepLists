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

  /**
    Initialisation du panneau des items
    Notamment pour rendre actif les + et -
  **/
  static init(){
    // Surveillance des boutons + et -
    let btnPlus   = document.querySelector('div#div-list-items div.btn-plus')
      , btnMoins  = document.querySelector('div#div-list-items div.btn-moins')
    btnPlus.addEventListener('click', this.addItemToCurrentList.bind(this))
    btnMoins.addEventListener('click', this.removeSelectedItem.bind(this))

    // Surveillance du menu, dans le formulaire, pour choisir les actions
    for(var i of [1,2,3]){
      var racineId = `item-action${i}`
      var selectId = `#${racineId}-type`
      var selectObj = document.querySelector(selectId)
      selectObj.addEventListener('change', this.onChooseTypeAction.bind(this,i))
      var btnChooseId = `#btn-choose-file-action${i}`
      let btnChoose   = document.querySelector(btnChooseId)
      btnChoose.addEventListener('click',this.chooseActionFile.bind(this,i))
    }

    // Pour sauver un item (nouveau ou pas) ou annuler sa création/édition
    this.btnSaveItem.addEventListener('click', this.onSaveItem.bind(this))
    this.btnCancelSaveItem.addEventListener('click', this.cancelSaveItem.bind(this))

  }

  /**
    Méthode appelée quand on sélectionne dans le menu une action à
    accomplir par le bouton +actionId+ de l'item édité
  **/
  static onChooseTypeAction(actionId, ev){
    // console.log("actionId = ", actionId)
    let selectObj = document.querySelector(`select#item-action${actionId}-type`)
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
    let btnC = document.querySelector(`#btn-choose-file-action${actionId}`)
    let btnF = document.querySelector(`#item-action${actionId}`)
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
    let selectObj = document.querySelector(`select#item-action${actionId}-type`)
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
    document.querySelector(`#item-action${actionId}`).value = choix || ''
    if (choix) {
      let btnChoose = document.querySelector(`#btn-choose-file-action${actionId}`)
      btnChoose.innerHTML = `Choisir "${path.basename(choix)}"`
    }
  }

  // Les éléments graphiques (interactifs)
  static get form(){return document.querySelector('form#item-form')}
  static get btnSaveItem(){return document.querySelector("button#btn-save-item")}
  static get btnCancelSaveItem(){return document.querySelector("button#btn-cancel-edit-item")}
  static get idField(){return document.querySelector('form#item-form input#item-id')}

  static showForm(){
    this.form.classList.remove('noDisplay')
    this.formIsVisible = true
  }
  static hideForm(){
    this.form.classList.add('noDisplay')
    this.formIsVisible = false
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

  static resetForm(){
    var prop
    for(prop of ['id','titre','description','expectedNext']){
      // Surtout pas list_id !
      document.querySelector(`#item-${prop}`).value = ''
    }
    for(var i of [1,2,3]){
      prop = `action${i}`
      document.querySelector(`#item-${prop}`).value = ''
      document.querySelector(`#item-${prop}-type`).selectedIndex = 0
      var obj = document.querySelector(`#btn-choose-file-${prop}`)
      obj.innerHTML = 'Choisir…'
      obj.classList.add('noDisplay')
      obj = document.querySelector(`#item-${prop}`)
      obj.innerHTML = 'Choisir…'
      obj.classList.add('noDisplay')
    }
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
    this.idField.value = editedItem.id
    return stopEvent(ev)
  }


  static removeSelectedItem(ev){
    console.error("Destruction d'item demandée (à implémenter)")
    return stopEvent(ev)
  }

  // Annulation de la création de l'item
  static cancelSaveItem(ev){
    this.hideForm()
    return stopEvent(ev)
  }

  // Méthode de création du nouvel item
  static createNewItem(){
    let newItem = new Item({})
    newItem.getValuesFromForm()
    if ( newItem.dataAreValid() ) {
      newItem.createAndDisplay()
      this.hideForm()
    }
  }
  // Méthode de sauvegarde de l'item édité
  static saveSelectedItem(){
    console.error("Implémentation de Item::saveSelectedItem requise")
    this.hideForm()
  }


  /** ---------------------------------------------------------------------
    *   INSTANCE
    *
    * Une instance, c'est par exemple un article pour une liste qui serait
    * un blog.
  *** --------------------------------------------------------------------- */
  constructor(data){
    this.data = data
  }

  // Méthode qui crée le nouvel item
  // Note : à partir des provData
  async create(){
    let request = "INSERT INTO items (titre, list_id, description, expectedNext, action1, action2, action3, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())"
      , valeurs = [this.titre, this.list_id, this.description, this.expectedNext, this.action1, this.action2, this.action3]
    // console.log("Je vais enregistrer les données : ", valeurs)
    await MySql2.execute(request, valeurs)
  }

  // Méthode qui construit l'item
  build(){

  }

  /**
    Méthode qui crée l'item et l'affiche dans la liste

  **/
  async createAndDisplay(){
    // les données ont été relevées du formulaire, elles ont été
    // validées, on peut maintenant les distribuer dans l'instance
    this.dispatchAndNormalizeProvData()
    await this.create() // à partir des provData
    this.build()
  }

  // Distribue les données dans l'instance
  dispatchAndNormalizeProvData(){
    for(var prop of ['titre','description','list_id', 'action1', 'action2', 'action3']){
      this[prop] = this.provData[prop]
    }
  }

  // Méthode qui récupère les données du formulaire (sans les checker,
  // en les mettant dans this.provData)
  getValuesFromForm(){
    this.provData = {}
    for(var prop of ['id', 'titre','list_id','description','action1','action2','action3']){
      this.provData[prop] = document.querySelector(`#item-${prop}`).value
    }
    // Quelques ajustements
    if ( this.provData.id != '' ){ // <= édition
      this.provData.id = parseInt(this.provData.id,10)
    }
    this.provData.list_id = parseInt(this.provData.list_id,10)

    // Il faut ajouter le type aux actions si elles sont définies
    for(var i of [1,2,3]){
      var prop = `action${i}`
        , type = document.querySelector(`select#item-${prop}-type`).value
      if ( this.provData[prop] == "" || type == 'none') {
        this.provData[prop] = null
      } else {
        this.provData[prop] = `${type}::${this.provData[prop]}`
      }
    }
    console.log("this.provData = ", this.provData)
  }

  /**
    Méthode qui checke la validité des données provisoires
    Retourne true si les données sont valides, faux dans le
    cas contraire.
  **/
  dataAreValid(){
    var errors = []
    this.provData.titre || errors.push("Le titre est requis")
    List.getById(this.provData.list_id) || errors.push("La liste est inconnue, bizarrement…")

    if (errors.length) {
      console.error("Des erreurs ont été trouvées : ", errors.join(CR))
      alert("Des erreurs ont été trouvées (cf. la console)")
      return false
    } else {
      return true
    }
  }

  /**
    |Propriétés volatiles
  **/

  // Liste (instance List) auquel appartient l'itemp
  get list(){
    if (undefined === this._list){
      this._list = List.getById(this.list_id)
    } return this._list
  }
  // Liste des valeurs des étapes exécutées
  get aSteps(){
    if ( undefined === this._asteps ) {
      this._asteps = this.steps.split(';')
    } return this._asteps
  }
  /**
    |Propriétés fixes (enregistrées)
  **/
  get titre(){return this.data.titre}
  set titre(v){this.data.titre = v}
  get description(){return this.data.description}
  set description(v){this.data.description = v}
  get list_id(){return this.data.list_id}
  set list_id(v){this.data.list_id = v}
  get expectedNext(){return this.data.expectedNext}
  set expectedNext(v){this.data.expectedNext = v}
  get steps(){return this.data.steps}
  set steps(v){this.data.steps = v}
  get action1(){return this.data.action1}
  set action1(v){this.data.action1 = v}
  get action2(){return this.data.action2}
  set action2(v){this.data.action2 = v}
  get action3(){return this.data.action3}
  set action3(v){this.data.action3 = v}
}
