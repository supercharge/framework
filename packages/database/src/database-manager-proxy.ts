'use strict'

export class DatabaseManagerProxy<T extends object> {
  /**
   * The class instance this proxy handler is applied to.
   */
  private readonly class: T

  /**
   * The method name to call for missing methods.
   */
  private readonly method: string = '__call'

  /**
   * Create a new call through handler for the given `Class`.
   *
   * @param {class} Class
   */
  constructor (Class: T) {
    this.class = Class
  }

  /**
   * The trap for getting values on the given `target`.
   *
   * @param target
   * @param property
   *
   * @returns {*}
   */
  get<R> (target: any, property: string): R | Function {
    if (Reflect.has(target, property)) {
      return Reflect.get(target, property)
    }

    const bind = target[this.method].call(this.class, property)

    if (typeof bind[property] === 'function') {
      return (...args: any[]) => {
        return bind[property](...args)
      }
    }

    return bind[property]
  }
}
