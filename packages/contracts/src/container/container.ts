'use strict'

import { Class } from '../support'

export interface Container {
  /**
   * Register a binding in the container.
   *
   * @param {String} namespace
   * @param {Function} factory
   */
  bind (namespace: string | Class, factory: (container: Container) => any): this

  /**
   * Register a shared binding (singleton) in the container.
   *
   * @param {String} namespace
   * @param {Function} factory
   */
  singleton (namespace: string | Class, factory: (container: Container) => any): this

  /**
   * Resolve the given namespace from the container.
   *
   * @param {String} namespace
   */
  make<T> (namespace: string | Class): T

  /**
   * Determine whether the given `namespace` is bound in the container.
   *
   * @param {String} namespace
   */
  hasBinding (namespace: string | Class): boolean

  /**
   * Flush all bindings and resolved instances from the containter.
   */
  flush (): this
}
