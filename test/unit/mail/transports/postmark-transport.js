'use strict'

const BaseTest = require('../../../../testing/base-test')
const PostmarkTransporter = require('../../../../mailer/transports/postmark')

class PostmarkTransporterTest extends BaseTest {
  async createPostmarkTransporter (t) {
    const transporter = new PostmarkTransporter({
      auth: {
        apiKey: '123'
      }
    })

    t.truthy(transporter)
  }
}

module.exports = new PostmarkTransporterTest()
