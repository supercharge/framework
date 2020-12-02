'use strict'

import { Route } from './route'
import { tap } from '@supercharge/goodies'
import { RouteAttributes } from './route-attributes'
import { HttpRouteGroup } from '@supercharge/contracts'

export class RouteGroup implements HttpRouteGroup {
  private readonly meta: {
    routes: Route[]
    attributes: RouteAttributes
  }

  constructor (routes: Route[] = [], attributes: RouteAttributes = new RouteAttributes()) {
    this.meta = { routes, attributes }
  }

  attributes (): RouteAttributes {
    return this.meta.attributes
  }

  routes (): Route[] {
    return this.meta.routes
  }

  addRoute (route: Route): this {
    return tap(this, () => {
      this.routes().push(route)
    })
  }

  prefix (prefix: string): this {
    return tap(this, () => {
      this.routes().forEach(route => {
        route.prefix(prefix)
      })
    })
  }

  middleware (middleware: string): this {
    return tap(this, () => {
      this.routes().forEach(route => {
        route.middleware(middleware)
      })
    })
  }
}
