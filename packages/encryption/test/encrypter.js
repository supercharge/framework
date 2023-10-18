
import { test } from 'uvu'
import { expect } from 'expect'
import { Str } from '@supercharge/strings'
import { Encrypter } from '../dist/index.js'

test('encrypt a string value', async () => {
  const encrypter = new Encrypter({ key: Str.random(32) })

  expect(encrypter.encrypt('Supercharge')).toBeDefined()
  expect(encrypter.encrypt('Supercharge')).not.toEqual('Supercharge')
  expect(
    encrypter.decrypt(encrypter.encrypt('Supercharge'))
  ).toEqual('Supercharge')
})

test('encrypt an object', async () => {
  const encrypter = new Encrypter({ key: Str.random(32) })

  expect(encrypter.encrypt({ name: 'Supercharge' })).toBeDefined()
  expect(
    encrypter.decrypt(encrypter.encrypt({ name: 'Supercharge' }))
  ).toEqual({ name: 'Supercharge' })
})

test('encrypt an array', async () => {
  const encrypter = new Encrypter({ key: Str.random(32) })

  expect(
    encrypter.decrypt(encrypter.encrypt([1, 2]))
  ).toEqual([1, 2])

  expect(
    encrypter.decrypt(encrypter.encrypt([{ name: 'Supercharge' }]))
  ).toEqual([{ name: 'Supercharge' }])
})

test('ensure random IV for each encryption', async () => {
  const encrypter = new Encrypter({ key: Str.random(32) })

  expect(
    encrypter.encrypt({ name: 'Supercharge' })
  ).not.toEqual(
    encrypter.encrypt({ name: 'Supercharge' })
  )
})

test('decrypt a string', async () => {
  const encrypter = new Encrypter({ key: Str.random(32) })

  expect(encrypter.decrypt(encrypter.encrypt(''))).toEqual('')
  expect(encrypter.decrypt(encrypter.encrypt('Supercharge'))).toEqual('Supercharge')
})

test('decrypt an object', async () => {
  const encrypter = new Encrypter({ key: Str.random(32) })
  const encrypted = encrypter.encrypt({ name: 'Supercharge' })

  expect(encrypter.decrypt(encrypted)).toEqual({ name: 'Supercharge' })
})

test('decrypt an array', async () => {
  const encrypter = new Encrypter({ key: Str.random(32) })
  const encrypted = encrypter.encrypt([{ name: 'Supercharge' }])

  expect(encrypter.decrypt(encrypted)).toEqual([{ name: 'Supercharge' }])
})

test('decrypt null or empty string', async () => {
  const encrypter = new Encrypter({ key: Str.random(32) })

  expect(encrypter.decrypt(encrypter.encrypt(null))).toBeUndefined()
})

test('throws when trying to decrypt a non-string value', async () => {
  const encrypter = new Encrypter({ key: Str.random(32) })

  expect(() => encrypter.decrypt({})).toThrow('"Encryption.decrypt" expects a string value. Received "object"')
  expect(() => encrypter.decrypt([])).toThrow('"Encryption.decrypt" expects a string value. Received "object"')
  expect(() => encrypter.decrypt(true)).toThrow('"Encryption.decrypt" expects a string value. Received "boolean"')
  expect(() => encrypter.decrypt(12345678)).toThrow('"Encryption.decrypt" expects a string value. Received "number"')
})

test('throws when detecting invalid hash', async () => {
  const encrypter = new Encrypter({ key: Str.random(32) })
  const encrypted = encrypter.encrypt('Supercharge')

  expect(() => {
    encrypter.decrypt(encrypted.slice(0, -1))
  }).toThrow('Invalid HMAC')
})

test('throws when detecting invalid parameters', async () => {
  const encrypter = new Encrypter({ key: Str.random(32) })
  const encrypted = encrypter.encrypt('Supercharge')
  const parts = encrypted.split('.')
  parts.pop()

  expect(() => {
    encrypter.decrypt(parts.join('.'))
  }).toThrow('Invalid string value provided to the "decrypt" method, it does not contain the required fields.')
})

test('fails when encryption key is not a string', async () => {
  expect(() => new Encrypter({ key: 12345678 })).toThrow('Invalid encryption key. Received "number"')
  expect(() => new Encrypter({ key: {} })).toThrow('Invalid encryption key. Received "object"')
  expect(() => new Encrypter({ key: [] })).toThrow('Invalid encryption key. Received "object"')
  expect(() => new Encrypter({ key: true })).toThrow('Invalid encryption key. Received "boolean"')
})

test('fails with an encryption key having less than 32 characters', async () => {
  expect(() => new Encrypter({ key: Str.random(16) })).toThrow()
  expect(() => new Encrypter({ key: Str.random(31) })).toThrow()

  expect(() => new Encrypter({ key: Str.random(32) })).not.toThrow()
  expect(() => new Encrypter({ key: Str.random(33) })).not.toThrow()
})

test.run()
