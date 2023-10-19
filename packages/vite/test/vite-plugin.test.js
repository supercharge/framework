
import { test } from 'uvu'
import { expect } from 'expect'
import { supercharge } from '../dist/index.js'

/**
 * This helper function translates the given file `path` from a platform-agnostic
 * format to a unix-specific format. For example, Windows uses back-slashes in
 * their paths and POSIX forward slashes. This function replaces a backslash
 * with a forward slash allowing us to use coherent assertions in our tests.
 *
 * @param {String} path
 *
 * @returns {String}
 */
function unixifyPath (path) {
  return String(path).replace(/\\/g, '/')
}

test('throws when missing configuration', async () => {
  expect(() => supercharge())
    .toThrow('supercharge-vite-plugin: missing inputs or configuration')

  expect(() => supercharge({}))
    .toThrow('supercharge-vite-plugin: missing "input" configuration')
})

test('throws for empty publicDirectory configuration', async () => {
  expect(() => supercharge({ input: 'app.ts', publicDirectory: '' }))
    .toThrow('supercharge-vite-plugin: the publicDirectory option must be a subdirectory, like "public"')

  expect(() => supercharge({ input: 'app.ts', publicDirectory: '      /   ' }))
    .toThrow('supercharge-vite-plugin: the publicDirectory option must be a subdirectory, like "public"')
})

test('throws for empty buildDirectory configuration', async () => {
  expect(() => supercharge({ input: 'app.ts', buildDirectory: '' }))
    .toThrow('supercharge-vite-plugin: the buildDirectory option must be a subdirectory, like "build"')

  expect(() => supercharge({ input: 'app.ts', buildDirectory: '      /   ' }))
    .toThrow('supercharge-vite-plugin: the buildDirectory option must be a subdirectory, like "build"')
})

test('throws for empty ssrOutputDirectory configuration', async () => {
  expect(() => supercharge({ input: 'app.ts', ssrOutputDirectory: '' }))
    .toThrow('supercharge-vite-plugin: the ssrOutputDirectory option must be a subdirectory, like "ssr"')

  expect(() => supercharge({ input: 'app.ts', ssrOutputDirectory: '      /   ' }))
    .toThrow('supercharge-vite-plugin: the ssrOutputDirectory option must be a subdirectory, like "ssr"')
})

test('uses "supercharge" as the name', async () => {
  const plugin = supercharge('resources/js/app.ts')

  expect(plugin.name).toEqual('supercharge')
})

test('enforces plugin invocation "post" other build plugin', async () => {
  const plugin = supercharge('resources/js/app.ts')

  expect(plugin.enforce).toEqual('post')
})

test('accepts a single string as input', async () => {
  const plugin = supercharge('resources/js/app.ts')

  const config = plugin.config({}, { command: 'build' })
  expect(
    unixifyPath(config.build.outDir)
  ).toEqual('public/build')
  expect(config.build.rollupOptions.input).toEqual(['resources/js/app.ts'])

  const ssrConfig = plugin.config({ build: { ssr: true } }, { command: 'build' })
  expect(
    unixifyPath(ssrConfig.build.outDir)
  ).toEqual('bootstrap/ssr')
  expect(ssrConfig.build.rollupOptions.input).toEqual(['resources/js/app.ts'])
})

test('accepts a string array as input', async () => {
  const plugin = supercharge(['resources/js/app.ts', 'resources/js/second.ts'])

  const config = plugin.config({}, { command: 'build' })
  expect(
    unixifyPath(config.build.outDir)
  ).toEqual('public/build')
  expect(config.build.rollupOptions.input).toEqual([
    'resources/js/app.ts',
    'resources/js/second.ts'
  ])

  const ssrConfig = plugin.config({ build: { ssr: true } }, { command: 'build' })
  expect(ssrConfig.build.outDir).toEqual('bootstrap/ssr')
  expect(ssrConfig.build.rollupOptions.input).toEqual([
    'resources/js/app.ts',
    'resources/js/second.ts'
  ])
})

