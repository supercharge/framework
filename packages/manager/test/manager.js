'use strict'

const Sinon = require('sinon')
const { Manager } = require('../dist')

describe('Manager', () => {
  it('fails for missing createDriver function', () => {
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

  it('fails to access the config for missing app instance', () => {
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

  it('keeps the app instance', () => {
    class TestManager extends Manager {
      defaultDriver () {
        return 'test'
      }
    }

    const manager = new TestManager(new App())
    expect(manager.app).toBeDefined()
  })

  it('creates a driver instance', () => {
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

  it('creates a driver instance by name', () => {
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

  it('reuses created driver instance', () => {
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

    expect(manager.has('test')).toBeFalse()
    expect(manager.driver().handle()).toEqual('works')
    expect(manager.has('test')).toBeTrue()
    expect(manager.driver().handle()).toEqual('works')
    expect(spy.calledOnce).toBeTrue()
  })
})

class App {
  config () {
    return {
      get () {
        return ''
      }
    }
  }
}
