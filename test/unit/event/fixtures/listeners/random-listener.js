'use strict'

const Listener = require('../../../../../listener')

class Random extends Listener {
  on () {
    return 'never.called'
  }

  async handle () { }
}

module.exports = Random
