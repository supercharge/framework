'use strict'

const { test } = require('uvu')
const expect = require('expect')
const { Application } = require('../dist')
const { Env } = require('@supercharge/env')

test('app.env()', async () => {
  const app = Application.createWithAppRoot(__dirname)

  expect(app.env()).toBeInstanceOf(Env)
})
test.run()
