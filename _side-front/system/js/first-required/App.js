const App = {
  async init(){
    UI.init()
    // Appeler la méthode 'onInit' si elle existe
    if ( 'function' === typeof this.onInit ) {
      this.onInit.call(this)
    }
  }
}
