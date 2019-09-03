'use strict'

const Path = require('path')
const Helper = require('../../../../../helper')
const BaseTest = require('../../../../../base-test')
const HttpKernel = require('../../../../../http/kernel')
const Application = require('../../../../../foundation/application')

class LoadMiddlewareTest extends BaseTest {
  async loadMiddleware (t) {
    Helper.setAppRoot(Path.resolve(__dirname, 'fixtures'))

    const kernel = new HttpKernel(new Application())
    await kernel._createServer()
    await kernel._registerCorePlugins()

    kernel._middlewareFolder = 'middleware/works-fine'
    await kernel._loadAppMiddleware()

    const server = kernel.getServer()

    server.route({
      method: 'GET',
      path: '/',
      handler: () => 'response'
    })

    const request = {
      url: '/',
      method: 'GET'
    }

    const response = await server.inject(request)
    t.true(response.result.includes('supercharge class middleware'))
    t.true(response.result.includes('supercharge object middleware'))
  }

  async throwsForInvalidExtensionPoint (t) {
    Helper.setAppRoot(Path.resolve(__dirname, 'fixtures'))

    const kernel = new HttpKernel(new Application())
    await kernel._createServer()
    await kernel._registerCorePlugins()

    kernel._middlewareFolder = 'middleware/invalid-extension-point'
    await t.throwsAsync(kernel._loadAppMiddleware())
  }

  async throwsForInvalidMiddlewareFormat (t) {
    Helper.setAppRoot(Path.resolve(__dirname, 'fixtures'))

    const kernel = new HttpKernel(new Application())
    await kernel._createServer()
    await kernel._registerCorePlugins()

    kernel._middlewareFolder = 'middleware/invalid-format'
    await t.throwsAsync(kernel._loadAppMiddleware())
  }

  async ignoresUnavailableMiddlewareFolder (t) {
    Helper.setAppRoot(Path.resolve(__dirname, 'fixtures'))

    const kernel = new HttpKernel(new Application())
    await kernel._createServer()
    await kernel._registerCorePlugins()

    await t.notThrowsAsync(kernel._loadAppMiddleware())
  }

  async ignoresFilesStartingWithUnderscore (t) {
    Helper.setAppRoot(Path.resolve(__dirname, 'fixtures'))

    const kernel = new HttpKernel(new Application())
    await kernel._createServer()
    await kernel._registerCorePlugins()

    kernel._middlewareFolder = 'middleware/starts-with-underscore'
    await kernel._loadAppMiddleware()

    const server = kernel.getServer()

    server.route({
      method: 'GET',
      path: '/',
      handler: () => 'response'
    })

    const request = {
      url: '/',
      method: 'GET'
    }

    const response = await server.inject(request)
    t.true(response.result.includes('supercharge middleware'))
    t.false(response.result.includes('not loaded'))
  }
}

module.exports = new LoadMiddlewareTest()
