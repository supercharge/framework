'use strict'

import { HttpRouter } from './router'
import { IncomingMessage, ServerResponse } from 'http'
import { Http2ServerRequest, Http2ServerResponse } from 'http2'
import { InlineMiddlewareHandler, MiddlewareCtor } from './middleware'

export type HttpServerHandler =
  (req: IncomingMessage | Http2ServerRequest, res: ServerResponse | Http2ServerResponse) => void

export interface HttpServer {
  /**
   * Returns the HTTP router instance.
   */
  router (): HttpRouter

  /**
   * Add the given `Middleware` as a global middleware to the HTTP server.
   */
  use (Middleware: MiddlewareCtor | InlineMiddlewareHandler): this

  /**
   * Add a route-level middleware for the given `name` and `Middleware` to the HTTP router.
   */
  useRouteMiddleware (name: string, Middleware: MiddlewareCtor): this

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
