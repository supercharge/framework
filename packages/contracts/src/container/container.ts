'use strict'

import { Class } from '../support'

/**
 * Defines the shape of the container `factory` callback method.
 */
export type BindingFactory<ReturnValue extends any> = (container: Container) => ReturnValue

/**
 * TBA.
 */
export interface LookupNode<Namespace extends string | Class> {
  namespace: Namespace
  factory: BindingFactory<any>
  isSingleton: boolean
}

/**
 * Infers the type of the `container.make()` method for the given input.
 *
 * - String and LookupNode = Returns any
 * - Class constructor with "makePlain" are returned as it is
 * - Otherwise an instance of the class constructor is returned
 * - All other values are returned as it is
 */
export type InferMakeType<T> = T extends string | LookupNode<string>
  ? any
  : T extends Class
    ? T
    : T extends Class<infer A>
      ? A
      : T

/**
 * Defines the IoC Container interface.
 */
export interface Container<ContainerBindings extends string | Class = any> {
  /**
   * Register a binding into the container.
   */
  bind<Binding extends keyof ContainerBindings> (
    namespace: Binding,
    factory: BindingFactory<ContainerBindings[Binding]>
  ): this
  bind<Binding extends string | Class>(
    namespace: Binding,
    factory: BindingFactory<Binding extends keyof ContainerBindings ? ContainerBindings[Binding] : any>
  ): this

  /**
   * Register a shared binding (singleton) in the container. It resolves the instance only once
   * and saves it in memory afterwards. Returns the cached instance on every subsequent call.
   */
  singleton<Binding extends keyof ContainerBindings> (
    namespace: Binding,
    factory: BindingFactory<ContainerBindings[Binding]>
  ): this
  singleton<Binding extends string | Class>(
    namespace: Binding,
    factory: BindingFactory<Binding extends keyof ContainerBindings ? ContainerBindings[Binding] : any>
  ): this

  /**
   * Resolve the given namespace from the container.
   *
   * @param {String} namespace
   */
  make<Binding extends Extract<keyof ContainerBindings, string>> (
    namespace: Binding | LookupNode<Binding>
  ): ContainerBindings[Binding]
  make<T extends any> (namespace: T | LookupNode<string>): T extends keyof ContainerBindings ? ContainerBindings[T] : InferMakeType<T>

  /**
   * Determine whether the given `namespace` is bound in the container.
   */
  hasBinding<Binding extends keyof ContainerBindings>(namespace: Binding): boolean
  hasBinding(namespace: string | Class): boolean

  /**
   * Flush all bindings and resolved instances from the containter.
   */
  flush (): this
}
