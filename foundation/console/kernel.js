'use strict'

const Path = require('path')
const Ace = require('@adonisjs/ace')
const ReadRecursive = require('recursive-readdir')

class ConsoleKernel {
  async bootstrap () {
    const files = await this.loadBaseCommands()

    files.forEach(commandFile => {
      Ace.addCommand(require(commandFile))
    })

    Ace.wireUpWithCommander()
    Ace.invoke()
  }

  async loadBaseCommands () {
    return ReadRecursive(
      Path.resolve(__dirname, 'commands'),
      ['base-command.js']
    )
  }
}

module.exports = ConsoleKernel
