'use strict'

const BaseTest = require('../../../../../base-test')
const VerifyCsrf = require('../../../../../http/middleware/verify-csrf-token')

class CsrfMiddlewareTest extends BaseTest {
  async isExcluded (t) {
    const verifyCsrf = new VerifyCsrf()

    const stub = this.stub(verifyCsrf, 'exclude').get(() => {
      return ['/exclude']
    })

    const request = { path: '/exclude' }

    t.true(verifyCsrf.isExcluded(request))
    stub.restore()
  }

  async isNotExcluded (t) {
    const verifyCsrf = new VerifyCsrf()

    const stub = this.stub(verifyCsrf, 'exclude').get(() => {
      return ['/different-than-request.path']
    })

    const request = { path: '/not-excluded' }

    t.false(verifyCsrf.isExcluded(request))
    stub.restore()
  }
}

module.exports = new CsrfMiddlewareTest()
