'use strict'

const BaseTest = require('@root/testing/base-test')
const { Transports } = require('@root/mail')
const SmtpTransporter = Transports['smtp']

class SmtpTransporterTest extends BaseTest {
  async createSmtpTransporter (t) {
    const transporter = new SmtpTransporter()
    t.truthy(transporter)
  }
}

module.exports = new SmtpTransporterTest()
