'use strict'

const Path = require('path')
const Queue = require('../../../queue')
const Config = require('../../../config')
const Helper = require('../../../helper')
const BaseTest = require('../../../base-test')
const Application = require('../../../foundation/application')
const QueueBootstrapper = require('../../../queue/bootstrapper')

class QueueBootstrapperTest extends BaseTest {
  async before () {
    Config.set('queue.driver', 'sync')
  }

  async serialNoJobsToLoad (t) {
    Helper.setAppRoot(Path.resolve(__dirname, 'fixtures/non-existent/job-folder'))

    const app = new Application()
    await app.register(QueueBootstrapper)

    t.is(Queue.jobs.size, 0)
  }

  async serialLoadJobs (t) {
    Helper.setAppRoot(Path.resolve(__dirname, 'fixtures'))

    const app = new Application()
    await app.register(QueueBootstrapper)

    t.is(Queue.jobs.size, 1)
  }
}

module.exports = new QueueBootstrapperTest()
