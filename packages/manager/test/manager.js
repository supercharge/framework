
import Sinon from 'sinon'
import { test } from 'uvu'
import { expect } from 'expect'
import { Manager } from '../dist/index.js'

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

  expect(() => manager.handle()).toThrow(
    'Unsupported driver "test". "TestManager" does not implement the "createTestDriver" method'
  )
})

test('fails to access the config for missing app instance', () => {
  class TestManager extends Manager {
    defaultDriver () {
      return 'test'
    }

    createTestDriver () {
      this.app.config()
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

      return new TestDriver()
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

      return new TestDriver()
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

      return new TestDriver()
    }
  }

  const manager = new TestManager(new App())
  const spy = Sinon.spy(manager, 'createDriver')

  expect(manager.isCached('test')).toBe(false)
  expect(manager.driver().handle()).toEqual('works')
  expect(manager.isCached('test')).toBe(true)
  expect(manager.driver().handle()).toEqual('works')
  expect(spy.calledOnce).toBe(true)
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
