'use strict'

const Uuid = require('uuid/v4')
const Queue = require('../../../queue')
const SqsClient = require('aws-sdk').SQS
const BaseTest = require('../../../base-test')
const SqsJob = require('../../../queue/jobs/sqs-job')

class SqsJobTest extends BaseTest {
  constructor () {
    super()

    Queue.addJob(TestingSqsJob)

    this.sqsClient = null

    this.baseUrl = 'https://sqs.region.amazonaws.com'
    this.account = 'supercharge'
    this.queueName = 'testing'
    this.prefix = `${this.baseUr}/${this.account}`
    this.queueUrl = `${this.prefix}/${this.queueName}`

    this.mockConfig = {
      queue: this.queueName,
      prefix: this.prefix
    }
    this.mockMessageId = Uuid()
    this.mockReceiptHandle = Uuid()
    this.mockData = { name: 'Supercharge' }
    this.mockPayload = JSON.stringify({ displayName: 'TestingSqsJob', data: this.mockData })

    this.mockChangeMessageVisibility = {
      promise: () => {
        return {
          QueueUrl: this.queueUrl,
          VisibilityTimeout: 12345,
          ReceiptHandle: this.mockReceiptHandle
        }
      }
    }

    this.mockDeleteMessage = {
      promise: () => {
        return {
          QueueUrl: this.queueUrl,
          ReceiptHandle: this.mockReceiptHandle
        }
      }
    }

    this.mockJob = {
      MD5OfBody: Uuid(),
      MessageId: this.mockMessageId,
      Body: this.mockPayload,
      ReceiptHandle: this.mockReceiptHandle,
      Attributes: { ApproximateReceiveCount: 1221 }
    }
  }

  _createJob () {
    return new SqsJob(this.mockJob, this.sqsClient, this.queueUrl)
  }

  before () {
    this.sqsClient = new SqsClient()
  }

  async fireAJobCallsHandleMethodAndDeletesJobFromQueue (t) {
    const job = this._createJob()
    const stub = this.stub(job.client, 'deleteMessage').returns(this.mockDeleteMessage)

    await job.fire()

    t.true(stub.called)

    stub.restore()
  }

  async serialReleaseJobBack (t) {
    const job = this._createJob()
    const stub = this.stub(job.client, 'changeMessageVisibility').returns(this.mockChangeMessageVisibility)

    await job.releaseBack(1)

    t.true(stub.called)

    stub.restore()
  }

  async serialReleaseJobBackWithDefaultTimeout (t) {
    const job = this._createJob()
    const mock = this.mock(job.client)

    mock
      .expects('changeMessageVisibility')
      .once()
      .withArgs({
        VisibilityTimeout: 0,
        QueueUrl: this.queueUrl,
        ReceiptHandle: this.mockReceiptHandle
      })
      .returns(this.mockChangeMessageVisibility)

    await job.releaseBack()

    mock.restore()
    mock.verify()

    t.pass()
  }

  async attempts (t) {
    const job = this._createJob()
    t.is(job.attempts(), 1221)
  }

  async serialMessageId (t) {
    const job = this._createJob()
    t.is(job.id(), this.mockMessageId)
  }
}

class TestingSqsJob {
  async handle () {
    //
  }
}

module.exports = new SqsJobTest()
