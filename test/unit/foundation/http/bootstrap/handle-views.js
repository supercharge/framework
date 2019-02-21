'use strict'

const Config = require('../../../../../config')
const BaseTest = require('../../../../../base-test')
const HandleViews = require('../../../../../src/foundation/http/bootstrap/handle-views')

class HandleViewsTest extends BaseTest {
  viewContextObject (t) {
    Config.set('app.name', 'Supercharge')

    const handler = new HandleViews()
    const request = { auth: { credentials: 'Marcus' } }

    t.deepEqual(handler.viewContext(request), {
      request,
      user: 'Marcus',
      title: 'Supercharge',
      description: undefined
    })
  }
}

module.exports = new HandleViewsTest()
