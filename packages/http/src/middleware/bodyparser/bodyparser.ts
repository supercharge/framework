
import JSON from '@supercharge/json'
import { PassThrough } from 'stream'
import { URLSearchParams } from 'url'
import Str from '@supercharge/strings'
import { HttpError } from '@supercharge/http-errors'
import Formidable, { Fields, Files } from 'formidable'
import { BodyparserOptions } from './bodyparser-options'
import { Application, HttpContext, HttpRequest, Middleware, NextHandler } from '@supercharge/contracts'

export class BodyparserMiddleware implements Middleware {
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
      await this.parse(request)
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
    return request.isMethod(
      this.options().methods()
    )
  }

  /**
   * Parse incoming request body and return the result.
   *
   * @param {HttpRequest} request
   *
   * @returns {Boolean}
   */
  async parse (request: HttpRequest): Promise<void> {
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

    throw HttpError.unsupportedMediaType(`Unsupported Content Type. Received "${request.contentType()}"`)
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
  async parseJson (request: HttpRequest): Promise<void> {
    const body = await this.collectBodyFrom(request, { limit: this.options().json().limit() })

    request.setPayload(
      JSON.parse(body)
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
  async parseText (request: HttpRequest): Promise<void> {
    const body = await this.collectBodyFrom(request, { limit: this.options().text().limit() })

    request.setPayload(body)
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
  async parseFormUrlEncoded (request: HttpRequest): Promise<void> {
    const body = await this.collectBodyFrom(request, { limit: this.options().form().limit() })

    request.setPayload(
      Object.fromEntries(
        new URLSearchParams(body)
      )
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
  async parseMultipart (request: HttpRequest): Promise<void> {
    const form = new Formidable.IncomingForm({
      multiples: true,
      encoding: this.options().encoding() as any, // TODO make Formidable BufferEncoding compatible with Node BufferEncoding
      maxFields: this.options().multipart().maxFields(),
      maxFileSize: this.options().multipart().maxFileSize()
    })

    const { files, fields }: { fields: Fields, files: Files } = await new Promise((resolve, reject) => {
      form.parse(request.req(), (error, fields: Fields, files: Files) => {
        if (error) {
          return Str(error.message).includesAll('maxFileSize', 'exceeded')
            ? reject(HttpError.payloadTooLarge('maxFileSize exceeded'))
            : reject(error)
        }

        resolve({ fields, files })
      })
    })

    request.setFiles(files)
    request.setPayload(fields)
  }

  /**
   * Fetch the incoming data from the given `request`.
   *
   * @param {HttpRequest} request
   *
   * @returns {*}
   */
  async collectBodyFrom (request: HttpRequest, options: { limit: number}): Promise<string> {
    let body = ''

    request.req().setEncoding(
      this.options().encoding()
    )

    try {
      // this .pipe(new PassThrough()) workaround is needed because
      // stream iteration on requests is currently broken in Node.js
      // https://github.com/nodejs/node/issues/38262
      for await (const chunk of request.req().pipe(new PassThrough())) {
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        body += chunk

        if (body.length > options.limit) {
          throw HttpError.payloadTooLarge('Payload Too Large')
        }
      }
    } catch (error) {
      request.req().unpipe()
      request.req().resume()

      throw error
    }

    request.setRawPayload(body)

    return Str(body).stripBom().get()
  }
}
