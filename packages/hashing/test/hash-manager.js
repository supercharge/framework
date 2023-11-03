
import { test } from 'uvu'
import { expect } from 'expect'
import { setupApp } from './helpers/index.js'
import { HashManager } from '../dist/index.js'
import { Hash } from 'node:crypto'

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

test('createHash', async () => {
  const app = await setupApp({ driver: 'scrypt' })
  const hash = new HashManager(app)

  expect(hash.createHash('sha512', 'supercharge') instanceof Hash).toBe(true)
})

test('md5', async () => {
  const app = await setupApp({ driver: 'scrypt' })
  const hash = new HashManager(app)

  expect(typeof hash.md5('supercharge') === 'string').toBe(true)
})

test('sha256', async () => {
  const app = await setupApp({ driver: 'scrypt' })
  const hash = new HashManager(app)

  expect(typeof hash.sha256('supercharge') === 'string').toBe(true)
})

test('sha512', async () => {
  const app = await setupApp({ driver: 'scrypt' })
  const hash = new HashManager(app)

  expect(typeof hash.sha512('supercharge') === 'string').toBe(true)
})

test.run()
