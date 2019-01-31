'use strict'

const Listr = require('listr')
const Execa = require('execa')
const BaseCommand = require('./../base')
const Fs = require('./../../../filesystem')
const Helper = require('./../../../helper')

/**
 * This command does the required steps
 * to set up a new Boost application.
 */
class Setup extends BaseCommand {
  /**
   * Convenience command to quickly set up
   * a Boost application.
   */
  static get signature () {
    return `
    setup
    { -n, --name=@value: Your application name }
    { -f, --force: Force a fresh application setup }
    `
  }

  /**
   * Returns the command description.
   */
  static get description () {
    return 'Automated setup for your new Boost application'
  }

  /**
   * Handle the application setup and execute
   * a sequential list of setup tasks.
   *
   * @param {Object} _
   * @param {Object} arguments
   */
  async handle (_, { force: forceSetup, name: appName }) {
    const tasks = new Listr([
      {
        title: 'Prepare .env file',
        task: async () => this.createEnvFileFromExample(forceSetup)
      },
      {
        title: 'Generate application key',
        task: async () => this.generateAppKey(appName)
      },
      {
        title: 'Set application name',
        enabled: () => !!appName,
        task: async () => this.setAppName(appName)
      }
    ])

    await this.run(async () => {
      await this.ensureNotInstalled(forceSetup)
      await tasks.run()
      this.finalNote(appName)
    })
  }

  /**
   * Copy the `.env.example` file over to `.env`.
   *
   * @returns {Promise}
   */
  async createEnvFileFromExample () {
    const source = await this.getEnvPath('.env.example')
    const destination = await this.getEnvPath()

    return Fs.copy(source, destination)
  }

  /**
   * Generate an application key.
   */
  async generateAppKey () {
    await Execa('node', ['craft', 'key:generate', '--force'], { cwd: Helper.appRoot() })
  }

  /**
   * Set the application name.
   *
   * @param {String} name
   */
  async setAppName (name) {
    await Execa('node', ['craft', 'app:name', name], { cwd: Helper.appRoot() })
  }

  /**
   * Print out a final setup note with
   * instructions on how to start
   * the Boost web server.
   *
   * @param {String} appName
   */
  finalNote (appName) {
    appName = appName || 'Boost'

    const lines = [
      '',
      '    Your project is ready for take off',
      `    Launch the server with:`,
      '',
      `    ${this.chalk.dim('$')} ${this.chalk.cyan(`cd ${appName}`)}`,
      `    ${this.chalk.dim('$')} ${this.chalk.cyan('node server')}`,
      ''
    ]

    lines.forEach(line => console.log(line))
  }
}

module.exports = Setup
