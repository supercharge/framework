'use strict'

export interface Middleware {
  /**
   * Handle the given request.
   */
  handle(request: any): any | Promise<any>
}
