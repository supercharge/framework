'use strict'

import { InputBag } from './input-bag.js'
import { QueryParameterBag as QueryParameterBagContract } from '@supercharge/contracts'

export class QueryParameterBag<Properties> extends InputBag<Properties> implements QueryParameterBagContract<Properties> {
  /**
   * Returns the query string created from all items in this query parameter bag,
   * without the leading question mark `?`.
   *
   * **Notice:** the returned querystring is encoded. Node.js automatically
   * encodes the querystring to ensure a valid URL. Some characters would
   * break the URL string otherwise. This way ensures the valid string.
   */
  toQuerystring (): string {
    return new URLSearchParams(
      this.all() as Record<string, string>
    ).toString()
  }

  /**
   * Returns the decoded querystring by running the result of `toQuerystring`
   * through `decodeURIComponent`. This method is useful to debug during
   * development. It’s recommended to use `toQuerystring` in production.
   */
  toQuerystringDecoded (): string {
    return decodeURIComponent(
      this.toQuerystring()
    )
  }
}
