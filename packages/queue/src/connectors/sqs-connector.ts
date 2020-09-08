'use strict'

import { SqsQueue } from '../sqs-queue'
import { SQS, Credentials } from 'aws-sdk'
import { Queue } from '@supercharge/contracts'
import { ConnectorInterface } from './connector-interface'

export class SqsConnector implements ConnectorInterface {
  /**
   * Establish a queue connection.
   *
   * @param config
   *
   * @returns {Queue}
   */
  connect (config: any): Queue {
    const { queue, prefix } = config

    return new SqsQueue(
      this.createSqsClient(config), queue, prefix
    )
  }

  /**
   * Creates and returns an SQS client instance.
   *
   * @param config
   *
   * @returns {SQS}
   */
  createSqsClient (config: any): SQS {
    return new SQS(
      this.createConfiguration(config)
    )
  }

  /**
   * Composes and returns the AWS SQS configuration.
   *
   * @param {Object} config
   *
   * @returns {Object}
   */
  createConfiguration (config: any): object {
    return Object.assign({
      apiVersion: 'latest',
      httpOptions: {
        connectTimeout: 60 * 1000 // 1min
      },
      credentials: this.createCredentials(config)
    }, config)
  }

  /**
   * Create an AWS credentials instance based on the
   * configured access key, secret, and token.
   *
   * @returns {AWS.Credentials} AWS.Credentials
   */
  createCredentials (config: any): Credentials {
    const { key, secret, token } = config

    return new Credentials(key, secret, token)
  }
}
