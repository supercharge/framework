
import Os from 'node:os'
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
  protected shutdownSignals: NodeJS.Signals[]

  /**
   * Stores the shutdown callback.
   */
  protected onShutdownCallbacks: OnShutdownCallback[]

  /**
   * Invoke callback and exit process
   */
  protected kill = async function (this: ShutdownSignalListener, signal: NodeJS.Signals) {
    try {
      await Promise.race([
        ...this.onShutdownCallbacks,
        new Promise((resolve) => {
          setTimeout(resolve, 3000)
        }),
      ])

      process.exit(Os.constants.signals[signal])
    } catch (error) {
      process.exit(1)
    }
  }.bind(this)

  /**
   * Create a new instance.
   */
  constructor (app: Application) {
    this.app = app
    this.onShutdownCallbacks = []
    this.shutdownSignals = ['SIGINT', 'SIGTERM']
  }

  /**
   * Assign the given shutdown `callback` that runs when receiving a shutdown signal.
   */
  onShutdown (callback: OnShutdownCallback): this {
    if (typeof callback !== 'function') {
      throw new TypeError(`Invalid argument: you must provide a callback function to "onShutdown", received "${typeof callback}"`)
    }

    this.onShutdownCallbacks.push(callback)

    return this
  }

  /**
   * Close on SIGINT AND SIGTERM SIGNALS
   */
  listen (...signals: NodeJS.Signals[] | NodeJS.Signals[][]): void {
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
  private runShutdownCallbackOn (...signals: NodeJS.Signals[] | NodeJS.Signals[][]): void {
    this.shutdownSignals = Set
      .from<NodeJS.Signals>(...signals)
      .concat(this.shutdownSignals)
      .toArray()

    this.shutdownSignals.forEach(signal => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      process.once(signal, this.kill)
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

    this.onShutdownCallbacks = []

    return this
  }
}
