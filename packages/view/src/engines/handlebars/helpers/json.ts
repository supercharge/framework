'use strict'

import Handlebars, { SafeString } from 'handlebars'

/**
 * Creates a JSON string from the content parameter.
 *
 * @returns {String} JSON
 */
export default function json (content: string, options: any): SafeString {
  return new Handlebars.SafeString(
    options.hash.pretty
      ? JSON.stringify(content, undefined, 2)
      : JSON.stringify(content)
  )
}
