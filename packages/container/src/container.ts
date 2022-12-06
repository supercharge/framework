'use strict'

import Map from '@supercharge/map'
import Str from '@supercharge/strings'
import { className, isClass } from '@supercharge/classes'
import { tap, upon, isFunction } from '@supercharge/goodies'
import { Class, Container as ContainerContract, BindingFactory } from '@supercharge/contracts'

interface Binding {
  factory: BindingFactory<any>
  isSingleton: boolean
}

export class Container implements ContainerContract {
  /**
   * Stores the container bindings.
   */
  private bindings: Map<string, Binding>

  /**
   * Stores the registered aliases.
   */
  private readonly aliases: Map<string, string[]>

  /**
   * Stores the singleton instances.
   */
  private singletons: Map<string, unknown>

  /**
   * Create a new container instance.
   */
  constructor () {
    this.aliases = new Map()
    this.bindings = new Map()
    this.singletons = new Map()
  }

  /**
   * Register a binding in the container.
   *
   * @param {String} namespace
   * @param {Function} factory
   *
   * @returns {Container}
   */
  bind (namespace: string | Class, factory: BindingFactory<any>, options?: { singleton?: boolean }): this {
    this.ensureNamespace(namespace)

    const { singleton = false } = options ?? {}

    if (!isFunction(factory)) {
      throw new Error(`container.bind(namespace, factory) expects the second argument to be a function. Received ${typeof factory}`)
    }

    return tap(this, () => {
      this.bindings.set(this.resolveNamespace(namespace), { factory, isSingleton: singleton })
    })
  }

  /**
   * Ensure the given `namespace` is a string or a class constructor.
   *
   * @param {String|Class} namespace
   */
  private ensureNamespace (namespace: string | Class): void {
    if (isClass(namespace)) {
      return
    }

    if (Str(namespace).isNotEmpty()) {
      return
    }

    throw new Error('Cannot bind empty namespace to the container')
  }

  /**
   * Register a shared binding (singleton) in the container.
   *
   * @param {String} abstract
   * @param {Function} factory
   *
   * @returns {Container}
   */
  singleton (namespace: string | Class, factory: BindingFactory<any>): this {
    return this.bind(namespace, factory, { singleton: true })
  }

  /**
   * Determine whether the given `namespace` is bound in the container.
   *
   * @param {String} namespace
   *
   * @returns {Boolean}
   */
  hasBinding (namespace: string | Class): boolean {
    return this.isAlias(namespace) || this.isSingleton(namespace) || this.bindings.has(
      this.resolveNamespace(namespace)
    )
  }

  /**
   * Determine whether the given `namespace` is bound as a singleton in the container.
   *
   * @param {String} namespace
   *
   * @returns {Boolean}
   */
  hasSingletonBinding (namespace: string | Class): boolean {
    return this.singletons.has(
      this.resolveNamespace(namespace)
    )
  }

  /**
   * Returns the resolved namespace identifier as a string.
   *
   * @param {String|Class} namespace
   *
   * @returns {String}
   */
  private resolveNamespace (namespace: string | Class): string {
    return isClass(namespace)
      ? className(namespace)
      : String(namespace)
  }

  /**
   * Determine whether the given `namespace` is a singleton.
   *
   * @param {String} namespace
   *
   * @returns {Boolean}
   */
  isSingleton (namespace: string | Class): boolean {
    return this.hasSingletonBinding(namespace) || this.bindings.contains((key, binding) => {
      return key === this.resolveNamespace(namespace) && binding.isSingleton
    })
  }

  /**
   * Resolve the given namespace from the container.
   *
   * @param {String} namespace
   *
   * @returns {*}
   */
  make<T = any> (namespace: string): T
  make<T> (namespace: Class<T>): T
  make<T extends any>(namespace: string | Class): T {
    if (this.isAlias(namespace)) {
      namespace = this.getAlias(namespace)
    }

    /**
     * If the namespace exists as a singleton, we’ll return the instance
     * without instantiating a new one. This way, the same instance
     * is reused when requesting it from the container.
     */
    if (this.hasSingletonBinding(namespace)) {
      return this.singletons.get(this.resolveNamespace(namespace)) as T
    }

    const instance = this.build<T>(namespace)

    /**
     * If the namespace is expected to be a singleton, we’ll cache the instance
     * in memory for future calls. Then, the cached instance will be returned.
     */
    if (this.isSingleton(namespace)) {
      this.singletons.set(this.resolveNamespace(namespace), instance)
    }

    return instance
  }

