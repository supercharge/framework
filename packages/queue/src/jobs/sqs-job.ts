'use strict'

import { Job } from './job'
import { SQS } from 'aws-sdk'
import { upon } from '@supercharge/goodies'
import { Message as SqsMessage, MessageSystemAttributeMap } from 'aws-sdk/clients/sqs'

export class SqsJob extends Job<SqsMessage> {
  /**
   * The SQS client instance.
   */
  private readonly sqs: SQS

  /**
   * The SQS queue url.
   */
  private readonly queueUrl: string

  constructor (job: SqsMessage, sqs: SQS, queueUrl: string) {
    super(job)

    this.sqs = sqs
    this.queueUrl = queueUrl
  }

  /**
   * Returns the job ID.
   *
   * @returns {String}
   */
  id (): string | undefined {
    return this.job.MessageId
  }

  /**
   * Returns the SQS receipt handle.
   *
   * @returns {String}
   */
  receiptHandle (): string {
    return this.job.ReceiptHandle ?? ''
  }

  /**
   * Returns the job’s data.
   *
   * @returns {*}
   */
  payload (): any {
    return upon(this.getParsedBody(), ({ data }) => {
      return data
    })
  }

  /**
   * Returns the job payload parsed to JavaScript.
   *
   * @returns {Object}
   */
  getParsedBody (): any {
    return JSON.parse(
      this.getRawBody() ?? ''
    )
  }

  /**
   * Returns the raw JSON job payload.
   *
   * @returns {JSON}
   */
  getRawBody (): string | undefined {
    return this.job.Body
  }

  /**
   * Returns the SQS attributes from the job.
   *
   * @returns {Object}
   */
  getAttributes (): MessageSystemAttributeMap | undefined {
    return this.job.Attributes
  }

  /**
   * Returns the job’s class name identifying
   * the job that handles the payload.
   *
   * @returns {String}
   */
  jobName (): string {
    return upon(this.getParsedBody(), ({ jobClassName }) => {
      return jobClassName
    })
  }

  /**
   * Returns the number of attempts for this job.
   *
   * @returns {Number}
   */
  attempts (): number {
    const attributes = this.getAttributes()

    return attributes
      ? parseInt(attributes.ApproximateReceiveCount)
      : 0
  }

  /**
   * Fire the job.
   */
  async fire (): Promise<void> {
    await super.fire()
    await this.delete()
  }

  /**
   * Release the job back to the queue.
   *
   * @param {Number} delay in seconds
   */
  async releaseBack (delay: number = 0): Promise<void> {
    await super.releaseBack(delay)

    await this.sqs.changeMessageVisibility({
      QueueUrl: this.queueUrl,
      VisibilityTimeout: delay,
      ReceiptHandle: this.receiptHandle()
    }).promise()
  }

  /**
   * Delete the job from the queue.
   */
  async delete (): Promise<void> {
    await super.delete()

    await this.sqs.deleteMessage({
      QueueUrl: this.queueUrl,
      ReceiptHandle: this.receiptHandle()
    }).promise()
  }
}
