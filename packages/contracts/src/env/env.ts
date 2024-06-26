
export interface EnvStore {
  /**
   * Returns the value of the request environment variable.
   */
  get (key: string): string
  get<R extends string> (key: string): R
  get (key: string, defaultValue: string): string
  get<R extends string> (key: string, defaultValue: R): R

  /**
   * This method is similar to the `Env.get` method, except that it throws
   * an error when the value is not existent in the environment.
   */
  getOrFail (key: string): string

  /**
   * Returns the environment variable identified by the given `key` as a number.
   */
  number (key: string): number
  number (key: string, defaultValue: number): number

  /**
   * Returns the environment variable identified by the given `key` as a boolean
   * value. The environment variable values `'true'` and `'1'` translate to a
   * truthy value, every other value returns `false` or the default value.
   */
  boolean (key: string): boolean
  boolean (key: string, defaultValue: boolean): boolean

  /**
   * Set the value of an environment variable.
   */
  set (key: string, value: string): this

  /**
   * Determine whether the `NODE_ENV` or `APP_ENV` variable is set to `'production'`.
   */
  isProduction (): boolean

  /**
   * Determine whether the `NODE_ENV` or `APP_ENV` variable is **not** set to `'production'`.
   */
  isNotProduction (): boolean

  /**
   * Determine whether the `NODE_ENV` or `APP_ENV` variable is set to `'test'` or `'testing'`.
   */
  isTesting (): boolean

  /**
   * Determine whether the `NODE_ENV` or `APP_ENV` variable is **not** set to `'test'` or `'testing'`.
   */
  isNotTesting (): boolean

  /**
   * Determine whether the `NODE_ENV` or `APP_ENV` environment variable equals the given `environment`.
   */
  is (environment: string): boolean
}
