'use strict'

import { Class } from '../utils'

/**
 * Defines the shape of the container `factory` callback method.
 */
export type BindingFactory<ReturnValue extends any> = (container: Container) => ReturnValue

/**
 * Defines the IoC Container interface.
 */
export interface Container<ContainerBindings extends string | Class = any> {
  /**
   * Register a binding into the container.
   */
  bind<Namespace extends keyof ContainerBindings> (
    namespace: Namespace,
    factory: BindingFactory<ContainerBindings[Namespace]>
  ): this
  bind<Namespace extends string | Class>(
    namespace: Namespace,
    factory: BindingFactory<Namespace extends keyof ContainerBindings ? ContainerBindings[Namespace] : any>
  ): this

  /**
   * Register a shared binding (singleton) in the container. It resolves the instance only once
   * and saves it in memory afterwards. Returns the cached instance on every subsequent call.
   */
  singleton<Namespace extends keyof ContainerBindings> (
    namespace: Namespace,
    factory: BindingFactory<ContainerBindings[Namespace]>
  ): this
  singleton<Namespace extends string | Class>(
    namespace: Namespace,
    factory: BindingFactory<Namespace extends keyof ContainerBindings ? ContainerBindings[Namespace] : any>
  ): this

  /**
   * Resolve the given namespace from the container.
   *
   * @param {String} namespace
   */
  make<Namespace extends Extract<keyof ContainerBindings, string>> (
    namespace: Namespace
  ): Namespace extends keyof ContainerBindings ? ContainerBindings[Namespace] : InferMakeType<Namespace>
  make<T> (namespace: Class<T>): T
  make<T = any> (namespace: string): T

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

/**
 * Infers the type of the `container.make()` method for the given input.
 *
 * - String and LookupNode = Returns any
 * - Class constructor with "makePlain" are returned as it is
 * - Otherwise an instance of the class constructor is returned
 * - All other values are returned as it is
 */
export type InferMakeType<T> = T extends string
  ? any
  : T extends Class
    ? T
    : T extends Class<infer A>
      ? A
      : T
