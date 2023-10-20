
import { Application, Logger } from '@supercharge/contracts'

export class Controller {
  /**
   * The application instance.
   */
  protected readonly app: Application

  /**
   * Create a new controller instance.
   */
  constructor (app: Application) {
    this.app = app
  }

  /**
   * Returns the application logger instance.
   */
  protected logger (): Logger {
    return this.app.make<Logger>('logger')
  }
}
