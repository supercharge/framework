'use strict'

import { SQS } from 'aws-sdk'
import Str from '@supercharge/strings'
import { SqsJob } from './jobs/sqs-job'
import { Job, Queue as QueueContract } from '@supercharge/contracts'

export class SqsQueue implements QueueContract {
  /**
   * The SQS client instance.
   */
  private readonly client: SQS

  /**
   * The name of the default queue.
   */
  private readonly prefix: string

  /**
   * The name of the default queue.
   */
  private readonly default: string

  /**
   * Create a new SQS queu instance.
   * @param client
   * @param config
   */
  constructor (client: SQS, defaultqueue: string, prefix: string) {
    this.client = client
    this.prefix = prefix
    this.default = defaultqueue
  }

  /**
   * Push a new job onto the queue.
   *
   * @param {String} jobName
   * @param {*} data
   * @param {String} queue
   *
   * @returns {String|undefined} the job ID
   */
  async push (jobName: string, data: any, queue?: string): Promise<any> {
    const response = await this.client.sendMessage({
      QueueUrl: this.queueUrlFor(queue),
      MessageBody: this.createPayload(jobName, data)
    }).promise()

    return response.MessageId
  }

  /**
   * Retrieve the next job from the queue.
   *
   * @param  {String} queue
   *
   * @returns {Job}
   */
  async pop (queue?: string): Promise<Job | undefined> {
    const { Messages: messages } = await this.client.receiveMessage({
      QueueUrl: this.queueUrlFor(queue),
      AttributeNames: ['ApproximateReceiveCount']
    }).promise()

    if (messages) {
      return new SqsJob(messages[0], this.client, this.queueUrlFor(queue))
    }
  }

  /**
   * Returns number of jobs on the given `queue`.
   *
   * @param  {String} queue
   *
   * @returns {Number}
   */
  async size (queue?: string): Promise<number> {
    const response = await this.client.getQueueAttributes({
      QueueUrl: this.queueUrlFor(queue),
      AttributeNames: ['ApproximateNumberOfMessages']
    }).promise()

    return response.Attributes
      ? parseInt(response.Attributes.ApproximateNumberOfMessages)
      : 0
  }

  /**
   * Clear all jobs from the given `queue`.
   *
   * @param {String} queue
   */
  async clear (queue?: string): Promise<void> {
    await this.client.purgeQueue({
      QueueUrl: this.queueUrlFor(queue)
    }).promise()
  }

  /**
   * Compose the queue URL for the given `queue` or use the default queue.
   *
   * @param {String} queue
   *
   * @returns {String}
   */
  queueUrlFor (queue?: string): string {
    return Str(this.prefix)
      .rtrim('/')
      .concat('/', queue ?? this.default)
      .get()
  }

  /**
   * Returns the queue job’s JSON payload based on the job name and data.
   *
   * @param {String} jobName
   * @param {*} data
   */
  createPayload (jobName: string, data: any): string {
    return JSON.stringify({ jobClassName: jobName, data })
  }
}
