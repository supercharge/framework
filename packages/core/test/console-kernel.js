'use strict'

const Path = require('path')
const Sinon = require('sinon')
const { test } = require('uvu')
const { expect } = require('expect')
const { Application, ConsoleKernel } = require('../dist')

const app = Application.createWithAppRoot(Path.resolve(__dirname, 'fixtures'))
app.config().set('app.key', 1234)

test('static .for(app)', async () => {
  expect(ConsoleKernel.for(app)).toBeInstanceOf(ConsoleKernel)
  expect(ConsoleKernel.for(app).app()).toBeInstanceOf(Application)
})

test('.bootstrappers()', async () => {
  const bootstrappers = ConsoleKernel.for(app).bootstrappers()
  expect(bootstrappers.length).toBe(5)
})

test('.bootstrap()', async () => {
  const kernel = ConsoleKernel.for(app)
  await kernel.bootstrap()

  expect(
    kernel.craft().commands().map(command => {
      return command.getName()
    }).toArray()
  ).toEqual(['help'])
})

test('.loadFrom()', async () => {
  const kernel = ConsoleKernel.for(app)
  await kernel.loadFrom(
    Path.resolve(__dirname, 'fixtures/app/console/commands')
  )

  expect(
    kernel.craft().commands().map(command => {
      return command.getName()
    }).toArray()
  ).toEqual(['help', 'test:command'])
})

test('.run()', async () => {
  const kernel = ConsoleKernel.for(app)
  await kernel.loadFrom(
    Path.resolve(__dirname, 'fixtures/app/console/commands')
  )

  const consoleLogStub = Sinon.stub(console, 'log').returns()
  const terminateStub = Sinon.stub(kernel.craft(), 'terminate').returns()

  await kernel.run(['test:command'])

  expect(terminateStub.callCount).toBe(1)
  expect(consoleLogStub.callCount).toBe(1)
  expect(consoleLogStub.calledWith('running test:command')).toBe(true)

  terminateStub.restore()
  consoleLogStub.restore()
})

test.run()
