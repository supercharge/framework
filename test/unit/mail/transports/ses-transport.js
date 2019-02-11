'use strict'

const BaseTest = require('../../../../testing/base-test')
const SesTransporter = require('../../../../mailer/transports/ses')

class SesTransporterTest extends BaseTest {
  async createSesTransporter (t) {
    const transporter = new SesTransporter()
    t.truthy(transporter)
  }
}

module.exports = new SesTransporterTest()
