
import { tap } from '@supercharge/goodies'
import { CookieConfig, RequestCookieBuilder as RequestCookieContract } from '@supercharge/contracts'

export class RequestCookieBuilder implements RequestCookieContract {
  /**
   * Stores the options used when retrieving a cookie value from the request.
   */
  private readonly cookieConfig: CookieConfig

  /**
   * Create a new instance.
   */
  constructor (options: CookieConfig) {
    this.cookieConfig = options
  }

  /**
   * Retrieve the unsigned cookie value.
   */
  unsigned (): this {
    return tap(this, () => {
      this.cookieConfig.signed = false
    })
  }
}
