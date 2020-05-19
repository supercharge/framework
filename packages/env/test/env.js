'use strict'

const Env = require('..')
const Path = require('path')
const Lab = require('@hapi/lab')
const { expect } = require('@hapi/code')
const Bootstrapper = require('../bootstrapper')

const { describe, it, before } = exports.lab = Lab.script()

describe('Env', () => {
  before(async () => {
    await new Bootstrapper().boot(new App())
  })

  it('throws for non-existent .env file', async () => {
    await expect(
      new Bootstrapper().boot(new NoEnvironmentFileApp())
    ).to.reject()
  })

  it('has environment variables after bootstrapper loaded', async () => {
    expect(Env.get('NAME')).to.exist()
  })

  it('get', async () => {
    Env.set('TEST_VAR', 1234)
    expect(Env.get('TEST_VAR')).to.equal('1234')
  })

  it('get default', async () => {
    expect(
      Env.get('UNAVAILABLE_ENV_VAR', 'defaultValue')
    ).to.equal('defaultValue')
  })

  it('getOrFail', async () => {
    expect(() => Env.getOrFail()).to.throw()
    const error = expect(() => Env.getOrFail(null)).to.throw()
    expect(error.message).to.include('Missing environment variable')

    Env.set('UNDEFINED', undefined)
    expect(() => Env.getOrFail('UNDEFINED')).to.throw()

    Env.set('DB', null)
    expect(() => Env.getOrFail('DB')).to.throw()

    Env.set('TIMEOUT', 20)
    expect(Env.getOrFail('TIMEOUT')).to.equal('20')

    Env.set('FALSE', false)
    expect(Env.getOrFail('FALSE')).to.equal('false')

    Env.set('USER', 'Marcus')
    expect(Env.getOrFail('USER')).to.equal('Marcus')
  })

  it('set', async () => {
    Env.set('Supercharge_TEMP', 'temp-value')
    expect(Env.get('Supercharge_TEMP')).to.equal('temp-value')
    delete process.env.Supercharge_TEMP
  })

  it('is production', async () => {
    process.env.NODE_ENV = 'not-production'
    expect(Env.isProduction()).to.be.false()

    process.env.NODE_ENV = 'production'
    expect(Env.isProduction()).to.be.true()
  })

  it('is testing', async () => {
    process.env.NODE_ENV = 'not-testing'
    expect(Env.isTesting()).to.be.false()

    process.env.NODE_ENV = 'testing'
    expect(Env.isTesting()).to.be.true()
  })

  it('is environment', async () => {
    expect(Env.is('local')).to.be.false()

    process.env.NODE_ENV = 'LOCAL'
    expect(Env.is('local')).to.be.true()
  })
})

class App {
  environmentFile () {
    return Path.resolve(__dirname, 'fixtures/secrets.env')
  }
}

class NoEnvironmentFileApp {
  environmentFile () {
    return Path.resolve(__dirname, 'fixtures/not-existent-file.env')
  }
}

// async getOrFail (t) {
//   const env = new Env.constructor()
//   t.throws(() => env.getOrFail())
//   const error = t.throws(() => env.getOrFail(null))
//   t.true(error.message.includes('Missing environment variable'))

//   env.set('UNDEFINED', undefined)
//   t.throws(() => env.getOrFail('UNDEFINED'))

//   env.set('DB', null)
//   t.throws(() => env.getOrFail('DB'))

//   env.set('TIMEOUT', 20)
//   t.is(env.getOrFail('TIMEOUT'), '20')

//   env.set('FALSE', false)
//   t.is(env.getOrFail('FALSE'), 'false')

//   env.set('USER', 'Marcus')
//   t.is(env.getOrFail('USER'), 'Marcus')
// }
