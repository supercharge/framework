'use strict'

import { Application } from '../foundation'
import { MiddlewareCtor } from './middleware'
import { HttpServer, HttpServerHandler } from './server'

export interface HttpKernel {
  /**
   * Determine whether the HTTP kernel is already boostrapped.
   */
  isBootstrapped (): boolean

  /**
   * Mark this HTTP kernel as bootstrapped.
   */
  markAsBootstrapped (): this

  /**
   * Returns the app instance.
   */
  app(): Application

  /**
   * Returns the HTTP server instance.
   */
  server (): HttpServer

  /**
   * Start an HTTP Server instance handling incoming requests.
   */
  startServer(): Promise<void>

  /**
   * Returns a request handler callback compatible with Node.js’ native HTTP server. This method
   * bootstraps the HTTP server instance by registering routes and middleware before returning
   * it. This request handler callback is useful during testing when sending requests into
   * the HTTP server instance with a community package, like Supertest from visionmedia.
   */
  serverCallback (): Promise<HttpServerHandler>

  /**
   * Returns the application’s global middleware stack. Every middleware
   * listed here runs on every request to the application.
   */
  middleware(): MiddlewareCtor[]

  /**
   * Returns the application’s global middleware stack. Every middleware
   * listed here runs on every request to the application.
   */
  routeMiddleware(): { [key: string]: MiddlewareCtor}

  /**
   * Returns an array of file paths to all controllers.
   */
  controllerPaths (): Promise<string[]>
}
