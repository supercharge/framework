'use strict'

const Path = require('path')
const RegistersPlugins = require('./01-registers-plugins')

class HttpConcerns extends RegistersPlugins {
  shouldIgnore (file) {
    return Path.basename(file).startsWith('_')
  }
}

module.exports = HttpConcerns
