
import { ParameterBag } from '../index.js'

export interface QueryParameterBag<T> extends ParameterBag<T> {
  /**
   * Returns the querystring created from all items in this query parameter bag,
   * without the leading question mark `?`.
   *
   * **Notice:** the returned querystring is encoded. Node.js automatically
   * encodes the querystring to ensure a valid URL. Some characters would
   * break the URL string otherwise. This way ensures the valid string.
   */
  toQuerystring (): string

  /**
   * Returns the decoded querystring by running the result of `toQuerystring`
   * through `decodeURIComponent`. This method is useful to debug during
   * development. It’s recommended to use `toQuerystring` in production.
   */
  toQuerystringDecoded (): string
}
