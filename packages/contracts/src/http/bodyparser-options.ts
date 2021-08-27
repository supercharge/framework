'use strict'

import { HttpMethods } from './methods'

export interface BodyparserOptions {
  /**
   * --------------------------------------------------------------------------
   * Request Payload Encoding
   * --------------------------------------------------------------------------
   *
   * The encoding used to decode the incoming request data. The default encoding
   * is `utf8`. You may change it to any of the supported encodings in Node.js’
   * `BufferEncoding` type:
   *     "ascii" | "utf8" | "utf16le" | "ucs2" |
   *     "base64" | "base64url" | "latin1" | "binary" | "hex"
   *
   */
  encoding: BufferEncoding

  /**
   * --------------------------------------------------------------------------
   * Parsed HTTP Methods
   * --------------------------------------------------------------------------
   *
   * This option defines which HTTP methods enable body parsing. The body parser
   * won’t process the request body if the request method isn’t configured here.
   *
   * The default methods are `['POST', 'PUT', 'PATCH']` because they are defined
   * in the specification to contain a request payload. Yet, parsing incoming
   * request payload for `GET`, `HEAD`, and `DELETE` requests may be valid.
   *
   * See http://tools.ietf.org/html/draft-ietf-httpbis-p2-semantics-19#section-6.3
   *
   */
  methods: HttpMethods | HttpMethods[]

  /**
   * --------------------------------------------------------------------------
   * JSON Parser Options
   * --------------------------------------------------------------------------
   *
   * This section configures the JSON parsing options. The given options only
   * apply to JSON parsing and you may adjust the settings to your needs.
   *
   */
  json: {
    /**
     * ------------------------------------------------------------------------
     * JSON Parsing Limit
     * ------------------------------------------------------------------------
     *
     * This option configures the JSON body limit. The body parser throws an
     * HTTP error with status code 413 if an incoming request body exceeds
     * the given limit.
     */
    limit: string | number

    /**
     * ------------------------------------------------------------------------
     * JSON Parsing Content Types
     * ------------------------------------------------------------------------
     *
     * This option defines the JSON content types which will be parsed. You
     * may use the `*` wildcard symbol to allow content types confirming
     * to the given definition.
     */
    contentTypes: string[]
  }

  /**
   * --------------------------------------------------------------------------
   * Form Parser Options
   * --------------------------------------------------------------------------
   *
   * This section configures the form parsing options. The given options only
   * apply to JSON parsing and you may adjust the settings to your needs.
   *
   */
  form: {
    /**
     * ------------------------------------------------------------------------
     * Form Parsing Limit
     * ------------------------------------------------------------------------
     *
     * This option configures the JSON body limit. The body parser throws an
     * HTTP error with status code 413 if an incoming request body exceeds
     * the given limit.
     */
    limit: string | number

    /**
     * ------------------------------------------------------------------------
     * Form Parsing Content Types
     * ------------------------------------------------------------------------
     *
     * This option defines the form content types which will be parsed. You
     * may use the `*` wildcard symbol to allow content types confirming
     * to the given definition.
     */
    contentTypes: string[]
  }

  /**
   * --------------------------------------------------------------------------
   * Text Parser Options
   * --------------------------------------------------------------------------
   *
   * This section configures the text parsing options. The given options only
   * apply to text parsing and you may adjust the settings to your needs.
   *
   */
  text: {
    /**
     * ------------------------------------------------------------------------
     * Text Parsing Limit
     * ------------------------------------------------------------------------
     *
     * This option configures the text body limit. The body parser throws an
     * HTTP error with status code 413 if an incoming request body exceeds
     * the given limit.
     */
    limit: string | number

    /**
     * ------------------------------------------------------------------------
     * Text Parsing Content Types
     * ------------------------------------------------------------------------
     *
     * This option defines the text content types which will be parsed. You
     * may use the `*` wildcard symbol to allow content types confirming
     * to the given definition.
     */
    contentTypes: string[]
  }

  /**
   * --------------------------------------------------------------------------
   * Multipart Parser Options
   * --------------------------------------------------------------------------
   *
   * This section configures the multipart parsing options. The given options
   * apply to multipart parsing and you may adjust the settings to your needs.
   *
   */
  multipart: {
    /**
     * ------------------------------------------------------------------------
     * Multipart File Size Limit
     * ------------------------------------------------------------------------
     *
     * This option configures the multipart body limit. The body parser throws
     * an HTTP error with status code 413 if an incoming request body exceeds
     * the given limit.
     */
    limit: string | number

    /**
     * ------------------------------------------------------------------------
     * Multipart Parsing Content Types
     * ------------------------------------------------------------------------
     *
     * This option defines the multipart content types which will be parsed. You
     * may use the `*` wildcard symbol to allow content types confirming
     * to the given definition.
     */
    contentTypes: string[]

    /**
     * ------------------------------------------------------------------------
     * Maximum Number of Multipart Fields
     * ------------------------------------------------------------------------
     *
     * This option defines the maximum number of fields allowed in the request
     * body. **Notice:** setting this option to `0` means unlimited fields.
     */
    maxFields: number
  }
}
