'use strict'

const { test } = require('uvu')
const { expect } = require('expect')
const { ScryptHasher } = require('../dist')

test('uses default scrypt options', async () => {
  const scrypt = new ScryptHasher({})
  const value = await scrypt.make('Supercharge')

  expect(typeof value === 'string').toBe(true)
  expect(value.startsWith('$')).toBe(true)
})

test.skip('needsRehash when changing the configuration', async () => {
  const bcrypt10 = new ScryptHasher({ rounds: 10 })
  const bcrypt12 = new ScryptHasher({ rounds: 12 })

  const value10 = await bcrypt10.make('Supercharge')

  expect(bcrypt10.needsRehash(value10)).toBe(false)
  expect(bcrypt12.needsRehash(value10)).toBe(true)
})

test.run()
