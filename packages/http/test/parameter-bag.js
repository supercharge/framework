
const { test } = require('uvu')
const { expect } = require('expect')
const { ParameterBag } = require('../dist')

test('all', () => {
  expect(new ParameterBag({}).all()).toEqual({})
  expect(
    new ParameterBag({ accept: 'application/json' }).all()
  ).toEqual({ accept: 'application/json' })
})

test('all for keys', () => {
  const bag = new ParameterBag({ a: 1, b: 2, c: 3 })

  expect(bag.all('a')).toEqual({ a: 1 })
  expect(bag.all('a', 'b')).toEqual({ a: 1, b: 2 })
  expect(bag.all(['a', 'b'])).toEqual({ a: 1, b: 2 })
})

test('get', () => {
  expect(new ParameterBag({}).get()).toEqual(undefined)
  expect(new ParameterBag({}).get('test')).toEqual(undefined)
  expect(new ParameterBag({ a: 'b' }).get('c')).toEqual(undefined)
  expect(new ParameterBag({ a: 'b' }).get('a')).toEqual('b')
})

test('set', () => {
  expect(new ParameterBag({}).set('a', 1).all()).toEqual({ a: 1 })

  expect(new ParameterBag({ a: 'b' }).set('c', 1).all()).toEqual({ a: 'b', c: 1 })

  const bag = new ParameterBag({ a: 'b' })
  expect(bag.get('a')).toEqual('b')
  expect(bag.set('a', 1).get('a')).toEqual(1)
})

test('has', () => {
  expect(new ParameterBag({}).has()).toBe(false)
  expect(new ParameterBag({}).has('test')).toBe(false)
  expect(new ParameterBag({ a: 'b' }).has('c')).toBe(false)

  expect(new ParameterBag({ a: 'b' }).has('a')).toBe(true)
})

test('remove', () => {
  expect(new ParameterBag({}).remove('a').all()).toEqual({ })
  expect(new ParameterBag({}).remove('a').all()).toEqual({ })
  expect(new ParameterBag({ a: 1, b: 2 }).remove('a').all()).toEqual({ b: 2 })
  expect(new ParameterBag({ a: 1, b: 2 }).remove('c').all()).toEqual({ a: 1, b: 2 })
})

test.run()
