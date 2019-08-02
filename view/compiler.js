'use strict'

const Path = require('path')
const Fs = require('../filesystem')
const Helper = require('../helper')
const Logger = require('../logging')
const Handlebars = require('handlebars')
const Collect = require('@supercharge/collections')

class HandlebarsCompiler {
  constructor () {
    this.engine = this.createEngine()
  }

  async initialize () {
    await this.loadHelpers()
  }

  instance () {
    return this.engine
  }

  compile (template) {
    return this.engine.compile(template)
  }

  render (template, data) {
    const renderFunction = this.compile(template)

    return renderFunction(data)
  }

  createEngine () {
    return Handlebars
  }

  async loadHelpers () {
    const helpersPaths = [].concat(this.helpersLocations())

    await Collect(helpersPaths).forEach(async helpersPath => {
      if (await Fs.exists(helpersPath)) {
        const files = await Fs.readDir(helpersPath)

        files.forEach(file => {
          this.registerHelper(helpersPath, file)
        })
      }
    })
  }

  registerHelper (helpersPath, file) {
    if (this.isDotFile(file)) {
      return
    }

    file = Path.join(helpersPath, file)

    try {
      const helper = require(file)
      const name = this.filename(helpersPath, file)

      if (typeof helper === 'function') {
        this.engine.registerHelper(name, helper)
      } else {
        Logger.warn(`View helper "${Path.basename(file)}" is not a function, it's a ${typeof helper}`)
      }
    } catch (err) {
      Logger.warn(`WARNING: failed to load helper ${file}: ${err.message}`)
    }
  }

  /**
   * Determine whether the file is a dotfile.
   *
   * @param {String} file
   *
   * @returns {Boolean}
   */
  isDotFile (file) {
    return file.startsWith('.')
  }

  filename (path, file) {
    return file.slice(path.length + 1, -Path.extname(file).length)
  }

  /**
   * Resolve the path to view files. This defaults
   * to `<project-root>/resources/views`.
   *
   * @returns {String}
   */
  viewsPath () {
    return Helper.resourcePath('views')
  }

  /**
   * Return an array of folders that contain
   * Handlebars layouts.
   *
   * @returns {Array}
   */
  layoutLocations () {
    return [
      Path.resolve(this.viewsPath(), 'layouts')
    ]
  }

  /**
   * Return an array of folders that contain
   * Handlebars helpers.
   *
   * @returns {Array}
   */
  helpersLocations () {
    return [
      Path.resolve(this.viewsPath(), 'helpers'),
      Path.resolve(__dirname, 'handlebars/helpers')
    ]
  }

  /**
   * Return an array of folders that contain
   * Handlebars partial views.
   *
   * @returns {Array}
   */
  partialsLocations () {
    return [
      Path.resolve(this.viewsPath(), 'partials')
    ]
  }

  /**
   * Returns a boolean whether the view engine
   * has a registered helper with the given
   * `name`.
   *
   * @param {String} name
   *
   * @returns {Boolean}
   */
  hasHelper (name) {
    return !!this.engine.helpers[name]
  }
}

module.exports = HandlebarsCompiler
