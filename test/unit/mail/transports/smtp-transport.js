'use strict'

const BaseTest = require('../../../../testing/base-test')
const SmtpTransporter = require('../../../../mailer/transports/smtp')

class SmtpTransporterTest extends BaseTest {
  async createSmtpTransporter (t) {
    const transporter = new SmtpTransporter()
    t.truthy(transporter)
  }
}

module.exports = new SmtpTransporterTest()
