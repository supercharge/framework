'use strict'

const Sinon = require('sinon')
const { test } = require('uvu')
const { expect } = require('expect')
const { Manager } = require('../dist')

test('fails for missing createDriver function', () => {
  class TestManager extends Manager {
    defaultDriver () {
      return 'test'
    }

    handle () {
      return this.driver()
    }
  }

  const manager = new TestManager(new App())

  expect(() => manager.handle()).toThrow('Unsupported driver "test".')
})

test('fails to access the config for missing app instance', () => {
  class TestManager extends Manager {
    defaultDriver () {
      return 'test'
    }

    createTestDriver () {
      class TestDriver { }

      return new TestDriver(this.config())
    }

    handle () {
      return this.driver()
    }
  }

  const manager = new TestManager(null)

  expect(() => manager.handle()).toThrow()
})

test('keeps the app instance', () => {
  class TestManager extends Manager {
    defaultDriver () {
      return 'test'
    }
  }

  const manager = new TestManager(new App())
  expect(manager.app).toBeDefined()
})

test('creates a driver instance', () => {
  class TestManager extends Manager {
    defaultDriver () {
      return 'test'
    }

    createTestDriver () {
      class TestDriver {
        handle () {
          return 'works'
        }
      }

      return new TestDriver(this.config())
    }
  }

  const manager = new TestManager(new App())
  expect(manager.driver().handle()).toEqual('works')
})

test('creates a driver instance by name', () => {
  class TestManager extends Manager {
    defaultDriver () {
      return 'test'
    }

    createSuperchargeDriver () {
      class TestDriver {
        handle () {
          return 'Supercharged!'
        }
      }

      return new TestDriver(this.config())
    }
  }

  const manager = new TestManager(new App())
  expect(manager.driver('supercharge').handle()).toEqual('Supercharged!')
})

test('reuses created driver instance', () => {
  class TestManager extends Manager {
    defaultDriver () {
      return 'test'
    }

    createTestDriver () {
      class TestDriver {
        handle () {
          return 'works'
        }
      }

      return new TestDriver(this.config())
    }
  }

  const manager = new TestManager(new App())
  const spy = Sinon.spy(manager, 'createDriver')

  expect(manager.has('test')).toBe(false)
  expect(manager.driver().handle()).toEqual('works')
  expect(manager.has('test')).toBe(true)
  expect(manager.driver().handle()).toEqual('works')
  expect(spy.calledOnce).toBe(true)
})

test('ensures driver config', () => {
  class TestManager extends Manager {
    defaultDriver () {
      return 'test'
    }

    createSuperchargeDriver () {
      this.ensureConfig('config.shouldBePresent')

      class TestDriver {
        handle () {
          return 'Supercharged!'
        }
      }

      return new TestDriver(this.config())
    }
  }

  const manager = new TestManager(new App())
  expect(manager.driver('supercharge').handle()).toEqual('Supercharged!')
})

class App {
  config () {
    return {
      get (key) {
        return key || ''
      },

      ensure (key) {
        return !!this.get(key)
      }
    }
  }
}

test.run()
