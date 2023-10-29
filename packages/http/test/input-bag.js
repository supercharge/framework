
import { test } from 'uvu'
import { expect } from 'expect'
import { InputBag } from '../dist/index.js'

test('all', () => {
  expect(new InputBag({}).all()).toEqual({})
  expect(
    new InputBag({ accept: 'application/json' }).all()
  ).toEqual({ accept: 'application/json' })
})

test('all for keys', () => {
  const bag = new InputBag({ a: 1, b: 2, c: 3 })

  expect(bag.all('a')).toEqual({ a: 1 })
  expect(bag.all('a', 'b')).toEqual({ a: 1, b: 2 })
  expect(bag.all(['a', 'b'])).toEqual({ a: 1, b: 2 })
})

test('get', () => {
  expect(new InputBag({}).get()).toEqual(undefined)
  expect(new InputBag({}).get('test')).toEqual(undefined)
  expect(new InputBag({ a: 'b' }).get('c')).toEqual(undefined)
  expect(new InputBag({ a: 'b' }).get('a')).toEqual('b')
})

test('set', () => {
  expect(new InputBag({}).set('a', 1).all()).toEqual({ a: 1 })

  expect(new InputBag({ a: 'b' }).set('c', 1).all()).toEqual({ a: 'b', c: 1 })

  const bag = new InputBag({ a: 'b' })
  expect(bag.get('a')).toEqual('b')
  expect(bag.set('a', 1).get('a')).toEqual(1)
})

test('has', () => {
  expect(new InputBag({}).has()).toBe(false)
  expect(new InputBag({}).has('test')).toBe(false)
  expect(new InputBag({ a: 'b' }).has('c')).toBe(false)

  expect(new InputBag({ a: 'b' }).has('a')).toBe(true)
})

test('remove', () => {
  expect(new InputBag({}).remove('a').all()).toEqual({ })
  expect(new InputBag({}).remove('a').all()).toEqual({ })
  expect(new InputBag({ a: 1, b: 2 }).remove('a').all()).toEqual({ b: 2 })
  expect(new InputBag({ a: 1, b: 2 }).remove('c').all()).toEqual({ a: 1, b: 2 })
})

test.run()
