'use strict'

import { Context } from 'koa'
import Str from '@supercharge/strings'
import { HeaderBag } from './header-bag'
import { RouterContext } from 'koa__router'
import { ParameterBag } from './parameter-bag'
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
  query (): ParameterBag {
    return new ParameterBag(this.ctx.query)
  }

  /**
   * Returns the request’s path parameters.
   */
  params (): ParameterBag {
    return new ParameterBag(this.ctx.params)
  }

  /**
   * Returns the path parameter for the given `name`. Returns the
   * `defaultValue` if a parameter for the name doesn’t exist.
   */
  param<T = any> (name: string, defaultValue?: T): T {
    return this.params().get(name, defaultValue)
  }

  /**
   * Returns the request payload.
   */
  payload (): any {
    return this.ctx.request.body
  }

  /**
   * Returns the merged request payload with query parameters. The query
   * parameters take preceedence over the request payload in case
   * attributes with the same name are defined in both places.
   */
  all (): Record<string, any> {
    return {
      ...this.payload(),
      ...this.query().all()
    }
  }

  /**
   * Returns an input item for the given `name` from the request payload or query parameters.
   * Returns the `defaultValue` if a parameter for the name doesn’t exist.
   */
  input<T = any> (name: string, defaultValue?: T): T {
    return this.all()[name] ?? defaultValue
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
