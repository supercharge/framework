
import { test } from 'uvu'
import { expect } from 'expect'
import { makeApp } from './helpers/index.js'

test('renders raw helper', async () => {
  const app = makeApp()
  const view = app.make('view')
  await view.boot()

  expect(
    await view.render('test-view-helper-raw')
  ).toEqual('{{name}}\n')
})

test('renders stack helper', async () => {
  const app = makeApp()
  const view = app.make('view')
  await view.boot()

  expect(
    await view.render('test-view-helper-stack')
  ).toEqual('  <p>part of test-stack</p>\n')
})

test('renders stack, append, prepend helpers', async () => {
  const app = makeApp()
  const view = app.make('view')
  await view.boot()

  expect(
    await view.render('test-view-helper-stack-append-prepend')
  ).toEqual('\n\n  prepend\n  content\n  append\n')
})

test('json', async () => {
  const app = makeApp()
  const view = app.make('view')
  await view.boot()

  const data = { user: { name: 'Supercharge' } }
  expect(
    await view.render('test-view-helper-json', data)
  ).toEqual(`<p>${JSON.stringify(data.user)}</p>\n`)
})

test('json prettry', async () => {
  const app = makeApp()
  const view = app.make('view')
  await view.boot()

  const data = { user: { name: 'Supercharge' } }
  expect(
    await view.render('test-view-helper-json-pretty', data)
  ).toEqual(`${JSON.stringify(data.user, null, 2)}\n`)
})

test.run()
