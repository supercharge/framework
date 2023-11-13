
import Sinon from 'sinon'
import { test } from 'uvu'
import Path from 'node:path'
import { expect } from 'expect'
import { fileURLToPath } from 'node:url'
import { Application, ConsoleKernel } from '../dist/index.js'

const __dirname = Path.dirname(fileURLToPath(import.meta.url))
const appRootPath = Path.resolve(__dirname, './fixtures')

const app = Application.createWithAppRoot(appRootPath)
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

test('.loadCommandsFromPaths()', async () => {
  const commandsPath = Path.resolve(__dirname, './fixtures/app/console/commands')

  const kernel = ConsoleKernel.for(app)
  await kernel.loadCommandsFromPaths(commandsPath)

  expect(
    kernel.craft().commands().map(command => {
      return command.getName()
    }).toArray()
  ).toEqual(['help', 'test:command'])
})

test('.run()', async () => {
  const commandsPath = Path.resolve(__dirname, './fixtures/app/console/commands')

  const kernel = ConsoleKernel.for(app)
  await kernel.loadCommandsFromPaths(commandsPath)

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
