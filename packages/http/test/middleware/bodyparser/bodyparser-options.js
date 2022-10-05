'use strict'

const { test } = require('uvu')
const { expect } = require('expect')
const { BodyparserOptions } = require('../../../dist')

test('encoding', () => {
  expect(new BodyparserOptions({}).encoding()).toEqual('utf8')
  expect(new BodyparserOptions({ encoding: 'hex' }).encoding()).toEqual('hex')
})

test('methods', () => {
  expect(new BodyparserOptions({}).methods()).toEqual([])

  expect(
    new BodyparserOptions({ methods: ['DELETE', 'post', 'PUT'] }).methods()
  ).toEqual(['DELETE', 'POST', 'PUT'])
})

test.run()
