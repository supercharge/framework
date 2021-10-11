'use strict'

import { HttpRouter } from './router'
import { IncomingMessage, ServerResponse } from 'http'
import { Http2ServerRequest, Http2ServerResponse } from 'http2'

export type HttpServerHandler =
  (req: IncomingMessage | Http2ServerRequest, res: ServerResponse | Http2ServerResponse) => void

export interface HttpServer {
  /**
   * Returns the HTTP router instance.
   */
  router (): HttpRouter

  /**
   * Returns a request handler callback compatible with Node.js’ native HTTP server.
   */
  callback (): HttpServerHandler

  /**
   * Bootstrap the HTTP server.
   */
  bootstrap (): Promise<void>

  /**
   * Start the HTTP server.
   */
  start (): Promise<void>
}
