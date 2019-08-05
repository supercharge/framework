'use strict'

const SqsQueue = require('../sqs-queue')
const SqsClient = require('aws-sdk/clients/sqs')

class SqsDriver {
  async connect (config) {
    return new SqsQueue(
      new SqsClient(this.options(config))
    )
  }

  options (config) {
    return Object.assign(
      {
        apiVersion: 'latest',
        httpOptions: {
          connectTimeout: 60 * 1000
        }
      },
      config
    )
  }
}

module.exports = SqsDriver
