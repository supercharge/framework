
import { test } from 'uvu'
import { expect } from 'expect'
import { BcryptHasher } from '../dist/bcrypt-hasher.js'

test('defaults to 12 rounds', async () => {
  const bcrypt = new BcryptHasher({})
  const value = await bcrypt.make('Supercharge')

  expect(typeof value === 'string').toBe(true)
  expect(value.startsWith('$2b')).toBe(true)
})

test('needsRehash when changing the configuration', async () => {
  const bcrypt10 = new BcryptHasher({ rounds: 10 })
  const bcrypt12 = new BcryptHasher({ rounds: 12 })

  const value10 = await bcrypt10.make('Supercharge')

  expect(bcrypt10.needsRehash(value10)).toBe(false)
  expect(bcrypt12.needsRehash(value10)).toBe(true)
})

test.run()
