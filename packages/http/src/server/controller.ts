'use strict'

import { Application } from '@supercharge/contracts'

export class Controller {
  /**
   * The application instance.
   */
  protected readonly app: Application

  /**
   * Create a new controller instance.
   *
   * @param app
   */
  constructor (app: Application) {
    this.app = app
  }
}
