'use strict'

const ViewCompiler = require('./../../view/compiler')

class RenderViews {
  constructor () {
    this.compiler = new ViewCompiler()
  }

  async render (template, data = {}) {
    return this.compiler.render(template, data)
  }
}

module.exports = RenderViews
