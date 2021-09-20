'use strict'

import * as Cookies from 'cookies'
import { tap } from '@supercharge/goodies'
import { ResponseCookieBuilder as ResponseCookieBuilderContract } from '@supercharge/contracts'

export class ResponseCookieBuilder implements ResponseCookieBuilderContract {
  /**
   * Stores the cookies options used to set a cookie value on the response.
   */
  private readonly setCookieOptions: Cookies.SetOption

  /**
   * Create a new instance.
   */
  constructor (options: Cookies.SetOption) {
    this.setCookieOptions = options
  }

  /**
   * Set the max age.
   *
   * @param {Number} maxAge
   *
   * @returns {this}
   */
  maxAge (maxAge: number): this {
    return tap(this, () => {
      this.setCookieOptions.maxAge = maxAge
    })
  }
}
