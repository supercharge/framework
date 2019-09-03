'use strict'

const Path = require('path')
const Fs = require('../../filesystem')
const Helper = require('../../helper')
const Logger = require('../../logging')
const Collect = require('@supercharge/collections')

class LoadBootstrappers {
  constructor () {
    this.coreBootstrappers = [
      '../../logging/bootstrapper.js',
      '../../auth/bootstrapper.js',
      '../../database/bootstrapper.js',
      '../../view/bootstrapper.js'
    ]
    this._bootstrapperFile = 'bootstrap/app.js'
  }

  /**
   * Load the core and user-land bootstrappers. Also,
   * create bootstrapper instances and run the
   * related `.boot()` method.
   */
  async registerBootstrappers () {
    await Collect(this.coreBootstrappers)
      .map(async path => {
        return this.resolveBootstrapperFrom(path)
      })
      .concat(
        await this.loadUserlandBootstrappers()
      )
      .forEachSeries(async bootstrapper => {
        await this.registerBootstrapper(bootstrapper)
      })
  }

  /**
   * Load the user-land bootstrappers listed in the
   * `bootstrap/app.js` file
   *
   * @returns {Array}
   */
  async loadUserlandBootstrappers () {
    if (await this.hasBootstrapFile()) {
      return this.loadBootstrappers()
    }

    Logger.debug('Missing bootstrap/app.js file. Skipping bootstrappers while app start.')

    return []
  }

  /**
   * Determines whether the `bootstrap/app.js` file exists.L0
   *
   * @returns {Boolean}
   */
  async hasBootstrapFile () {
    return Fs.exists(this.bootstrapFile())
  }

  /**
   * Returns the path to the `bootstrap/app.js` file.
   *
   * @returns {String}
   */
  bootstrapFile () {
    return Path.resolve(Helper.appRoot(), this._bootstrapperFile)
  }

  /**
   * Resolve the bootstrappers array.
   *
   * @returns {Boolean}
   */
  async loadBootstrappers () {
    const { bootstrappers } = require(this.bootstrapFile())

    if (!Array.isArray(bootstrappers)) {
      Logger.error(`The "bootstrappers" property in bootstrap/app.js must be an array, received ${typeof bootstrappers}. Ignoring the file.`)

      return []
    }

    return bootstrappers
  }

  /**
   * Register a single bootstrapper.
   */
  async registerBootstrapper (Bootstrapper) {
    return new Bootstrapper(this).boot()
  }

  /**
   * Resolve the bootstrapper, instantiate
   * a bootstrapper class and pass the
   * app argument to it.
   *
   * @param {String} path
   *
   * @returns {Class}
   */
  resolveBootstrapperFrom (path) {
    return require(
      Path.resolve(__dirname, path)
    )
  }
}

module.exports = LoadBootstrappers
