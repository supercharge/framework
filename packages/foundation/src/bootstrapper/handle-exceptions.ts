'use strict'

// @ts-ignore
import Youch from 'youch'
// @ts-ignore
import toTerminal from 'youch-terminal'
import { tap } from '@supercharge/goodies'
import { Bootstrapper } from '@supercharge/contracts'

export class HandleExceptions implements Bootstrapper {
  /**
   * Bootstrap the application. This will listen for exceptions
   * crashing your Node.js process. The listeners will print
   * a message to the terminal before exiting the process.
   */
  async bootstrap () {
    process
      .on('uncaughtException', (error: Error) => this.handle(error))
      .on('unhandledRejection', (error: Error) => this.handle(error))
  }

  /**
   * Pretty-print the given `error` to the terminal.
   *
   * @param {Error} error
   */
  handle (error?: Error): any {
    return tap(new Youch(error).toJSON(), output => {
      console.log(toTerminal(output))
      process.exit(1)
    })
  }
}
