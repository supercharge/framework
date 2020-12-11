'use strict'

import { Route } from './route'
import { Application, HttpContext, IocResolverContract } from '@supercharge/contracts'

export class ControllerDispatcher {
  /**
   * The IoC resolver instance.
   */
  private readonly resolver: IocResolverContract<any>

  /**
   * Create a new instance.
   *
   * @param app Application
   */
  constructor (app: Application) {
    this.resolver = app.container().getResolver(undefined, undefined, 'http/controllers/')
  }

  /**
   * Call the route handler instance with the given HTTP context.
   *
   * @param route Route
   * @param ctx HttpContext
   */
  async dispatch (route: Route, ctx: HttpContext): Promise<void> {
    return this.resolver.call(
      this.resolveHandler(route), undefined, [ctx]
    )
  }

  /**
   * Returns the resolved controller.
   *
   * @param route Route
   *
   * @returns {Controller}
   */
  resolveHandler (route: Route): any {
    return this.resolver.resolve(
      route.handler() as string
    )
  }
}
