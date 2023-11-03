
export interface HttpRouteGroup {
  /**
   * Returns the route group prefix.
   */
  prefix(): string

  /**
   * Returns the route group middleware stack.
   */
  middleware(): string[]
}
