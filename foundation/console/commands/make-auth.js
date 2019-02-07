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

    this.middleware = {
      'auth/session.js': 'auth/session.js'
    }

    this.models = {
      'user.js': 'user.js'
    }

    this.events = {
      'auth/user-registered.js': 'auth/user-registered.js'
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

      this.success(`\n${this.icon('success')} Authentication scaffolding successful.`)
    })
  }

  async copyFiles () {
    await this.copyViews()
    await this.useAppLayoutInWelcomeRoute()

    // copy CSS styles?
    // copy email template

    await this.copyModels()
    await this.copyRoutes()
    await this.copyMiddlware()
    await this.copyEvents()
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

  async useAppLayoutInWelcomeRoute () {
    const welcomeRoute = Helper.routesPath('welcome.js')
    const content = await this.getFileContent(welcomeRoute)

    if (content) {
      await this.writeFile(
        welcomeRoute,
        content.replace(`, null, { layout: 'clean' }`, '')
      )
    }
  }

  async copyModels () {
    await forEachSeries(Object.entries(this.models), async ([stub, dest]) => {
      if (await this.pathExists(Helper.modelsPath(dest))) {
        if (!await this.confirm(`The model [${dest}] exists already. Replace it?`)) {
          return
        }
      }

      await this.copy(
        Path.resolve(this.stubsDir, 'models', stub),
        Helper.modelsPath(dest)
      )

      this.completed('created', `models/${dest}`)
    })

    console.log()

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

    console.log()
  }

  async install (dependencies) {
    dependencies = Array.isArray(dependencies) ? dependencies : [dependencies]

    this.info(`Installing model dependencies: [${[...dependencies]}]`)

    await Execa('npm', ['install', ...dependencies], { cwd: Helper.appRoot() })
  }

  async copyMiddlware () {
    await forEachSeries(Object.entries(this.middleware), async ([stub, dest]) => {
      if (await this.pathExists(Helper.middlewarePath(dest))) {
        if (!await this.confirm(`The middleware [${dest}] exists already. Replace it?`)) {
          return
        }
      }

      await this.copy(
        Path.resolve(this.stubsDir, 'middleware', stub),
        Helper.middlewarePath(dest)
      )

      this.completed('created', `middleware/${dest}`)
    })
  }

  async copyEvents () {
    await forEachSeries(Object.entries(this.events), async ([stub, dest]) => {
      if (await this.pathExists(Helper.eventsPath(dest))) {
        if (!await this.confirm(`The event [${dest}] exists already. Replace it?`)) {
          return
        }
      }

      await this.copy(
        Path.resolve(this.stubsDir, 'events', stub),
        Helper.eventsPath(dest)
      )

      this.completed('created', `events/${dest}`)
    })
  }
}

module.exports = MakeAuth
