
import { test } from 'uvu'
import { expect } from 'expect'
import { StateBag } from '../dist/index.js'

test('all', () => {
  expect(new StateBag({}).all()).toEqual({})
  expect(
    new StateBag({ accept: 'application/json' }).all()
  ).toEqual({ accept: 'application/json' })
})

test('all for keys', () => {
  const bag = new StateBag({ a: 1, b: 2, c: 3 })

  expect(bag.all('a')).toEqual({ a: 1 })
  expect(bag.all('a', 'b')).toEqual({ a: 1, b: 2 })
  expect(bag.all(['a', 'b'])).toEqual({ a: 1, b: 2 })
})

test('get', () => {
  expect(new StateBag({}).get()).toEqual(undefined)
  expect(new StateBag({}).get('test')).toEqual(undefined)
  expect(new StateBag({ a: 'b' }).get('c')).toEqual(undefined)
  expect(new StateBag({ a: 'b' }).get('a')).toEqual('b')
})

test('get defaultValue', () => {
  expect(new StateBag({}).get('test', 'defaultValue')).toEqual('defaultValue')
  expect(new StateBag({ a: 'b' }).get('c', 'defaultValue')).toEqual('defaultValue')
  expect(new StateBag({ a: null }).get('a', 'defaultValue')).toEqual('defaultValue')
  expect(new StateBag({ a: undefined }).get('a', 'defaultValue')).toEqual('defaultValue')
  expect(new StateBag({ a: undefined }).get('a', '')).toEqual('')
})

test('get nested keys', () => {
  expect(new StateBag({ a: {} }).get('a.b')).toEqual(undefined)
  expect(new StateBag({ a: { b: null } }).get('a.b')).toEqual(null)
  expect(new StateBag({ a: { b: { c: [] } } }).get('a.b.c')).toEqual([])
})

test('set', () => {
  expect(new StateBag({}).set('a', 1).all()).toEqual({ a: 1 })
  expect(new StateBag({ a: 'b' }).set('c', 1).all()).toEqual({ a: 'b', c: 1 })

  const bag = new StateBag({ a: 'b', nested: { foo: 'bar' } })
  expect(bag.get('a')).toEqual('b')
  expect(bag.set('a', 1).get('a')).toEqual(1)

  expect(() => {
    bag.set([1, 2, 3])
  }).toThrow('Invalid argument when setting values via ".set()". Expected a key-value-pair or object as the first argument.')
})

test('set: merges nested fields', () => {
  const bag = new StateBag({ a: 'b' })
    .set({ nested: { foo: 'bar' } })
    .set({ nested: { bar: 'baz' } })
  expect(bag.get('nested')).toEqual({ foo: 'bar', bar: 'baz' })

  expect(new StateBag({ }).set('a.b', 1).all()).toEqual({ a: { b: 1 } })
})

test('merge', () => {
  expect(new StateBag({}).merge({ a: 1 }).all()).toEqual({ a: 1 })
  expect(new StateBag({ a: 'b' }).merge({ c: 1 }).all()).toEqual({ a: 'b', c: 1 })
  expect(new StateBag({ a: { b: 1 } }).merge({ a: { c: 2 } }).all()).toEqual({ a: { b: 1, c: 2 } })

  const bag = new StateBag({ a: 'b' })
  expect(bag.get('a')).toEqual('b')
  expect(bag.merge({ a: 1 }).get('a')).toEqual(1)

  expect(() => bag.merge([1, 2, 3]))
    .toThrow('Invalid argument when merging values via ".merge()". Expected an object. Received "object".')

  expect(() => bag.merge('key', 'value'))
    .toThrow('Invalid argument when merging values via ".merge()". Expected an object. Received "string".')
})

test('exists', () => {
  expect(new StateBag({}).exists()).toBe(false)
  expect(new StateBag({}).exists('test')).toBe(false)
  expect(new StateBag({ a: 'b' }).exists('c')).toBe(false)

  expect(new StateBag({ a: '' }).exists('a')).toBe(true)
  expect(new StateBag({ a: 'b' }).exists('a')).toBe(true)
  expect(new StateBag({ a: null }).exists('a')).toBe(true)
  expect(new StateBag({ a: false }).exists('a')).toBe(true)
  expect(new StateBag({ a: undefined }).exists('a')).toBe(true)
  expect(new StateBag({ a: { b: { u: undefined } } }).exists('a.b.u')).toBe(true)
})

