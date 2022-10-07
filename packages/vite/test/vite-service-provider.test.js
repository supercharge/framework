'use strict'

import { EOL } from 'node:os'
import { ViteServiceProvider } from '../dist'
import { ViewServiceProvider } from '@supercharge/view'
import { describe, test, expect, beforeEach } from 'vitest'
import { clearViteHotReloadFile, clearViteManifest, createViteManifest, makeApp } from './helpers'

const app = makeApp()

describe('ViteServiceProvider', () => {
  beforeEach(async () => {
    await clearViteManifest(app)
    await clearViteHotReloadFile(app)
  })

  test('registers view helpers', async () => {
    const app = makeApp()

    await app
      .register(new ViewServiceProvider(app))
      .register(new ViteServiceProvider(app))
      .boot()

    const view = app.make('view')

    expect(view.hasHelper('vite')).toBe(true)
  })

  test('render vite view helper with unnamed arguments', async () => {
    const app = makeApp()
    await createViteManifest(app)

    await app
      .register(new ViewServiceProvider(app))
      .register(new ViteServiceProvider(app))
      .boot()

    const rendered = await app.make('view').render('test-vite-helper-unnamed-arguments')

    expect(rendered).toEqual(
      '<script type="module" src="/build/assets/app.version.js"></script>' +
      '<link rel="stylesheet" href="/build/assets/app.version.css" />' + EOL
    )
  })

  test('render vite view helper with named "input" arguments', async () => {
    const app = makeApp()
    await createViteManifest(app)

    await app
      .register(new ViewServiceProvider(app))
      .register(new ViteServiceProvider(app))
      .boot()

    const rendered = await app.make('view').render('test-vite-helper-hash-arguments')

    expect(rendered).toEqual(
      '<script type="module" src="/build/assets/app.from-hash.version.js"></script>' +
      '<link rel="stylesheet" href="/build/assets/app.version.css" />' + EOL
    )
  })

  test('fails to render vite view helper with named "input" arguments and wrong type', async () => {
    const app = makeApp()
    await createViteManifest(app)

    await app
      .register(new ViewServiceProvider(app))
      .register(new ViteServiceProvider(app))
      .boot()

    await expect(
      app.make('view').render('test-vite-helper-hash-arguments-number')
    ).rejects.toThrow('Invalid "input" value in your "vite" helper: only string values are allowed. Received "number"')
  })
})
