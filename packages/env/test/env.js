'use strict'

const Path = require('path')
const { Env, EnvBootstrapper } = require('../dist')

describe('Env', () => {
  beforeAll(async () => {
    await new EnvBootstrapper().boot(new App())
  })

  it('throws for non-existent .env file', async () => {
    await expect(
      new EnvBootstrapper().boot(new NoEnvironmentFileApp())
    ).toReject()
  })

  it('has environment variables after bootstrapper loaded', async () => {
    expect(Env.get('NAME')).toBeDefined()
  })

  it('get', async () => {
    Env.set('TEST_VAR', 1234)
    expect(Env.get('TEST_VAR')).toEqual('1234')
  })

  it('get default', async () => {
    expect(
      Env.get('UNAVAILABLE_ENV_VAR', 'defaultValue')
    ).toEqual('defaultValue')
  })

  it('getOrFail', async () => {
    expect(() => Env.getOrFail()).toThrow()
    expect(() => Env.getOrFail(null)).toThrow('Missing environment variable')

    Env.set('UNDEFINED', undefined)
    expect(() => Env.getOrFail('UNDEFINED')).toThrow()

    Env.set('DB', null)
    expect(() => Env.getOrFail('DB')).toThrow()

    Env.set('TIMEOUT', 20)
    expect(Env.getOrFail('TIMEOUT')).toEqual('20')

    Env.set('FALSE', false)
    expect(Env.getOrFail('FALSE')).toEqual('false')

    Env.set('USER', 'Marcus')
    expect(Env.getOrFail('USER')).toEqual('Marcus')
  })

  it('set', async () => {
    Env.set('Supercharge_TEMP', 'temp-value')
    expect(Env.get('Supercharge_TEMP')).toEqual('temp-value')
    delete process.env.Supercharge_TEMP
  })

  it('is production', async () => {
    process.env.NODE_ENV = 'not-production'
    expect(Env.isProduction()).toBeFalse()

    process.env.NODE_ENV = 'production'
    expect(Env.isProduction()).toBeTrue()
  })

  it('is testing', async () => {
    process.env.NODE_ENV = 'not-testing'
    expect(Env.isTesting()).toBeFalse()

    process.env.NODE_ENV = 'testing'
    expect(Env.isTesting()).toBeTrue()
  })

  it('is environment', async () => {
    expect(Env.is('local')).toBeFalse()

    process.env.NODE_ENV = 'LOCAL'
    expect(Env.is('local')).toBeTrue()
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