test('accepts a full configuration object', async () => {
  const plugin = supercharge({
    input: 'resources/js/app.ts',
    buildDirectory: 'other-build',
    publicDirectory: 'other-public'
  })

  const config = plugin.config({}, { command: 'build' })
  expect(config.base).toEqual('/other-build/')
  expect(config.build.manifest).toBe(true)
  expect(
    unixifyPath(config.build.outDir)
  ).toEqual('other-public/other-build')
  expect(config.build.rollupOptions.input).toEqual('resources/js/app.ts')
})

test('accepts a partial configuration object', async () => {
  const plugin = supercharge({
    input: 'resources/js/app.ts',
    // buildDirectory: 'other-build',
    publicDirectory: 'other-public',
    ssr: 'resources/js/ssr.ts'
  })

  const config = plugin.config({}, { command: 'build' })
  expect(config.base).toEqual('/build/')
  expect(config.build.manifest).toBe(true)
  expect(
    unixifyPath(config.build.outDir)
  ).toEqual('other-public/build')

  const ssrConfig = plugin.config({ build: { ssr: true } }, { command: 'build' })
  expect(ssrConfig.base).toEqual('/build/')
  expect(ssrConfig.build.manifest).toBe(false)
  expect(
    unixifyPath(ssrConfig.build.outDir)
  ).toEqual('bootstrap/ssr')
  expect(ssrConfig.build.rollupOptions.input).toEqual('resources/js/ssr.ts')
})

test('handles surrounding slashes on directories', async () => {
  const plugin = supercharge({
    input: 'resources/js/app.ts',
    buildDirectory: '/other-build/test/',
    publicDirectory: '/other-public/test/',
    ssrOutputDirectory: '/ssr-directory/test/'
  })

  const config = plugin.config({}, { command: 'build' })
  expect(config.base).toEqual('/other-build/test/')
  expect(
    unixifyPath(config.build.outDir)
  ).toEqual('other-public/test/other-build/test')

  const ssrConfig = plugin.config({ build: { ssr: true } }, { command: 'build' })
  expect(
    unixifyPath(ssrConfig.build.outDir)
  ).toEqual('ssr-directory/test')
})

test('prefers a custom outDir over resolved outDir', async () => {
  const plugin = supercharge({
    input: 'resources/js/app.ts',
    buildDirectory: 'other-build',
    publicDirectory: 'other-public'
  })

  const config = plugin.config({ build: { outDir: 'other-outDir' } }, { command: 'build' })
  expect(config.build.outDir).toEqual('other-outDir')
})

test('configures the Vite dev server', async () => {
  const plugin = supercharge('resources/js/app.ts')

  const config = plugin.config({}, { command: 'serve' })
  expect(config.base).toEqual('')
  expect(config.server.origin).toEqual('__supercharge_vite_placeholder__')
})

test('prevents the Inertia helpers from being externalized', () => {
  const plugin = supercharge('resources/js/app.ts')

  const noSsrConfig = plugin.config({ build: { ssr: true } }, { command: 'build' })
  expect(noSsrConfig.ssr.noExternal).toEqual(['supercharge-vite-plugin'])

  const nothingExternalConfig = plugin.config({ ssr: { noExternal: true }, build: { ssr: true } }, { command: 'build' })
  expect(nothingExternalConfig.ssr.noExternal).toBe(true)

  const arrayNoExternalConfig = plugin.config({ ssr: { noExternal: ['foo'] }, build: { ssr: true } }, { command: 'build' })
  expect(arrayNoExternalConfig.ssr.noExternal).toEqual(['foo', 'supercharge-vite-plugin'])

  const stringNoExternalConfig = plugin.config({ ssr: { noExternal: 'foo' }, build: { ssr: true } }, { command: 'build' })
  expect(stringNoExternalConfig.ssr.noExternal).toEqual(['foo', 'supercharge-vite-plugin'])
})

test.run()
