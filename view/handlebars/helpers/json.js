'use strict'

const Handlebars = require('handlebars')

/**
 * Creates a JSON string from the content parameter.
 *
 * @returns {String} JSON
 */
function json (content, options) {
  return new Handlebars.SafeString(
    options.hash.pretty
      ? JSON.stringify(content, undefined, 2)
      : JSON.stringify(content)
  )
}

module.exports = json
