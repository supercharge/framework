
const { test } = require('uvu')
const { expect } = require('expect')
const { setupApp } = require('./helpers')
const { Controller } = require('../dist')

const app = setupApp()

test('controller.app()', async () => {
  class TestController extends Controller {}
  const controller = new TestController(app)

  expect(controller.app).toEqual(app)
})

test.run()
