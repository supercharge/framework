'use strict'

const BaseTest = require('@root/testing/base-test')
const { Transports } = require('@root/mail')
const SesTransporter = Transports['ses']

class SesTransporterTest extends BaseTest {
  async createSesTransporter (t) {
    const transporter = new SesTransporter()
    t.truthy(transporter)
  }
}

module.exports = new SesTransporterTest()
