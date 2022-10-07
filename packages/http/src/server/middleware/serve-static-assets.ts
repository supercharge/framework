'use strict'

import serveStaticFilesFrom from 'koa-static'
import { HttpContext, Middleware, NextHandler, StaticAssetsConfig } from '@supercharge/contracts'

export class ServeStaticAssetsMiddleware implements Middleware {
  /**
   * Stores the path to the "public" directory.
   */
  protected readonly publicPath: string

  /**
   * The asset handler serving static files for an incoming request.
   */
  private readonly handleAssets: any

  /**
   * Create a new middleware instance.
   *
   * @param {Application} config
   */
  constructor (config: StaticAssetsConfig, publicPath: string) {
    this.publicPath = publicPath

    this.handleAssets = serveStaticFilesFrom(
      this.assetsLocation(), config
    )
  }

  /**
   * Returns the path to the asset files.
   *
   * @returns {Array}
   */
  assetsLocation (): string {
    return this.publicPath
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
