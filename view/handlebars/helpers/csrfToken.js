'use strict'

const _ = require('lodash')

/**
 * Returns the CSRF token.
 *
 * @returns {String} HTML
 */
function csrfToken (context) {
  const token = _.get(context, 'data.root._csrfToken')

  return token || ''
}

module.exports = csrfToken
