'use strict'

const Env = require('../env')
const Config = require('../config')
const Compiler = require('./compiler')

class ViewBoostrapper {
  constructor (server) {
    this._server = server
    this._engine = new Compiler()
    this._config = Config.get('app', {})
  }

  async boot () {
    await this._engine.initialize()

    await this.serveViews()
  }

  async serveViews () {
    this._server.views(
      {
        engines: {
          hbs: this._engine.instance()
        },
        layout: 'app',
        isCached: Env.isProduction(),
        path: this._engine.viewsPath(),
        layoutPath: this._engine.layoutLocations(),
        helpersPath: this._engine.helpersLocations(),
        partialsPath: this._engine.partialsLocations(),
        context: (request) => this.viewContext(request)
      })
  }

  viewContext (request) {
    return {
      request,
      user: request.user,
      title: this._config.name,
      description: this._config.description
    }
  }
}

module.exports = ViewBoostrapper
