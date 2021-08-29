'use strict'

const Koa = require('koa')
const { test } = require('uvu')
// const expect = require('expect')
const { createServer } = require('http')
const { makeFetch } = require('supertest-fetch')
const BodyparserConfig = require('./fixtures/bodyparser-config')
const { BodyparserMiddleware, HttpContext } = require('../../dist')

const appMock = {
  make () {},
  config () {
    return {
      get () {
        return BodyparserConfig
      }
    }
  }
}

const app = new Koa()
  .use(async (ctx, next) => {
    const context = HttpContext.wrap(ctx, appMock)

    return await new BodyparserMiddleware(appMock).handle(context, next)
  })
  .use(async (ctx, next) => {
    const context = HttpContext.wrap(ctx, appMock)

    context.response.payload(context.request.payload)

    await next()
  })

const fetch = makeFetch(
  createServer(app.callback())
)

test('parse json body', async () => {
  await fetch('/', {
    body: JSON.stringify({ hello: 'Supercharge' }),
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })
    .expect(200, { hello: 'Supercharge' })
    .expectHeader('content-type', 'application/json; charset=utf-8')
})

test.run()
