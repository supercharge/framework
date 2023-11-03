
import { HttpContext } from './context.js'
import { HttpMethods } from './methods.js'
import { RouteHandler } from './router.js'

export interface RouteObjectAttributes {
  path: string
  middleware: string[]
  methods: HttpMethods[]
  isInlineHandler: boolean
  isControllerClass: boolean
}

export interface HttpRoute {
  /**
   * Assign a route prefix.
   */
  prefix(prefix: string): this

  /**
   * Assign a middleware to the route.
   */
  middleware(middleware: string | string[]): this

  /**
   * Returns the route path.
   */
  path (): string

  /**
   * Returns the route’s HTTP methods.
   */
  methods (): HttpMethods[]

  /**
   * Returns the route handler.
   */
  handler (): RouteHandler

  /**
   * Run the route handler.
   */
  run (ctx: HttpContext): Promise<any>

  /**
   * Returns the route object’s attributes.
   */
  toJSON (): RouteObjectAttributes
}
