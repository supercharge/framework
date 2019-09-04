'use strict'

const Youch = require('youch')
const Listener = require('../listener')
const toTerminal = require('youch-terminal')

class UnhandledSystemErrorsHandler extends Listener {
  /**
   * Listen for the `unhandledRejection` and
   * `uncaughtException` system exceptions.
   *
   * @returns {Array}
   */
  on () {
    return ['unhandledRejection', 'uncaughtException']
  }

  /**
   * Ensure the `system` event listener type to listen
   * for the related events on the Node.js `process`
   * and not on the event dispatcher instance.
   *
   * @returns {String}
   */
  type () {
    return 'system'
  }

  /**
   * Pretty print developer errors to the terminal.
   *
   * @param {Error} error
   */
  async handle (error) {
    const output = await new Youch(error).toJSON()
    console.log(toTerminal(output))
    process.exit(1)
  }
}

module.exports = UnhandledSystemErrorsHandler
