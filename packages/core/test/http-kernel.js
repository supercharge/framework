'use strict'

const Sinon = require('sinon')
const { test } = require('uvu')
const expect = require('expect')
const { HttpKernel } = require('../dist')

test('registers and calls booted callbacks', async () => {
  let booted = false

  const kernel = new HttpKernel()
  kernel.booted(() => {
    booted = true
  })

  const listenStub = Sinon.stub(kernel, 'listen').returns()
  const bootstrapStub = Sinon.stub(kernel, 'bootstrap').returns()

  await kernel.startServer()
  expect(booted).toBe(true)

  listenStub.restore()
  bootstrapStub.restore()
})

test.run()
