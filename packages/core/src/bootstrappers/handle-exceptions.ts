
import Youch from 'youch'
// @ts-expect-error
import toTerminal from 'youch-terminal'
import { tap } from '@supercharge/goodies'
import { Bootstrapper } from '@supercharge/contracts'

export class HandleExceptions implements Bootstrapper {
  /**
   * Bootstrap the application. This will listen for exceptions
   * crashing your Node.js process. The listeners will print
   * a message to the terminal before exiting the process.
   */
  async bootstrap (): Promise<void> {
    process
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      .on('uncaughtException', async (error: Error) => {
        await this.handle(error)
      })
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      .on('unhandledRejection', async (error: Error) => {
        await this.handle(error)
      })
  }

  /**
   * Pretty-print the given `error` to the terminal.
   *
   * @param {Error} error
   */
  async handle (error: Error): Promise<void> {
    await tap(new Youch(error, {}).toJSON(), output => {
      console.log(toTerminal(output))
      process.exit(1)
    })
  }
}
