'use strict'

export interface Htmlable {
  /**
   * Returns the content as an HTML string.
   *
   * @return string
   */
  toHtml(): string
}
