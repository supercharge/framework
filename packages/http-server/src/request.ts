'use strict'

import { Context } from 'koa'
import { RouterContext } from 'koa__router'
import { HttpRequest } from '@supercharge/contracts'

export class Request implements HttpRequest {
  /**
   * Stores the route context object from Koa.
   */
  private readonly ctx: Context & RouterContext

  /**
   * Create a new request instance.
   *
   * @param ctx
   */
  constructor (ctx: Context & RouterContext) {
    this.ctx = ctx
  }

  /**
   * Returns the query parameter object.
   */
  query (): { [key: string]: unknown } {
    return this.ctx.query
  }

  /**
   * Returns the path parameter object.
   */
  params (): { [key: string]: unknown } {
    return this.ctx.params
  }

  /**
   * Returns the request payload.
   */
  payload (): any {
    return { still: 'in progress' }
  }

  /**
   * Returns the request headers.
   */
  headers (): { [key: string]: unknown } {
    return this.ctx.headers
  }
}
