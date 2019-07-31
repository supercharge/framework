'use strict'

const Env = require('../env')
const Config = require('../config')
const Compiler = require('./compiler')

class ViewBoostrapper {
  constructor (server) {
    this.server = server
    this.engine = new Compiler()
    this.config = Config.get('app', {})
  }

  async boot () {
    await this.engine.initialize()

    await this.serveViews()
  }

  async serveViews () {
    this.server.views(
      {
        engines: {
          hbs: this.engine.instance()
        },
        layout: 'app',
        isCached: Env.isProduction(),
        path: this.engine.viewsPath(),
        layoutPath: this.engine.layoutLocations(),
        helpersPath: this.engine.helpersLocations(),
        partialsPath: this.engine.partialsLocations(),
        context: (request) => this.viewContext(request)
      })
  }

  viewContext (request) {
    return {
      request,
      user: request.user,
      title: this.config.name,
      description: this.config.description
    }
  }
}

module.exports = ViewBoostrapper
