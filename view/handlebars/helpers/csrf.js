'use strict'

const _ = require('lodash')
const Handlebars = require('handlebars')

/**
 * Generates a CSRF token hidden input form field.
 *
 * @returns {String} HTML
 */
function csrf (context) {
  const token = _.get(context, 'data.root._csrfToken')

  if (token) {
    return new Handlebars.SafeString(`<input type="hidden" name="_csrfToken" value="${token}">`)
  }

  return ''
}

module.exports = csrf
