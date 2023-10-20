
import { Str } from '@supercharge/strings'
import { tap } from '@supercharge/goodies'
import { RouterContext } from '@koa/router'
import { Dict } from '@supercharge/contracts'
import { OutgoingHttpHeaders } from 'node:http'

export class ResponseHeaderBag {
  /**
   * Stores the request headers as an object.
   */
  private readonly ctx: RouterContext

  /**
    * Create a new instance.
    */
  constructor (ctx: RouterContext) {
    this.ctx = ctx
  }

  /**
    * Returns an object with all `keys` existing in the input bag.
    */
  all (...keys: string[] | string[][]): OutgoingHttpHeaders {
    if (keys.length === 0) {
      return this.ctx.res.getHeaders()
    }

    return ([] as string[])
      .concat(...keys)
      .reduce((carry: Dict<string>, key) => {
        carry[key] = this.get(key)

        return carry
      }, {})
  }

  /**
    * Returns the input value for the given `name`. Returns `undefined`
    * if the given `name` does not exist in the input bag.
    */
  get (name: string, defaultValue?: string): string | undefined {
    const header = this.ctx.response.get(name)

    return Str(header).isNotEmpty()
      ? header
      : defaultValue
  }

  /**
    * Set an input for the given `name` and assign the `value`. This
    * overrides a possibly existing input with the same `name`.
    */
  set (name: string, value: string | string[] | number): this {
    const stringValue = typeof value === 'number' ? String(value) : value

    return tap(this, () => {
      this.ctx.set(name, stringValue)
    })
  }

  /**
    * Removes the input with the given `name`.
    */
  remove (name: string): this {
    return tap(this, () => {
      this.ctx.remove(name)
    })
  }

  /**
    * Determine whether the HTTP header for the given `name` exists.
    */
  has (name: string): boolean {
    return !!this.get(name)
  }

  /**
    * Returns an object containing all parameters.
    */
  toJSON (): OutgoingHttpHeaders {
    return this.all()
  }
}
