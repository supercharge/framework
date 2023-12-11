
import { test } from 'uvu'
import { EOL } from 'node:os'
import { expect } from 'expect'
import { ViteServiceProvider } from '../dist/index.js'
import { HttpServiceProvider } from '@supercharge/http'
import { ViewServiceProvider } from '@supercharge/view'
import { clearViteHotReloadFile, clearViteManifest, createViteManifest, makeApp } from './helpers/index.js'

test.before.each(async () => {
  await clearViteManifest()
  await clearViteHotReloadFile()
})

test('registers view helpers', async () => {
  const app = makeApp()

  await app
    .register(new HttpServiceProvider(app))
    .register(new ViewServiceProvider(app))
    .register(new ViteServiceProvider(app))
    .boot()

  const view = app.make('view')

  expect(view.hasHelper('vite')).toBe(true)
})

test('render Vite view helper with unnamed arguments', async () => {
  const app = makeApp()
  await createViteManifest()

  await app
    .register(new HttpServiceProvider(app))
    .register(new ViewServiceProvider(app))
    .register(new ViteServiceProvider(app))
    .boot()

  const rendered = await app.make('view').render('test-vite-helper-unnamed-arguments')

  expect(rendered).toEqual(
    '<link href="/build/assets/app.version.css" rel="stylesheet" />' +
    '<script src="/build/assets/app.version.js" type="module"></script>' +
    EOL
  )
})

test('render Vite view helper with named "input" arguments', async () => {
  const app = makeApp()
  await createViteManifest()

  await app
    .register(new HttpServiceProvider(app))
    .register(new ViewServiceProvider(app))
    .register(new ViteServiceProvider(app))
    .boot()

  const rendered = await app.make('view').render('test-vite-helper-hash-arguments')

  expect(rendered).toEqual(
    '<link href="/build/assets/app.version.css" rel="stylesheet" />' +
    '<script src="/build/assets/app.from-hash.version.js" type="module"></script>' +
    EOL
  )
})

test('render Vite view helper with named "input" and "attributes"', async () => {
  const app = makeApp()
  await createViteManifest()

  await app
    .register(new HttpServiceProvider(app))
    .register(new ViewServiceProvider(app))
    .register(new ViteServiceProvider(app))
    .boot()

  const rendered = await app.make('view').render('test-vite-helper-with-attributes')

  expect(rendered).toEqual(
    '<link href="/build/assets/app.version.css" rel="stylesheet" data-turbo-track="reload" async />' +
    '<script src="/build/assets/app.from-hash.version.js" type="module" data-turbo-track="reload" async></script>' +
    EOL
  )
})

test('fails to render vite view helper with named "input" arguments and wrong type', async () => {
  const app = makeApp()
  await createViteManifest()

  await app
    .register(new HttpServiceProvider(app))
    .register(new ViewServiceProvider(app))
    .register(new ViteServiceProvider(app))
    .boot()

  await expect(
    app.make('view').render('test-vite-helper-hash-arguments-number')
  ).rejects.toThrow('Invalid "input" value in your "vite" helper: only string values are allowed. Received "number"')
})

test.run()
