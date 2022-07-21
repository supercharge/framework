'use strict'

const Koa = require('koa')
const { test } = require('uvu')
const Supertest = require('supertest')
const { HttpContext, Request, Response } = require('../dist')

const appMock = {
  make (key) {
    if (key === 'request') {
      return Request
    }

    if (key === 'response') {
      return Response
    }
  },
  config () {
    return {
      get () { }
    }
  }
}

test.skip('fullUrl', async () => {
  const app = new Koa().use(ctx => {
    const { request, response } = HttpContext.wrap(ctx, appMock)

    return response.payload({
      fullUrl: request.fullUrl()
    })
  })

  // ensure to listen on a port we control
  const server = app.listen(3000)

  await Supertest(app.callback())
    .get('/')
    .set({ host: 'http://user:pass@localhost:3000/foo?bar=baz' })
    .expect(200, { fullUrl: 'http://user:pass@localhost:3000/foo?bar=baz' })

  server.close()
})

test('url', async () => {
  const app = new Koa().use(ctx => {
    const { request, response } = HttpContext.wrap(ctx, appMock)

    return response.payload({
      url: request.url()
    })
  })

  await Supertest(app.callback())
    .get('/')
    .set({ host: 'http://localhost/foo' }) // use a URL without a port number
    .expect(200, { port: '' })

  // ensure to listen on a port we control
  const server = app.listen(1234)

  await Supertest(server)
    .get('/')
    .expect(200, { port: 1234 })

  server.close()
})

test('port', async () => {
  const app = new Koa().use(ctx => {
    const { request, response } = HttpContext.wrap(ctx, appMock)

    return response.payload({
      port: request.url().port()
    })
  })

  await Supertest(app.callback())
    .get('/')
    .set({ host: 'http://localhost/foo' }) // use a URL without a port number
    .expect(200, { port: '' })

  // ensure to listen on a port we control
  const server = app.listen(1234)

  await Supertest(server)
    .get('/')
    .expect(200, { port: 1234 })

  server.close()
})

test.run()
