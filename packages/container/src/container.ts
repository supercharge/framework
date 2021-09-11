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

export interface ContainerBindings {
  'container': Container
}

export class Container<ContainerBindings extends string | Class = any> implements ContainerContract {
  /**
   * Stores the container bindings.
   */
  private bindings: Map<string, Binding>

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
  bind<Binding extends keyof ContainerBindings> (
    namespace: Binding,
    factory: BindingFactory<ContainerBindings[Binding]>,
    isSingleton: boolean = false
  ): this {
    this.ensureNamespace(namespace)

    if (!isFunction(factory)) {
      throw new Error(`container.bind(namespace, factory) expects the second argument to be a function. Received ${typeof factory}`)
    }

    return tap(this, () => {
      this.bindings.set(this.resolveNamespace(namespace), { factory, isSingleton })
    })
  }

  /**
   * Ensure the given `namespace` is a string or a class constructor.
   *
   * @param {String|Class} namespace
   */
  private ensureNamespace<Binding extends keyof ContainerBindings> (namespace: Binding): void {
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
  singleton<Binding extends keyof ContainerBindings> (
    namespace: Binding,
    factory: BindingFactory<ContainerBindings[Binding]>
  ): this {
    return this.bind(namespace, factory, true)
  }

  /**
   * Determine whether the given `namespace` is bound in the container.
   *
   * @param {String} namespace
   *
   * @returns {Boolean}
   */
  hasBinding<Binding extends keyof ContainerBindings> (namespace: Binding): boolean {
    return this.bindings.has(
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
  hasSingletonBinding<Binding extends keyof ContainerBindings> (namespace: Binding): boolean {
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
  private resolveNamespace<Binding extends keyof ContainerBindings> (namespace: Binding): string {
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
  isSingleton<Binding extends keyof ContainerBindings> (namespace: Binding): boolean {
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
  make<T extends any, Binding extends keyof ContainerBindings>(namespace: Binding): T {
    /**
     * If the namespace exists as a singleton, we’ll return the instance
     * without instantiating a new one. This way, the same instance
     * is reused when requesting it from the container.
     */
    if (this.hasSingletonBinding(namespace)) {
      return this.singletons.get(this.resolveNamespace(namespace)) as T
    }

    const instance = this.build<T, Binding>(namespace)

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
  private build<T, Binding extends keyof ContainerBindings> (namespace: Binding): T {
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
  private getFactoryFor<Binding extends keyof ContainerBindings> (namespace: Binding): any {
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
  resolveFactoryFor<Bindin extends keyof ContainerBindings> (namespace: Bindin): any {
    const name = this.resolveNamespace(namespace)

    return upon(this.bindings.get(name), binding => {
      return (binding as unknown as Binding).factory
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
    return (container: this) => {
      return new Constructor(container)
    }
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
}
