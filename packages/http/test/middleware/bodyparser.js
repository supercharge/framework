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

test('proceeds request without a body', async () => {
  await fetch('/', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })
    .expect(200, {})
})

test('parse urlencoded body', async () => {
  await fetch('/', {
    body: 'hello=Supercharge',
    method: 'POST',
    headers: {
      Accept: 'application/x-www-form-urlencoded',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
    .expect(200, { hello: 'Supercharge' })
})

test('parse text body', async () => {
  await fetch('/', {
    body: 'hello Supercharge',
    method: 'POST',
    headers: {
      Accept: 'text/plain',
      'Content-Type': 'text/plain'
    }
  })
    .expect(200, 'hello Supercharge')
})

test('throws for unsupported content type', async () => {
  await fetch('/', {
    body: 'Hello Supercharge',
    method: 'POST',
    headers: {
      Accept: 'supercharge/content-type',
      'Content-Type': 'supercharge/content-type'
    }
  })
    .expect(415, 'Unsupported Media Type')
})

test('throws when requesting without content-type headers', async () => {
  await fetch('/', {
    body: JSON.stringify({ hello: 'Supercharge' }),
    method: 'POST',
    headers: { Accept: 'application/json' }
  })
    .expect(200, JSON.stringify({ hello: 'Supercharge' }))
    .expectHeader('content-type', 'text/plain; charset=utf-8')
})

test('skips parsing on GET request', async () => {
  await fetch('/', { method: 'GET' }).expect(204)
})

test('skips parsing on DELETE request', async () => {
  await fetch('/', { method: 'DELETE' }).expect(204)
})

test.run()
