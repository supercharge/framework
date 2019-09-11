'use strict'

const ViewCompiler = require('../../view')
const Application = require('../../foundation/application')
const ViewBootstrapper = require('../../view/bootstrapper')

class RenderViews {
  constructor () {
    this.compiler = null
  }

  async _initialize () {
    const app = new Application()
    await app.registerCoreBootstrappers()
    await app.initializeHttpServer()
    await app.register(ViewBootstrapper)

    this.compiler = ViewCompiler
    await this.compiler.initialize()
  }

  async render (template, data = {}) {
    await this._initialize()

    return this.compiler.renderTemplate(template, data)
  }
}

module.exports = RenderViews
