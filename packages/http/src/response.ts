'use strict'

import { Context } from 'koa'
import { tap } from '@supercharge/goodies'
import { HttpResponse } from '@supercharge/contracts'

export class Response implements HttpResponse {
  /**
   * Stores the route context object from Koa.
   */
  private readonly ctx: Context

  /**
   * Create a new response instance.
   *
   * @param ctx
   */
  constructor (ctx: Context) {
    this.ctx = ctx
  }

  /**
   * Set the response payload.
   */
  payload (payload: any): this {
    return tap(this, () => {
      this.ctx.response.body = payload
    })
  }

  /**
   * Set a response header.
   */
  header (key: string, value: string): this {
    return tap(this, () => {
      this.ctx.response.set(key, value)
    })
  }

  /**
   * Set a response status.
   */
  status (status: number): this {
    return tap(this, () => {
      this.ctx.response.status = status
    })
  }
}
