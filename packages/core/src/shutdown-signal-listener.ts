'use strict'

import Set from '@supercharge/set'
import { Application } from '@supercharge/contracts'

export type OnShutdownCallback = () => Promise<void> | void

export class ShutdownSignalListener {
  /**
   * Stores the application instance.
   */
  protected readonly app: Application

  /**
   * Stores the shutdown signals to listen on.
   */
  protected shutdownSignals: string[]

  /**
   * Stores the shutdown callback.
   */
  protected onShutdownCallback: OnShutdownCallback

  /**
   * Invoke callback and exit process
   */
  protected kill = async function (this: ShutdownSignalListener) {
    try {
      await Promise.race([
        this.onShutdownCallback(),
        new Promise((resolve) => {
          setTimeout(resolve, 3000)
        }),
      ])

      process.exit(0)
    } catch (error) {
      process.exit(1)
    }
  }.bind(this)

  /**
   * Create a new instance.
   */
  constructor (app: Application) {
    this.app = app
    this.onShutdownCallback = () => {}
    this.shutdownSignals = ['SIGINT', 'SIGTERM']
  }

  /**
   * Assign the given shutdown `callback` that runs when receiving a shutdown signal.
   */
  onShutdown (callback: OnShutdownCallback): this {
    this.onShutdownCallback = callback

    return this
  }

  /**
   * Close on SIGINT AND SIGTERM SIGNALS
   */
  listen (...signals: string[] | string[][]): void {
    this.runShutdownCallbackOn(...signals)

    /**
     * Log the uncaught exception error.
     */
    process.on('uncaughtExceptionMonitor', (error) => {
      this.app.logger().alert(error.message, { error })
    })
  }

  /**
   * Register the shutdown handler to run for the given `signals`.
   */
  private runShutdownCallbackOn (...signals: string[] | string[][]): void {
    this.shutdownSignals = Set.from(...signals).concat(this.shutdownSignals).toArray()

    this.shutdownSignals.forEach(signal => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      process.on(signal, this.kill)
    })
  }

  /**
   * Remove the event listeners for shutdown signals and
   * reset the shutdown callback to a no-op function.
   */
  cleanup (): this {
    this.shutdownSignals.forEach(signal => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      process.removeListener(signal, this.kill)
    })

    this.onShutdownCallback = () => {}

    return this
  }
}
