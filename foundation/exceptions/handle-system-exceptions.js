'use strict'

const Youch = require('youch')
const forTerminal = require('youch-terminal')

class UnhandledSystemErrorsHandler {
  on () {
    return ['unhandledRejection', 'uncaughtException']
  }

  async handle (error) {
    const output = await new Youch(error).toJSON()
    console.log(forTerminal(output))
    process.exit(1)
  }

  listenForSystemErrors () {
    this.on().forEach(error => {
      process.on(error, async error => this.handle(error))
    })
  }
}

module.exports = UnhandledSystemErrorsHandler
