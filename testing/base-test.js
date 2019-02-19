'use strict'

const Many = require('extends-classes')
const Http = require('./concerns/makes-http-requests')
const RenderViews = require('./concerns/render-views')
const MocksConsole = require('./concerns/mocks-console')
const TestHelpers = require('./concerns/provides-test-helpers')
const MocksStubsSpies = require('./concerns/creates-stubs-mocks-spies')
const TestRunner = require(`./drivers/ava`)

/**
 * This is the base test class each test should
 * implement. It provides reusable utilities
 * to quickly create powerful test cases.
 */
class BaseTest extends Many(Http, MocksStubsSpies, MocksConsole, RenderViews, TestRunner, TestHelpers) {
  /**
   * Create a new test case instance.
   */
  constructor (options) {
    super(options)

    this.registerTests()
  }

  /**
   * Prints out the method name that
   * is unavailable on a class.
   *
   * @param {String} method
   */
  __call (method) {
    console.log(`'${method}()' is missing in your test class!`)
  }
}

module.exports = BaseTest
