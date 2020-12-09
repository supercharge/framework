'use strict'

import { Application } from '../foundation'

export interface HttpKernel {
  /**
   * Returns the app instance.
   */
  app(): Application

  /**
   * Bootstrap the HTTP server to handle requests.
   */
  bootstrap(): Promise<void>

  /**
   * Start an HTTP Server instance handling incoming requests.
   */
  startServer(): Promise<void>
}
