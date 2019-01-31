'use strict'

const BaseTest = require('@root/testing/base-test')
const { Transports } = require('@root/mail')
const SparkpostTransporter = Transports['sparkpost']

class SparkpostTransporterTest extends BaseTest {
  async createSparkpostTransporter (t) {
    const transporter = new SparkpostTransporter({
      sparkPostApiKey: '123'
    })
    t.truthy(transporter)
  }
}

module.exports = new SparkpostTransporterTest()
