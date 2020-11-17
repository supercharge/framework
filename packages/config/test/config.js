'use strict'

const Path = require('path')
const { Config } = require('../dist')

describe('Config', () => {
  afterEach(() => {
    Config.clear()
  })

  it('all', () => {
    Config.set('app.name', 'Supercharge')
    expect(typeof Config.all()).toEqual('object')
    expect(Config.all()).toMatchObject({ app: { name: 'Supercharge' } })
  })

  it('get', () => {
    Config.set('key', 'value')
    expect(Config.get('key')).toEqual('value')
    expect(Config.get('unavailable')).toEqual(undefined)
  })

  it('get nested', async () => {
    await new ConfigBootstrapper().bootstrap(new App())
    expect(Config.get('app.nested.key')).toEqual('nested-value')
  })

  it('get defaultValue', () => {
    expect(Config.get('unavailable', 'fallback')).toEqual('fallback')
  })

  it('set', () => {
    Config.set('key', 'value')
    expect(Config.get('key')).toEqual('value')

    Config.set('key', undefined)
    expect(Config.get('key')).toBeUndefined()
  })

  it('has', () => {
    Config.set('app.port', 1234)
    Config.set('app.env', 'production')

    expect(Config.has('app.port')).toBeTrue()
    expect(Config.has('app.name')).toBeFalse()
    expect(Config.has('app.environment')).toBeFalse()
  })

  it('initializes with values', () => {
    const Conf = new Config.constructor({ isProduction: true })

    expect(Conf.has('isProduction')).toBeFalse()
  })
})

class App {
  configPath () {
    return Path.resolve(__dirname, 'fixtures/config')
  }
}
