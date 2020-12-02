'use strict'

import { HttpRequest } from './request'
import { HttpResponse } from './response'

export interface HttpContext {
  /**
   * Returns the request instance..
   */
  request: HttpRequest

  /**
   * Returns the response instance.
   */
  response: HttpResponse
}
