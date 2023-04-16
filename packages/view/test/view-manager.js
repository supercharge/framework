'use strict'

const { test } = require('uvu')
const { expect } = require('expect')
const { makeApp } = require('./helpers')

test('renders a view', async () => {
  const app = makeApp()
  const view = app.make('view')
  await view.boot()

  expect(
    await view.render('test-view')
  ).toEqual('<p>Test View: </p>\n')
})

test('throws for missing view file', async () => {
  const app = makeApp()
  const view = app.make('view')
  await view.boot()

  await expect(async () => {
    await view.render('not-existing-test-view')
  }).rejects.toThrow('View file does not exist.')
})

test('renders a view with data', async () => {
  const app = makeApp()
  const view = app.make('view')
  await view.boot()

  expect(
    await view.render('test-view', { name: 'Supercharge ' })
  ).toEqual('<p>Test View: Supercharge </p>\n')
})

test('renders a view with data and layout', async () => {
  const app = makeApp()
  const view = app.make('view')
  await view.boot()

  expect(
    await view.render('test-view', { name: 'Supercharge ' }, { layout: 'test' })
  ).toEqual('<div class="layout">\n  <p>Test View: Supercharge </p>\n\n</div>\n')
})

test('throws for invalid views path', async () => {
  const app = makeApp()
  const viewsPath = app.resourcePath('not-existing-views-path')
  app.config().set('view.handlebars.views', viewsPath)

  const view = app.make('view')
  await view.boot()

  await expect(async () => {
    return view.render('test-view')
  }).rejects.toThrow(`Path to view files not existing. Received ${viewsPath}`)
})

test('throws when rendering a view with not-existing layout', async () => {
  const app = makeApp()
  const view = app.make('view')
  await view.boot()

  await expect(async () => {
    await view.render('test-view', { name: 'Supercharge ' }, { layout: 'not-existing' })
  }).rejects.toThrow()
})

test('throws for misconfigured layouts path', async () => {
  const app = makeApp()

  const layoutsPath = app.resourcePath('not-existing-layouts-path')
  app.config().set('view.handlebars.layouts', layoutsPath)

  const view = app.make('view')
  await view.boot()

  await expect(async () => {
    await view.render('test-view', { name: 'Supercharge ' }, { layout: 'test' })
  }).rejects.toThrow(`Path to view layouts not existing. Received ${layoutsPath}`)
})

test('throws when rendering a view with not-existing layout', async () => {
  const app = makeApp()
  const view = app.make('view')
  await view.boot()

  await expect(async () => {
    await view.render('test-view', { name: 'Supercharge ' }, { layout: 'not-existing' })
  }).rejects.toThrow()
})

test('renders partials', async () => {
  const app = makeApp()
  const view = app.make('view')
  await view.boot()

  expect(
    await view.render('test-view-with-partial', { name: 'Supercharge ' })
  ).toEqual('<p>Test View: Supercharge </p>\n<p>Test Partial</p>\n')
})

test('exists', async () => {
  const app = makeApp()
  const view = app.make('view')
  await view.boot()

  expect(await view.exists('test-view')).toBe(true)
  expect(await view.exists('not-existing-test-view')).toBe(false)
})

test('registerPartial', async () => {
  const app = makeApp()
  const view = app.make('view')
  view.registerPartial('test', '<div id="testing-div">this is a test partial</div>')
  await view.boot()

  expect(
    await view.render('test-view-with-in-memory-partial')
  ).toEqual('<p>Test View: <div id="testing-div">this is a test partial</div></p>\n')
})

test('registerHelper', async () => {
  const app = makeApp()
  const view = app.make('view')
  view.registerHelper('test', () => {
    return 'this-comes-from-test-helper'
  })

  expect(
    await view.render('test-view-with-in-memory-helper')
  ).toEqual('<p>Test View: this-comes-from-test-helper</p>\n')
})

test.run()
