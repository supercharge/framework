'use strict'

import { Application } from '../foundation'
import { MiddlewareCtor } from './middleware'

export interface HttpKernel {
  /**
   * Returns the app instance.
   */
  app(): Application

  /**
   * Bootstrap the HTTP server to handle requests.
   */
  bootstrap(): Promise<void>

  /**
   * Start an HTTP Server instance handling incoming requests.
   */
  startServer(): Promise<void>

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
