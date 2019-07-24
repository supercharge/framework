'use strict'

const BaseTest = require('../../../../base-test')
const MailgunTransporter = require('../../../../mailer/transports/mailgun')

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
