'use strict'

import ms from 'ms'
import { tap } from '@supercharge/goodies'
import { CookieOptions, ResponseCookieBuilder as ResponseCookieBuilderContract } from '@supercharge/contracts'

type Units =
  | 'Years'
  | 'Year'
  | 'Y'
  | 'Weeks'
  | 'Week'
  | 'W'
  | 'Days'
  | 'Day'
  | 'D'
  | 'Hours'
  | 'Hour'
  | 'H'
  | 'Minutes'
  | 'Minute'
  | 'Min'
  | 'M'
  | 'Seconds'
  | 'Second'
  | 'Sec'
  | 's'
  | 'Milliseconds'
  | 'Millisecond'
  | 'Ms'

type UnitAnyCase = Lowercase<Units> | Units

export type StringTime =
    | `${number}`
    | `${number}${UnitAnyCase}`
    | `${number} ${UnitAnyCase}`

export class ResponseCookieBuilder implements ResponseCookieBuilderContract {
  /**
   * Stores the cookies options used to set a cookie value on the response.
   */
  private readonly responseCookieOptions: CookieOptions

  /**
   * Create a new instance.
   */
  constructor (options: CookieOptions) {
    this.responseCookieOptions = options
  }

  /**
   * Creates a cookie that expires in `time` milliseconds from now.
   */
  expiresIn (time: StringTime | number): this {
    if (typeof time === 'string') {
      this.responseCookieOptions.maxAge = ms(time)
    } else if (typeof time === 'number') {
      this.responseCookieOptions.maxAge = time
    } else {
      throw new Error(`Strings and numbers are supported arguments in method "expiresIn".Received ${typeof time}`)
    }

    return this
  }

  /**
   * Creates a cookie that expires at the given `date` time in the future.
   */
  expiresAt (date: Date): this {
    if (!(date instanceof Date)) {
      throw new Error('Argument in method "expiresAt" must be an instance of date.')
    }

    return tap(this, () => {
      this.responseCookieOptions.expires = date
    })
  }

  /**
   * The URL path on the server on which the cookie will be available.
   */
  path (path: string): this {
    return tap(this, () => {
      this.responseCookieOptions.path = path
    })
  }

  /**
   * The domain that the cookie will be available to.
   */
  domain (domain: string): this {
    return tap(this, () => {
      this.responseCookieOptions.domain = domain
    })
  }

  /**
   * Mark the cookie to be only available on HTTPS connections.
   */
  secure (): this {
    return tap(this, () => {
      this.responseCookieOptions.secure = true
    })
  }

  /**
   * Mark the cookie to be available on HTTP and HTTPS connections.
   */
  unsecured (): this {
    return tap(this, () => {
      this.responseCookieOptions.secure = false
    })
  }

  /**
   * Mark the cookie to be only accessible through the HTTP protocol
   * and not available to client-side JavaScript.
    */
  httpOnly (httpOnly?: boolean): this {
    return tap(this, () => {
      this.responseCookieOptions.httpOnly = httpOnly ?? true
    })
  }

  /**
   * Determine how the cookie behaves on cross-site requests.
   */
  sameSite (attribute: 'strict' | 'lax' | 'none' | boolean): this {
    return tap(this, () => {
      this.responseCookieOptions.sameSite = attribute
    })
  }

  /**
   * The cookie will be signed using the app key.
   */
  signed (): this {
    return tap(this, () => {
      this.responseCookieOptions.signed = true
    })
  }

  /**
   * The cookie will be sent in plain text.
   */
  unsigned (): this {
    return tap(this, () => {
      this.responseCookieOptions.signed = false
    })
  }

  /**
   * Mark this cookie to overwrite or not overwrite any previously set cookie with the same name.
   */
  overwrite (overwrite?: boolean): this {
    return tap(this, () => {
      this.responseCookieOptions.overwrite = overwrite ?? false
    })
  }
}
