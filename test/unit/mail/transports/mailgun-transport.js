'use strict'

const BaseTest = require('@root/testing/base-test')
const { Transports } = require('@root/mail')
const MailgunTransporter = Transports['mailgun']

class MailgunTransporterTest extends BaseTest {
  async createMailgunTransporter (t) {
    const transporter = new MailgunTransporter({
      auth: {
        api_key: '123'
      }
    })

    t.truthy(transporter)
  }
}

module.exports = new MailgunTransporterTest()
