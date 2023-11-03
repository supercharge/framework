
import { Str } from '@supercharge/strings'
import { EnvStore } from '@supercharge/contracts'

export class Env implements EnvStore {
  /**
   * Returns the value of the request environment variable.
   */
  get (key: string): string
  get (key: string, defaultValue: any): string
  get (key: string, defaultValue?: any): string {
    return String(process.env[key] ?? defaultValue ?? '')
  }

  /**
   * This method is similar to the `Env.get` method, except that
   * it throws an error when the value is not existent in the environment.
   */
  getOrFail (key: string): string {
    const value = this.get(key)

    if (this.isEmpty(value)) {
      throw new Error(`Missing environment variable "${key}"`)
    }

    return value
  }

  /**
   * Returns the environment variable identified by the given `key` as a number.
   */
  number (key: string): number
  number (key: string, defaultValue: number): number
  number (key: string, defaultValue?: number): number {
    const num = Number(this.get(key, defaultValue))

    if (Number.isNaN(num)) {
      throw new Error(`The value for environment variable "${key}" cannot be converted to a number.`)
    }

    return num
  }

  /**
   * Returns the environment variable identified by the given `key` as a boolean value.
   */
  boolean (key: string): boolean
  boolean (key: string, defaultValue: boolean): boolean
  boolean (key: string, defaultValue?: boolean): boolean {
    const validTruthy = ['1', 'true']
    key = this.get(key).toLowerCase()

    if (validTruthy.includes(key)) {
      return true
    }

    return defaultValue ?? false
  }

  /**
   * Set the value of an environment variable.
   */
  set (key: string, value: string): this {
    process.env[key] = value

    return this
  }

  /**
   * Determine whether the given `value` is null or undefined.
   */
  isEmpty (value?: string | null): boolean {
    switch (value) {
      case null:
      case 'null':
        return true

      case undefined:
      case 'undefined':
        return true

      case '':
        return true

      default:
        return false
    }
  }

  /**
   * Determine whether the `NODE_ENV` variable is set to `production`.
   */
  isProduction (): boolean {
    return this.is('production')
  }

  /**
   * Determine whether the `NODE_ENV` variable is **not** set to `production`.
   */
  isNotProduction (): boolean {
    return !this.isProduction()
  }

  /**
   * Determine whether the `NODE_ENV` variable is set to `testing`.
   */
  isTesting (): boolean {
    return this.is('test') || this.is('testing')
  }

  /**
   * Determine whether the `NODE_ENV` variable equals the given `environment`.
   */
  is (environment: string): boolean {
    return Str(
      this.get('NODE_ENV')
    ).lower().equals(environment)
  }
}
