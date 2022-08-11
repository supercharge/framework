'use strict'

import { ViteServiceProvider } from '../dist'
import { ViewServiceProvider } from '@supercharge/view'
import { describe, test, expect, afterEach } from 'vitest'
import { clearViteHotReloadFile, clearViteManifest, createViteManifest, makeApp } from './helpers'

const app = makeApp()

describe('ViteServiceProvider', () => {
  afterEach(async () => {
    await clearViteManifest(app)
    await clearViteHotReloadFile(app)
  })

  test('registers view helpers', async () => {
    const app = makeApp()

    app
      .register(new ViewServiceProvider(app))
      .register(new ViteServiceProvider(app))

    const view = app.make('view')

    expect(view.hasHelper('vite')).toBe(true)
  })

  test('calls view helper', async () => {
    const app = makeApp()
    await createViteManifest(app)

    app
      .register(new ViewServiceProvider(app))
      .register(new ViteServiceProvider(app))

    const rendered = await app.make('view').render('test-vite-helper')

    expect(rendered).toEqual(
      '<script type="module" src="/build/assets/app.version.js"></script>' +
      '<link rel="stylesheet" href="/build/assets/app.version.css" />\n'
    )
  })
})
