
/**
 * @typedef {import('@supercharge/contracts').HashConfig} HashConfig
 */

const { test } = require('uvu')
const { expect } = require('expect')
const { ScryptValidationError } = require('../dist/')
const { ScryptHasher } = require('../dist/scrypt-hasher')

/**
 * @param {HashConfig['scrypt'] | undefined} config
 * @returns {ScryptHasher}
 */
function scryptFactory (config = {}) {
  return new ScryptHasher({
    cost: 16384,
    blockSize: 8,
    saltSize: 16,
    keyLength: 64,
    parallelization: 1,
    maxMemory: 32 * 1024 * 1024,
    ...config
  })
}

test('uses default scrypt options', async () => {
  const scrypt = new ScryptHasher({})
  const value = await scrypt.make('Supercharge')

  expect(typeof value === 'string').toBe(true)
  expect(value.startsWith('$')).toBe(true)
})

test('make hash', async () => {
  const scrypt = scryptFactory()
  const value = await scrypt.make('Supercharge')

  expect(typeof value === 'string').toBe(true)
  expect(value.startsWith('$')).toBe(true)
})

test('check hash', async () => {
  const scrypt = await scryptFactory()
  const value = await scrypt.make('Supercharge')

  expect(await scrypt.check('Supercharge', value)).toBe(true)
  expect(await scrypt.check('Superchargy', value)).toBe(false)
})

test('check: ensures two arguments are provided', async () => {
  const scrypt = await scryptFactory()

  await expect(scrypt.check()).rejects.toThrow('Received invalid arguments: you must provide a "plain" text and "hashed" value')
  await expect(scrypt.check('')).rejects.toThrow('Received invalid arguments: you must provide a "plain" text and "hashed" value')
  await expect(scrypt.check('', '')).rejects.toThrow('Received invalid arguments: you must provide a "plain" text and "hashed" value')
  await expect(scrypt.check(null)).rejects.toThrow('Received invalid arguments: you must provide a "plain" text and "hashed" value')
  await expect(scrypt.check(null, '')).rejects.toThrow('Received invalid arguments: you must provide a "plain" text and "hashed" value')
  await expect(scrypt.check(null, null)).rejects.toThrow('Received invalid arguments: you must provide a "plain" text and "hashed" value')
})

test('check hash: id validation fails', async () => {
  const scrypt = await scryptFactory()
  const value = await scrypt.make('Supercharge')

  const changed = value.replace('$scrypt$', '$scrypt123$')
  await expect(scrypt.check('Supercharge', changed)).rejects.toThrow(ScryptValidationError)
  await expect(scrypt.check('Supercharge', changed)).rejects.toThrow('Incompatible "scrypt123" identifier found in the hash')
})

test('check hash: cost validation fails', async () => {
  const scrypt = await scryptFactory({ cost: 2048 })
  const value = await scrypt.make('Supercharge')

  const changed = value.replace('n=2048', 'n=2049')
  await expect(scrypt.check('Supercharge', changed)).rejects.toThrow(ScryptValidationError)
  await expect(scrypt.check('Supercharge', changed)).rejects.toThrow('The "n" (cost) parameter must be a power of 2 greater than 1')

  const nonInteger = value.replace('n=2048', 'n=abc')
  await expect(scrypt.check('Supercharge', nonInteger)).rejects.toThrow('The "n" (cost) parameter must be an integer')
})

test('check hash: blockSize validation fails', async () => {
  const scrypt = await scryptFactory({ blockSize: 8 })
  const value = await scrypt.make('Supercharge')

  const changed = value.replace('r=8', 'r=abc')
  await expect(scrypt.check('Supercharge', changed)).rejects.toThrow(ScryptValidationError)
  await expect(scrypt.check('Supercharge', changed)).rejects.toThrow('The "r" (blockSize) parameter must be an integer')
})

test('check hash: parallelization validation fails', async () => {
  const scrypt = await scryptFactory({ parallelization: 2 })
  const value = await scrypt.make('Supercharge')

  const changed = value.replace('p=2', 'p=abc')
  await expect(scrypt.check('Supercharge', changed)).rejects.toThrow(ScryptValidationError)
  await expect(scrypt.check('Supercharge', changed)).rejects.toThrow('The "p" (parallelization) parameter must be an integer')

  const changed2 = value.replace('p=2', 'p=0')
  await expect(scrypt.check('Supercharge', changed2)).rejects.toThrow(`The "p" (parallelization) parameter must be in the range (1 <= parallelization <= ${Number.MAX_SAFE_INTEGER})`)
})

test('needsRehash throws when not providing a string value', async () => {
  const scrypt = scryptFactory()
  expect(() => scrypt.needsRehash()).toThrow(ScryptValidationError)
  expect(() => scrypt.needsRehash(null)).toThrow(ScryptValidationError)
  expect(() => scrypt.needsRehash(123)).toThrow(ScryptValidationError)
  expect(() => scrypt.needsRehash({})).toThrow(ScryptValidationError)
  expect(() => scrypt.needsRehash([])).toThrow(ScryptValidationError)
})

test('needsRehash when changing the configuration', async () => {
  const scrypt2048 = scryptFactory({ cost: 2048 })
  const scrypt4096 = scryptFactory({ cost: 4096 })

  const hashed = await scrypt2048.make('Supercharge')

  expect(scrypt2048.needsRehash(hashed)).toBe(false)
  expect(scrypt4096.needsRehash(hashed)).toBe(true)
})

test('cost validation', async () => {
  expect(() => scryptFactory({ cost: -1 })).toThrow(ScryptValidationError)
  expect(() => scryptFactory({ cost: 3 })).toThrow(ScryptValidationError)
  expect(() => scryptFactory({ cost: 2047 })).toThrow(ScryptValidationError)
})

test('parallelization validation', async () => {
  expect(() => scryptFactory({ parallelization: -1 })).toThrow(ScryptValidationError)
  expect(() => scryptFactory({ parallelization: Number.MAX_SAFE_INTEGER + 1 })).toThrow(ScryptValidationError)
})

test('maxMemory validation', async () => {
  expect(() => scryptFactory({ maxMemory: 64 })).toThrow(ScryptValidationError)
  expect(() => scryptFactory({ maxMemory: 64, cost: 2, blockSize: 1 })).toThrow(ScryptValidationError)
})

test('saltSize validation', async () => {
  expect(() => scryptFactory({ saltSize: -1 })).toThrow(ScryptValidationError)
  expect(() => scryptFactory({ saltSize: 15 })).toThrow(ScryptValidationError)
  expect(() => scryptFactory({ saltSize: 1025 })).toThrow(ScryptValidationError)

  expect(() => scryptFactory({ saltSize: 16 })).not.toThrow(ScryptValidationError)
  expect(() => scryptFactory({ saltSize: 1024 })).not.toThrow(ScryptValidationError)
})

test('keyLength validation', async () => {
  expect(() => scryptFactory({ keyLength: -1 })).toThrow(ScryptValidationError)
  expect(() => scryptFactory({ keyLength: 63 })).toThrow(ScryptValidationError)
  expect(() => scryptFactory({ keyLength: 129 })).toThrow(ScryptValidationError)

  expect(() => scryptFactory({ keyLength: 64 })).not.toThrow(ScryptValidationError)
  expect(() => scryptFactory({ keyLength: 128 })).not.toThrow(ScryptValidationError)
})

test.run()
