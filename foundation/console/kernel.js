'use strict'

const Path = require('path')
const Ace = require('@adonisjs/ace')
const ReadRecursive = require('recursive-readdir')
const MakeAuthCommand = require('../../auth/console/make-auth')

class ConsoleKernel {
  async bootstrap () {
    const files = await this.loadBaseCommands()

    files.forEach(commandFile => {
      Ace.addCommand(require(commandFile))
    })

    Ace.addCommand(MakeAuthCommand)

    Ace.wireUpWithCommander()
    Ace.invoke()
  }

  async loadBaseCommands () {
    return ReadRecursive(
      Path.resolve(__dirname, 'commands'),
      ['base-command.js'] // list of ignored files
    )
  }
}

module.exports = ConsoleKernel
