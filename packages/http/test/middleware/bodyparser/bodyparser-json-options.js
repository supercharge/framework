
import { test } from 'uvu'
import { expect } from 'expect'
import { BodyparserOptions } from '../../../dist/index.js'

test('limit defaults to 1mb', () => {
  expect(new BodyparserOptions({ }).json().limit()).toEqual(
    1024 * 1024 // 1mb in bytes
  )
})

test('limit', () => {
  expect(new BodyparserOptions({ json: { limit: 10 } }).json().limit()).toEqual(10)
  expect(new BodyparserOptions({ json: { limit: '10b' } }).json().limit()).toEqual(10)
  expect(new BodyparserOptions({ json: { limit: '1kb' } }).json().limit()).toEqual(1024)
})

test('contentTypes', () => {
  expect(
    new BodyparserOptions({ json: { contentTypes: [] } }).json().contentTypes()
  ).toEqual([])

  expect(
    new BodyparserOptions({
      json: { contentTypes: ['application/json', 'text/html'] }
    }).json().contentTypes()
  ).toEqual(['application/json', 'text/html'])

  expect(
    new BodyparserOptions({
      json: { contentTypes: ['Application/JSON', 'text/HTML'] }
    }).json().contentTypes()
  ).toEqual(['application/json', 'text/html'])
})

test.run()
