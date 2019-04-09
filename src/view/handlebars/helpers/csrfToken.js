'use strict'

const _ = require('lodash')
const Config = require('../../../config')

/**
 * Returns the CSRF token.
 *
 * @returns {String} HTML
 */
function csrfToken (context) {
  const tokenName = Config.get('session.token')
  const token = _.get(context, `data.root.${tokenName}`)

  return token || ''
}

module.exports = csrfToken
