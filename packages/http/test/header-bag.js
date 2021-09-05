'use strict'

const { test } = require('uvu')
const expect = require('expect')
const { HeaderBag } = require('../dist')

test('all', () => {
  expect(new HeaderBag().all()).toEqual({})
  expect(new HeaderBag({}).all()).toEqual({})
  expect(
    new HeaderBag({ accept: 'application/json' }).all()
  ).toEqual({ accept: 'application/json' })
})

test('all for keys', () => {
  const bag = new HeaderBag({ a: 1, b: 2, c: 3 })

  expect(bag.all('a')).toEqual({ a: 1 })
  expect(bag.all('a', 'b')).toEqual({ a: 1, b: 2 })
  expect(bag.all(['a', 'b'])).toEqual({ a: 1, b: 2 })
})

test('get', () => {
  expect(new HeaderBag({}).get()).toEqual(undefined)
  expect(new HeaderBag().get('test')).toEqual(undefined)
  expect(new HeaderBag({ a: 'b' }).get('c')).toEqual(undefined)
  expect(new HeaderBag({ a: 'b' }).get('a')).toEqual('b')
})

test('set', () => {
  expect(new HeaderBag().set('a', 1).all()).toEqual({ a: 1 })
  expect(new HeaderBag({}).set('a', 1).all()).toEqual({ a: 1 })

  expect(new HeaderBag({ a: 'b' }).set('c', 1).all()).toEqual({ a: 'b', c: 1 })

  const bag = new HeaderBag({ a: 'b' })
  expect(bag.get('a')).toEqual('b')
  expect(bag.set('a', 1).get('a')).toEqual(1)
})

test('has', () => {
  expect(new HeaderBag({}).has()).toBe(false)
  expect(new HeaderBag().has('test')).toBe(false)
  expect(new HeaderBag({ a: 'b' }).has('c')).toBe(false)

  expect(new HeaderBag({ a: 'b' }).has('a')).toBe(true)
})

test.run()
