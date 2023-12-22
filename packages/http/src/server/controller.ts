
import { Application, HttpContext, Logger } from '@supercharge/contracts'

export abstract class Controller {
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

  /**
   * Handle the incoming HTTP request.
   */
  abstract handle (ctx: HttpContext): Promise<any> | any
}
