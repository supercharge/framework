
import { InputBag } from './input-bag.js'

export class RequestHeaderBag<RequestHeaders> extends InputBag<RequestHeaders> {
  /**
   * Returns the lowercased string value for the given `name`.
   */
  private lowercase<Key extends keyof RequestHeaders = any> (name: string | Key): Key {
    return String(name).toLowerCase() as Key
  }

  /**
   * Returns the input value for the given `name`. Returns `undefined`
   * if the given `name` does not exist in the input bag.
   */
  override get<Value = any, Key extends keyof RequestHeaders = any> (key: Key, defaultValue?: Value): RequestHeaders[Key] | Value | undefined {
    switch (key) {
      case 'referrer':
      case 'referer':
        return super.get('referrer' as Key) ?? super.get('referer' as Key) ?? defaultValue

      default:
        return super.get(this.lowercase<Key>(key), defaultValue)
    }
  }

  /**
   * Set an input for the given `name` and assign the `value`. This
   * overrides a possibly existing input with the same `name`.
   */
  override set<Key extends keyof RequestHeaders> (key: Key | Partial<RequestHeaders>, value?: any): this {
    if (this.isObject(key)) {
      const values = Object.entries(key).reduce<Partial<RequestHeaders>>((carry, [key, value]) => {
        const id = this.lowercase<Key>(key)
        // @ts-expect-error
        carry[id] = value

        return carry
      }, {})

      return super.set(values)
    }

    return super.set(this.lowercase(key), value)
  }

  /**
   * Removes the input with the given `name`.
   */
  override remove<Key extends keyof RequestHeaders> (key: Key): this {
    return super.remove(
      this.lowercase(key)
    )
  }
}
