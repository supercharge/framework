'use strict'

import { tap } from '@supercharge/goodies'

export interface RouteAttributesMeta {
  prefix: string
  middleware: string[]
}

export class RouteAttributes {
  private readonly meta: RouteAttributesMeta

  constructor () {
    this.meta = { prefix: '', middleware: [] }
  }

  prefix (): string {
    return this.meta.prefix
  }

  public setPrefix (prefix: string): RouteAttributes {
    return tap(this, () => {
      this.meta.prefix = prefix
    })
  }

  middleware (): string[] {
    return this.meta.middleware
  }

  public setMiddleware (middleware: string | string[]): RouteAttributes {
    return tap(this, () => {
      this.meta.middleware = this.meta.middleware?.concat(middleware)
    })
  }
}
