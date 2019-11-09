'use strict'
/**
  Comme il y a des procédures identiques pour les instances list et item,
  on fait une méthode générale qui sera appelée par:
    <Classe>.prototype.update = updateInstance
  dans l'instance. Toute la "subtilité" se trouve dans le 'this' ci-dessus
  qui concernera toujours l'instance voulue.

  Pour fonctionner, les données doivent être enregistrées dans une table
  qui porte le nom de la classe avec un "s"
  Si la classe s'appelle "List", la table doit s'appeler "Lists".

**/
async function updateInstance(newValeurs){
  // On ne prend en compte que les valeurs modifiées
  var modValues = {}
  var columns = []
  var valeurs = []
  for(var prop in newValeurs){
    if ( this[prop] != newValeurs[prop] ) {
      columns.push(`${prop} = ?`)
      valeurs.push(newValeurs[prop])
      Object.assign(modValues, {[prop]: newValeurs[prop]})
    }
  }
  if ( valeurs.length < 1 ){
    // console.log("PAS DE MODIFICATION")
    return // pas de modification
  }
  else {
    // console.log("Valeurs modifiées (valeurs) : ", modValues, valeurs)
  }
  columns.push("updated_at = ?")
  valeurs.push(new Date())
  Object.assign(modValues, {updated_at: new Date()})
  valeurs.push(this.id)
  var request = `UPDATE ${this.constructor.name}s SET ${columns.join(', ')} WHERE id = ?`
  var res = await MySql2.execute(request,valeurs)
  // console.log("Résultat de la requête %s : ", request, res)
  // console.log("avec les valeurs : ", valeurs)

  // On dispatche les nouvelles valeurs dans l'instance
  for(var prop in modValues){this[prop]=modValues[prop]}
  // Si une méthode afterUpdate existe, on l'invoque pour finir
  if ('function' === typeof this.afterUpdate){
    this.afterUpdate.call(this)
  }
}
