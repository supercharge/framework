
import { RouterContext } from '@koa/router'
import { InteractsWithState } from './interacts-with-state.js'
import { Application, HttpContext as HttpContextContract, HttpRequest, HttpResponse, HttpResponseCtor, HttpRequestCtor, HttpConfig } from '@supercharge/contracts'

export class HttpContext extends InteractsWithState implements HttpContextContract {
  /**
   * The application instance.
   */
  private readonly app: Application

  /**
   * The cookie config object.
   */
  private readonly cookieConfig: HttpConfig['cookie']

  /**
   * Create a new HTTP context instance.
   */
  constructor (ctx: RouterContext, app: Application, cookieConfig: HttpConfig['cookie']) {
    super(ctx)

    this.app = app
    this.cookieConfig = cookieConfig
  }

  /**
   * Returns a wrapped HTTP context for the raw Koa HTTP `ctx`.
   */
  static wrap (ctx: RouterContext, app: Application, cookieConfig: HttpConfig['cookie']): HttpContext {
    return new this(ctx, app, cookieConfig)
  }

  /**
   * Returns the raw Koa HTTP context instance.
   */
  get raw (): RouterContext {
    return this.koaCtx
  }

  /**
   * Returns the HTTP request instance.
   */
  get request (): HttpRequest {
    /**
     * We’re retrieving the Request constructor from the container because
     * the request is macroable. That means, packages may decorate the
     * request with custom methods. And we want to allow that easily.
     */
    const Request = this.app.make<HttpRequestCtor>('request')

    return new Request(this, this.cookieConfig)
  }

  /**
   * Returns the HTTP response instance.
   */
  get response (): HttpResponse {
    /**
     * We’re retrieving the Response constructor from the container because
     * the response is macroable. That means, packages may decorate the
     * response with custom methods. And we want to allow that easily.
     */
    const Response = this.app.make<HttpResponseCtor>('response')

    return new Response(this, this.cookieConfig)
  }
}
