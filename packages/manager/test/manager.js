'use strict'

const Sinon = require('sinon')
const Lab = require('@hapi/lab')
const { Manager } = require('..')
const { expect } = require('@hapi/code')

const { describe, it } = (exports.lab = Lab.script())

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

    const manager = new TestManager(null).setApp(new App())

    expect(() => manager.handle()).to.throw('Unsupported driver "test".')
  })

  it('keeps the app instance', () => {
    class TestManager extends Manager {
      defaultDriver () {
        return 'test'
      }
    }

    const manager = new TestManager(new App())
    expect(manager.app).to.exist()
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
    expect(manager.driver().handle()).to.equal('works')
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
    expect(manager.driver('supercharge').handle()).to.equal('Supercharged!')
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

    expect(manager.has('test')).to.be.false()
    expect(manager.driver().handle()).to.equal('works')
    expect(manager.has('test')).to.be.true()
    expect(manager.driver().handle()).to.equal('works')
    expect(spy.calledOnce).to.be.true()
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
