'use strict'

const Path = require('path')
const Helper = require('../../../../helper')
const BaseTest = require('../../../../base-test')
const Application = require('../../../../foundation/application')
const HttpBootstrapper = require('../../../../http/bootstrapper')

class LoadMiddlewareTest extends BaseTest {
  async loadMiddleware (t) {
    Helper.setAppRoot(Path.resolve(__dirname, 'fixtures'))

    const app = new Application()
    const kernel = new HttpBootstrapper(app)
    await kernel.registerCorePlugins()

    kernel._middlewareFolder = 'middleware/works-fine'
    await kernel.loadAppMiddleware()

    app.server.route({
      method: 'GET',
      path: '/',
      handler: () => 'response'
    })

    const request = {
      url: '/',
      method: 'GET'
    }

    const response = await app.server.inject(request)
    t.true(response.result.includes('supercharge class middleware'))
    t.true(response.result.includes('supercharge object middleware'))
  }

  async throwsForInvalidExtensionPoint (t) {
    Helper.setAppRoot(Path.resolve(__dirname, 'fixtures'))

    const app = new Application()
    const kernel = new HttpBootstrapper(app)
    await kernel.registerCorePlugins()

    kernel._middlewareFolder = 'middleware/invalid-extension-point'
    await t.throwsAsync(() => kernel.loadAppMiddleware())
  }

  async throwsForInvalidMiddlewareFormat (t) {
    Helper.setAppRoot(Path.resolve(__dirname, 'fixtures'))

    const app = new Application()
    const kernel = new HttpBootstrapper(app)
    await kernel.registerCorePlugins()

    kernel._middlewareFolder = 'middleware/invalid-format'
    await t.throwsAsync(() => kernel.loadAppMiddleware())
  }

  async ignoresUnavailableMiddlewareFolder (t) {
    Helper.setAppRoot(Path.resolve(__dirname, 'fixtures'))

    const app = new Application()
    const kernel = new HttpBootstrapper(app)
    await kernel.registerCorePlugins()

    await t.notThrowsAsync(() => kernel.loadAppMiddleware())
  }

  async ignoresFilesStartingWithUnderscore (t) {
    Helper.setAppRoot(Path.resolve(__dirname, 'fixtures'))

    const app = new Application()
    const kernel = new HttpBootstrapper(app)
    await kernel.registerCorePlugins()

    kernel._middlewareFolder = 'middleware/starts-with-underscore'
    await kernel.loadAppMiddleware()

    app.server.route({
      method: 'GET',
      path: '/',
      handler: () => 'response'
    })

    const request = {
      url: '/',
      method: 'GET'
    }

    const response = await app.server.inject(request)
    t.true(response.result.includes('supercharge middleware'))
    t.false(response.result.includes('not loaded'))
  }
}

module.exports = new LoadMiddlewareTest()
