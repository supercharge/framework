'use strict'

class TestingLifecycleHooks {
  /**
   * Run actions before all test cases
   * in the test class. This method
   * runs before `beforeEach`.
   */
  async before () {}

  /**
   * Run actions before each test case
   * in the test class.
   */
  async beforeEach () {}

  /**
   * Run actions after all test cases
   * in the test class. This method
   * runs after `afterEach`.
   */
  async after () {}

  /**
   * Run actions after each test case
   * in the test class.
   */
  async afterEach () {}

  /**
   * This methods always runs after
   * the test cases, even if the
   * tests fail.
   */
  async alwaysAfter () {}

  /**
   * This methods always runs after
   * each of the test cases, even
   * if the tests fail.
   */
  async alwaysAfterEach () {}

  /**
   * Returns all methods from the test class.
   */
  classMethods () {
    return Object.getOwnPropertyNames(Object.getPrototypeOf(this))
  }

  /**
   * Determine whether the given method should
   * be excluded as a test case.
   *
   * @param {String} methodName
   */
  includes (methodName) {
    return !this.methodsToSkip().includes(methodName)
  }

  /**
   * A list of methods that should not be
   * assigned as test cases.
   */
  methodsToSkip () {
    return [
      'constructor',
      'before',
      'beforeEach',
      'after',
      'afterEach',
      'alwaysAfter',
      'alwaysAfterEach'
    ]
  }
}

module.exports = TestingLifecycleHooks
