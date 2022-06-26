'use strict'

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

test('add', () => {
  expect(new StateBag({ state: {} }).add('a', 1).all()).toEqual({ a: 1 })

  expect(new StateBag({ state: { a: 'b' } }).add('c', 1).all()).toEqual({ a: 'b', c: 1 })

  const bag = new StateBag({ state: { a: 'b' } })
  expect(bag.get('a')).toEqual('b')
  expect(bag.add('a', 1).get('a')).toEqual(1)

  expect(() => {
    bag.add([1, 2, 3])
  }).toThrow('Invalid argument when setting state via "state().set()". Expected a key-value-pair or object as the first argument.')
})

test('has', () => {
  expect(new StateBag({ state: {} }).has()).toBe(false)
  expect(new StateBag({ state: {} }).has('test')).toBe(false)
  expect(new StateBag({ state: { a: 'b' } }).has('c')).toBe(false)

  expect(new StateBag({ state: { a: 'b' } }).has('a')).toBe(true)
})

test('isMissing', () => {
  expect(new StateBag({ state: {} }).isMissing()).toBe(true)
  expect(new StateBag({ state: {} }).isMissing('test')).toBe(true)
  expect(new StateBag({ state: { a: 'b' } }).isMissing('c')).toBe(true)

  expect(new StateBag({ state: { a: 'b' } }).isMissing('a')).toBe(false)
})

test('remove', () => {
  expect(new StateBag({ state: {} }).remove('a').all()).toEqual({ })
  expect(new StateBag({ state: {} }).remove('a').all()).toEqual({ })
  expect(new StateBag({ state: { a: 1, b: 2 } }).remove('a').all()).toEqual({ b: 2 })
  expect(new StateBag({ state: { a: 1, b: 2 } }).remove('c').all()).toEqual({ a: 1, b: 2 })
})

test('clear', () => {
  expect(new StateBag({ state: {} }).clear().all()).toEqual({ })
  expect(new StateBag({ state: { a: 1, b: 2 } }).clear().all()).toEqual({ })
})

test.run()
