
import { Application } from '@supercharge/contracts'
import MethodMissing from '@supercharge/method-missing'

export class Facade extends MethodMissing {
  /**
   * The application instance
   */
  static app: Application

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
    return Facade.app.make(namespace)
  }

  /**
   * Returns the facade instance.
   *
   * @returns {*}
   */
  getFacadeInstance (): any {
    const facade = this.resolveFacadeInstance(
      this.getContainerNamespace()
    )

    if (!facade) {
      throw new Error(`Failed to retrieve facade instance for binding "${this.getContainerNamespace()}"`)
    }

    return facade
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
    if (this.getFacadeInstance()[methodName]) {
      return this.getFacadeInstance()[methodName](...args)
    }

    throw new Error(`Missing method "${methodName}" on facade ${this.getContainerNamespace()}`)
  }
}
