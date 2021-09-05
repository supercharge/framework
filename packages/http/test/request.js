'use strict'

const Koa = require('koa')
const { test } = require('uvu')
const Supertest = require('supertest')
const { HttpContext } = require('../dist')

const appMock = {
  make () {},
  config () {
    return {
      get () { }
    }
  }
}

test('request querystring', async () => {
  const app = new Koa().use((ctx) => {
    const { request, response } = HttpContext.wrap(ctx, appMock)

    return response.payload(request.query())
  })

  await Supertest(app.callback())
    .get('/?name=Supercharge&marcus=isCool')
    .expect(200, { name: 'Supercharge', marcus: 'isCool' })
})

test('request.all() returns query params', async () => {
  const app = new Koa().use((ctx) => {
    const { request, response } = HttpContext.wrap(ctx, appMock)

    return response.payload(request.all())
  })

  await Supertest(app.callback())
    .get('/?name=Supercharge')
    .expect(200, { name: 'Supercharge' })
})

test.run()
