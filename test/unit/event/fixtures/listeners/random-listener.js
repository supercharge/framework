'use strict'

const Listener = require('../../../../../event/listener')

class Random extends Listener {
  on () {
    return 'never.called'
  }

  async handle () { }
}

module.exports = Random
