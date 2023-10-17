
import { test } from 'uvu'
import { expect } from 'expect'
import { setupApp } from './helpers/index.js'
import { Controller } from '../dist/index.js'

const app = setupApp()

test('controller.app()', async () => {
  class TestController extends Controller {}
  const controller = new TestController(app)

  expect(controller.app).toEqual(app)
})

test.run()
