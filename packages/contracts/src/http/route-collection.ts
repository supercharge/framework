'use strict'

import { HttpRoute as Route } from './route'

export interface HttpRouteCollection {
  /**
   * Register a new route to the collection.
   */
  add (route: Route | Route[]): Route | Route[]

  /**
   * Returns all registered routes.
   */
   all (): Route[]
}
