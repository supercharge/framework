
const { test } = require('uvu')
const { expect } = require('expect')
const { setupApp } = require('./helpers')
const { HashManager } = require('../dist')

test('make hash', async () => {
  const app = await setupApp()
  const hash = new HashManager(app)
  const value = await hash.make('Supercharge')

  expect(typeof value === 'string').toBe(true)
  expect(value.startsWith('$2b')).toBe(true)
})

test('check hash', async () => {
  const app = await setupApp()
  const hash = new HashManager(app)
  const value = await hash.make('Supercharge')

  expect(await hash.check('Supercharge', value)).toBe(true)
  expect(await hash.check('Other-Supercharge', value)).toBe(false)
})

test('needsRehash', async () => {
  const app = await setupApp()
  const hash = new HashManager(app)

  expect(() => hash.needsRehash()).toThrow()
  expect(() => hash.needsRehash(null)).toThrow()
  expect(() => hash.needsRehash(123)).toThrow()
  expect(() => hash.needsRehash([])).toThrow()
  expect(() => hash.needsRehash({})).toThrow()

  expect(hash.needsRehash('$2a')).toBe(true)
  expect(hash.needsRehash('$2b')).toBe(true)

  const hashValue = await hash.make('foo')
  expect(hash.needsRehash(hashValue)).toBe(false)
})

test('fallback to 12 rounds', async () => {
  const app = await setupApp()
  const hash = new HashManager(app)

  expect(() => hash.needsRehash()).toThrow()
  expect(() => hash.needsRehash(null)).toThrow()
  expect(() => hash.needsRehash(123)).toThrow()
  expect(() => hash.needsRehash([])).toThrow()
  expect(() => hash.needsRehash({})).toThrow()

  expect(hash.needsRehash('$2a')).toBe(true)
  expect(hash.needsRehash('$2b')).toBe(true)

  const hashValue = await hash.make('foo')
  expect(hash.needsRehash(hashValue)).toBe(false)
})

test('create scrypt hasher', async () => {
  const app = await setupApp({ driver: 'scrypt' })
  const hash = new HashManager(app)

  const value = await hash.make('Supercharge')
  expect(await hash.check('Supercharge', value)).toBe(true)
  expect(await hash.check('Other-Supercharge', value)).toBe(false)
})

test.run()
