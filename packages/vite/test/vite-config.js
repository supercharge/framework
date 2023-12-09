
import { test } from 'uvu'
import { expect } from 'expect'
import { ViteConfig } from '../dist/index.js'

test('default Vite config', async () => {
  const config = ViteConfig.from()

  expect(config.toJSON()).toEqual({
    assetsUrl: '/build',
    hotReloadFilePath: '/build/.vite/hot.json',
    manifestFilePath: '/build/.vite/manifest.json',
    styleAttributes: {},
    scriptAttributes: {}
  })
})

test('assetsUrl', async () => {
  expect(
    ViteConfig.from({ assetsUrl: 'build' }).toJSON()
  ).toMatchObject({
    assetsUrl: '/build',
    hotReloadFilePath: '/build/.vite/hot.json',
    manifestFilePath: '/build/.vite/manifest.json'
  })

  expect(
    ViteConfig.from({ assetsUrl: 'build/' }).toJSON()
  ).toMatchObject({
    assetsUrl: '/build',
    hotReloadFilePath: '/build/.vite/hot.json',
    manifestFilePath: '/build/.vite/manifest.json'
  })

  expect(
    ViteConfig.from({ assetsUrl: '//foo/bar' }).toJSON()
  ).toMatchObject({
    assetsUrl: '/foo/bar',
    hotReloadFilePath: '/foo/bar/.vite/hot.json',
    manifestFilePath: '/foo/bar/.vite/manifest.json'
  })
})

test('hotReloadFilePath', async () => {
  expect(
    ViteConfig.from({ hotReloadFilePath: 'foo/bar/hot.json' }).toJSON()
  ).toMatchObject({
    hotReloadFilePath: 'foo/bar/hot.json'
  })

  expect(
    ViteConfig.from({
      assetsUrl: '/build',
      hotReloadFilePath: 'foo/bar/hot.json'
    }).toJSON()
  ).toMatchObject({
    assetsUrl: '/build',
    hotReloadFilePath: 'foo/bar/hot.json'
  })
})

test('manifestFilePath', async () => {
  expect(
    ViteConfig.from({ manifestFilePath: 'foo/bar/manifest.json' }).toJSON()
  ).toMatchObject({
    manifestFilePath: 'foo/bar/manifest.json'
  })

  expect(
    ViteConfig.from({
      assetsUrl: '/build',
      manifestFilePath: 'foo/bar/manifest.json'
    }).toJSON()
  ).toMatchObject({
    assetsUrl: '/build',
    manifestFilePath: 'foo/bar/manifest.json'
  })
})

test.run()
