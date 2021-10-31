'use strict'

const { test } = require('uvu')
const expect = require('expect')
const { BodyparserOptions } = require('../../../dist')

test('maxFileSize defaults to 200mb', () => {
  expect(new BodyparserOptions({ }).multipart().maxFileSize()).toEqual(
    200 * 1024 * 1024 // 200mb in bytes
  )
})

test('maxFileSize', () => {
  expect(
    new BodyparserOptions({ multipart: { maxFileSize: 0 } }).multipart().maxFileSize()
  ).toEqual(0)

  expect(
    new BodyparserOptions({ multipart: { maxFileSize: 10 } }).multipart().maxFileSize()
  ).toEqual(10)

  expect(
    new BodyparserOptions({ multipart: { maxFileSize: '10kb' } }).multipart().maxFileSize()
  ).toEqual(10 * 1024)
})

test('maxFields defaults to 1000', () => {
  expect(new BodyparserOptions({ }).multipart().maxFields()).toEqual(1000)
})

test('maxFields', () => {
  expect(new BodyparserOptions({ multipart: { maxFields: 0 } }).multipart().maxFields()).toEqual(0)
  expect(new BodyparserOptions({ multipart: { maxFields: 10 } }).multipart().maxFields()).toEqual(10)
})

test('contentTypes', () => {
  expect(
    new BodyparserOptions({ multipart: { contentTypes: [] } }).multipart().contentTypes()
  ).toEqual([])

  expect(
    new BodyparserOptions({
      multipart: { contentTypes: ['multipart/form-data'] }
    }).multipart().contentTypes()
  ).toEqual(['multipart/form-data'])

  expect(
    new BodyparserOptions({
      multipart: { contentTypes: ['Multipart/FORM-DaTa'] }
    }).multipart().contentTypes()
  ).toEqual(['multipart/form-data'])
})

test.run()
