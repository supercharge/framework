'use strict'

import { Route } from './route'
import { tap } from '@supercharge/goodies'

export class RouteCollection {
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
}
