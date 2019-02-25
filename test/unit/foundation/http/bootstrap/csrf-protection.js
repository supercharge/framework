'use strict'

const BaseTest = require('../../../../../base-test')
const HttpKernel = require('../../../../../src/foundation/http/kernel')
const Application = require('../../../../../src/foundation/application')
const CsrfProtection = require('../../../../../src/foundation/http/bootstrap/csrf-protection')

class LoadRoutesTest extends BaseTest {
  async doesNotRegisterCsrfProtection (t) {
    const server = new HttpKernel(new Application()).createServer()

    const handler = new CsrfProtection(new Application())
    await handler.extends(server)

    t.falsy(server.registrations['crumb'])
  }

  async registersCsrfProtection (t) {
    const app = new Application()
    const stub = this.stub(app, 'isRunningTests').returns(false)

    const server = new HttpKernel().createServer()

    const handler = new CsrfProtection(app)
    await handler.extends(server)

    await server.initialize()

    stub.restore()

    t.truthy(server.registrations['crumb'])
  }
}

module.exports = new LoadRoutesTest()
