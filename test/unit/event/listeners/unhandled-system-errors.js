'use strict'

const BaseTest = require('../../../../base-test')
const UnhandledRejectionListener = require('../../../../event/listeners/handle-system-exceptions')

class UnhandledSytemErrorsTest extends BaseTest {
  before () {
    this.stub(console, 'log')
    this.stub(process, 'exit')
  }

  alwaysAfter () {
    console.log.restore()
    process.exit.restore()
  }

  async serialNodeProcessHasListeners (t) {
    const listener = new UnhandledRejectionListener()

    listener.on().forEach(event => {
      t.not(process.listenerCount(event), 0)
    })
  }

  // async serialHandlesUnhandledSytemErrors (t) {
  //   const listener = new UnhandledRejectionListener()
  //   listener.listenForSystemErrors()

  //   const hadListeners = process.emit('unhandledRejection', 'Supererror')
  //   t.true(hadListeners)

  //   await new Promise(resolve => setTimeout(resolve, 100))

  //   this.sinon().assert.called(process.exit)
  //   this.sinon().assert.called(console.log)
  //   t.pass()
  // }
}

module.exports = new UnhandledSytemErrorsTest()
