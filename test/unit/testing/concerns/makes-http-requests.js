'use strict'

const Path = require('path')
const Fs = require('../../../../filesystem')
const Config = require('../../../../config')
const Helper = require('../../../../helper')
const Encryption = require('../../../../encryption')
const BaseTest = require('../../../../base-test')

class MakesHttpRequestsTest extends BaseTest {
  async before () {
    Config.set('app.key', 'a'.repeat(32))

    await Fs.ensureDir('./temp/layouts')
    await Fs.ensureDir('./temp/helpers')
    await Fs.ensureDir('./temp/partials')

    this.stub = this.stub(Helper, 'resourcePath').returns(Path.resolve('./temp'))
  }

  async after () {
    this.stub.restore()

    await Fs.remove('./temp')
  }

  async assignsKeyValueHeader (t) {
    const request = await this.withHeader('name', 'Marcus')

    t.deepEqual(request.headers, { name: 'Marcus' })
  }

  async assignsHeadersAsObject (t) {
    const request = await this.withHeaders({ passion: 'Supercharge' })

    t.deepEqual(request.headers, { passion: 'Supercharge' })
  }

  async withoutMiddlewareAsString (t) {
    const request = await this.withoutMiddleware('testing')

    t.deepEqual(request.excludedMiddleware, ['testing'])
  }

  async withoutMiddlewareAsArray (t) {
    const request = await this.withoutMiddleware(['testing'])

    t.deepEqual(request.excludedMiddleware, ['testing'])
  }

  async withoutMiddlewareUnique (t) {
    const request = await this
      .withoutMiddleware(['testing'])
      .withoutMiddleware(['testing'])

    t.deepEqual(request.excludedMiddleware, ['testing'])
  }

  async usesCookies (t) {
    const response = await this.withCookie('name', 'Marcus').get('/cookie')

    t.is(response.statusCode, 404)
  }

  async canActAs (t) {
    const request = await this.actAs({ name: 'Marcus' })

    t.deepEqual(request.user, { name: 'Marcus' })
  }

  async usesPayload (t) {
    const request = await this.withPayload({ name: 'Marcus' })

    t.deepEqual(request.payload, { name: 'Marcus' })
  }

  async sendsGetRequestAsObject (t) {
    const path = `/${Encryption.randomKey().replace(/\//g, '')}`

    const response = await this.addRoute({
      path,
      method: 'GET',
      handler: (request) => request.headers['x-name']
    }).get({
      uri: path,
      headers: { 'x-name': 'Marcus' }
    })

    t.is(response.statusCode, 200)
    t.is(response.payload, 'Marcus')
  }

  async sendsGetRequest (t) {
    const response = await this.get('/get')

    t.is(response.statusCode, 404)
  }

  async defaultsToGetRequest (t) {
    const url = `/${Encryption.randomKey().replace(/\//g, '')}`
    const path = url.slice(0, -1)

    const response = await this.request().addRoute({
      path,
      method: 'GET',
      handler: (request) => request.headers['x-name']
    }).inject({
      uri: path,
      headers: { 'x-name': 'Marcus' }
    })

    t.is(response.statusCode, 200)
    t.is(response.payload, 'Marcus')
  }

  async sendsPostRequestWithoutRoute (t) {
    const response = await this.post({ uri: '/post' })

    t.is(response.statusCode, 404)
  }

  async sendsPutRequestWithoutRoute (t) {
    const response = await this.put({ uri: '/put' })

    t.is(response.statusCode, 404)
  }

  async sendsPatchRequestWithoutRoute (t) {
    const response = await this.patch({ uri: '/patch' })

    t.is(response.statusCode, 404)
  }

  async sendsDeleteRequestWithoutRoute (t) {
    const response = await this.delete('/delete')

    t.is(response.statusCode, 404)
  }

  async sendsDeleteRequestAsUrl (t) {
    const path = `/${Encryption.randomKey().replace(/\//g, '')}`

    const response = await this.addRoute({
      path,
      method: 'DELETE',
      handler: () => 'Deleted.'
    }).delete(path)

    t.is(response.statusCode, 200)
    t.is(response.payload, 'Deleted.')
  }

  async sendsDeleteRequestAsObject (t) {
    const path = `/${Encryption.randomKey().replace(/\//g, '')}`

    const response = await this.addRoute({
      path,
      method: 'DELETE',
      handler: (request) => request.headers['x-name']
    }).delete({
      uri: path,
      headers: { 'x-name': 'Marcus' }
    })

    t.is(response.statusCode, 200)
    t.is(response.payload, 'Marcus')
  }
}

module.exports = new MakesHttpRequestsTest()
