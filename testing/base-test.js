'use strict'

const Many = require('extends-classes')
const Http = require('./concerns/makes-http-requests')
const RenderViews = require('./concerns/render-views')
const MocksConsole = require('./concerns/mocks-console')
const TestHelpers = require('./concerns/provides-test-helpers')
const TestingHooks = require('./concerns/provides-testing-hooks')
const MocksStubsSpies = require('./concerns/creates-stubs-mocks-spies')

/**
 * This is the base test class each test should
 * implement. It provides reusable utilities
 * to quickly create powerful test cases.
 */
class BaseTest extends Many(Http, MocksStubsSpies, MocksConsole, RenderViews, TestHelpers, TestingHooks) {
  /**
   * Create a new test case instance.
   */
  constructor () {
    super()

    const AvaRunner = require('./drivers/ava')
    const runner = new AvaRunner(this)
    runner.registerTests()
  }

  /**
   * Prints out the method name that
   * is unavailable on a class.
   *
   * @param {String} method
   */
  __call (method, [...args]) {
    console.log(`'${method}()' is missing in your test class!`, args)
  }

  /**
   * Called by AVA, not used by us yet.
   */
  then () { }
}

module.exports = BaseTest
