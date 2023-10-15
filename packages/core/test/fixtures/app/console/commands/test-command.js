
const { Command } = require('@supercharge/console')

module.exports = class TestCommand extends Command {
  configure () {
    this.name('test:command')
  }

  run () {
    console.log('running test:command')
  }
}
