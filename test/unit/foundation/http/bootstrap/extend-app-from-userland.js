'use strict'

const Path = require('path')
const Helper = require('../../../../../helper')
const BaseTest = require('../../../../../testing/base-test')
const ExtendFromUserland = require('../../../../../foundation/http/bootstrap/extend-app-from-userland')

class ExtendAppFromUserlandTest extends BaseTest {
  async serialExtendFromUserland (t) {
    Helper.setAppRoot(Path.resolve(__dirname, 'fixtures'))

    const server = { name: '' }

    const handler = new ExtendFromUserland()
    await handler.extends(server)

    t.deepEqual(server, { name: 'Supercharge' })
  }

  async serialDoNotExtendWithMissingFile (t) {
    Helper.setAppRoot(__dirname)

    const server = { name: '' }

    const handler = new ExtendFromUserland()
    await handler.extends(server)

    t.deepEqual(server, { name: '' })
  }
}

module.exports = new ExtendAppFromUserlandTest()
