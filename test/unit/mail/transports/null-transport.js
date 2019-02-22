'use strict'

const BaseTest = require('../../../../base-test')
const NullTransporter = require('../../../../src/mailer/transports/null')

class NullTransporterTest extends BaseTest {
  async createNullTransporter (t) {
    const transporter = new NullTransporter()
    t.truthy(transporter)
    t.is(transporter.sendMail(), undefined)
  }
}

module.exports = new NullTransporterTest()
