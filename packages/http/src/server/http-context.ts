
import { RouterContext } from '@koa/router'
import { InteractsWithState } from './interacts-with-state.js'
import { Application, HttpContext as HttpContextContract, HttpRequest, HttpResponse, HttpResponseCtor, HttpRequestCtor, HttpConfig, type Encrypter } from '@supercharge/contracts'

export class HttpContext extends InteractsWithState implements HttpContextContract {
  /**
   * Stores the application instance.
   */
  private readonly app: Application

  /**
   * Stores the encrypter instance.
   */
  private readonly encryption: Encrypter

  /**
   * Stores the cookie config object.
   */
  private readonly cookieConfig: HttpConfig['cookie']

  /**
   * Create a new HTTP context instance.
   */
  constructor (ctx: RouterContext, app: Application, cookieConfig: HttpConfig['cookie'], encryption: Encrypter) {
    super(ctx)

    this.app = app
    this.encryption = encryption
    this.cookieConfig = cookieConfig
  }

  /**
   * Returns a wrapped HTTP context for the raw Koa HTTP `ctx`.
   */
  static wrap (ctx: RouterContext, app: Application, cookieConfig: HttpConfig['cookie'], encryption: Encrypter): HttpContext {
    return new this(ctx, app, cookieConfig, encryption)
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

    return new Request(this, this.cookieConfig, this.encryption)
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

    return new Response(this, this.cookieConfig, this.encryption)
  }
}
