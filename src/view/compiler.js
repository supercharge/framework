'use strict'

const Fs = require('fs')
const Path = require('path')
const Helper = require('./../helper')
const Logger = require('./../logging')
const Handlebars = require('handlebars')

class HandlebarsCompiler {
  constructor () {
    this._engine = this.createEngine()

    this.loadHelpers()
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

  loadHelpers () {
    const helpersPaths = [].concat(this.helpersLocations())

    helpersPaths.forEach(helpersPath => {
      if (Fs.existsSync(helpersPath)) {
        Fs.readdirSync(helpersPath).forEach(file => {
          if (!file.startsWith('.')) {
            this.registerHelper(helpersPath, file)
          }
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
        Logger.debug('Registered helper function:  ' + Path.basename(file))
      }
      else {
	      Logger.warn(`Helper file '${Path.basename(file)}' is not a function, it's a ${typeof helper}`)
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
