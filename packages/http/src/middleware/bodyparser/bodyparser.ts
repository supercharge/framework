'use strict'

// import Formidable from 'formidable'
import JSON from '@supercharge/json'
import { URLSearchParams } from 'url'
import { HttpError } from '@supercharge/http-errors'
import { BodyparserOptions } from './bodyparser-options'
import { Application, HttpContext, HttpRequest, Middleware, NextHandler } from '@supercharge/contracts'

export class Bodyparser implements Middleware {
  /**
   * The application instance.
   */
  protected readonly app: Application

  /**
   * Create a new middleware instance.
   *
   * @param {Application} app
   */
  constructor (app: Application) {
    this.app = app
  }

  /**
   * Returns the options determining how to serve assets.
   *
   * @returns {CorsOptions}
   */
  options (): BodyparserOptions {
    return new BodyparserOptions(
      this.app.config().get('bodyparser')
    )
  }

  /**
   * Handle the incoming request.
   *
   * @param ctx HttpContext
   * @param next NextHandler
   */
  async handle ({ request }: HttpContext, next: NextHandler): Promise<void> {
    if (this.shouldParsePayload(request)) {
      request.setPayload(await this.parse(request))
    }

    await next()
  }

  /**
   * Determine whether to parse incoming request body.
   *
   * @param {HttpRequest} request
   *
   * @returns {Boolean}
   */
  shouldParsePayload (request: HttpRequest): boolean {
    return this.hasConfiguredMethod(request) && request.hasPayload()
  }

  /**
   * Determine whether to parse incoming request body.
   *
   * @param {HttpRequest} request
   *
   * @returns {Boolean}
   */
  hasConfiguredMethod (request: HttpRequest): boolean {
    return this.options().methods().map(method => {
      return method.toUpperCase()
    }).includes(
      request.method().toUpperCase()
    )
  }

  /**
   * Parse incoming request body and return the result.
   *
   * @param {HttpRequest} request
   *
   * @returns {Boolean}
   */
  async parse (request: HttpRequest): Promise<any> {
    if (this.isJson(request)) {
      return await this.parseJson(request)
    }

    if (this.isText(request)) {
      return await this.parseText(request)
    }

    if (this.isFormUrlEncoded(request)) {
      return await this.parseFormUrlEncoded(request)
    }

    if (this.isMultipart(request)) {
      return await this.parseMultipart(request)
    }

    throw HttpError.unsupportedMediaType(`Unsupported Content-Type. Received "${request.contentType() ?? ''}"`)
  }

  /**
   * Determine whether the given `request` contains a JSON body.
   *
   * @param {HttpRequest} request
   *
   * @returns {Boolean}
   */
  protected isJson (request: HttpRequest): boolean {
    return request.isContentType(
      this.options().json().contentTypes()
    )
  }

  /**
   * Returns the parsed JSON data.
   *
   * @param {HttpRequest} request
   *
   * @returns {Boolean}
   */
  async parseJson (request: HttpRequest): Promise<any> {
    const body = await this.collectBodyFrom(request)

    return JSON.parse(
      body.toString()
    )
  }

  /**
   * Determine whether the given `request` contains a text body.
   *
   * @param {HttpRequest} request
   *
   * @returns {Boolean}
   */
  protected isText (request: HttpRequest): boolean {
    return request.isContentType(
      this.options().text().contentTypes()
    )
  }

  /**
   * Returns the parsed text data.
   *
   * @param {HttpRequest} request
   *
   * @returns {*}
   */
  async parseText (request: HttpRequest): Promise<any> {
    const body = await this.collectBodyFrom(request)

    return body.toString()
  }

  /**
   * Determine whether the given `request` contains form-url-encoded data.
   *
   * @param {HttpRequest} request
   *
   * @returns {Boolean}
   */
  protected isFormUrlEncoded (request: HttpRequest): boolean {
    return request.isContentType(
      this.options().form().contentTypes()
    )
  }

  /**
   * Returns the parsed form data.
   *
   * @param {HttpRequest} request
   *
   * @returns {*}
   */
  async parseFormUrlEncoded (request: HttpRequest): Promise<any> {
    const body = await this.collectBodyFrom(request)

    return Object.fromEntries(
      new URLSearchParams(body.toString())
    )
  }

  /**
   * Determine whether the given `request` contains multipart data.
   *
   * @param {HttpRequest} request
   *
   * @returns {Boolean}
   */
  protected isMultipart (request: HttpRequest): boolean {
    return request.isContentType(
      this.options().multipart().contentTypes()
    )
  }

  /**
   * Returns the parsed multipart data.
   *
   * @param {HttpRequest} request
   *
   * @returns {*}
   */
  async parseMultipart (_request: HttpRequest): Promise<any> {
    // TODO
    // const body = await this.collectBodyFrom(request)

    // const form = Formidable({
    //   encoding: this.options().encoding() as any, // TODO make BufferEncoding from Formidable compatible with Node’s BufferEncoding
    //   maxFields: this.options().multipart().maxFields()
    // })

    // const { fields, files } = await new Promise((resolve, reject) => {
    //   form.parse(request.req(), (error, fields, files) => {
    //     if (error) {
    //       return reject(error)
    //     }

    //     resolve({ fields, files })
    //   })
    // })
  }

  /**
   * Fetch the incoming data from the given `request`.
   *
   * @param {HttpRequest} request
   *
   * @returns {*}
   */
  async collectBodyFrom (request: HttpRequest): Promise<any> {
    let body = ''

    request.req().setEncoding(
      this.options().encoding()
    )

    for await (const chunk of request.req()) {
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      body += chunk
    }

    return body
  }
}
