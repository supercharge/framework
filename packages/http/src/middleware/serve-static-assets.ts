
import { Middleware } from './base.js'
import serveStaticFilesFrom from 'koa-static'
import { Application, HttpContext, NextHandler, StaticAssetsConfig } from '@supercharge/contracts'

export class ServeStaticAssetsMiddleware extends Middleware {
  /**
   * The asset handler serving static files for an incoming request.
   */
  private readonly handleAssets: any

  /**
   * Create a new middleware instance.
   *
   * @param {Application} app
   */
  constructor (app: Application) {
    super(app)

    this.handleAssets = serveStaticFilesFrom(
      this.assetsLocation(), this.config()
    )
  }

  /**
   * Returns the path to the asset files.
   *
   * @returns {Array}
   */
  assetsLocation (): string {
    return this.app.publicPath()
  }

  /**
   * Returns the options determining how to serve assets.
   *
   * @returns {StaticAssetsConfig}
   */
  config (): StaticAssetsConfig {
    return this.app.config().get<StaticAssetsConfig>('static')
  }

  /**
   * Handle the incoming request.
   *
   * @param ctx HttpContext
   * @param next NextHandler
   */
  async handle (ctx: HttpContext, next: NextHandler): Promise<void> {
    return await this.handleAssets(ctx.raw, next)
  }
}
