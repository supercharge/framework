
import { test } from 'uvu'
import { expect } from 'expect'
import { BaseHasher } from '../dist/base-hasher.js'
import { Hash } from 'crypto'

test('createHash', async () => {
  const hasher = new BaseHasher()

  const hash = hasher.createHash('sha256', 'supercharge')
  expect(hash instanceof Hash).toBe(true)
  expect(hash.digest('base64').endsWith('=')).toBe(true)
})

test('md5 with value', async () => {
  const hasher = new BaseHasher()

  const md5 = hasher.md5('supercharge')
  expect(typeof md5 === 'string').toBe(true)
  expect(md5.endsWith('=')).toBe(true)
})

test('md5 with input encoding', async () => {
  const hasher = new BaseHasher()

  const md5 = hasher.md5('supercharge', 'utf8')
  expect(md5 instanceof Hash).toBe(true)
})

test('md5 with hash builder callback', async () => {
  const hasher = new BaseHasher()

  const md5 = hasher.md5('supercharge', hash => hash.toString('hex'))
  expect(typeof md5 === 'string').toBe(true)
})

test('sha256 with value', async () => {
  const hasher = new BaseHasher()

  const sha256 = hasher.sha256('supercharge')
  expect(typeof sha256 === 'string').toBe(true)
  expect(sha256.endsWith('=')).toBe(true)
})

test('sha256 with input encoding', async () => {
  const hasher = new BaseHasher()

  const sha256 = hasher.sha256('supercharge', 'utf8')
  expect(sha256 instanceof Hash).toBe(true)
})

test('sha256 with hash builder callback', async () => {
  const hasher = new BaseHasher()

  const sha256 = hasher.sha256('supercharge', hash => hash.toString('hex'))
  expect(typeof sha256 === 'string').toBe(true)
})

test('sha512 with value', async () => {
  const hasher = new BaseHasher()

  const sha512 = hasher.sha512('supercharge')
  expect(typeof sha512 === 'string').toBe(true)
  expect(sha512.endsWith('=')).toBe(true)
})

test('sha512 with input encoding', async () => {
  const hasher = new BaseHasher()

  const sha512 = hasher.sha512('supercharge', 'utf8')
  expect(sha512 instanceof Hash).toBe(true)
})

test('sha512 with hash builder callback', async () => {
  const hasher = new BaseHasher()

  const sha512 = hasher.sha512('supercharge', hash => hash.toString('hex'))
  expect(typeof sha512 === 'string').toBe(true)
})

test('hashes are different from each other', async () => {
  const hasher = new BaseHasher()
  const input = 'supercharge'

  expect(hasher.md5(input)).toEqual(hasher.md5(input))
  expect(hasher.md5(input)).not.toEqual(hasher.sha256(input))
  expect(hasher.md5(input)).not.toEqual(hasher.sha512(input))

  expect(hasher.sha256(input)).toEqual(hasher.sha256(input))
  expect(hasher.sha256(input)).not.toEqual(hasher.md5(input))
  expect(hasher.sha256(input)).not.toEqual(hasher.sha512(input))

  expect(hasher.sha512(input)).toEqual(hasher.sha512(input))
  expect(hasher.sha512(input)).not.toEqual(hasher.md5(input))
  expect(hasher.sha512(input)).not.toEqual(hasher.sha256(input))
})

test('hash builder', async () => {
  const hasher = new BaseHasher()

  const sha512 = hasher.sha512('supercharge', hash => {
    hash
      .inputEncoding('utf8')
      .toString('hex')
  })

  expect(typeof sha512 === 'string').toBe(true)
})

test.run()
