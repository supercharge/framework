'use strict'

import { Application } from '..'
import { MiddlewareCtor } from './middleware'
import { HttpServer, HttpServerHandler } from './server'

export interface HttpKernel {
  /**
   * Determine whether the HTTP kernel is already boostrapped.
   */
  isBootstrapped (): boolean

  /**
   * Determine whether the HTTP kernel is not boostrapped yet.
   */
  isNotBootstrapped (): boolean

  /**
   * Mark this HTTP kernel as bootstrapped.
   */
  markAsBootstrapped (): this

  /**
   * Prepare the application by running the configured bootstrappers. This
   * method doesn’t register the middleware stack to the underlying HTTP
   * server. It prepares the application which is useful for testing.
   */
  prepare (): Promise<this>

  /**
   * Runs the `prepare` method booting configured service providers and also
   * registers the app’s middleware stack and routes to the HTTP server.
   */
  bootstrap(): Promise<void>

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
  startServer(): Promise<this>

  /**
   * Stop the HTTP Server instance.
   */
  stopServer(): Promise<this>

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
}
