'use strict'

import { Route } from './route'
import { tap } from '@supercharge/goodies'

export class RouteCollection {
  private readonly meta: {
    routes: Route[]
  }

  constructor () {
    this.meta = { routes: [] }
  }

  public add (route: Route | Route[]): Route | Route[] {
    return tap(route, () => {
      this.meta.routes = this.meta.routes.concat(route)
    })
  }

  public all (): Route[] {
    return this.meta.routes
  }
}
