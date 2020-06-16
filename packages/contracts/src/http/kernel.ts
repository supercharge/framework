'use strict'

export interface HttpKernel {
  /**
   * Start an HTTP Server instance handling incoming requests.
   *
   * @returns {Promise}
   */
  startServer(): Promise<void>
}
