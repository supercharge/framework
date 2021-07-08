'use strict'

export interface EnvStore {
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

  /**
   * Determine whether the `NODE_ENV` variable is set to `'production'`.
   *
   * @returns {Boolean}
   */
  isProduction (): boolean

  /**
   * Determine whether the `NODE_ENV` variable is **not** set to `'production'`.
   *
   * @returns {Boolean}
   */
  isNotProduction (): boolean

  /**
   * Determine whether the `NODE_ENV` variable is set to `'test'` or `'testing'`.
   *
   * @returns {Boolean}
   */
  isTesting (): boolean

  /**
   * Determine whether the `NODE_ENV` environment variable equals the given `environment`.
   *
   * @param {String} environment
   *
   * @returns {Boolean}
   */
  is (environment: string): boolean
}
