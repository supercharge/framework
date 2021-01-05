'use strict'

import serveStaticFilesFrom from 'koa-static'
import { Application, HttpContext, Middleware, NextHandler, StaticAssetsOptions } from '@supercharge/contracts'

export class ServeStaticAssets implements Middleware {
  /**
   * The application instance.
   */
  protected readonly app: Application

  /**
   * The application instance.
   */
  private readonly handleAssets: any

  /**
   * Create a new middleware instance.
   *
   * @param {Application} app
   */
  constructor (app: Application) {
    this.app = app
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
   * @returns {StaticAssetsOptions}
   */
  config (): StaticAssetsOptions {
    return this.app.config().get('static')
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
