'use strict'

import { supercharge } from '../dist'
import { describe, test, expect } from 'vitest'

describe('supercharge-vite-plugin', () => {
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

  test('uses "supercharge" as the name', async () => {
    const plugin = supercharge('resources/js/app.ts')

    expect(plugin.name).toEqual('supercharge')
  })

  test('enforces plugin invocation "post" other build plugin', async () => {
    const plugin = supercharge('resources/js/app.ts')

    expect(plugin.enforce).toEqual('post')
  })

  test('accepts a single string as inpput', async () => {
    const plugin = supercharge('resources/js/app.ts')

    const config = plugin.config({}, { command: 'build' })
    expect(config.build.outDir).toEqual('public/build')
    expect(config.build.rollupOptions.input).toEqual(['resources/js/app.ts'])
  })

  test('accepts a string array as inpput', async () => {
    const plugin = supercharge(['resources/js/app.ts', 'resources/js/second.ts'])

    const config = plugin.config({}, { command: 'build' })
    expect(config.build.outDir).toEqual('public/build')
    expect(config.build.rollupOptions.input).toEqual([
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
    expect(config.build.outDir).toEqual('other-public/other-build')
    expect(config.build.rollupOptions.input).toEqual('resources/js/app.ts')
  })

  test('accepts a partial configuration object', async () => {
    const plugin = supercharge({
      input: 'resources/js/app.ts',
      // buildDirectory: 'other-build',
      publicDirectory: 'other-public'
    })

    const config = plugin.config({}, { command: 'build' })
    expect(config.base).toEqual('/build/')
    expect(config.build.outDir).toEqual('other-public/build')
  })

  test('handles surrounding slashes on directories', async () => {
    const plugin = supercharge({
      input: 'resources/js/app.ts',
      buildDirectory: '/other-build/test/',
      publicDirectory: '/other-public/test/'
    })

    const config = plugin.config({}, { command: 'build' })
    expect(config.base).toEqual('/other-build/test/')
    expect(config.build.outDir).toEqual('other-public/test/other-build/test')
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
})
