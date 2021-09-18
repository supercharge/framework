'use strict'

import * as Cookies from 'cookies'
import { tap } from '@supercharge/goodies'
import { RequestCookieBuilder as RequestCookieContract } from '@supercharge/contracts'

export class RequestCookieBuilder implements RequestCookieContract {
  /**
   * Stores the options used when retrieving a cookie value from the request.
   */
  private readonly getCookieOptions: Cookies.GetOption

  /**
   * Create a new instance.
   */
  constructor (options: Cookies.GetOption) {
    this.getCookieOptions = options
  }

  /**
   * Retrieve the unsigned cookie value.
   *
   * @returns {this}
   */
  unsigned (): this {
    return tap(this, () => {
      this.getCookieOptions.signed = false
    })
  }
}
