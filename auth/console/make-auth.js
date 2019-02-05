'use strict'

const Path = require('path')
const Execa = require('execa')
const Helper = require('../../helper')
const { forEachSeries } = require('p-iteration')
const BaseCommand = require('../../foundation/console/commands/base-command')

/**
 * Craft command to set the application name.
 */
class MakeAuth extends BaseCommand {
  constructor () {
    super()

    this.views = {
      'auth/login.hbs': 'auth/login.hbs',
      'auth/signup.hbs': 'auth/signup.hbs',
      'auth/forgot-password.hbs': 'auth/forgot-password.hbs',
      'auth/forgot-password-email-sent.hbs': 'auth/forgot-password-email-sent.hbs',
      'auth/reset-password.hbs': 'auth/reset-password.hbs',
      'auth/reset-password-success.hbs': 'auth/reset-password-success.hbs'
    }

    this.routes = {
      'auth/login.js': 'auth/login.js',
      'auth/signup.js': 'auth/signup.js',
      'auth/logout.js': 'auth/logout.js'
    }
  }
  /**
   * Allow users to specify the application
   * name as a parameter or ask for the
   * name afterwards.
   */
  static get signature () {
    return `make:auth`
  }

  /**
   * Returns the command description.
   */
  static get description () {
    return 'Scaffold login and sign up views and routes'
  }

  /**
   * Handle the command and set the aplication name
   * in the project's .env file.
   */
  async handle () {
    await this.run(async () => {
      await this.copyFiles()
      await this.installDependencies()

      this.success(`\n${this.icon('success')} Authentication scaffolding successful. Generated authentication views and routes.`)
    })
  }

  async copyFiles () {
    await this.ensureDirectories()
    // copy views
    await this.copyViews()
    // copy CSS styles?
    // copy email template

    // copy model

    // copy routes
    await this.copyRoutes()

    // copy event?
    // copy auth middleware?
  }

  async ensureDirectories () {
    await this.ensureDir(Helper.viewsPath('auth'))
    await this.ensureDir(Helper.routesPath('auth'))
  }

  async copyViews () {
    await forEachSeries(Object.entries(this.views), async ([stub, dest]) => {
      if (await this.pathExists(Helper.viewsPath(dest))) {
        if (!await this.confirm(`The view [${dest}] exists already. Replace it?`)) {
          return
        }
      }

      await this.copy(
        Path.resolve(__dirname, 'stubs', 'views', stub),
        Helper.viewsPath(dest)
      )
    })
  }

  async copyRoutes () {
    await forEachSeries(Object.entries(this.routes), async ([stub, dest]) => {
      if (await this.pathExists(Helper.routesPath(dest))) {
        if (!await this.confirm(`The route [${dest}] exists already. Replace it?`)) {
          return
        }
      }

      await this.copy(
        Path.resolve(__dirname, 'stubs', 'routes', stub),
        Helper.routesPath(dest)
      )
    })
  }

  async installDependencies () {
    await Execa('npm', ['install', 'mongoose'], { cwd: Helper.appRoot() })
  }
}

module.exports = MakeAuth
