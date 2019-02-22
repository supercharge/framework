'use strict'

const Path = require('path')
const Helper = require('../../../helper')
const BaseTest = require('../../../base-test')

class HelperTest extends BaseTest {
  beforeEach ({ context }) {
    this.appRoot = Path.resolve(__dirname)
    Helper.setAppRoot(this.appRoot)
    context.helper = Helper
  }

  rootPath (t) {
    t.deepEqual(t.context.helper.appRoot(), Path.resolve(__dirname))
  }

  rootPathFromCwd (t) {
    Helper.setAppRoot(undefined)
    t.deepEqual(Helper.appRoot(), process.cwd())
    Helper.setAppRoot(this.appRoot)
  }

  resourcePath (t) {
    t.deepEqual(t.context.helper.resourcePath(), Path.resolve(__dirname, 'resources'))
  }

  viewsPath (t) {
    t.deepEqual(t.context.helper.viewsPath(), Path.resolve(__dirname, 'resources/views'))
  }

  storagePath (t) {
    t.deepEqual(t.context.helper.storagePath(), Path.resolve(__dirname, 'storage'))
  }

  modelsPath (t) {
    t.deepEqual(t.context.helper.modelsPath(), Path.resolve(__dirname, 'app/models'))
  }

  routesPath (t) {
    t.deepEqual(t.context.helper.routesPath(), Path.resolve(__dirname, 'app/routes'))
  }

  middlewarePath (t) {
    t.deepEqual(t.context.helper.middlewarePath(), Path.resolve(__dirname, 'app/middleware'))
  }

  strategiesPath (t) {
    t.deepEqual(t.context.helper.strategiesPath(), Path.resolve(__dirname, 'app/auth/strategies'))
  }

  eventsPath (t) {
    t.deepEqual(t.context.helper.eventsPath(), Path.resolve(__dirname, 'app/events'))
  }

  listenersPath (t) {
    t.deepEqual(t.context.helper.listenersPath(), Path.resolve(__dirname, 'app/listeners'))
  }

  mailsPath (t) {
    t.deepEqual(t.context.helper.mailsPath(), Path.resolve(__dirname, 'app/mails'))
  }
}

module.exports = new HelperTest()
