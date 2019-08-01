'use strict'

const BaseTest = require('../../../../base-test')

class CsrfHelperTest extends BaseTest {
  async insertsCsrfTokenValue (t) {
    const data = { _csrfToken: 'test-csrf' }

    const input = await this.render('<meta name="csrf-token" content="{{csrfToken}}">', data)

    t.true(input.includes('content="test-csrf"'))
  }

  async emptyStringForMissingCsrfTokenValue (t) {
    const input = await this.render('<meta name="csrf-token" content="{{csrfToken}}">', {})
    t.is(input, '<meta name="csrf-token" content="">')
  }
}

module.exports = new CsrfHelperTest()
