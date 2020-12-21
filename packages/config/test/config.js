'use strict'

const { Config } = require('../dist')

describe('Config', () => {
  it('all', () => {
    const config = new Config()
    config.set('app.name', 'Supercharge')

    expect(typeof config.all()).toEqual('object')
  })

  it('get', () => {
    const config = new Config({ key: 'value' })

    expect(config.get('key')).toEqual('value')
    expect(config.get('unavailable')).toEqual(undefined)
  })

  it('get nested', async () => {
    const config = new Config({ app: { nested: { key: 'nested-value' } } })

    expect(config.get('app.nested.key')).toEqual('nested-value')
  })

  it('get defaultValue', () => {
    const config = new Config()
    expect(config.get('unavailable', 'fallback')).toEqual('fallback')
  })

  it('set', () => {
    const config = new Config()
    config.set('key', 'value')
    expect(config.get('key')).toEqual('value')

    config.set('key', undefined)
    expect(config.get('key')).toBeUndefined()
  })

  it('has', () => {
    const config = new Config()

    config.set('app.port', 1234)
    config.set('app.env', 'production')

    expect(config.has('app.port')).toBeTrue()
    expect(config.has('app.name')).toBeFalse()
    expect(config.has('app.environment')).toBeFalse()
  })

  it('clear', () => {
    const config = new Config({ key: 'value' })
    expect(config.has('key')).toBeTrue()

    config.clear()
    expect(config.has('key')).toBeFalse()
  })
})
