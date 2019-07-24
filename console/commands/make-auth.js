'use strict'

const Path = require('path')
const Helper = require('../../helper')
const BaseCommand = require('./base-command')
const Collect = require('@supercharge/collections')

class MakeAuth extends BaseCommand {
  constructor () {
    super()

    this.stubsDir = Path.resolve(__dirname, '..', 'stubs', 'make', 'auth')

    this.views = [
      'home.hbs',
      'auth/login.hbs',
      'auth/signup.hbs',
      'auth/forgot-password.hbs',
      'auth/forgot-password-email-sent.hbs',
      'auth/reset-password.hbs',
      'auth/reset-password-success.hbs'
    ]

    this.routes = [
      'home.js',
      'auth/login.js',
      'auth/signup.js',
      'auth/logout.js',
      'auth/forgot-password.js',
      'auth/reset-password.js'
    ]

    this.strategies = ['strategies/session.js']

    this.models = ['user.js']

    this.events = ['auth/user-registered.js']
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
    await this.copyModels()
    await this.copyRoutes()
    await this.copyStrategies()
    await this.copyEvents()
  }

  async copyViews () {
    await Collect(this.views).forEachSeries(async view => {
      if (await this.pathExists(Helper.viewsPath(view))) {
        if (!await this.confirm(`The view [${view}] exists already. Replace it?`)) {
          return
        }
      }

      await this.copy(
        Path.resolve(this.stubsDir, 'views', view),
        Helper.viewsPath(view)
      )

      this.completed('created', `views/${view}`)
    })

    console.log()
  }

  async useAppLayoutInWelcomeRoute () {
    const welcomeRoute = Helper.routesPath('welcome.js')
    const content = await this.getFileContent(welcomeRoute)

    if (content) {
      await this.writeFile(
        welcomeRoute,
        content.replace(
          `h.view('welcome', null, { layout: 'clean' })`,
          `h.view('welcome')`
        )
      )
    }
  }

  async copyModels () {
    await Collect(this.models).forEachSeries(async (model) => {
      if (await this.pathExists(Helper.modelsPath(model))) {
        if (!await this.confirm(`The model [${model}] exists already. Replace it?`)) {
          return
        }
      }

      await this.copy(
        Path.resolve(this.stubsDir, 'models', model),
        Helper.modelsPath(model)
      )

      this.completed('created', `models/${model}`)
    })

    console.log()
  }

  async copyRoutes () {
    await Collect(this.routes).forEachSeries(async (route) => {
      if (await this.pathExists(Helper.routesPath(route))) {
        if (!await this.confirm(`The route [${route}] exists already. Replace it?`)) {
          return
        }
      }

      await this.copy(
        Path.resolve(this.stubsDir, 'routes', route),
        Helper.routesPath(route)
      )

      this.completed('created', `routes/${route}`)
    })

    console.log()
  }

  async copyStrategies () {
    await Collect(this.strategies).forEachSeries(async (strategy) => {
      if (await this.pathExists(Helper.strategiesPath(strategy))) {
        if (!await this.confirm(`The authentication strategy [${strategy}] exists already. Replace it?`)) {
          return
        }
      }

      await this.copy(
        Path.resolve(this.stubsDir, strategy),
        Helper.strategiesPath(strategy)
      )

      this.completed('created', `auth/${strategy}`)
    })
  }

  async copyEvents () {
    await Collect(this.events).forEachSeries(async (event) => {
      if (await this.pathExists(Helper.eventsPath(event))) {
        if (!await this.confirm(`The event [${event}] exists already. Replace it?`)) {
          return
        }
      }

      await this.copy(
        Path.resolve(this.stubsDir, 'events', event),
        Helper.eventsPath(event)
      )

      this.completed('created', `events/${event}`)
    })
  }
}

module.exports = MakeAuth
