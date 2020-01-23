'use strict'

const AWS = require('aws-sdk')
const SqsClient = AWS.SQS
const Uuid = require('uuid/v4')
const Queue = require('../../../queue')
const BaseTest = require('../../../base-test')
const SqsJob = require('../../../queue/jobs/sqs-job')
const SqsQueue = require('../../../queue/connections/sqs-queue')

class SqsQueueTest extends BaseTest {
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
    this.mockPayload = JSON.stringify({ name: 'TestingSqsJob', data: this.mockData })

    this.mockReceiveMessagesResult = {
      promise: () => {
        return {
          Messages: [
            {
              Body: this.mockPayload,
              MessageId: this.mockMessageId,
              ReceiptHandle: this.mockReceiptHandle
            }
          ]
        }
      }
    }

    this.mockReceiveEmptyMessagesResult = {
      promise: () => {
        return {
          Messages: []
        }
      }
    }

    this.mockSendMessageResult = {
      promise: () => {
        return {
          Body: this.mockPayload,
          MessageId: this.mockMessageId,
          ReceiptHandle: this.mockReceiptHandle,
          Attributes: { ApproximateReceiveCount: 1 }
        }
      }
    }

    this.mockQueueAttributesResult = {
      promise: () => {
        return {
          Attributes: { ApproximateNumberOfMessages: 1 }
        }
      }
    }

    this.mockQueuePurgeResult = {
      promise: () => { }
    }
  }

  beforeEach () {
    this.sqsClient = new SqsClient()
  }

  async connect (t) {
    const queue = new SqsQueue(this.mockConfig)
    t.is(queue, await queue.connect())
  }

  async disconnect (t) {
    const queue = new SqsQueue(this.mockConfig)
    t.is(await queue.disconnect(), undefined)
  }

  async push (t) {
    const queue = new SqsQueue(this.mockConfig)
    queue.client = this.sqsClient

    const sendMessageStub = this.stub(queue.client, 'sendMessage').returns(this.mockSendMessageResult)

    t.is(await queue.push(TestingSqsJob), this.mockMessageId)

    sendMessageStub.restore()
  }

  async pop (t) {
    const queue = new SqsQueue(this.mockConfig)
    queue.client = this.sqsClient

    const receiveMessageStub = this.stub(queue.client, 'receiveMessage').returns(this.mockReceiveMessagesResult)
    t.true(await queue.pop() instanceof SqsJob)
    t.true(receiveMessageStub.calledOnce)

    receiveMessageStub.restore()
  }

  async serialPopNull (t) {
    const queue = new SqsQueue(this.mockConfig)
    queue.client = this.sqsClient

    const receiveMessageStub = this.stub(queue.client, 'receiveMessage').returns(this.mockReceiveEmptyMessagesResult)
    t.is(await queue.pop(), null)
    t.true(receiveMessageStub.calledOnce)

    receiveMessageStub.restore()
  }

  async size (t) {
    const queue = new SqsQueue(this.mockConfig)
    queue.client = this.sqsClient
    const getQueueAttributesStub = this.stub(queue.client, 'getQueueAttributes').returns(this.mockQueueAttributesResult)

    t.is(await queue.size(), 1)

    getQueueAttributesStub.restore()
  }

  async clear (t) {
    const queue = new SqsQueue(this.mockConfig)
    queue.client = this.sqsClient
    const purgeQueueStub = this.stub(queue.client, 'purgeQueue').returns(this.mockQueuePurgeResult)

    await queue.clear()
    t.true(purgeQueueStub.calledOnce)

    purgeQueueStub.restore()
  }
}

class TestingSqsJob {
  constructor (test) {
    this.test = test
  }

  async handle () {
    this.test._setSucceeded()
  }
}

module.exports = new SqsQueueTest()
