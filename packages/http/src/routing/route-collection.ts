
import { Route } from './route.js'
import { tap } from '@supercharge/goodies'
import { HttpRouteCollection, RouteObjectAttributes } from '@supercharge/contracts'

export class RouteCollection implements HttpRouteCollection {
  /**
   * Stores all registered routes.
   */
  private routes: Route[]

  /**
   * Create a new instance.
   */
  constructor () {
    this.routes = []
  }

  /**
   * Register a new route to the collection.
   */
  public add (route: Route | Route[]): Route | Route[] {
    return tap(route, () => {
      this.routes = this.routes.concat(route)
    })
  }

  /**
   * Returns all registered routes.
   */
  public all (): Route[] {
    return this.routes
  }

  /**
   * Clear all registered routes.
   */
  public clear (): this {
    return tap(this, () => {
      this.routes = []
    })
  }

  /**
   * Returns the number of routes registerd to this route collection.
   */
  public count (): number {
    return this.routes.length
  }

  /**
   * Returns the attributes of all routes.
   */
  public toJSON (): RouteObjectAttributes[] {
    return this.routes.map(route => {
      return route.toJSON()
    })
  }
}
