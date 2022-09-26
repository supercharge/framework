'use strict'

import { Vite } from '../dist'
import { describe, test, expect, beforeEach } from 'vitest'
import { makeApp, createViteManifest, createViteHotReloadFile, clearViteManifest, clearViteHotReloadFile } from './helpers'

const app = makeApp()

describe('Vite', () => {
  beforeEach(async () => {
    await clearViteManifest(app)
    await clearViteHotReloadFile(app)
  })

  test('JS import', async () => {
    await createViteManifest(app)

    const tags = Vite.generateTags(app, 'resources/js/app.js')

    expect(tags).toEqual('<script type="module" src="/build/assets/app.version.js"></script>')
  })

  test('CSS import', async () => {
    await createViteManifest(app)

    const tags = Vite.generateTags(app, ['resources/css/app.css'])

    expect(tags).toEqual('<link rel="stylesheet" href="/build/assets/app.version.css" />')
  })

  test('JS and CSS imports', async () => {
    await createViteManifest(app)

    const tags = Vite.generateTags(app, ['resources/css/app.css', 'resources/js/app.js'])

    expect(tags).toEqual(
      '<link rel="stylesheet" href="/build/assets/app.version.css" />' +
      '<script type="module" src="/build/assets/app.version.js"></script>'
    )
  })

  test('JS with CSS imports', async () => {
    await createViteManifest(app)

    const tags = Vite.generateTags(app, ['resources/js/app-with-css-import.js'])

    expect(tags).toEqual(
      '<script type="module" src="/build/assets/app-with-css-import.version.js"></script>' +
      '<link rel="stylesheet" href="/build/assets/imported-css.version.css" />'
    )
  })

  test('Vite hot module replacement with JS only', async () => {
    await createViteHotReloadFile(app)

    const tags = Vite.generateTags(app, ['resources/js/app.js'])

    expect(tags).toEqual(
      '<script type="module" src="http://localhost:3000/@vite/client"></script>' +
      '<script type="module" src="http://localhost:3000/resources/js/app.js"></script>'
    )
  })

  test('Vite hot module replacement with JS and CSS', async () => {
    await createViteHotReloadFile(app)

    const tags = Vite.generateTags(app, ['resources/css/app.css', 'resources/js/app.js'])

    expect(tags).toEqual(
      '<script type="module" src="http://localhost:3000/@vite/client"></script>' +
      '<link rel="stylesheet" href="http://localhost:3000/resources/css/app.css" />' +
      '<script type="module" src="http://localhost:3000/resources/js/app.js"></script>'
    )
  })

  test('fails when manifest file is not available', async () => {
    expect(() => {
      Vite.generateTags(app, ['resources/css/app.css', 'resources/js/app.js'])
    }).toThrow(`Vite manifest file not found at: ${app.publicPath('build/manifest.json')}`)
  })

  test('fails when entrypoint is missing in manifest file', async () => {
    await createViteManifest(app)

    expect(() => {
      Vite.generateTags(app, ['missing/entrypoing/file.css'])
    }).toThrow('Entrypoint not found in manifest: missing/entrypoing/file.css')
  })
})
