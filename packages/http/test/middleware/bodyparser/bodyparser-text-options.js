'use strict'

const { test } = require('uvu')
const { expect } = require('expect')
const { BodyparserOptions } = require('../../../dist')

test('limit defaults to 56kb', () => {
  expect(new BodyparserOptions({ }).text().limit()).toEqual(
    56 * 1024 // 56kb in bytes
  )
})

test('limit', () => {
  expect(new BodyparserOptions({ text: { limit: 10 } }).text().limit()).toEqual(10)
  expect(new BodyparserOptions({ text: { limit: '10b' } }).text().limit()).toEqual(10)
  expect(new BodyparserOptions({ text: { limit: '1kb' } }).text().limit()).toEqual(1024)
})

test('contentTypes', () => {
  expect(
    new BodyparserOptions({ text: { contentTypes: [] } }).text().contentTypes()
  ).toEqual([])

  expect(
    new BodyparserOptions({
      text: { contentTypes: ['text/*'] }
    }).text().contentTypes()
  ).toEqual(['text/*'])

  expect(
    new BodyparserOptions({
      text: { contentTypes: ['TeXt/*'] }
    }).text().contentTypes()
  ).toEqual(['text/*'])
})

test.run()
