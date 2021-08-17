'use strict'

import { Context } from 'koa'
import Str from '@supercharge/strings'
import { HeaderBag } from './header-bag'
import { RouterContext } from 'koa__router'
import { HttpRequest, InteractsWithContentTypes } from '@supercharge/contracts'

export class Request implements HttpRequest, InteractsWithContentTypes {
  /**
   * The route context object from Koa.
   */
  protected readonly ctx: Context | Context & RouterContext

  /**
   * Create a new response instance.
   *
   * @param ctx
   * @param cookieOptions
   */
  constructor (ctx: Context | Context & RouterContext) {
    this.ctx = ctx
  }

  /**
   * Returns the request method.
   */
  method (): string {
    return this.ctx.request.method
  }

  /**
   * Returns the request’s URL path.
   */
  path (): string {
    return this.ctx.request.path
  }

  /**
   * Returns the request’s query parameters.
   */
  get query (): Record<string, any> {
    return this.ctx.query
  }

  /**
   * Returns the request’s path parameters.
   */
  get params (): Record<string, any> {
    return this.ctx.params
  }

  /**
   * Returns the request payload.
   */
  get payload (): any {
    return this.ctx.request.body
  }

  /**
   * Returns the request headers.
   */
  headers (): HeaderBag {
    return new HeaderBag(this.ctx.headers)
  }

  /**
   * Returns the request header identified by the given `key`. The default
   * value will be returned if no header is present for the given key.
   *
   * @param {String} key
   * @param {String|String[]} defaultValue
   *
   * @returns {String}
   */
  header (key: string, defaultValue?: string | string[]): string | string[] | undefined {
    return this.headers().get(key, defaultValue)
  }

  /**
   * Determine whether the request contains a header with the given `key`.
   *
   * @returns {Boolean}
   */
  hasHeader (key: string): boolean {
    return this.headers().has(key)
  }

  /**
   * Determine whether the request is sending JSON payload.
   *
   * @returns {Boolean}
   */
  isJson (): boolean {
    return Str(
      this.header('content-type')
    ).contains('/json', '+json')
  }

  /**
   * Determine whether the request is asking for a JSON response.
   *
   * @returns {Boolean}
   */
  wantsJson (): boolean {
    return Str(
      this.header('accept')
    ).contains('/json', '+json')
  }

  /**
   * Determine whether the request is asking for an HTML response.
   *
   * @returns {Boolean}
   */
  wantsHtml (): boolean {
    return Str(
      this.header('accept')
    ).contains('text/html')
  }
}
