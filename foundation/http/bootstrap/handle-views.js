'use strict'

const Path = require('path')
const Config = require('../../../config')
const Helper = require('../../../helper')
const Handlebars = require('handlebars')
const HandlebarsHelpers = require('handlebars-helpers')

class Views {
  /**
   * Create a Handlebars instance for view rendering.
   * Enrich the Handlebars instance to include
   * dozens of useful layout helpers.
   */
  constructor () {
    this.viewManager = this.initializeHandlebars()
  }

  /**
   * Initialize an extended handlebars instance that
   * contains hundrets of additional helpers.
   */
  initializeHandlebars () {
    HandlebarsHelpers({
      handlebars: Handlebars
    })

    return Handlebars
  }
  /**
   * Create the hapi view configuration object. This
   * configuration includes the Handlebars render
   * engine and view configurations.
   *
   * @returns {Object}
   */
  extends (server) {
    server.views(
      {
        engines: {
          hbs: this.handlebars()
        },
        path: this.viewsPath(),
        layoutPath: this.layoutLocations(),
        layout: 'app',
        helpersPath: this.helpersLocations(),
        partialsPath: this.partialsLocations(),
        isCached: Config.get('app.isProduction'),
        context: function (request) {
          return {
            request,
            user: request.auth.credentials,
            title: Config.get('app.name'),
            description: Config.get('app.description')
          }
        }
      })
  }

  /**
   * Returns the handlebars instance.
   *
   * @returns {Object}
   */
  handlebars () {
    return this.viewManager
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
      Path.resolve(__dirname, '..', '..', '..', 'view', 'handlebars', 'helpers')
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
}

module.exports = Views
