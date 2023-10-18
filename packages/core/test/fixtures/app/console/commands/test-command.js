
import { Command } from '@supercharge/console'

export default class TestCommand extends Command {
  configure () {
    this.name('test:command')
  }

  run () {
    console.log('running test:command')
  }
}
