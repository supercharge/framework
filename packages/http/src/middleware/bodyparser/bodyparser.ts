
import JSON from '@supercharge/json'
import { Str } from '@supercharge/strings'
import { URLSearchParams } from 'node:url'
import { HttpError } from '@supercharge/http-errors'
import Formidable, { Fields, Files } from 'formidable'
import { BodyparserOptions } from './bodyparser-options.js'
// @ts-expect-error deep requiring
import { firstValues } from 'formidable/src/helpers/firstValues.js'
import { Application, HttpContext, HttpRequest, Middleware, NextHandler } from '@supercharge/contracts'

export class BodyparserMiddleware implements Middleware {
  /**
   * The application instance.
   */
  protected readonly app: Application

  /**
   * Create a new middleware instance.
   */
  constructor (app: Application) {
    this.app = app
  }

  /**
   * Returns the options determining how to serve assets.
   */
  options (): BodyparserOptions {
    return new BodyparserOptions(
      this.app.config().get('bodyparser')
    )
  }

  /**
   * Handle the incoming request.
   */
  async handle ({ request }: HttpContext, next: NextHandler): Promise<void> {
    if (this.shouldParsePayload(request)) {
      await this.parse(request)
    }

    await next()
  }

  /**
   * Determine whether to parse incoming request body.
   */
  shouldParsePayload (request: HttpRequest): boolean {
    return this.hasConfiguredMethod(request) && request.hasPayload()
  }

  /**
   * Determine whether to parse incoming request body.
   */
  hasConfiguredMethod (request: HttpRequest): boolean {
    return request.isMethod(
      this.options().methods()
    )
  }

  /**
   * Parse incoming request body and return the result.
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
   */
  protected isJson (request: HttpRequest): boolean {
    return request.isContentType(
      this.options().json().contentTypes()
    )
  }

  /**
   * Returns the parsed JSON data.
   */
  async parseJson (request: HttpRequest): Promise<void> {
    const body = await this.collectBodyFrom(request, { limit: this.options().json().limit() })

    request.setPayload(
      JSON.parse(body)
    )
  }

  /**
   * Determine whether the given `request` contains a text body.
   */
  protected isText (request: HttpRequest): boolean {
    return request.isContentType(
      this.options().text().contentTypes()
    )
  }

  /**
   * Returns the parsed text data.
   */
  async parseText (request: HttpRequest): Promise<void> {
    const body = await this.collectBodyFrom(request, { limit: this.options().text().limit() })

    request.setPayload(body)
  }

  /**
   * Determine whether the given `request` contains form-url-encoded data.
   */
  protected isFormUrlEncoded (request: HttpRequest): boolean {
    return request.isContentType(
      this.options().form().contentTypes()
    )
  }

  /**
   * Returns the parsed form data.
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
   */
  protected isMultipart (request: HttpRequest): boolean {
    return request.isContentType(
      this.options().multipart().contentTypes()
    )
  }

  /**
   * Returns the parsed multipart data.
   */
  async parseMultipart (request: HttpRequest): Promise<void> {
    const form = Formidable({
      multiples: true,
      encoding: this.options().encoding() as any, // TODO make Formidable BufferEncoding compatible with Node BufferEncoding
      maxFields: this.options().multipart().maxFields(),
      maxFileSize: this.options().multipart().maxFileSize(),
      maxTotalFileSize: this.options().multipart().maxTotalFileSize()
    })

    const { files, fields }: { fields: Fields, files: Files } = await new Promise((resolve, reject) => {
      form.parse(request.req(), (error, fields: Fields, files: Files) => {
        if (error) {
          if (Str(error.message).includesAll('maxFileSize')) {
            return reject(HttpError.payloadTooLarge('maxFileSize exceeded'))
          }

          if (Str(error.message).includesAll('maxTotalFileSize', 'exceeded')) {
            return reject(HttpError.payloadTooLarge('maxTotalFileSize exceeded'))
          }

          reject(error)
        }

        resolve({ fields: firstValues(form, fields), files })
      })
    })

    request.setFiles(files)
    request.setPayload(
      this.resolveMultipartFields(fields)
    )
  }

  /**
   * Returns the fields as an object and properties that are an
   * array with a single value are resolved to that value.
   */
  private resolveMultipartFields (fields: Fields): object {
    return Object.fromEntries(
      Object.entries(fields).map(([key, value]) => {
        return Array.isArray(value) && value.length === 1
          ? [key, value[0]]
          : [key, value]
      })
    )
  }

  /**
   * Fetch the incoming data from the given `request`.
   */
  async collectBodyFrom (request: HttpRequest, options: { limit: number}): Promise<string> {
    let body = ''

    request.req().setEncoding(
      this.options().encoding()
    )

    try {
      for await (const chunk of request.req()) {
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
