'use strict'

const { test } = require('uvu')
const { expect } = require('expect')
const { Config } = require('../dist')

test('all', () => {
  expect(new Config().all()).toEqual({})
  expect(new Config(null).all()).toEqual({})
  expect(new Config({}).all()).toEqual({})
  expect(new Config({ name: 'foo' }).all()).toEqual({ name: 'foo' })
})

test('get', () => {
  const config = new Config({ key: 'value' })

  expect(config.get('key')).toEqual('value')
  expect(config.get('unavailable')).toBeUndefined()
})

test('get nested', async () => {
  const config = new Config({ app: { nested: { key: 'nested-value' } } })

  expect(config.get('app.nested.key')).toEqual('nested-value')
})

test('get defaultValue', () => {
  const config = new Config()
  expect(config.get('unavailable', 'defaultValue')).toBe('defaultValue')
})

test('set', () => {
  const config = new Config()

  config.set('key', 'value')
  expect(config.get('key')).toEqual('value')

  config.set('key', undefined)
  expect(config.get('key')).toBeUndefined()

  expect(
    new Config()
      .set('foo', 'bar')
      .set('app.name', 'Supercharge')
      .all()
  ).toEqual({ foo: 'bar', app: { name: 'Supercharge' } })
})

test('has', () => {
  const config = new Config()
    .set('null', null)
    .set('app.port', 1234)
    .set('app.env.current', 'production')

  expect(config.has('null')).toBe(true)
  expect(config.has('app.port')).toBe(true)
  expect(config.has('app.env.current')).toBe(true)

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

test('isEmpty', () => {
  const config = new Config({
    empty: undefined,
    emptyNull: null,
    emptyString: '',
    emptyObject: {},
    emptyArray: [],
    emptyNumber: 0
  })

  expect(config.isEmpty('empty')).toBe(true)
  expect(config.isEmpty('emptyNull')).toBe(true)
  expect(config.isEmpty('emptyString')).toBe(true)
  expect(config.isEmpty('emptyObject')).toBe(true)
  expect(config.isEmpty('emptyArray')).toBe(true)

  expect(config.isEmpty('emptyNumber')).toBe(false)
})

test('isNotEmpty', () => {
  const config = new Config({
    empty: undefined,
    emptyNull: null,
    emptyString: '',
    emptyObject: {},
    emptyArray: [],
    emptyNumber: 0
  })

  expect(config.isNotEmpty('emptyNumber')).toBe(true)

  expect(config.isNotEmpty('empty')).toBe(false)
  expect(config.isNotEmpty('emptyNull')).toBe(false)
  expect(config.isNotEmpty('emptyString')).toBe(false)
  expect(config.isNotEmpty('emptyObject')).toBe(false)
  expect(config.isNotEmpty('emptyArray')).toBe(false)
})

test('ensureNotEmpty', () => {
  const config = new Config({
    empty: undefined,
    notEmpty: 0
  })

  expect(() => {
    config.ensureNotEmpty('empty')
  }).toThrow('Missing value for the given key "empty"')
  expect(() => {
    config.ensureNotEmpty('empty', () => {
      throw new TypeError('failed')
    })
  }).toThrow(TypeError)

  expect(() => config.ensureNotEmpty('notEmpty')).not.toThrow()
})

test('clear', () => {
  const config = new Config({ key: 'value' })
  expect(config.has('key')).toBe(true)

  config.clear()
  expect(config.all()).toEqual({})
  expect(config.has('key')).toBe(false)
})

test.run()
