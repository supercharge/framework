'use strict'

export interface Container {
  /**
   * Register a binding in the container.
   *
   * @param {String} namespace
   * @param {Function} factory
   */
  bind (namespace: string, factory: () => any): this

  /**
   * Register a shared binding (singleton) in the container.
   *
   * @param {String} namespace
   * @param {Function} factory
   */
  singleton (namespace: string, factory: () => any): this

  /**
   * Determine whether the given namespace is bound in the container.
   *
   * @param {String} namespace
   */
  hasBinding (namespace: string): boolean

  /**
   * Resolve the given namespace from the container.
   *
   * @param {String} namespace
   */
  make<T> (namespace: string): T

  /**
   * Flush all bindings and resolved instances from the containter.
   */
  flush (): this
}
