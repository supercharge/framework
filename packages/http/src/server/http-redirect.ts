
import { Context } from 'koa'
import { tap } from '@supercharge/goodies'
import { HttpRedirect as HttpRedirectContract } from '@supercharge/contracts'

export class HttpRedirect implements HttpRedirectContract {
  /**
   * The route context object from Koa.
   */
  private readonly ctx: Context

  /**
   * Create a new instance.
   */
  constructor (ctx: Context) {
    this.ctx = ctx
  }

  /**
   * Redirect the request back to the previous path.
   */
  back (options?: { fallback: string }): this {
    const fallback = options ? options.fallback : ''

    this.ctx.response.redirect('back', fallback)

    return this
  }

  /**
   * Redirect the request to the given URL `path`.
   */
  to (path: string): this {
    return tap(this, () => {
      this.ctx.response.redirect(path)
    })
  }

  /**
   * Redirects the request with HTTP status 307. This keeps the request payload
   * which is useful for POST/PUT requests containing content.
   *
   * More details: Details: https://developer.mozilla.org/de/docs/Web/HTTP/Status
   */
  withPayload (): this {
    return tap(this, () => {
      this.ctx.response.status = 307
    })
  }

  /**
   * Marks this redirect as permanent with HTTP status 301.
   */
  permanent (): this {
    return tap(this, () => {
      this.ctx.response.status = 301
    })
  }
}
