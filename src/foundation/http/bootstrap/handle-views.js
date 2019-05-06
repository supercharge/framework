'use strict'

const Config = require('../../../config')
const HandlebarsCompiler = require('../../../view/compiler')

class HandleViews {
  /**
   * Create a Handlebars instance for view rendering.
   * Enrich the Handlebars instance to include
   * dozens of useful layout helpers.
   */
  constructor () {
    this.engine = new HandlebarsCompiler()
  }

  /**
   * Create the hapi view configuration object. This
   * configuration includes the Handlebars render
   * engine and view configurations.
   *
   * @returns {Object}
   */
  extends (server) {
    server.views(
      {
        engines: {
          hbs: this.engine.instance()
        },
        layout: 'app',
        path: this.engine.viewsPath(),
        layoutPath: this.engine.layoutLocations(),
        helpersPath: this.engine.helpersLocations(),
        partialsPath: this.engine.partialsLocations(),
        isCached: Config.get('app.isProduction'),
        context: this.viewContext
      })
  }

  viewContext (request) {
    return {
      request,
      user: request.user,
      title: Config.get('app.name'),
      description: Config.get('app.description')
    }
  }
}

module.exports = HandleViews