test('has', () => {
  expect(new StateBag({}).has()).toBe(false)
  expect(new StateBag({}).has('test')).toBe(false)
  expect(new StateBag({ a: 'b' }).has('c')).toBe(false)
  expect(new StateBag({ a: undefined }).has('a')).toBe(false)

  expect(new StateBag({ a: '' }).has('a')).toBe(true)
  expect(new StateBag({ a: 'b' }).has('a')).toBe(true)
  expect(new StateBag({ a: null }).has('a')).toBe(true)
  expect(new StateBag({ a: false }).has('a')).toBe(true)
})

test('has: works with nested fields', () => {
  expect(new StateBag({ a: { b: { c: true } } }).has('a')).toBe(true)
  expect(new StateBag({ a: { b: { c: true } } }).has('a.b')).toBe(true)
  expect(new StateBag({ a: { b: { u: undefined } } }).has('a.b.u')).toBe(false)

  expect(new StateBag({ a: { b: { e: '' } } }).has('a.b.e')).toBe(true)
  expect(new StateBag({ a: { b: { n: null } } }).has('a.b.n')).toBe(true)
  expect(new StateBag({ a: { b: { f: false } } }).has('a.b.f')).toBe(true)

  expect(new StateBag({ a: { b: { c: true } } }).has('a.c')).toBe(false)
  expect(new StateBag({ a: { b: { c: true } } }).has('a.b.d')).toBe(false)
})

test('isMissing', () => {
  expect(new StateBag({}).isMissing()).toBe(true)
  expect(new StateBag({}).isMissing('test')).toBe(true)
  expect(new StateBag({ a: 'b' }).isMissing('c')).toBe(true)
  expect(new StateBag({ a: undefined }).isMissing('a')).toBe(true)

  expect(new StateBag({ a: '' }).isMissing('a')).toBe(false)
  expect(new StateBag({ a: 'b' }).isMissing('a')).toBe(false)
  expect(new StateBag({ a: null }).isMissing('a')).toBe(false)
  expect(new StateBag({ a: false }).isMissing('a')).toBe(false)
})

test('isMissing: works with nested fields', () => {
  expect(new StateBag({ a: { b: { c: true } } }).isMissing('a')).toBe(false)
  expect(new StateBag({ a: { b: { c: true } } }).isMissing('a.b')).toBe(false)
  expect(new StateBag({ a: { b: { u: undefined } } }).isMissing('a.b.u')).toBe(true)

  expect(new StateBag({ a: { b: { e: '' } } }).isMissing('a.b.e')).toBe(false)
  expect(new StateBag({ a: { b: { n: null } } }).isMissing('a.b.n')).toBe(false)
  expect(new StateBag({ a: { b: { f: false } } }).isMissing('a.b.f')).toBe(false)

  expect(new StateBag({ a: { b: { c: true } } }).isMissing('a.c')).toBe(true)
  expect(new StateBag({ a: { b: { c: true } } }).isMissing('a.b.d')).toBe(true)
})

test('remove', () => {
  expect(new StateBag({}).remove('a').all()).toEqual({ })
  expect(new StateBag({}).remove('a').all()).toEqual({ })
  expect(new StateBag({ a: 1, b: 2 }).remove('a').all()).toEqual({ b: 2 })
  expect(new StateBag({ a: 1, b: 2 }).remove('c').all()).toEqual({ a: 1, b: 2 })
})

test('remove: works with nested fields', () => {
  expect(new StateBag({}).remove('a').all()).toEqual({ })
  expect(new StateBag({}).remove('a').all()).toEqual({ })
  expect(new StateBag({}).remove('a.b.c').all()).toEqual({ })
  expect(new StateBag({ a: { b: { c: 'd' } } }).remove('a').all()).toEqual({ })
  expect(new StateBag({ a: { b: { c: 'd' } } }).remove('a.b').all()).toEqual({ a: {} })
  expect(new StateBag({ a: { b: { c: 'd' } } }).remove('a.b.c').all()).toEqual({ a: { b: {} } })
})

test('clear', () => {
  expect(new StateBag({}).clear().all()).toEqual({ })
  expect(new StateBag({ a: 1, b: 2 }).clear().all()).toEqual({ })
})

test.run()
