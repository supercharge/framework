'use strict'

/**
 * Barrel export all transports
 */
module.exports = {
  ses: require('./ses'),
  null: require('./null'),
  smtp: require('./smtp'),
  mailgun: require('./mailgun'),
  postmark: require('./postmark'),
  sparkpost: require('./sparkpost')
}
