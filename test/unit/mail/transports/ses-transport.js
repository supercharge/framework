'use strict'

const BaseTest = require('../../../../base-test')
const SesTransporter = require('../../../../src/mailer/transports/ses')

class SesTransporterTest extends BaseTest {
  async createSesTransporter (t) {
    const transporter = new SesTransporter()
    t.truthy(transporter)
  }
}

module.exports = new SesTransporterTest()