  /**
   * Run the factory function for the given binding that resolves the related instance.
   *
   * @param {String} namespace
   *
   * @returns {*}
   *
   * @throws
   */
  private build<T> (namespace: string | Class): T {
    return upon(this.getFactoryFor(namespace), factory => {
      return factory(this)
    })
  }

  /**
   * Returns the factory callback for the given namespace.
   *
   * @param {String} namespace
   *
   * @returns {Function}
   *
   * @throws
   */
  private getFactoryFor (namespace: string | Class): any {
    if (this.hasBinding(namespace)) {
      return this.resolveFactoryFor(namespace)
    }

    if (isClass(namespace)) {
      return this.createFactoryFor(namespace)
    }

    throw new Error(`Missing container binding for the given namespace "${this.resolveNamespace(namespace)}"`)
  }

  /**
   * Returns a factory function for the given namespace.
   *
   * @param {String} namespace
   *
   * @returns {Function}
   */
  resolveFactoryFor (namespace: string | Class): any {
    const name = this.resolveNamespace(namespace)

    return upon(this.bindings.get(name), binding => {
      return binding?.factory
    })
  }

  /**
   * Returns a factory function for the given class constructor.
   *
   * @param Constructor
   *
   * @returns {Function}
   */
  createFactoryFor (Constructor: Class): any {
    return (container: Container) => {
      return new Constructor(container)
    }
  }

  /**
   * Determine whether the given `namespace` is an alias.
   */
  getAlias (namespace: string | Class): string {
    const abstract = this.resolveNamespace(namespace)

    for (const [alias, aliases] of this.aliases.entries()) {
      if (aliases.includes(abstract)) {
        return alias
      }
    }

    throw new Error(`No alias registered for the given "${abstract}"`)
  }

  /**
   * Determine whether the given `namespace` is an alias.
   */
  isAlias (namespace: string | Class): boolean {
    try {
      this.getAlias(namespace)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Alias a binding to a different name.
   */
  alias (namespace: string | Class, alias: string | Class): this {
    if (!namespace) {
      throw new Error('You must provide a source namespace as the first argument when creating a container alias.')
    }

    if (!alias) {
      throw new Error('You must provide an alias name as the second argument when creating a container alias.')
    }

    const resolvedAlias = this.resolveNamespace(alias)
    const resolvedNamespace = this.resolveNamespace(namespace)

    if (resolvedAlias === resolvedNamespace) {
      throw new Error(`"${resolvedNamespace}" is an alias for itself`)
    }

    return tap(this, () => {
      this.addAlias(resolvedNamespace, resolvedAlias)
    })
  }

  /**
   * Assign the given `alias` to the concrete `namespace`.
   *
   * @param namespace
   * @param alias
   *
   * @returns {this}
   */
  private addAlias (namespace: string, alias: string): this {
    const aliases = this.aliases.getOrDefault(namespace, [])
    aliases.push(alias)

    this.aliases.set(namespace, aliases)

    return this
  }

  /**
   * Remove a resolved instance from the (singleton) cache.
   */
  forgetInstance (namespace: string | Class): this {
    if (!namespace) {
      throw new Error('You must provide a "namespace" as the first argument when calling container.forgetInstance(namespace).')
    }

    if (this.isAlias(namespace)) {
      namespace = this.getAlias(namespace)
    }

    this.singletons.delete(
      this.resolveNamespace(namespace)
    )

    return this
  }

  /**
   * Flush all bindings and resolved instances from the containter.
   *
   * @returns {this}
   */
  flush (): this {
    return tap(this, () => {
      this.bindings = new Map()
      this.singletons = new Map()
    })
  }
}
