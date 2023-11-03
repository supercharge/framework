
export interface EnvStore {
  /**
   * Returns the value of the request environment variable.
   */
  get (key: string): string
  get (key: string, defaultValue: any): string

  /**
   * This method is similar to the `Env.get` method, except that it throws
   * an error when the value is not existent in the environment.
   */
  getOrFail (key: string): string

  /**
   * Returns the environment variable identified by the given `key` as a number.
   */
  number (key: string): number
  number (key: string, defaultValue?: number): number

  /**
   * Returns the environment variable identified by the given `key` as a boolean value.
   */
  boolean (key: string): boolean
  boolean (key: string, defaultValue?: boolean): boolean

  /**
   * Set the value of an environment variable.
   */
  set (key: string, value: string): this

  /**
   * Determine whether the `NODE_ENV` variable is set to `'production'`.
   */
  isProduction (): boolean

  /**
   * Determine whether the `NODE_ENV` variable is **not** set to `'production'`.
   */
  isNotProduction (): boolean

  /**
   * Determine whether the `NODE_ENV` variable is set to `'test'` or `'testing'`.
   */
  isTesting (): boolean

  /**
   * Determine whether the `NODE_ENV` environment variable equals the given `environment`.
   */
  is (environment: string): boolean
}
