
import { tap } from '@supercharge/goodies'
import { CookieOptions, RequestCookieBuilder as RequestCookieContract } from '@supercharge/contracts'

export class RequestCookieBuilder implements RequestCookieContract {
  /**
   * Stores the options used when retrieving a cookie value from the request.
   */
  private readonly cookieOptions: CookieOptions

  /**
   * Create a new instance.
   */
  constructor (options: CookieOptions) {
    this.cookieOptions = options
  }

  /**
   * Retrieve the unsigned cookie value.
   *
   * @returns {this}
   */
  unsigned (): this {
    return tap(this, () => {
      this.cookieOptions.signed = false
    })
  }
}
