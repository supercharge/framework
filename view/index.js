'use strict'

const Path = require('path')
const Env = require('../env')
const Fs = require('../filesystem')
const Helper = require('../helper')
const Config = require('../config')
const Logger = require('../logging')
const Handlebars = require('handlebars')
const Collect = require('@supercharge/collections')

class ViewCompiler {
  constructor () {
    this.server = null
    this.engine = this.createEngine()
  }

  /**
   * Returns the application configuration.
   *
   * @returns {Object}
   */
  get config () {
    return Config.get('app', {})
  }

  /**
   * Create the Handlebars view rendering engine.
   *
   * @returns {Object}
   */
  createEngine () {
    return Handlebars
  }

  /**
   * Loads all view helpers.
   */
  async initialize () {
    await this.loadHelpers()
  }

  /**
   * Load all view helpers, provided by the
   * Supercharge core and from user-land.
   */
  async loadHelpers () {
    await Collect(
      await this.helpersLocations()
    )
      .filter(async path => Fs.exists(path))
      .forEach(async helpersPath => {
        const files = await Fs.files(helpersPath)

        files
          .filter(file => !this.isDotFile(file))
          .forEach(file => this.registerHelper(helpersPath, file))
      })
  }

  registerHelper (helpersPath, file) {
    file = Path.join(helpersPath, file)

    try {
      const helper = require(file)
      const name = this.filename(helpersPath, file)

      typeof helper === 'function'
        ? this.engine.registerHelper(name, helper)
        : Logger.warn(`View helper "${Path.basename(file)}" is not a function, it's a ${typeof helper}`)
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

  /**
   * Returns the file name without extension.
   *
   * @param {String} path
   * @param {String} file
   *
   * @returns {String}
   */
  filename (path, file) {
    return file.slice(path.length + 1, -Path.extname(file).length)
  }

  async serveViewsOn (server) {
    server.views(
      {
        engines: {
          hbs: this.engine
        },
        layout: 'app',
        isCached: Env.isProduction(),
        path: this.viewsPath(),
        layoutPath: await this.layoutLocations(),
        helpersPath: await this.helpersLocations(),
        partialsPath: await this.partialsLocations(),
        context: (request) => this.viewContext(request)
      })

    this.server = server
  }

  /**
   * Returns the default, global view context data
   * which will be appended to every request and
   * therefore available in every template.
   *
   * @param {Request} request
   *
   * @returns {Object}
   */
  viewContext (request) {
    return {
      request,
      user: request.user,
      title: this.config.name,
      description: this.config.description
    }
  }

  /**
   * Renders the given `data` into the template
   * located at `viewPath` and returns the
   * resulting, rendered HTML.
   *
   * @param {String} template
   * @param {*} data
   *
   * @returns {String}
   */
  render (viewPath, data) {
    return this.server.render(viewPath, data, { layout: null })
  }

  /**
   * Renders the given `data` into the `template` string
   * and returns the resulting, rendered HTML.
   *
   * @param {String} template
   * @param {*} data
   *
   * @returns {String}
   */
  renderTemplate (template, data) {
    const render = this.engine.compile(template)

    return render(data)
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
  async layoutLocations () {
    return Collect([
      Path.resolve(this.viewsPath(), 'layouts')
    ])
      .filter(path => Fs.exists(path))
      .all()
  }

  /**
   * Return an array of folders that contain
   * Handlebars helpers.
   *
   * @returns {Array}
   */
  async helpersLocations () {
    return Collect([
      Path.resolve(this.viewsPath(), 'helpers'),
      Path.resolve(__dirname, 'handlebars/helpers')
    ])
      .filter(path => Fs.exists(path))
      .all()
  }

  /**
   * Return an array of folders that contain
   * Handlebars partial views.
   *
   * @returns {Array}
   */
  async partialsLocations () {
    return Collect([
      Path.resolve(this.viewsPath(), 'partials')
    ])
      .filter(path => Fs.exists(path))
      .all()
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

module.exports = new ViewCompiler()
