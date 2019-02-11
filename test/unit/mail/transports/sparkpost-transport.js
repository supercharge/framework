'use strict'

const BaseTest = require('../../../../testing/base-test')
const SparkpostTransporter = require('../../../../mailer/transports/sparkpost')

class SparkpostTransporterTest extends BaseTest {
  async createSparkpostTransporter (t) {
    const transporter = new SparkpostTransporter({
      sparkPostApiKey: '123'
    })
    t.truthy(transporter)
  }
}

module.exports = new SparkpostTransporterTest()
