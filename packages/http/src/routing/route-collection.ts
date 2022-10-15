'use strict'

import { Route } from './route'
import { tap } from '@supercharge/goodies'
import { HttpRouteCollection } from '@supercharge/contracts'

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
   *
   * @param {Route} route
   *
   * @returns {}
   */
  public add (route: Route | Route[]): Route | Route[] {
    return tap(route, () => {
      this.routes = this.routes.concat(route)
    })
  }

  /**
   * Returns all registered routes.
   *
   * @returns {Route[]}
   */
  public all (): Route[] {
    return this.routes
  }

  /**
   * Clear all registered routes.
   *
   * @returns {this}
   */
  public clear (): this {
    return tap(this, () => {
      this.routes = []
    })
  }

  /**
   * Returns the number of routes registerd to this route collection.
   *
   * @returns {Number}
   */
  public count (): number {
    return this.routes.length
  }
}
