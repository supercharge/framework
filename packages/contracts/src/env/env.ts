'use strict'

export interface EnvContract {
  /**
   * Returns the value of the request environment variable.
   *
   * @param {String} key
   * @param {String} defaultValue
   *
   * @returns {String}
   */
  get (key: string, defaultValue?: any): string

  /**
   * This method is similar to the `Env.get` method, except that it throws
   * an error when the value is not existent in the environment.
   *
   * @param {String} key
   *
   * @returns {String}
   *
   * @throws
   */
  getOrFail (key: string): string

  /**
   * Set the value of an environment variable.
   *
   * @param {String} key
   * @param {String} value
   */
  set (key: string, value: string): void
}
