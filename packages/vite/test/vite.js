
import { test } from 'uvu'
import { expect } from 'expect'
import { Vite } from '../dist/index.js'
import { makeApp, createViteManifest, createViteHotReloadFile, clearViteManifest, clearViteHotReloadFile, createViteConfig } from './helpers/index.js'

const app = makeApp()

test.before.each(async () => {
  await clearViteManifest()
  await clearViteHotReloadFile()
})

test('JS import', async () => {
  const viteConfig = createViteConfig()
  await createViteManifest(viteConfig)

  const tags = Vite
    .from(viteConfig)
    .generateTagsFromEntrypoints('resources/js/app.js')
    .toString()

  expect(tags).toEqual('<script src="/build/assets/app.version.js" type="module"></script>')
})

test('JS import with default attribute', async () => {
  const viteConfig = createViteConfig({
    scriptAttributes: {
      foo: 'bar'
    }
  })
  await createViteManifest(viteConfig)

  const tags = Vite
    .from(viteConfig)
    .generateTagsFromEntrypoints('resources/js/app.js')
    .toString()

  expect(tags).toEqual('<script src="/build/assets/app.version.js" type="module" foo="bar"></script>')
})

test('CSS import', async () => {
  const viteConfig = createViteConfig()
  await createViteManifest(viteConfig)

  const tags = Vite
    .from(viteConfig)
    .generateTagsFromEntrypoints(['resources/css/app.css'])
    .toString()

  expect(tags).toEqual('<link href="/build/assets/app.version.css" rel="stylesheet" />')
})

test('JS and CSS imports (sorts CSS first)', async () => {
  const viteConfig = createViteConfig()
  await createViteManifest(viteConfig)

  const tags = Vite
    .from(viteConfig)
    .generateTagsFromEntrypoints(['resources/js/app.js', 'resources/css/app.css'])
    .toString()

  expect(tags).toEqual(
    '<link href="/build/assets/app.version.css" rel="stylesheet" />' +
    '<script src="/build/assets/app.version.js" type="module"></script>'
  )
})

test('JS with CSS imports', async () => {
  const viteConfig = createViteConfig()
  await createViteManifest(viteConfig)

  const tags = Vite
    .from(viteConfig)
    .generateTagsFromEntrypoints(['resources/js/app-with-css-import.js'])
    .toString()

  expect(tags).toEqual(
    '<link href="/build/assets/imported-css.version.css" rel="stylesheet" />' +
    '<script src="/build/assets/app-with-css-import.version.js" type="module"></script>'
  )
})

test('Vite hot module replacement with JS only', async () => {
  await createViteHotReloadFile()
  const viteConfig = createViteConfig()

  const tags = Vite
    .from(viteConfig)
    .generateTagsFromEntrypoints(['resources/js/app.js'])
    .toString()

  expect(tags).toEqual(
    '<script src="http://localhost:3000/@vite/client" type="module"></script>' +
    '<script src="http://localhost:3000/resources/js/app.js" type="module"></script>'
  )
})

test('Vite hot module replacement with JS and CSS (sorts tags in input order)', async () => {
  await createViteHotReloadFile()
  const viteConfig = createViteConfig()

  const tags = Vite
    .from(viteConfig)
    .generateTagsFromEntrypoints(['resources/css/app.css', 'resources/js/app.js'])
    .toString()

  expect(tags).toEqual(
    '<script src="http://localhost:3000/@vite/client" type="module"></script>' +
    '<link href="http://localhost:3000/resources/css/app.css" rel="stylesheet" />' +
    '<script src="http://localhost:3000/resources/js/app.js" type="module"></script>'
  )
})

test('Vite uses a full asset URL', async () => {
  const viteConfig = createViteConfig({ assetsUrl: 'https://superchargejs.com/assets-dir/' })
  // await createViteHotReloadFile(viteConfig)
  await createViteManifest(viteConfig)

  const tags = Vite
    .from(viteConfig)
    .generateTagsFromEntrypoints(['resources/js/app-with-css-import.js'])
    .toString()

  expect(tags).toEqual(
    '<link href="https://superchargejs.com/assets-dir/assets/imported-css.version.css" rel="stylesheet" />' +
    '<script src="https://superchargejs.com/assets-dir/assets/app-with-css-import.version.js" type="module"></script>'
  )
})

test('fails when manifest file is not available', async () => {
  const viteConfig = createViteConfig()

  expect(() => {
    Vite
      .from(viteConfig)
      .generateTagsFromEntrypoints(['resources/css/app.css', 'resources/js/app.js'])
      .toString()
  }).toThrow(`Vite manifest file not found at path: ${app.publicPath('build/.vite/manifest.json')}`)
})

test('fails when entrypoint is missing in manifest file', async () => {
  await createViteManifest()
  const viteConfig = createViteConfig()

  expect(() => {
    Vite.from(viteConfig)
      .generateTagsFromEntrypoints(['missing/entrypoing/file.css'])
      .toString()
  }).toThrow('Entrypoint not found in manifest: "missing/entrypoing/file.css"')
})

test.run()
