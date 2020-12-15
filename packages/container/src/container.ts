'use strict'

import Map from '@supercharge/map'
import Str from '@supercharge/strings'
import { tap, upon, isFunction } from '@supercharge/goodies'
import { Container as ContainerContract } from '@supercharge/contracts'

type BindingFactory<ReturnValue extends any> = (
  container: Container
) => ReturnValue

interface Binding<ReturnValue extends any> {
  factory: BindingFactory<ReturnValue>
  isSingleton: boolean
}

export class Container implements ContainerContract {
  /**
   * Stores the container bindings.
   */
  private bindings: Map<string, Binding<unknown>>

  /**
   * Stores the singleton instances.
   */
  private singletons: Map<string, unknown>

  /**
   * Create a new container instance.
   */
  constructor () {
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
  bind (namespace: string, factory: BindingFactory<unknown>, isSingleton: boolean = false): this {
    this.ensureNamespace(namespace)

    if (this.isNotFunction(factory)) {
      throw new Error(`container.bind(namespace, factory) expects the second argument to be a function. Received ${typeof factory}`)
    }

    return tap(this, () => {
      this.bindings.set(namespace, { factory, isSingleton })
    })
  }

  /**
   * Register a shared binding (singleton) in the container.
   *
   * @param {String} abstract
   * @param {Function} factory
   *
   * @returns {Container}
   */
  singleton (namespace: string, factory: BindingFactory<unknown>): this {
    return this.bind(namespace, factory, true)
  }

  /**
   * Determine whether the given `namespace` is bound in the container.
   *
   * @param {String} namespace
   *
   * @returns {Boolean}
   */
  hasBinding (namespace: string): boolean {
    return this.bindings.has(namespace)
  }

  /**
   * Determine whether the given `namespace` is bound as a singleton in the container.
   *
   * @param {String} namespace
   *
   * @returns {Boolean}
   */
  hasSingletonBinding (namespace: string): boolean {
    return this.singletons.has(namespace)
  }

  /**
   * Determine whether the given namespace is bound in the container.
   *
   * @param {String} namespace
   *
   * @returns {Boolean}
   */
  isMissingBinding (namespace: string): boolean {
    return !this.hasBinding(namespace)
  }

  /**
   * Determine whether the given `namespace` is a singleton.
   *
   * @param {String} namespace
   *
   * @returns {Boolean}
   */
  isSingleton (namespace: string): boolean {
    return this.hasSingletonBinding(namespace) || this.bindings.contains((key, binding) => {
      return key === namespace && binding.isSingleton
    })
  }

  /**
   * Resolve the given namespace from the container.
   *
   * @param {String} namespace
   *
   * @returns {*}
   */
  make<T>(namespace: string): T {
    /**
     * If the namespace exists as a singleton, we’ll return the instance
     * without instantiating a new one. This way, the same instance
     * is reused when requesting it from the container.
     */
    if (this.hasSingletonBinding(namespace)) {
      return this.singletons.get(namespace) as T
    }

    const instance = this.build<T>(namespace)

    /**
     * If the namespace is expected to be a singleton, we’ll cache the instance
     * in memory for future calls. Then, the cached instance will be returned.
     */
    if (this.isSingleton(namespace)) {
      this.singletons.set(namespace, instance)
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
  private build<T> (namespace: string): T {
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
  private getFactoryFor (namespace: string): any {
    if (this.isMissingBinding(namespace)) {
      throw new Error(`Missing container binding for the given namespace "${namespace}"`)
    }

    return upon(this.bindings.get(namespace), binding => {
      return binding?.factory
    })
  }

  /**
   * Flush all bindings and resolved instances from the containter.
   *
   * @returns {Container}
   */
  flush (): this {
    return tap(this, () => {
      this.bindings = new Map()
      this.singletons = new Map()
    })
  }

  /**
   * Determine whether the given input is a function.
   *
   * @param target
   *
   * @returns {Boolean}
   */
  private ensureNamespace (namespace: string): void {
    if (Str(namespace).isEmpty()) {
      throw new Error('Cannot bind empty namespace to the container')
    }
  }

  /**
   * Determine whether the given input is not a function.
   *
   * @param target
   *
   * @returns {Boolean}
   */
  private isNotFunction (target: any): boolean {
    return !this.isFunction(target)
  }

  /**
   * Determine whether the given input is a function.
   *
   * @param target
   *
   * @returns {Boolean}
   */
  private isFunction (target: any): boolean {
    return isFunction(target)
  }
}
