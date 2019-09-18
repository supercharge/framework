'use strict'

const ViewCompiler = require('../../view')
const Application = require('../../foundation/application')

class RenderViews {
  constructor () {
    this.compiler = null
  }

  async _initialize () {
    const app = new Application()
    await app.registerCoreBootstrappers()

    this.compiler = ViewCompiler
    await this.compiler.initialize()
  }

  async render (template, data = {}) {
    await this._initialize()

    return this.compiler.renderTemplate(template, data)
  }
}

module.exports = RenderViews
