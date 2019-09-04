'use strict'

const ViewCompiler = require('./')

class ViewBoostrapper {
  constructor ({ server }) {
    this.server = server
    this.compiler = ViewCompiler
  }

  async boot () {
    await this.compiler.initialize()
    await this.compiler.serveViewsOn(this.server)
  }
}

module.exports = ViewBoostrapper
