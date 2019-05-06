'use strict'

const Path = require('path')
const Fs = require('./../filesystem')
const Helper = require('./../helper')
const Logger = require('./../logging')
const Handlebars = require('handlebars')
const { forEach } = require('p-iteration')

class HandlebarsCompiler {
  constructor () {
    this._engine = this.createEngine()
  }

  async initialize () {
    await this.loadHelpers()
  }

  instance () {
    return this._engine
  }

  compile (template) {
    return this._engine.compile(template)
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

    await forEach(helpersPaths, async helpersPath => {
      if (await Fs.exists(helpersPath)) {
        const files = await Fs.readDir(helpersPath)

        files.forEach(file => {
          this.registerHelper(helpersPath, file)
        })
      }
    })
  }

  registerHelper (helpersPath, file) {
    file = Path.join(helpersPath, file)

    try {
      const helper = require(file)
      const name = this.filename(helpersPath, file)

      if (typeof helper === 'function') {
        this._engine.registerHelper(name, helper)
      }
    } catch (err) {
      Logger.warn(`WARNING: failed to load helper ${file}: ${err.message}`)
    }
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
    const views = this.viewsPath()

    return [ Path.resolve(views, 'layouts') ]
  }

  /**
   * Return an array of folders that contain
   * Handlebars helpers.
   *
   * @returns {Array}
   */
  helpersLocations () {
    const views = this.viewsPath()

    return [
      Path.resolve(views, 'helpers'),
      Path.resolve(__dirname, 'handlebars', 'helpers')
    ]
  }

  /**
   * Return an array of folders that contain
   * Handlebars partial views.
   *
   * @returns {Array}
   */
  partialsLocations () {
    const views = this.viewsPath()

    return [ Path.resolve(views, 'partials') ]
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
    return !!this._engine.helpers[name]
  }
}

module.exports = HandlebarsCompiler
