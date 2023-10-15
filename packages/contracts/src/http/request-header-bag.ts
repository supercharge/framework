
import { IncomingHttpHeaders } from 'http'

export interface RequestHeaderBag {
  /**
   * Returns an object with all `keys` existing in the input bag.
   */
  all<Key extends keyof IncomingHttpHeaders = string> (...keys: Key[] | Key[][]): { [Key in keyof IncomingHttpHeaders]: IncomingHttpHeaders[Key] }

  /**
   * Returns the input value for the given `name`. Returns `undefined`
   * if the given `name` does not exist in the input bag.
   */
  get<Header extends keyof IncomingHttpHeaders> (name: Header): IncomingHttpHeaders[Header]
  get<T, Header extends keyof IncomingHttpHeaders> (name: Header, defaultValue: T): IncomingHttpHeaders[Header] | T

  /**
   * Set an input for the given `name` and assign the `value`. This
   * overrides a possibly existing input with the same `name`.
   */
  set (name: string, value: any): this

  /**
   * Removes the input with the given `name`.
   */
  remove (name: string): this

  /**
   * Determine whether the HTTP header for the given `name` exists.
   */
  has (name: keyof IncomingHttpHeaders): name is keyof IncomingHttpHeaders

  /**
   * Returns an object containing all parameters.
   */
  toJSON (): Partial<IncomingHttpHeaders>
}
