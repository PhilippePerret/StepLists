'use strict'

const Dom = {
    name: 'Dom'

, createDiv(data){ return this.create('DIV', data) }
, createInputText(attrs){return this.create('INPUT', Object.assign(attrs,{type:'text'}))}
, createTextarea(attrs){return this.create('TEXTAREA', attrs)}
, createHidden(attrs){return this.create('INPUT', Object.assign(attrs,{type:'hidden'}))}
, createInput(data){ return this.create('INPUT', data) }
, createButton(attrs){return this.create('BUTTON',Object.assign(attrs,{type:'button'}))}
, createSelect(attrs){
    let values = attrs.values
    delete attrs.values
    let select = this.create('SELECT', attrs)
    this.peupleSelect(select, values, attrs)
    return select
  }
, createCheckbox(attrs){
    var cb = this.createInput({type:'checkbox',name:attrs.name, id:(attrs.id||attrs.name)})
    if ( attrs.checked === true ) cb.checked = true
    var label = this.create('LABEL', {for:(attrs.id||attrs.name), text: attrs.text})
    var dom = this.createDiv({class:attrs.row})
    dom.append(cb)
    dom.append(label)
    return dom
  }
  /**
    Pour actualiser un menu
    @param {Object} data
                        id:     Identifiant du select
                        values: Les valeurs à mettre
                        first_title: Si défini, le premier titre ("Choisir…")
  **/
, updateSelect(data){
    this.peupleSelect(document.querySelector(data.id), data.values, Object.assign(data,{reset:true}))
  }
, peupleSelect(select, values, options){
    options.reset && (select.innerHTML = '')
    options.first_title && values.unshift(['', options.first_title])
    let selected = options.selected
    for ( var value of values ) {
      var [id, titre] = value
      var attrs = {value:id, text:titre}
      if ( id === selected ) Object.assign(attrs,{selected:"SELECTED"})
      select.append(this.create('OPTION', attrs))
    }
    selected && (select.value = selected) // au cas où
}

, create(tag, attrs){
    var dom = document.createElement(tag)
    for(var k in attrs){
      switch (k) {
        case 'inner':
          console.log("inner ajouté :", attrs[k])
          if ( 'string' === typeof attrs[k]) {
            dom.innerHTML = attrs[k]
          } else {
            // Ce sont des éléments DOM à insérer
            attrs[k].map( domElement => dom.appendChild(domElement))
          }
          break;
        case 'text':
          dom.innerHTML = attrs[k]
          break
        default:
          // Par défaut, on définit un attribut
          dom.setAttribute(k, attrs[k])
      }
    }
    return dom
  }

}
