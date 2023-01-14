'use strict'

const { test } = require('uvu')
const { expect } = require('expect')
const { Env: EnvStore } = require('../dist')

const Env = new EnvStore()

test('has environment from NPM script', async () => {
  expect(Env.get('NODE_ENV')).toEqual('testing')
})

test('get', async () => {
  expect(Env.get('')).toEqual('')
  expect(Env.get('')).toEqual('')
  expect(Env.get(null)).toEqual('')
  expect(Env.get('UNAVAILABLE_ENV_VAR')).toEqual('')

  Env.set('TEST_VAR', 1234)
  expect(Env.get('TEST_VAR')).toEqual('1234')

  Env.set('TEST_VAR', '')
  expect(Env.get('TEST_VAR')).toEqual('')
  expect(Env.get('TEST_VAR', 'default')).toEqual('')
})

test('get default', async () => {
  expect(
    Env.get('UNAVAILABLE_ENV_VAR', 'defaultValue')
  ).toEqual('defaultValue')

  expect(
    Env
      .set('EMPTY_ENV_VAR', '')
      .get('EMPTY_ENV_VAR', 'defaultValue')
  ).toEqual('')
})

test('isEmpty', async () => {
  expect(Env.isEmpty(null)).toBe(true)
  expect(Env.isEmpty('null')).toBe(true)

  expect(Env.isEmpty()).toBe(true)
  expect(Env.isEmpty(undefined)).toBe(true)
  expect(Env.isEmpty('undefined')).toBe(true)

  expect(Env.isEmpty('')).toBe(true)
})

test('getOrFail', async () => {
  expect(() => Env.getOrFail()).toThrow()
  expect(() => Env.getOrFail(null)).toThrow('Missing environment variable')
  expect(() => Env.getOrFail('null')).toThrow('Missing environment variable')

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

test('set', async () => {
  Env.set('Supercharge_TEMP', 'temp-value')
  expect(Env.get('Supercharge_TEMP')).toEqual('temp-value')
  delete process.env.Supercharge_TEMP

  expect(
    Env.set('NULL', null).get('NULL')
  ).toEqual('null')
})

test('isProduction', async () => {
  process.env.NODE_ENV = 'not-production'
  expect(Env.isProduction()).toBe(false)

  process.env.NODE_ENV = 'production'
  expect(Env.isProduction()).toBe(true)
})

test('isNotProduction', async () => {
  process.env.NODE_ENV = 'not-production'
  expect(Env.isNotProduction()).toBe(true)

  process.env.NODE_ENV = 'production'
  expect(Env.isNotProduction()).toBe(false)
})

test('isTesting', async () => {
  process.env.NODE_ENV = 'not-testing'
  expect(Env.isTesting()).toBe(false)

  process.env.NODE_ENV = 'testing'
  expect(Env.isTesting()).toBe(true)
})

test('is', async () => {
  expect(Env.is('local')).toBe(false)

  process.env.NODE_ENV = 'LOCAL'
  expect(Env.is('local')).toBe(true)
})

test('number', () => {
  Env.set('NUMBER_VAR', 123)
  expect(Env.number('NUMBER_VAR')).toEqual(123)

  Env.set('TEST_VAR', '123')
  expect(Env.number('TEST_VAR')).toEqual(123)
  expect(Env.number('TEST_VAR', 456)).toEqual(123)
  expect(Env.number('UNAVAILABLE_NUMBER_VAR', 123)).toEqual(123)
  expect(Env.number('UNAVAILABLE_NUMBER_VAR', '123')).toEqual(123)

  Env.set('NUM_NAME', false)
  expect(() => Env.number('NUM_NAME'))
    .toThrow('The value for environment variable "NUM_NAME" cannot be converted to a number.')

  Env.set('NUM_BOOLEAN', false)
  expect(() => Env.number('NUM_BOOLEAN'))
    .toThrow('The value for environment variable "NUM_BOOLEAN" cannot be converted to a number.')
})

test('boolean', () => {
  Env.set('TRUE', '1')
  expect(Env.boolean('TRUE')).toEqual(true)
  Env.set('TRUE', 'true')
  expect(Env.boolean('TRUE')).toEqual(true)
  Env.set('TRUE', 'TRUE')
  expect(Env.boolean('TRUE')).toEqual(true)

  Env.set('FALSE', '0')
  expect(Env.boolean('FALSE')).toEqual(false)
  Env.set('FALSE', 'false')
  expect(Env.boolean('FALSE')).toEqual(false)
  Env.set('FALSE', 'FALSE')
  expect(Env.boolean('FALSE')).toEqual(false)

  Env.set('TEST_VAR', 'trUE')
  expect(Env.boolean('TEST_VAR')).toEqual(true)
  expect(Env.boolean('TEST_VAR', false)).toEqual(true)
  expect(Env.boolean('UNAVAILABLE_boolean_VAR', true)).toEqual(true)
  expect(Env.boolean('UNAVAILABLE_boolean_VAR', false)).toEqual(false)
})

test.run()
