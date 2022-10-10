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
  get (key: string): string
  get (key: string, defaultValue: any): string

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
   * Returns the environment variable identified by the given `key` as a number.
   *
   * @param {String} key
   *
   * @returns {Number}
   */
  number (key: string): number
  number (key: string, defaultValue?: number): number

  /**
   * Returns the environment variable identified by the given `key` as a boolean value.
   *
   * @param {String} key
   *
   * @returns {Boolean}
   */
  boolean (key: string): boolean
  boolean (key: string, defaultValue?: boolean): boolean

  /**
   * Set the value of an environment variable.
   *
   * @param {String} key
   * @param {String} value
   */
  set (key: string, value: string): this

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
