'use strict'

const BaseTest = require('../../../../base-test')

class CreatesStubsMocksSpiesTest extends BaseTest {
  async serialMock (t) {
    const api = { method: () => {} }
    api.method()

    const mocked = this.mock(api)
    mocked.expects('method').once()
    api.method()

    t.true(mocked.verify())

    mocked.restore()
  }
}

module.exports = new CreatesStubsMocksSpiesTest()
