
const { test } = require('uvu')
const { expect } = require('expect')
const { StateBag } = require('../dist')

test('all', () => {
  expect(new StateBag({ state: {} }).all()).toEqual({})
  expect(
    new StateBag({ state: { accept: 'application/json' } }).all()
  ).toEqual({ accept: 'application/json' })
})

test('all for keys', () => {
  const bag = new StateBag({ state: { a: 1, b: 2, c: 3 } })

  expect(bag.all('a')).toEqual({ a: 1 })
  expect(bag.all('a', 'b')).toEqual({ a: 1, b: 2 })
  expect(bag.all(['a', 'b'])).toEqual({ a: 1, b: 2 })
})

test('get', () => {
  expect(new StateBag({ state: {} }).get()).toEqual(undefined)
  expect(new StateBag({ state: {} }).get('test')).toEqual(undefined)
  expect(new StateBag({ state: { a: 'b' } }).get('c')).toEqual(undefined)
  expect(new StateBag({ state: { a: 'b' } }).get('a')).toEqual('b')
})

test('get defaultValue', () => {
  expect(new StateBag({ state: {} }).get('test', 'defaultValue')).toEqual('defaultValue')
  expect(new StateBag({ state: { a: 'b' } }).get('c', 'defaultValue')).toEqual('defaultValue')
  expect(new StateBag({ state: { a: null } }).get('a', 'defaultValue')).toEqual('defaultValue')
  expect(new StateBag({ state: { a: undefined } }).get('a', 'defaultValue')).toEqual('defaultValue')
  expect(new StateBag({ state: { a: undefined } }).get('a', '')).toEqual('')
})

test('get nested keys', () => {
  expect(new StateBag({ state: { a: {} } }).get('a.b')).toEqual(undefined)
  expect(new StateBag({ state: { a: { b: null } } }).get('a.b')).toEqual(null)
  expect(new StateBag({ state: { a: { b: { c: [] } } } }).get('a.b.c')).toEqual([])
})

test('add', () => {
  expect(new StateBag({ state: {} }).add('a', 1).all()).toEqual({ a: 1 })
  expect(new StateBag({ state: { a: 'b' } }).add('c', 1).all()).toEqual({ a: 'b', c: 1 })

  const bag = new StateBag({ state: { a: 'b', nested: { foo: 'bar' } } })
  expect(bag.get('a')).toEqual('b')
  expect(bag.add('a', 1).get('a')).toEqual(1)

  expect(() => {
    bag.add([1, 2, 3])
  }).toThrow('Invalid argument when setting state via "state().set()". Expected a key-value-pair or object as the first argument.')
})

test('add: merges nested fields', () => {
  const bag = new StateBag({ state: { a: 'b' } })
    .add({ nested: { foo: 'bar' } })
    .add({ nested: { bar: 'baz' } })
  expect(bag.get('nested')).toEqual({ foo: 'bar', bar: 'baz' })

  expect(new StateBag({ state: { } }).add('a.b', 1).all()).toEqual({ a: { b: 1 } })
})

test('merge', () => {
  expect(new StateBag({ state: {} }).merge({ a: 1 }).all()).toEqual({ a: 1 })
  expect(new StateBag({ state: { a: 'b' } }).merge({ c: 1 }).all()).toEqual({ a: 'b', c: 1 })
  expect(new StateBag({ state: { a: { b: 1 } } }).merge({ a: { c: 2 } }).all()).toEqual({ a: { b: 1, c: 2 } })

  const bag = new StateBag({ state: { a: 'b' } })
  expect(bag.get('a')).toEqual('b')
  expect(bag.merge({ a: 1 }).get('a')).toEqual(1)

  expect(() => bag.merge([1, 2, 3]))
    .toThrow('Invalid argument when merging state via "state().merge()". Expected an object. Received "object".')

  expect(() => bag.merge('key', 'value'))
    .toThrow('Invalid argument when merging state via "state().merge()". Expected an object. Received "string".')
})

test('has', () => {
  expect(new StateBag({ state: {} }).has()).toBe(false)
  expect(new StateBag({ state: {} }).has('test')).toBe(false)
  expect(new StateBag({ state: { a: 'b' } }).has('c')).toBe(false)

  expect(new StateBag({ state: { a: '' } }).has('a')).toBe(true)
  expect(new StateBag({ state: { a: 'b' } }).has('a')).toBe(true)
  expect(new StateBag({ state: { a: null } }).has('a')).toBe(true)
  expect(new StateBag({ state: { a: false } }).has('a')).toBe(true)
  expect(new StateBag({ state: { a: undefined } }).has('a')).toBe(true)
})

