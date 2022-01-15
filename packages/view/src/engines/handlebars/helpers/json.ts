'use strict'

import Handlebars, { SafeString } from 'handlebars'

/**
 * Creates a JSON string from the content parameter.
 *
 * @returns {String} JSON
 *
 * @example
 * ```hbs
 * {{json user}}
 * renders
 * {"name": "Supercharge"}
 *
 * {{json user pretty=true}}
 * renders with line breaks and 2-space indention
 * {
 *   "name": "Supercharge"
 * }
 * ```
 */
export default function json (content: string, options: any): SafeString {
  return new Handlebars.SafeString(
    options.hash.pretty
      ? JSON.stringify(content, undefined, 2)
      : JSON.stringify(content)
  )
}
