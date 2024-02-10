
import { HttpRouter } from './router.js'
import { Http2ServerRequest, Http2ServerResponse } from 'node:http2'
import { InlineMiddlewareHandler, MiddlewareCtor } from './middleware.js'
import { Server as NodeHttpServer, IncomingMessage, ServerResponse } from 'node:http'

export type HttpServerHandler =
  (req: IncomingMessage | Http2ServerRequest, res: ServerResponse | Http2ServerResponse) => Promise<void>

export interface HttpServer {
  /**
   * Returns the HTTP router instance.
   */
  router (): HttpRouter

  /**
   * Clear all registered routes from the router.
   */
  clearRoutes(): this

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
  bootstrap (): void

  /**
   * Determine whether the HTTP server is already boostrapped.
   */
  isBootstrapped (): boolean

  /**
   * Start the HTTP server on a local hostname and port to accept incoming connections.
   */
  start (): Promise<void>

  /**
   * Stop the HTTP server from accepting new connections. Existing connections
   * stay alive and will be processed. The server stops as soon as all open
   * connections have been processed through the HTTP request lifecycle.
   */
  stop (): Promise<void>

  /**
   * Returns the reference to the started Node.js HTTP server.
   */
  nodeServer(): NodeHttpServer | undefined
}
