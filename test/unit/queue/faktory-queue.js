'use strict'

const Queue = require('../../../queue')
const BaseTest = require('../../../base-test')
const FaktoryJob = require('../../../queue/jobs/faktory-job')
const FaktoryMockServer = require('./fixtures/faktory-server')
const FaktoryQueue = require('../../../queue/connections/faktory-queue')

class FaktoryQueueTest extends BaseTest {
  constructor () {
    super()

    Queue.addJob(TestingFaktoryJob)

    this.queue = 'supercharge-testing'
    this.faktoryServer = new FaktoryMockServer()

    this.mockPayload = { name: 'Marcus' }

    this.mockPushResponse = { jid: '1234', jobtype: 'TestingFaktoryJob' }
  }

  async before () {
    await this.faktoryServer.start()

    this.config = {
      queue: this.queue,
      port: this.faktoryServer.port()
    }
  }

  async alwaysAfter () {
    await this.faktoryServer.stop()
  }

  async serialConnect (t) {
    const queue = new FaktoryQueue(this.config)
    t.is(queue, await queue.connect())

    t.pass()
  }

  async serialDisconnect (t) {
    const queue = new FaktoryQueue(this.config)
    await queue.connect()

    t.is(await queue.disconnect(), undefined)
  }

  async serialPush (t) {
    const queue = new FaktoryQueue(this.config)
    await queue.connect()

    const mock = this.mock(queue.client)

    mock
      .expects('push')
      .once()
      .withArgs({
        queue: this.queue,
        custom: { attempts: 0 },
        args: [this.mockPayload],
        jobtype: 'TestingFaktoryJob'
      })
      .returns(this.mockPushResponse.jid)

    const id = await queue.push(TestingFaktoryJob, this.mockPayload)

    mock.restore()
    mock.verify()

    t.is(id, this.mockPushResponse.jid)
  }

  // async pop (t) {
  //   const queue = new FaktoryQueue(this.mockConfig)
  //   queue.client = this.sqsClient

  //   const receiveMessageStub = this.stub(queue.client, 'receiveMessage').returns(this.mockReceiveMessagesResult)
  //   t.true(await queue.pop() instanceof FaktoryJob)
  //   t.true(receiveMessageStub.calledOnce)

  //   receiveMessageStub.restore()
  // }

  // async serialPopNull (t) {
  //   const queue = new FaktoryQueue(this.mockConfig)
  //   queue.client = this.sqsClient

  //   const receiveMessageStub = this.stub(queue.client, 'receiveMessage').returns(this.mockReceiveEmptyMessagesResult)
  //   t.is(await queue.pop(), null)
  //   t.true(receiveMessageStub.calledOnce)

  //   receiveMessageStub.restore()
  // }

  // async size (t) {
  //   const queue = new FaktoryQueue(this.mockConfig)
  //   queue.client = this.sqsClient
  //   const getQueueAttributesStub = this.stub(queue.client, 'getQueueAttributes').returns(this.mockQueueAttributesResult)

  //   t.is(await queue.size(), 1)

  //   getQueueAttributesStub.restore()
  // }

  // async resolvesQueueUrl (t) {
  //   const queue = new FaktoryQueue(this.mockConfig)
  //   queue.client = this.sqsClient

  //   t.is(queue.queueUrlFor(), this.queueUrl)
  //   t.is(queue.queueUrlFor('test'), `${this.prefix}/test`)
  // }
}

class TestingFaktoryJob {
  constructor (test) {
    this.test = test
  }

  async handle () {
    this.test._setSucceeded()
  }
}

module.exports = new FaktoryQueueTest()
