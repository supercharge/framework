'use strict'

const Path = require('path')
const Execa = require('execa')
const Helper = require('../../../helper')
const BaseCommand = require('./base-command')
const { forEachSeries } = require('p-iteration')

class MakeAuth extends BaseCommand {
  constructor () {
    super()

    this.stubsDir = Path.resolve(__dirname, '..', 'stubs', 'make', 'auth')

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
      'auth/logout.js': 'auth/logout.js',
      'auth/forgot-password.js': 'auth/forgot-password.js',
      'auth/reset-password.js': 'auth/reset-password.js'
    }
  }

  /**
   * Returns the command signature.
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
   * Handle the command.
   */
  async handle () {
    await this.run(async () => {
      await this.copyFiles()

      this.success(`\n${this.icon('success')} Authentication scaffolding successful. Generated authentication views and routes.`)
    })
  }

  async copyFiles () {
    await this.ensureDirectories()
    await this.copyViews()
    // copy CSS styles?
    // copy email template

    await this.copyModels()
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
        Path.resolve(this.stubsDir, 'views', stub),
        Helper.viewsPath(dest)
      )

      this.completed('created', `views/${dest}`)
    })

    console.log()
  }

  async copyModels () {
    // copy user model

    // const dependencies = ['mongoose@5.4.3']
    // await this.install(dependencies)
  }

  async copyRoutes () {
    await forEachSeries(Object.entries(this.routes), async ([stub, dest]) => {
      if (await this.pathExists(Helper.routesPath(dest))) {
        if (!await this.confirm(`The route [${dest}] exists already. Replace it?`)) {
          return
        }
      }

      await this.copy(
        Path.resolve(this.stubsDir, 'routes', stub),
        Helper.routesPath(dest)
      )

      this.completed('created', `routes/${dest}`)
    })
  }

  async install (dependencies) {
    dependencies = Array.isArray(dependencies) ? dependencies : [dependencies]

    this.info(`Installing model dependencies: [${[...dependencies]}]`)

    await Execa('npm', ['install', ...dependencies], { cwd: Helper.appRoot() })
  }
}

module.exports = MakeAuth
