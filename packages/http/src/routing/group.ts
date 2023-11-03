
import { Str } from '@supercharge/strings'
import { HttpRouteGroup, RouteAttributes } from '@supercharge/contracts'

export class RouteGroup implements HttpRouteGroup {
  /**
   * Stores the route group attributes, like prefix and middleware.
   */
  private readonly attributes: RouteAttributes

  /**
   * Create a new route group instance.
   */
  constructor (attributes: RouteAttributes) {
    this.attributes = attributes
  }

  /**
   * Returns the route group prefix.
   */
  prefix (): string {
    return Str(this.attributes.prefix).ltrim('/').start('/').get()
  }

  /**
   * Returns the route group middleware stack.
   */
  middleware (): string[] {
    return this.attributes.middleware ?? []
  }
}
