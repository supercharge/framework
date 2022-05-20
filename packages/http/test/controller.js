'use strict'

const { test } = require('uvu')
const { expect } = require('expect')
const { Controller } = require('../dist')

const app = {
  key () {
    return '1234'
  }
}

test('controller.app()', async () => {
  class TestController extends Controller {}
  const controller = new TestController(app)

  expect(controller.app).toEqual(app)
})

test.run()
