'use strict'

const ViewCompiler = require('./../../view/compiler')

class RenderViews {
  constructor () {
    this.compiler = new ViewCompiler()
  }

  async _initialize () {
    await this.compiler.initialize()
  }

  async render (template, data = {}) {
    await this._initialize()

    return this.compiler.render(template, data)
  }
}

module.exports = RenderViews
