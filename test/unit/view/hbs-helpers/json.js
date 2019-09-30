'use strict'

const BaseTest = require('../../../../base-test')

class JsonHelperTest extends BaseTest {
  async jsonHelper (t) {
    const data = { name: 'Marcus' }
    const output = await this.render('{{json data}}', { data })
    t.is(output, JSON.stringify(data))
  }

  async jsonHelperNotPretty (t) {
    const data = { name: 'Marcus' }
    const output = await this.render('{{json data pretty=false}}', { data })
    t.is(output, JSON.stringify(data))
  }

  async jsonHelperPretty (t) {
    const data = { name: 'Marcus' }
    const output = await this.render('{{json data pretty=true}}', { data })
    t.is(output, JSON.stringify(data, null, 2))
  }
}

module.exports = new JsonHelperTest()
