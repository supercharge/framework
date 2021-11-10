'use strict'

const { test } = require('uvu')
const expect = require('expect')
const { Config } = require('../dist')

test('all', () => {
  const config = new Config()
  config.set('app.name', 'Supercharge')

  expect(typeof config.all()).toEqual('object')
})

test('get', () => {
  const config = new Config({ key: 'value' })

  expect(config.get('key')).toEqual('value')
  expect(config.get('unavailable')).toEqual(undefined)
})

test('get nested', async () => {
  const config = new Config({ app: { nested: { key: 'nested-value' } } })

  expect(config.get('app.nested.key')).toEqual('nested-value')
})

test('get defaultValue', () => {
  const config = new Config()
  expect(config.get('unavailable', 'fallback')).toEqual('fallback')
})

test('set', () => {
  const config = new Config()

  config.set('key', 'value')
  expect(config.get('key')).toEqual('value')

  config.set('key', undefined)
  expect(config.get('key')).toBeUndefined()
})

test('has', () => {
  const config = new Config()
    .set('app.port', 1234)
    .set('app.env', 'production')

  expect(config.has('app.port')).toBe(true)
  expect(config.has('app.name')).toBe(false)
  expect(config.has('app.environment')).toBe(false)
})

test('isMissing', () => {
  const config = new Config()
    .set('app.port', 1234)
    .set('app.env', 'production')

  expect(config.isMissing('app.name')).toBe(true)
  expect(config.isMissing('app.environment')).toBe(true)

  expect(config.isMissing('app.env')).toBe(false)
  expect(config.isMissing('app.port')).toBe(false)
})

test('ensure', () => {
  const config = new Config().set('app.port', 1234)

  expect(() => config.ensure('app.port')).not.toThrow()

  expect(() => config.ensure('app.name')).toThrow()
  expect(() => config.ensure('app.name', () => {
    throw new Error('Config Error')
  })).toThrow('Config Error')
})

test('clear', () => {
  const config = new Config({ key: 'value' })
  expect(config.has('key')).toBe(true)

  config.clear()
  expect(config.has('key')).toBe(false)
})

test.run()
