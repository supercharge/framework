'use strict'

import { tap } from '@supercharge/goodies'
import { Route, RouteObjectAttributes } from './route'
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

  /**
   * Returns an array of routes with their attributes.
   */
  public toJSON (): RouteObjectAttributes[] {
    return this.routes.map(route => {
      return route.toJSON()
    })
  }
}
