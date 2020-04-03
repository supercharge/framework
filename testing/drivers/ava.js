'use strict'

const Ava = require('ava')
const Database = require('../../database')

class AvaTesting {
  constructor (test) {
    this.test = test
  }

  /**
   * Maps the class methods to test methods. Each method
   * is checked for being a private class method, a
   * test to skip, an actual test, and many more.
   */
  registerTests () {
    this.assignHooks()

    this.test.classMethods()
      .filter(method => this.test.includes(method))
      .forEach(methodName => this.createTest(methodName))
  }

  /**
   * Register hooks to the test runner.
   */
  assignHooks () {
    this.assignBeforeHook()
    this.assignBeforeEachHook()
    this.assignAfterHook()
    this.assignAfterEachHook()
    this.assignAlwaysAfterHook()
    this.assignAlwaysAfterEachHook()
  }

  /**
   * Register the `before` hook.
   */
  assignBeforeHook () {
    Ava.before(`${this.constructor.name}: before`, async t => {
      return this.test.before(t)
    })
  }

  /**
   * Register the `beforeEach` hook.
   */
  assignBeforeEachHook () {
    Ava.beforeEach(`${this.constructor.name}: beforeEach`, async t => {
      return this.test.beforeEach(t)
    })
  }

  /**
   * Register the `after` hook.
   */
  assignAfterHook () {
    Ava.after(`${this.constructor.name}: after`, async t => {
      return this.test.after(t)
    })
  }

  /**
   * Register the `afterEach` hook.
   */
  assignAfterEachHook () {
    Ava.afterEach(`${this.constructor.name}: afterEach`, async t => {
      return this.test.afterEach(t)
    })
  }

  /**
   * Register the `after.always` hook.
   */
  assignAlwaysAfterHook () {
    Ava.after.always(`${this.constructor.name}: after.always`, async t => {
      await this.test.alwaysAfter(t)

      // closing the database connection must be the last action
      await Database.close()
    })
  }

  /**
   * Register the `afterEach.always` hook.
   */
  assignAlwaysAfterEachHook () {
    Ava.afterEach.always(`${this.constructor.name}: afterEach.always`, async t => {
      return this.test.alwaysAfterEach(t)
    })
  }

  /**
   * Creates a test from the class method.
   *
   * @param {String} methodName
   */
  createTest (methodName) {
    /**
     * Ignore all methods starting with an underscore.
     */
    if (methodName.startsWith('_')) {
      return
    }

    /**
     * Skip methods starting with "skip*".
     */
    if (methodName.startsWith('skip')) {
      return this.skip(methodName)
    }

    /**
     * Mark method as TODO when starting with "todo*".
     */
    if (methodName.startsWith('todo')) {
      return this.todo(methodName)
    }

    /**
     * Mark method as the only one to execute.
     */
    if (methodName.startsWith('only')) {
      return this.only(methodName)
    }

    /**
     * Mark method as failing.
     */
    if (methodName.startsWith('failing')) {
      return this.failing(methodName)
    }

    /**
     * Serial execution for this method.
     */
    if (methodName.startsWith('serial')) {
      return this.serial(methodName)
    }

    /**
     * Create a test that can run in a worker.
     */
    this.addTest(methodName)
  }

  /**
   * Create a test based on the class method’s implementation.
   *
   * @param {String} name
   */
  addTest (name) {
    Ava(name, async t => {
      return this.test[name](t)
    })
  }

  /**
   * Create a test that is marked as todo.
   * @param {String} name
   */
  todo (name) {
    Ava.todo(name)
  }

  /**
   * Create a test that will be skipped
   * during the test run.
   *
   * @param {String} name
   */
  skip (name) {
    /* istanbul ignore next */
    Ava.skip(name, async t => this.test[name](t))
  }

  /**
   * Create a test method where only this
   * method runs and the other methods
   * in this file are ignored.
   *
   * @param {String} name
   */
  only (name) {
    Ava.only(name, async t => this.test[name](t))
  }

  /**
   * Create a test method that runs in sequence.
   *
   * @param {String} name
   */
  serial (name) {
    Ava.serial(name, async t => this.test[name](t))
  }

  /**
   * Create test method that is expected to fail.
   *
   * @param {String} name
   */
  failing (name) {
    /* istanbul ignore next */
    Ava.failing(name, async t => this.test[name](t))
  }
}

module.exports = AvaTesting
