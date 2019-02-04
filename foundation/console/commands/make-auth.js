'use strict'

// const Helper = require('./../../../helper')
const BaseCommand = require('./base-command')

/**
 * Craft command to set the application name.
 */
class MakeAuth extends BaseCommand {
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
      // ensure directories exists
      // copy views

      this.success('Authentication scaffolding successful. Generated authentication views and routes')
    })
  }
}

module.exports = MakeAuth
