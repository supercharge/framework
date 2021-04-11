'use strict'

import { Application } from '@supercharge/contracts'
import MethodMissing from '@supercharge/method-missing'

export class Facade extends MethodMissing {
  /**
   * The application instance
   */
  static app: Application

  /**
   * The resolved container instance for this facade.
   */
  resolvedInstance: any

  /**
   * Set the application instance.
   *
   * @param {Application} app
   *
   * @returns {Facade}
   */
  static setApplication (app: Application): typeof Facade {
    this.app = app

    return this
  }

  /**
   * Returns the container binding name.
   *
   * @returns {String}
   *
   * @throws
   */
  getContainerNamespace (): string {
    throw new Error(`The facade ${this.constructor.name} must implement the getContainerNamespace method.`)
  }

  /**
   * Returns the facade instance resolved from the IoC container.
   *
   * @param {String} namespace
   *
   * @returns {*}
   */
  resolveFacadeInstance (namespace: string): unknown {
    if (!this.resolvedInstance) {
      this.resolvedInstance = Facade.app.make(namespace)
    }

    return this.resolvedInstance
  }

  /**
   * Returns the facade instance.
   *
   * @returns {*}
   */
  getFacadeInstance (): any {
    return this.resolveFacadeInstance(
      this.getContainerNamespace()
    )
  }

  /**
   * Pass through all calls to the facaded instance.
   *
   * @param {String} methodName
   * @param {Array} args
   *
   * @returns {*}
   */
  __call (methodName: string, args: unknown[]): unknown {
    return this.getFacadeInstance()[methodName](...args)
  }
}
