'use strict'

const { test } = require('uvu')
const { expect } = require('expect')
const { Env: EnvStore } = require('../dist')

const Env = new EnvStore()

test('has environment from NPM script', async () => {
  expect(Env.get('NODE_ENV')).toEqual('testing')
})

test('get', async () => {
  Env.set('TEST_VAR', 1234)
  expect(Env.get('TEST_VAR')).toEqual('1234')
})

test('get default', async () => {
  expect(
    Env.get('UNAVAILABLE_ENV_VAR', 'defaultValue')
  ).toEqual('defaultValue')
})

test('isEmpty', async () => {
  expect(Env.isEmpty(null)).toBe(true)
  expect(Env.isEmpty('null')).toBe(true)

  expect(Env.isEmpty()).toBe(true)
  expect(Env.isEmpty(undefined)).toBe(true)
  expect(Env.isEmpty('undefined')).toBe(true)
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

test.run()
