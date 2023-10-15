
const { test } = require('uvu')
const { expect } = require('expect')
const { FileBag } = require('../dist')

test('all', () => {
  expect(new FileBag().all()).toEqual({})
  expect(new FileBag({}).all()).toEqual({})
  expect(
    new FileBag({ accept: 'application/json' }).all()
  ).toEqual({ accept: 'application/json' })
})

test('all for keys', () => {
  const bag = new FileBag({ a: 1, b: 2, c: 3 })

  expect(bag.all('a')).toEqual({ a: 1 })
  expect(bag.all('a', 'b')).toEqual({ a: 1, b: 2 })
  expect(bag.all(['a', 'b'])).toEqual({ a: 1, b: 2 })
})

test('get', () => {
  expect(new FileBag({}).get()).toEqual(undefined)
  expect(new FileBag().get('test')).toEqual(undefined)
  expect(new FileBag({ a: 'b' }).get('c')).toEqual(undefined)
  expect(new FileBag({ a: 'b' }).get('a')).toEqual('b')
})

test('add', () => {
  expect(new FileBag().add('a', 1).all()).toEqual({ a: 1 })
  expect(new FileBag({}).add('a', 1).all()).toEqual({ a: 1 })

  expect(new FileBag({ a: 'b' }).add('c', 1).all()).toEqual({ a: 'b', c: 1 })

  const bag = new FileBag({ a: 'b' })
  expect(bag.get('a')).toEqual('b')
  expect(bag.add('a', 1).get('a')).toEqual(1)
})

test('has', () => {
  expect(new FileBag({}).has()).toBe(false)
  expect(new FileBag().has('test')).toBe(false)
  expect(new FileBag({ a: 'b' }).has('c')).toBe(false)

  expect(new FileBag({ a: 'b' }).has('a')).toBe(true)
})

test('has', () => {
  expect(new FileBag().isEmpty()).toBe(true)
  expect(new FileBag({}).isEmpty()).toBe(true)

  expect(new FileBag({ a: 'b' }).isEmpty()).toBe(false)

  const bag = new FileBag()
  expect(bag.isEmpty()).toBe(true)
  expect(bag.add('a', 1).isEmpty()).toBe(false)
})

test.run()
