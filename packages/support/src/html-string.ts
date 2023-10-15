
import { Htmlable } from '@supercharge/contracts'

export class HtmlString implements Htmlable {
  /**
   * Stores the HTML string.
   */
  private readonly html: string

  constructor (html?: string) {
    this.html = html ?? ''
  }

  /**
   * Create an HtmlString instance for the given `html`.
   *
   * @return {HtmlString}
   */
  static from (html?: string): HtmlString {
    return new this(html)
  }

  /**
   * Returns the content as an HTML string.
   *
   * @return string
   */
  toString (): string {
    return this.toHtml()
  }

  /**
   * Returns the content as an HTML string.
   *
   * @return string
   */
  toHtml (): string {
    return this.html
  }

  /**
   * Determine whether the given HTML string is empty.
   *
   * @returns {Boolean}
   */
  isEmpty (): boolean {
    return this.html.length === 0
  }

  /**
   * Determine whether the given HTML string is not empty.
   *
   * @returns {Boolean}
   */
  isNotEmpty (): boolean {
    return !this.isEmpty()
  }
}