test('has: works with nested fields', () => {
  expect(new StateBag({ state: { a: { b: { c: true } } } }).has('a')).toBe(true)
  expect(new StateBag({ state: { a: { b: { c: true } } } }).has('a.b')).toBe(true)

  expect(new StateBag({ state: { a: { b: { e: '' } } } }).has('a.b.e')).toBe(true)
  expect(new StateBag({ state: { a: { b: { n: null } } } }).has('a.b.n')).toBe(true)
  expect(new StateBag({ state: { a: { b: { f: false } } } }).has('a.b.f')).toBe(true)
  expect(new StateBag({ state: { a: { b: { u: undefined } } } }).has('a.b.u')).toBe(true)

  expect(new StateBag({ state: { a: { b: { c: true } } } }).has('a.c')).toBe(false)
  expect(new StateBag({ state: { a: { b: { c: true } } } }).has('a.b.d')).toBe(false)
})

test('isMissing', () => {
  expect(new StateBag({ state: {} }).isMissing()).toBe(true)
  expect(new StateBag({ state: {} }).isMissing('test')).toBe(true)
  expect(new StateBag({ state: { a: 'b' } }).isMissing('c')).toBe(true)

  expect(new StateBag({ state: { a: '' } }).isMissing('a')).toBe(false)
  expect(new StateBag({ state: { a: 'b' } }).isMissing('a')).toBe(false)
  expect(new StateBag({ state: { a: null } }).isMissing('a')).toBe(false)
  expect(new StateBag({ state: { a: false } }).isMissing('a')).toBe(false)
  expect(new StateBag({ state: { a: undefined } }).isMissing('a')).toBe(false)
})

test('isMissing: works with nested fields', () => {
  expect(new StateBag({ state: { a: { b: { c: true } } } }).isMissing('a')).toBe(false)
  expect(new StateBag({ state: { a: { b: { c: true } } } }).isMissing('a.b')).toBe(false)

  expect(new StateBag({ state: { a: { b: { e: '' } } } }).isMissing('a.b.e')).toBe(false)
  expect(new StateBag({ state: { a: { b: { n: null } } } }).isMissing('a.b.n')).toBe(false)
  expect(new StateBag({ state: { a: { b: { f: false } } } }).isMissing('a.b.f')).toBe(false)
  expect(new StateBag({ state: { a: { b: { u: undefined } } } }).isMissing('a.b.u')).toBe(false)

  expect(new StateBag({ state: { a: { b: { c: true } } } }).isMissing('a.c')).toBe(true)
  expect(new StateBag({ state: { a: { b: { c: true } } } }).isMissing('a.b.d')).toBe(true)
})

test('remove', () => {
  expect(new StateBag({ state: {} }).remove('a').all()).toEqual({ })
  expect(new StateBag({ state: {} }).remove('a').all()).toEqual({ })
  expect(new StateBag({ state: { a: 1, b: 2 } }).remove('a').all()).toEqual({ b: 2 })
  expect(new StateBag({ state: { a: 1, b: 2 } }).remove('c').all()).toEqual({ a: 1, b: 2 })
})

test('remove: works with nested fields', () => {
  expect(new StateBag({ state: {} }).remove('a').all()).toEqual({ })
  expect(new StateBag({ state: {} }).remove('a').all()).toEqual({ })
  expect(new StateBag({ state: {} }).remove('a.b.c').all()).toEqual({ })
  expect(new StateBag({ state: { a: { b: { c: 'd' } } } }).remove('a').all()).toEqual({ })
  expect(new StateBag({ state: { a: { b: { c: 'd' } } } }).remove('a.b').all()).toEqual({ a: {} })
  expect(new StateBag({ state: { a: { b: { c: 'd' } } } }).remove('a.b.c').all()).toEqual({ a: { b: {} } })
})

test('clear', () => {
  expect(new StateBag({ state: {} }).clear().all()).toEqual({ })
  expect(new StateBag({ state: { a: 1, b: 2 } }).clear().all()).toEqual({ })
})

test.run()
