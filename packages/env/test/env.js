'use strict'

const { Env: EnvStore } = require('../dist')

const Env = new EnvStore()

describe('Env', () => {
  it('has environment variables after bootstrapper loaded', async () => {
    expect(Env.get('NODE_ENV')).toEqual('test')
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
